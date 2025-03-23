
import React, { useState } from 'react';
import { usePurchaseData, PurchaseRequest } from '@/hooks/usePurchaseData';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Filter, Plus, Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { approvePurchaseRequest, rejectPurchaseRequest, updatePurchaseStatus } from '@/services/purchaseService';

const Purchases = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: purchaseRequests, isLoading, isError } = usePurchaseData();

  // Filter purchase requests based on search query, status, priority, and active tab
  const filteredRequests = purchaseRequests
    ?.filter(request => {
      const matchesSearch = 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
      const matchesTab = activeTab === 'all' || 
        (activeTab === 'pending' && request.status === 'pending') ||
        (activeTab === 'approved' && request.status === 'approved') ||
        (activeTab === 'ordered' && (request.status === 'ordered' || request.status === 'delivered')) ||
        (activeTab === 'rejected' && request.status === 'rejected');
      
      return matchesSearch && matchesStatus && matchesPriority && matchesTab;
    })
    .sort((a, b) => {
      // Sort by creation date (most recent first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleApprove = async (requestId: string) => {
    if (!user) return;
    
    try {
      await approvePurchaseRequest(requestId, user);
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!user) return;
    
    try {
      // In a real application, you'd show a dialog to get the rejection reason
      const rejectionReason = "Does not meet budget requirements";
      await rejectPurchaseRequest(requestId, rejectionReason, user);
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'ordered' | 'delivered') => {
    if (!user) return;
    
    try {
      await updatePurchaseStatus(requestId, status, user);
    } catch (error) {
      console.error(`Error updating request to ${status}:`, error);
    }
  };

  const getPriorityBadge = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">High</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
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

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Purchase Requests</h2>
            <p className="text-muted-foreground">
              Manage purchase requisitions for lab supplies and equipment
            </p>
          </div>
          <Button className="sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search purchases..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="ordered">Ordered</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {renderRequestsTable()}
          </TabsContent>

          <TabsContent value="pending" className="mt-0">
            {renderRequestsTable()}
          </TabsContent>

          <TabsContent value="approved" className="mt-0">
            {renderRequestsTable()}
          </TabsContent>

          <TabsContent value="ordered" className="mt-0">
            {renderRequestsTable()}
          </TabsContent>

          <TabsContent value="rejected" className="mt-0">
            {renderRequestsTable()}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );

  function renderRequestsTable() {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading purchase requests...</p>
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-10">
          <p className="text-destructive">Error loading purchase requests</p>
        </div>
      );
    }

    if (!filteredRequests || filteredRequests.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No purchase requests found</p>
        </div>
      );
    }

    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[130px]">Request ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Requested By</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">
                  {request.id}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{request.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()} · {request.department}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={request.requestedBy.avatar} />
                      <AvatarFallback>
                        {request.requestedBy.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{request.requestedBy.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{request.requestedBy.role}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {getPriorityBadge(request.priority)}
                </TableCell>
                <TableCell>
                  <div className="font-medium">${request.totalAmount.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.items.length} item{request.items.length !== 1 ? 's' : ''}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(request.status)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {request.status === 'pending' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-1 text-green-600 hover:text-green-700"
                          onClick={() => handleApprove(request.id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 gap-1 text-red-600 hover:text-red-700"
                          onClick={() => handleReject(request.id)}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {request.status === 'approved' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-1 text-blue-600 hover:text-blue-700"
                        onClick={() => handleUpdateStatus(request.id, 'ordered')}
                      >
                        Mark Ordered
                      </Button>
                    )}
                    {request.status === 'ordered' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 gap-1 text-purple-600 hover:text-purple-700"
                        onClick={() => handleUpdateStatus(request.id, 'delivered')}
                      >
                        Mark Delivered
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <span className="sr-only">Details</span>
                      <span>···</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }
};

export default Purchases;
