
import React, { useState, useEffect } from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Select, SelectContent, SelectGroup, SelectItem, 
  SelectLabel, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Facility } from '@/types/facility';
import { useOrganizationsData } from '@/hooks/useOrganizationsData';

export interface InventoryFormData {
  id?: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  facilityId: string;
}

interface AddInventoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  facilities: Facility[];
  formData: InventoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<InventoryFormData>>;
  isEditMode: boolean;
  onAddItem: () => Promise<void>;
  onUpdateItem: () => Promise<void>;
}

const AddInventoryDialog: React.FC<AddInventoryDialogProps> = ({
  isOpen,
  onClose,
  facilities,
  formData,
  setFormData,
  isEditMode,
  onAddItem,
  onUpdateItem
}) => {
  const { data: organizations } = useOrganizationsData();
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>('');
  const [filteredFacilities, setFilteredFacilities] = useState<Facility[]>(facilities);

  // When dialog opens, reset faculty selection if not in edit mode
  useEffect(() => {
    if (isOpen && !isEditMode) {
      setSelectedFacultyId('');
      setFilteredFacilities(facilities);
    } else if (isOpen && isEditMode && formData.facilityId) {
      // For edit mode, try to find the faculty ID from the selected facility
      const selectedFacility = facilities.find(f => f.id === formData.facilityId);
      if (selectedFacility?.facultyId) {
        setSelectedFacultyId(selectedFacility.facultyId);
        setFilteredFacilities(facilities.filter(f => f.facultyId === selectedFacility.facultyId));
      }
    }
  }, [isOpen, isEditMode, facilities, formData.facilityId]);

  // Filter facilities when faculty is selected
  useEffect(() => {
    if (selectedFacultyId) {
      setFilteredFacilities(facilities.filter(f => f.facultyId === selectedFacultyId));
      // Clear facility selection if the current facility doesn't belong to the selected faculty
      const currentFacilityMatchesFaculty = facilities.some(
        f => f.id === formData.facilityId && f.facultyId === selectedFacultyId
      );
      if (!currentFacilityMatchesFaculty) {
        setFormData(prev => ({ ...prev, facilityId: '' }));
      }
    } else {
      setFilteredFacilities(facilities);
    }
  }, [selectedFacultyId, facilities, setFormData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'quantity' ? parseInt(value) || 0 : value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFacultyChange = (facultyId: string) => {
    setSelectedFacultyId(facultyId);
  };

  const handleSubmit = async () => {
    // Validate that a facility is selected
    if (!formData.facilityId) {
      toast({
        title: "Facility Required",
        description: "Please select a facility for this inventory item",
        variant: "destructive",
      });
      return;
    }

    if (isEditMode) {
      await onUpdateItem();
    } else {
      await onAddItem();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Edit Inventory Item' : 'Add New Inventory Item'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Update the details of the inventory item below.'
              : 'Fill in the details of the new inventory item below.'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter item name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Select
              value={selectedFacultyId}
              onValueChange={handleFacultyChange}
            >
              <SelectTrigger id="faculty">
                <SelectValue placeholder="Select faculty first" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Faculties</SelectItem>
                {organizations?.map(org => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name} ({org.faculty})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a faculty to filter available facilities
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="facility">Facility</Label>
            <Select
              value={formData.facilityId}
              onValueChange={(value) => handleSelectChange('facilityId', value)}
              disabled={filteredFacilities.length === 0}
            >
              <SelectTrigger id="facility">
                <SelectValue placeholder={
                  selectedFacultyId && filteredFacilities.length === 0 
                    ? "No facilities in this faculty" 
                    : "Select facility"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredFacilities.length > 0 ? (
                  filteredFacilities.map(facility => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name} ({facility.type})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    {selectedFacultyId ? "No facilities in this faculty" : "Select a faculty first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Equipment">Equipment</SelectItem>
                  <SelectItem value="Chemicals">Chemicals</SelectItem>
                  <SelectItem value="Glassware">Glassware</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Tools">Tools</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Storage location"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleInputChange}
                min={0}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Select
                value={formData.unit}
                onValueChange={(value) => handleSelectChange('unit', value)}
              >
                <SelectTrigger id="unit">
                  <SelectValue placeholder="Select unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pc">Piece</SelectItem>
                  <SelectItem value="box">Box</SelectItem>
                  <SelectItem value="L">Liter</SelectItem>
                  <SelectItem value="mL">Milliliter</SelectItem>
                  <SelectItem value="kg">Kilogram</SelectItem>
                  <SelectItem value="g">Gram</SelectItem>
                  <SelectItem value="set">Set</SelectItem>
                  <SelectItem value="unit">Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditMode ? 'Update Item' : 'Add Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddInventoryDialog;
