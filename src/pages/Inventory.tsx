
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
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useInventoryData } from '@/hooks/useInventoryData';
import { useFacilityData } from '@/hooks/useFacilityData';
import { InventoryItem } from '@/types/facility';
import { useOrganizationsData } from '@/hooks/useOrganizationsData';
import AddInventoryDialog, { InventoryFormData } from '@/components/inventory/AddInventoryDialog';

const Inventory = () => {
  const { user } = useAuth();
  const { data: inventoryItems, isLoading } = useInventoryData();
  const { data: facilities, isLoading: isFacilitiesLoading } = useFacilityData();
  const { data: organizations, isLoading: isOrganizationsLoading } = useOrganizationsData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [facilityFilter, setFacilityFilter] = useState('all');
  const [facultyFilter, setFacultyFilter] = useState('all');
  
  const [formData, setFormData] = useState<InventoryFormData>({
    name: '',
    category: 'Equipment',
    location: '',
    quantity: 0,
    unit: 'pc',
    facilityId: '',
  });
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Check if user has admin privileges (only org_admin can manage inventory now)
  const hasAdminPrivileges = user?.role === 'org_admin';
  
  // Filter inventory based on selected filters
  const filteredInventory = inventoryItems?.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesFacility = facilityFilter === 'all' || item.facilityId === facilityFilter;
    const matchesFaculty = facultyFilter === 'all' || item.facultyId === facultyFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesFacility && matchesFaculty;
  }) || [];

  // Get facilities filtered by faculty for the dropdown
  const filteredFacilities = facultyFilter === 'all' 
    ? facilities 
    : facilities?.filter(facility => facility.facultyId === facultyFilter);

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

  const handleAddItem = async () => {
    try {
      // Validate that a facility is selected
      if (!formData.facilityId) {
        toast({
          title: "Lab Required",
          description: "Please select a lab for this inventory item",
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
          title: "Lab Required",
          description: "Please select a lab for this inventory item",
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

  // If data is still loading, show a loading message for the whole page
  if (isFacilitiesLoading || isOrganizationsLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Loading data...</p>
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
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            value={facultyFilter}
            onValueChange={setFacultyFilter}
          >
            <SelectTrigger id="faculty-filter" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {organizations?.map(org => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name} ({org.faculty})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={facilityFilter}
            onValueChange={setFacilityFilter}
          >
            <SelectTrigger id="facility-filter" className="w-full">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by lab" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labs</SelectItem>
              {filteredFacilities?.map(facility => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
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
        </div>
        
        {/* Inventory Table */}
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Lab</TableHead>
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
                        {item.facilityName}
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

      {/* Add/Edit Inventory Dialog */}
      {facilities && hasAdminPrivileges && (
        <AddInventoryDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            resetForm();
          }}
          facilities={facilities}
          formData={formData}
          setFormData={setFormData}
          isEditMode={isEditMode}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
        />
      )}
    </MainLayout>
  );
};

export default Inventory;
