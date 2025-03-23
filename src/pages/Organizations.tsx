
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Building, Plus, Search, Edit, Trash, Users, Microscope, BoxesIcon } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';

// Mock organizations
const mockOrganizations = [
  {
    id: '1',
    name: 'Science Department',
    description: 'Chemistry and biology research labs',
    department: 'Chemistry',
    facilities: 3,
    members: 15,
    equipment: 48
  },
  {
    id: '2',
    name: 'Engineering Department',
    description: 'Computer science and electrical engineering labs',
    department: 'Computer Science',
    facilities: 2,
    members: 12,
    equipment: 36
  },
  {
    id: '3',
    name: 'Medical Department',
    description: 'Medical research and training facilities',
    department: 'Biology',
    facilities: 4,
    members: 20,
    equipment: 62
  }
];

const Organizations = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: ''
  });

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockOrganizations;
    }
  });

  // Filter organizations based on search
  const filteredOrganizations = organizations?.filter(org => 
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddOrganization = () => {
    toast({
      title: "Organization added",
      description: `${formData.name} has been added`,
    });
    setIsDialogOpen(false);
    setFormData({ name: '', description: '', department: '' });
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
              Manage organizations, departments, and their resources
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New Organization</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new organization or department.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
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
                  <Label htmlFor="description">Description</Label>
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
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>{org.department}</CardDescription>
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
                  <Button variant="outline" size="sm">
                    <Users className="h-4 w-4 mr-1" />
                    Members
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
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
    </MainLayout>
  );
};

export default Organizations;
