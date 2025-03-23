
import React, { useState } from 'react';
import {
  BoxesIcon,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from "@/hooks/use-toast";
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useFacilityData } from '@/hooks/useFacilityData';
import { InventoryItem } from '@/types/facility';

// Item form type
interface ItemFormData {
  id?: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  facilityId: string;
}

const Inventory = () => {
  const { user } = useAuth();
  const { data: inventoryItems, isLoading } = useInventoryData();
  const { data: facilities, isLoading: isFacilitiesLoading } = useFacilityData();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    category: 'Equipment',
    location: '',
    quantity: 0,
    unit: 'pc',
    facilityId: '',
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if user has admin privileges (org_admin or lab_supervisor)
  const hasAdminPrivileges = user?.role === 'org_admin' || user?.role === 'lab_supervisor';
  
  // Filter inventory
  const filteredInventory = inventoryItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesFacility = facilityFilter === 'all' || item.facilityId === facilityFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesFacility;
  }) || [];

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Equipment',
      location: '',
      quantity: 0,
      unit: 'pc',
      facilityId: '',
    });
    setIsEditMode(false);
  };

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

  const handleAddItem = async () => {
    try {
      // Validate that a facility is selected
      if (!formData.facilityId) {
        toast({
          title: "Facility Required",
          description: "Please select a facility for this inventory item",
          variant: "destructive",
        });
        return;
      }

      const status = formData.quantity === 0 ? 'Out of Stock' :
                     formData.quantity < 10 ? 'Low Stock' : 'In Stock';

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          name: formData.name,
          category: formData.category,
          location: formData.location,
          quantity: formData.quantity,
          unit: formData.unit,
          status: status,
          facility_id: formData.facilityId
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Item added",
        description: `${formData.name} has been added to inventory`,
      });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding item:', error);
      toast({
        title: "Error",
        description: "Failed to add inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateItem = async () => {
    if (!formData.id) return;
    
    try {
      // Validate that a facility is selected
      if (!formData.facilityId) {
        toast({
          title: "Facility Required",
          description: "Please select a facility for this inventory item",
          variant: "destructive",
        });
        return;
      }

      const status = formData.quantity === 0 ? 'Out of Stock' :
                     formData.quantity < 10 ? 'Low Stock' : 'In Stock';

      const { error } = await supabase
        .from('inventory_items')
        .update({
          name: formData.name,
          category: formData.category,
          location: formData.location,
          quantity: formData.quantity,
          unit: formData.unit,
          status: status,
          facility_id: formData.facilityId,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.id);

      if (error) throw error;
      
      toast({
        title: "Item updated",
        description: `${formData.name} has been updated`,
      });
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditItem = (item: InventoryItem) => {
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category,
      location: item.location,
      quantity: item.quantity,
      unit: item.unit,
      facilityId: item.facilityId || '',
    });
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleDeleteItem = async (id: string, itemName: string) => {
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Item deleted",
        description: `${itemName} has been removed from inventory`,
      });
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: "Error",
        description: "Failed to delete inventory item. Please try again.",
        variant: "destructive",
      });
    }
  };

  // If facilities are still loading, show a loading message for the whole page
  if (isFacilitiesLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading facilities data...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <BoxesIcon className="h-8 w-8 mr-2 text-lab-600" />
              Inventory
            </h1>
            <p className="text-muted-foreground">
              Manage laboratory equipment, chemicals, and supplies
            </p>
          </div>
          
          {hasAdminPrivileges && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
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
                    <Label htmlFor="facility">Facility</Label>
                    <Select
                      value={formData.facilityId}
                      onValueChange={(value) => handleSelectChange('facilityId', value)}
                    >
                      <SelectTrigger id="facility">
                        <SelectValue placeholder="Select facility" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities?.map(facility => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name} ({facility.type})
                          </SelectItem>
                        ))}
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
                  <Button variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={isEditMode ? handleUpdateItem : handleAddItem}>
                    {isEditMode ? 'Update Item' : 'Add Item'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inventory..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger id="category-filter" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Equipment">Equipment</SelectItem>
              <SelectItem value="Chemicals">Chemicals</SelectItem>
              <SelectItem value="Glassware">Glassware</SelectItem>
              <SelectItem value="Safety">Safety</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger id="status-filter" className="w-full">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={facilityFilter}
            onValueChange={setFacilityFilter}
          >
            <SelectTrigger id="facility-filter" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by facility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Facilities</SelectItem>
              {facilities?.map(facility => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Inventory Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Facility</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  {hasAdminPrivileges && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={hasAdminPrivileges ? 7 : 6} className="text-center py-8 text-muted-foreground">
                      Loading inventory items...
                    </TableCell>
                  </TableRow>
                ) : filteredInventory.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={hasAdminPrivileges ? 7 : 6} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      No items found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInventory.map((item) => (
                    <TableRow key={item.id} className="animate-fade-in">
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {facilities?.find(f => f.id === item.facilityId)?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.status === 'In Stock' && (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {item.status}
                          </Badge>
                        )}
                        {item.status === 'Low Stock' && (
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {item.status}
                          </Badge>
                        )}
                        {item.status === 'Out of Stock' && (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {item.status}
                          </Badge>
                        )}
                      </TableCell>
                      {hasAdminPrivileges && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditItem(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id, item.name)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Inventory;
