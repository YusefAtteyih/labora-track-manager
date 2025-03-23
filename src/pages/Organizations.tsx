
import React, { useState } from 'react';
import { Building, Plus, Search, Edit, Trash, Users, Microscope, BoxesIcon, BookOpen, School } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { Organization, useOrganizationsData } from '@/hooks/useOrganizationsData';
import { supabase } from '@/integrations/supabase/client';
import OrganizationMembers from '@/components/organizations/OrganizationMembers';
import EditOrganizationDialog from '@/components/organizations/EditOrganizationDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const Organizations = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    university: 'University of Science and Technology',
    faculty: '',
    department: ''
  });
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: organizations, isLoading, refetch } = useOrganizationsData();

  // Filter organizations based on search
  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.faculty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.university.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddOrganization = async () => {
    if (!formData.name || !formData.department) {
      toast({
        title: "Missing information",
        description: "Please fill in both name and department fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          department: formData.department,
          university: formData.university,
          faculty: formData.faculty,
          description: formData.description
        })
        .select();

      if (error) throw error;
      
      toast({
        title: "Organization added",
        description: `${formData.name} has been added`,
      });
      
      // Reset form and close dialog
      setIsDialogOpen(false);
      setFormData({ 
        name: '', 
        description: '', 
        university: 'University of Science and Technology',
        faculty: '',
        department: '' 
      });
      
      // Refresh organizations data
      refetch();
    } catch (error: any) {
      toast({
        title: "Error adding organization",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    }
  };

  const handleViewMembers = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsMembersDialogOpen(true);
  };

  const handleEditOrganization = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (organization: Organization) => {
    setSelectedOrganization(organization);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrganization) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', selectedOrganization.id);

      if (error) throw error;
      
      toast({
        title: "Organization deleted",
        description: `${selectedOrganization.name} has been deleted`,
      });
      
      setIsDeleteDialogOpen(false);
      setSelectedOrganization(null);
      refetch();
    } catch (error: any) {
      toast({
        title: "Error deleting organization",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if the user is allowed to manage organizations
  if (user?.role !== 'org_admin') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Only Organization Administrators can access this page.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Building className="h-8 w-8 mr-2 text-lab-600" />
              Organizations
            </h1>
            <p className="text-muted-foreground">
              Manage university organizations, faculties, and departments
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card max-w-lg">
              <DialogHeader>
                <DialogTitle>Add New Organization</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new organization structure.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    name="university"
                    value={formData.university}
                    onChange={handleInputChange}
                    placeholder="Enter university name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="faculty">Faculty</Label>
                  <Input
                    id="faculty"
                    name="faculty"
                    value={formData.faculty}
                    onChange={handleInputChange}
                    placeholder="Enter faculty name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="Enter department name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of the organization"
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddOrganization}>
                  Add Organization
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search organizations..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading organizations...</p>
          </div>
        ) : filteredOrganizations && filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{org.name}</CardTitle>
                      <CardDescription className="mt-1">
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center">
                            <School className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{org.university}</span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{org.faculty}</span>
                          </div>
                          <Badge variant="outline" className="w-fit mt-1">
                            {org.department}
                          </Badge>
                        </div>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{org.description}</p>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col items-center p-2 bg-primary/5 rounded-md">
                      <Users className="h-4 w-4 mb-1 text-primary" />
                      <span className="text-lg font-medium">{org.members}</span>
                      <span className="text-xs text-muted-foreground">Members</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-primary/5 rounded-md">
                      <Microscope className="h-4 w-4 mb-1 text-primary" />
                      <span className="text-lg font-medium">{org.facilities}</span>
                      <span className="text-xs text-muted-foreground">Facilities</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-primary/5 rounded-md">
                      <BoxesIcon className="h-4 w-4 mb-1 text-primary" />
                      <span className="text-lg font-medium">{org.equipment}</span>
                      <span className="text-xs text-muted-foreground">Equipment</span>
                    </div>
                  </div>
                </CardContent>
                <Separator />
                <CardFooter className="flex justify-between p-4">
                  <Button variant="outline" size="sm" onClick={() => handleViewMembers(org)}>
                    <Users className="h-4 w-4 mr-1" />
                    Members
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditOrganization(org)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteClick(org)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No organizations found</p>
          </div>
        )}
      </div>

      {/* Members Dialog */}
      {selectedOrganization && (
        <OrganizationMembers
          organizationId={selectedOrganization.id}
          organizationName={selectedOrganization.name}
          isOpen={isMembersDialogOpen}
          onClose={() => setIsMembersDialogOpen(false)}
        />
      )}

      {/* Edit Organization Dialog */}
      <EditOrganizationDialog
        organization={selectedOrganization}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedOrganization(null);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {selectedOrganization?.name} and remove all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrganization} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Organizations;
