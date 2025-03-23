
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search, 
  Clock, 
  Calendar, 
  ShoppingCart 
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/context/AuthContext';
import { mockBookingsData } from '@/data/bookings';

// Mock purchase requests pending approval
const mockPurchaseRequests = [
  {
    id: 'pr-001',
    requestType: 'purchase',
    itemName: 'Microscope Slides',
    quantity: 10,
    unitPrice: 25.99,
    totalPrice: 259.90,
    requestedBy: {
      id: '3',
      name: 'Facility Member',
      role: 'facility_member',
      avatar: 'https://ui-avatars.com/api/?name=Facility+Member&background=38bdf8&color=fff'
    },
    department: 'Chemistry',
    justification: 'Needed for upcoming student labs in cell biology',
    dateRequested: '2023-06-15T10:30:00',
    status: 'pending'
  },
  {
    id: 'pr-002',
    requestType: 'purchase',
    itemName: 'Laboratory Gloves (Box of 100)',
    quantity: 5,
    unitPrice: 18.50,
    totalPrice: 92.50,
    requestedBy: {
      id: '3',
      name: 'Facility Member',
      role: 'facility_member',
      avatar: 'https://ui-avatars.com/api/?name=Facility+Member&background=38bdf8&color=fff'
    },
    department: 'Chemistry',
    justification: 'Safety equipment for handling chemicals',
    dateRequested: '2023-06-16T14:15:00',
    status: 'pending'
  }
];

// Combine booking requests that need approval
const pendingBookings = mockBookingsData.filter(booking => booking.status === 'pending');

const Approvals = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const { data: approvalRequests, isLoading } = useQuery({
    queryKey: ['approvals'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Combine both types of requests
      const allRequests = [
        ...pendingBookings.map(booking => ({
          id: booking.id,
          requestType: 'booking',
          details: booking
        })),
        ...mockPurchaseRequests.map(purchase => ({
          id: purchase.id,
          requestType: 'purchase',
          details: purchase
        }))
      ];
      
      return allRequests;
    }
  });

  // Filter requests based on search and type
  const filteredRequests = approvalRequests?.filter(request => {
    const matchesSearch = searchQuery === '' || 
      (request.requestType === 'booking' && 
        (request.details.facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         request.details.user.name.toLowerCase().includes(searchQuery.toLowerCase()))) ||
      (request.requestType === 'purchase' && 
        (request.details.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
         request.details.requestedBy.name.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesType = filterType === 'all' || request.requestType === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleApprove = (id: string, type: string) => {
    toast({
      title: "Request approved",
      description: `The ${type} request has been approved`,
    });
  };

  const handleReject = (id: string, type: string) => {
    toast({
      title: "Request rejected",
      description: `The ${type} request has been rejected`,
    });
  };

  if (user?.role !== 'lab_supervisor') {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">
            Only Lab Supervisors can access the approvals page.
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
            <p className="text-muted-foreground">
              Review and approve booking and purchase requests
            </p>
          </div>
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
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Requests</SelectItem>
              <SelectItem value="booking">Bookings</SelectItem>
              <SelectItem value="purchase">Purchases</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="bookings">
              <Calendar className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="purchases">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading requests...</p>
              </div>
            ) : filteredRequests && filteredRequests.length > 0 ? (
              <div className="space-y-4">
                {filteredRequests.map(request => (
                  <Card key={request.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {request.requestType === 'booking' ? (
                              <>
                                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                                Facility Booking Request
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="h-4 w-4 mr-2 text-green-500" />
                                Purchase Request
                              </>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {request.requestType === 'booking' 
                              ? `${request.details.facility.name} - ${new Date(request.details.startDate).toLocaleDateString()}`
                              : `${request.details.itemName} - ${request.details.quantity} units`
                            }
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                          Pending Approval
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex items-center mt-2">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={
                            request.requestType === 'booking' 
                              ? request.details.user.avatar 
                              : request.details.requestedBy.avatar
                          } />
                          <AvatarFallback>
                            {request.requestType === 'booking' 
                              ? request.details.user.name.substring(0, 2).toUpperCase() 
                              : request.details.requestedBy.name.substring(0, 2).toUpperCase()
                            }
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {request.requestType === 'booking' 
                              ? request.details.user.name 
                              : request.details.requestedBy.name
                            }
                          </div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {request.requestType === 'booking' 
                              ? request.details.user.role 
                              : request.details.requestedBy.role.replace('_', ' ')
                            }
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm flex items-start gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          Requested on {new Date(
                            request.requestType === 'booking' 
                              ? request.details.startDate 
                              : request.details.dateRequested
                          ).toLocaleString()}
                        </div>
                      </div>
                      {request.requestType === 'booking' && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium">Purpose:</div>
                          <p>{request.details.purpose}</p>
                        </div>
                      )}
                      {request.requestType === 'purchase' && (
                        <div className="mt-2 text-sm">
                          <div className="font-medium">Justification:</div>
                          <p>{request.details.justification}</p>
                          <div className="mt-2 font-medium">Total Cost:</div>
                          <p>${request.details.totalPrice.toFixed(2)}</p>
                        </div>
                      )}
                    </CardContent>
                    <div className="px-6 py-3 bg-muted/30 flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600"
                        onClick={() => handleReject(request.id, request.requestType)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleApprove(request.id, request.requestType)}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No pending approval requests found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="bookings">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading booking requests...</p>
              </div>
            ) : filteredRequests?.filter(r => r.requestType === 'booking').length ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests
                      .filter(r => r.requestType === 'booking')
                      .map(request => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">{request.details.facility.name}</div>
                            <div className="text-sm text-muted-foreground">{request.details.facility.location}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.details.user.avatar} />
                                <AvatarFallback>
                                  {request.details.user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.details.user.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">{request.details.user.role}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {new Date(request.details.startDate).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={request.details.purpose}>
                              {request.details.purpose}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleReject(request.id, 'booking')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-500"
                                onClick={() => handleApprove(request.id, 'booking')}
                              >
                                <CheckCircle className="h-4 w-4" />
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
                <p className="text-muted-foreground">No pending booking requests found.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="purchases">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading purchase requests...</p>
              </div>
            ) : filteredRequests?.filter(r => r.requestType === 'purchase').length ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Requested By</TableHead>
                      <TableHead>Justification</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests
                      .filter(r => r.requestType === 'purchase')
                      .map(request => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div className="font-medium">{request.details.itemName}</div>
                          </TableCell>
                          <TableCell>{request.details.quantity}</TableCell>
                          <TableCell>${request.details.totalPrice.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={request.details.requestedBy.avatar} />
                                <AvatarFallback>
                                  {request.details.requestedBy.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{request.details.requestedBy.name}</div>
                                <div className="text-xs text-muted-foreground capitalize">
                                  {request.details.requestedBy.role.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate" title={request.details.justification}>
                              {request.details.justification}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleReject(request.id, 'purchase')}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-8 w-8 p-0 text-green-500"
                                onClick={() => handleApprove(request.id, 'purchase')}
                              >
                                <CheckCircle className="h-4 w-4" />
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
                <p className="text-muted-foreground">No pending purchase requests found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Approvals;
