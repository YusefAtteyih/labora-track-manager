
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Check, FileDown, Clock, DollarSign, Package, Plus, Search, ShoppingCart, X, Filter, ArrowDown10, ArrowDown8, ArrowUpDown
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockPurchaseRequestsData } from '@/data/purchases';

type SortField = 'created' | 'priority' | 'total' | 'status' | null;
type SortDirection = 'asc' | 'desc';

const Purchases = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { data: purchases, isLoading } = useQuery({
    queryKey: ['purchases'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockPurchaseRequestsData;
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter purchases based on search query and filters
  const filteredPurchases = React.useMemo(() => {
    if (!purchases) return [];
    
    let result = purchases.filter(purchase => {
      const matchesSearch = 
        purchase.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        purchase.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
      const matchesDepartment = departmentFilter === 'all' || purchase.department === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesDepartment;
    });
    
    // Sort purchases
    if (sortField) {
      result = [...result].sort((a, b) => {
        let comparison = 0;
        
        switch (sortField) {
          case 'created':
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          case 'priority':
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
            break;
          case 'total':
            comparison = a.totalAmount - b.totalAmount;
            break;
          case 'status':
            const statusOrder = { pending: 1, approved: 2, rejected: 3, ordered: 4, delivered: 5 };
            comparison = statusOrder[a.status] - statusOrder[b.status];
            break;
          default:
            break;
        }
        
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }
    
    return result;
  }, [purchases, searchQuery, statusFilter, departmentFilter, sortField, sortDirection]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? 
      <ArrowDown8 className="h-4 w-4 ml-1" /> : 
      <ArrowDown10 className="h-4 w-4 ml-1" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'ordered':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Ordered</Badge>;
      case 'delivered':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Purchase Requests</h2>
            <p className="text-muted-foreground">
              Request and track laboratory supplies and equipment purchases
            </p>
          </div>
          <Button className="sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Purchase Request
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Requests</CardDescription>
              <CardTitle className="text-2xl">42</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-500">↑ 12%</span> from last month
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Approval</CardDescription>
              <CardTitle className="text-2xl">7</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className="text-red-500">↑ 3</span> more than usual
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>This Month's Spend</CardDescription>
              <CardTitle className="text-2xl">$12,450</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-500">↓ 8%</span> under budget
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg. Processing Time</CardDescription>
              <CardTitle className="text-2xl">2.4 days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                <span className="text-green-500">↓ 0.6 days</span> improvement
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search requests..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="computerScience">Computer Science</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="h-10">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending ({purchases?.filter(p => p.status === 'pending').length || 0})</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="ordered">Ordered</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading purchase requests...</p>
              </div>
            ) : filteredPurchases && filteredPurchases.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('created')}
                        >
                          Created {getSortIcon('created')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('priority')}
                        >
                          Priority {getSortIcon('priority')}
                        </button>
                      </TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('total')}
                        >
                          Total {getSortIcon('total')}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button 
                          className="flex items-center"
                          onClick={() => handleSort('status')}
                        >
                          Status {getSortIcon('status')}
                        </button>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchases.map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="font-medium max-w-[200px] truncate" title={purchase.title}>
                            {purchase.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {purchase.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(purchase.priority)}
                        </TableCell>
                        <TableCell>
                          {purchase.department.charAt(0).toUpperCase() + purchase.department.slice(1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={purchase.requestedBy.avatar} />
                              <AvatarFallback>
                                {purchase.requestedBy.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{purchase.requestedBy.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{purchase.requestedBy.role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${purchase.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {purchase.status === 'pending' && (
                              <>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No purchase requests found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            {/* Content will automatically filter to show only pending requests */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases
                    .filter(p => p.status === 'pending')
                    .map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="font-medium max-w-[200px] truncate" title={purchase.title}>
                            {purchase.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {purchase.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(purchase.priority)}
                        </TableCell>
                        <TableCell>
                          {purchase.department.charAt(0).toUpperCase() + purchase.department.slice(1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={purchase.requestedBy.avatar} />
                              <AvatarFallback>
                                {purchase.requestedBy.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{purchase.requestedBy.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{purchase.requestedBy.role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${purchase.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              Details
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            {/* Similar structure as "all" tab, but filtered for approved status */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases
                    .filter(p => p.status === 'approved')
                    .map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="font-medium max-w-[200px] truncate" title={purchase.title}>
                            {purchase.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {purchase.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(purchase.priority)}
                        </TableCell>
                        <TableCell>
                          {purchase.department.charAt(0).toUpperCase() + purchase.department.slice(1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={purchase.requestedBy.avatar} />
                              <AvatarFallback>
                                {purchase.requestedBy.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{purchase.requestedBy.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{purchase.requestedBy.role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${purchase.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Package className="h-4 w-4 mr-2" />
                              Mark as Ordered
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="ordered" className="mt-0">
            {/* Similar structure as "all" tab, but filtered for ordered status */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPurchases
                    .filter(p => p.status === 'ordered')
                    .map((purchase) => (
                      <TableRow key={purchase.id}>
                        <TableCell>
                          <div className="font-medium max-w-[200px] truncate" title={purchase.title}>
                            {purchase.title}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ID: {purchase.id}
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(purchase.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(purchase.priority)}
                        </TableCell>
                        <TableCell>
                          {purchase.department.charAt(0).toUpperCase() + purchase.department.slice(1)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={purchase.requestedBy.avatar} />
                              <AvatarFallback>
                                {purchase.requestedBy.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{purchase.requestedBy.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{purchase.requestedBy.role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          ${purchase.totalAmount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(purchase.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" className="h-8 px-3">
                              <Check className="h-4 w-4 mr-2" />
                              Mark as Delivered
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Purchases;
