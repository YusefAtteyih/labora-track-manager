
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash, 
  MoreHorizontal,
  Shield,
  Buildings,
  User
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from "@/hooks/use-toast";
import { useAuth, UserRole } from '@/context/AuthContext';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Organization Admin',
    email: 'org_admin@university.edu',
    role: 'org_admin',
    avatar: 'https://ui-avatars.com/api/?name=Org+Admin&background=0284c7&color=fff',
    organizationId: '1',
    organizationName: 'Science Department',
    status: 'active',
    lastActive: '2023-06-15T14:30:00'
  },
  {
    id: '2',
    name: 'Lab Supervisor',
    email: 'lab_supervisor@university.edu',
    role: 'lab_supervisor',
    avatar: 'https://ui-avatars.com/api/?name=Lab+Supervisor&background=0ea5e9&color=fff',
    organizationId: '1',
    organizationName: 'Science Department',
    status: 'active',
    lastActive: '2023-06-15T10:15:00'
  },
  {
    id: '3',
    name: 'Facility Member',
    email: 'facility_member@university.edu',
    role: 'facility_member',
    avatar: 'https://ui-avatars.com/api/?name=Facility+Member&background=38bdf8&color=fff',
    organizationId: '1',
    organizationName: 'Science Department',
    status: 'active',
    lastActive: '2023-06-14T16:45:00'
  },
  {
    id: '4',
    name: 'Another Lab Supervisor',
    email: 'lab_super2@university.edu',
    role: 'lab_supervisor',
    avatar: 'https://ui-avatars.com/api/?name=Another+Lab+Supervisor&background=0ea5e9&color=fff',
    organizationId: '2',
    organizationName: 'Engineering Department',
    status: 'active',
    lastActive: '2023-06-13T11:20:00'
  },
  {
    id: '5',
    name: 'Student User',
    email: 'student@university.edu',
    role: 'student',
    avatar: 'https://ui-avatars.com/api/?name=Student+User&background=7dd3fc&color=fff',
    organizationId: '2',
    organizationName: 'Engineering Department',
    status: 'active',
    lastActive: '2023-06-12T09:30:00'
  },
  {
    id: '6',
    name: 'Visitor User',
    email: 'visitor@example.com',
    role: 'visitor',
    avatar: 'https://ui-avatars.com/api/?name=Visitor+User&background=bae6fd&color=fff',
    status: 'inactive',
    lastActive: '2023-06-01T14:00:00'
  }
];

// User form data type
interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

const Users = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'facility_member',
    organizationId: '1'
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockUsers;
    }
  });

  // Filter users based on search and role
  const filteredUsers = users?.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddUser = () => {
    toast({
      title: "User added",
      description: `${formData.name} has been added with role ${formData.role.replace('_', ' ')}`,
    });
    setIsDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      role: 'facility_member',
      organizationId: '1'
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'org_admin':
        return <Buildings className="h-3.5 w-3.5 mr-1.5" />;
      case 'lab_supervisor':
        return <Shield className="h-3.5 w-3.5 mr-1.5" />;
      case 'facility_member':
        return <User className="h-3.5 w-3.5 mr-1.5" />;
      case 'student':
      case 'visitor':
      default:
        return <User className="h-3.5 w-3.5 mr-1.5" />;
    }
  };

  // Check if the user is allowed to manage users
  if (user?.role !== 'org_admin') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Only Organization Administrators can access the users management page.
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
              <UsersIcon className="h-8 w-8 mr-2 text-lab-600" />
              Users
            </h1>
            <p className="text-muted-foreground">
              Manage users, their roles, and organization access
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new user account.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="org_admin">Organization Admin</SelectItem>
                      <SelectItem value="lab_supervisor">Lab Supervisor</SelectItem>
                      <SelectItem value="facility_member">Facility Member</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="visitor">Visitor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select 
                    value={formData.organizationId} 
                    onValueChange={(value) => handleSelectChange('organizationId', value)}
                  >
                    <SelectTrigger id="organization">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Science Department</SelectItem>
                      <SelectItem value="2">Engineering Department</SelectItem>
                      <SelectItem value="3">Medical Department</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty for visitors with no organization affiliation
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>
                  Add User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="org_admin">Organization Admin</SelectItem>
              <SelectItem value="lab_supervisor">Lab Supervisor</SelectItem>
              <SelectItem value="facility_member">Facility Member</SelectItem>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="visitor">Visitor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="table">
          <TabsList className="mb-4">
            <TabsTrigger value="table">Table View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback>
                                {user.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="font-medium">{user.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-normal capitalize flex items-center w-fit">
                            {getRoleIcon(user.role)}
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.organizationName || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.lastActive).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grid">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers && filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredUsers.map((user) => (
                  <Card key={user.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <Avatar className="h-20 w-20 mb-3">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback className="text-xl">
                            {user.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <h3 className="font-medium text-lg line-clamp-1">{user.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                        <Badge variant="outline" className="font-normal capitalize mb-4 flex items-center">
                          {getRoleIcon(user.role)}
                          {user.role.replace('_', ' ')}
                        </Badge>
                        
                        <div className="w-full flex justify-between text-sm text-muted-foreground">
                          <span>Organization:</span>
                          <span className="font-medium">{user.organizationName || '-'}</span>
                        </div>
                        <div className="w-full flex justify-between text-sm text-muted-foreground">
                          <span>Status:</span>
                          <span className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                            {user.status}
                          </span>
                        </div>
                        
                        <div className="w-full mt-4 flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No users found</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Users;
