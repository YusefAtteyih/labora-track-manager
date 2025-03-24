import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, Filter, Plus, Search, Slash, X, XCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useBookingData } from '@/hooks/useBookingData';
import { approveBooking, rejectBooking } from '@/services/bookingService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

const Bookings = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);
  
  const { data: bookings, isLoading, isError, refetch } = useBookingData();
  const { user, isAuthenticated } = useAuth();

  // Check if user has permission to approve/reject (admin or lab supervisor)
  const canManageBookings = isAuthenticated && user?.role && ['org_admin', 'lab_supervisor'].includes(user.role);

  // Handle approve booking
  const handleApproveBooking = async (bookingId: string) => {
    try {
      setProcessingBookingId(bookingId);
      await approveBooking(bookingId);
      toast({
        title: "Booking Approved",
        description: "The booking has been successfully approved.",
      });
      refetch(); // Refresh the bookings data
    } catch (error) {
      console.error("Error approving booking:", error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "An error occurred while approving the booking.",
        variant: "destructive"
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Handle reject booking
  const handleRejectBooking = async (bookingId: string) => {
    try {
      setProcessingBookingId(bookingId);
      await rejectBooking(bookingId);
      toast({
        title: "Booking Rejected",
        description: "The booking has been rejected.",
      });
      refetch(); // Refresh the bookings data
    } catch (error) {
      console.error("Error rejecting booking:", error);
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "An error occurred while rejecting the booking.",
        variant: "destructive"
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  // Filter bookings based on search query and filters
  const filteredBookings = bookings?.filter(booking => {
    const matchesSearch = 
      booking.facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesType = filterType === 'all' || booking.facility.type === filterType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // Group bookings by day for calendar view
  const groupedBookings = React.useMemo(() => {
    if (!filteredBookings) return {};
    
    return filteredBookings.reduce((acc, booking) => {
      const date = booking.startDate.split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(booking);
      return acc;
    }, {} as Record<string, typeof filteredBookings>);
  }, [filteredBookings]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bookings</h2>
            <p className="text-muted-foreground">
              View and manage facility and equipment bookings
            </p>
          </div>
          <Button className="sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>

        {/* Filter section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="lab">Laboratory</SelectItem>
                <SelectItem value="equipment">Equipment</SelectItem>
                <SelectItem value="classroom">Classroom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs section */}
        <Tabs defaultValue="list">
          <TabsList className="mb-4">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          {/* List View Tab */}
          <TabsContent value="list" className="mt-0">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading bookings...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-destructive">Error loading bookings</p>
              </div>
            ) : filteredBookings && filteredBookings.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Facility</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.facility.name}</div>
                          <div className="text-sm text-muted-foreground">{booking.facility.location}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={booking.user.avatar} />
                              <AvatarFallback>
                                {booking.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{booking.user.name}</div>
                              <div className="text-xs text-muted-foreground capitalize">{booking.user.role}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(booking.startDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {new Date(booking.endDate).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate" title={booking.purpose}>
                            {booking.purpose}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {booking.status === 'pending' && canManageBookings && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0" 
                                  disabled={processingBookingId === booking.id}
                                  onClick={() => handleApproveBooking(booking.id)}
                                  title="Approve booking"
                                >
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-8 w-8 p-0"
                                  disabled={processingBookingId === booking.id}
                                  onClick={() => handleRejectBooking(booking.id)}
                                  title="Reject booking"
                                >
                                  <XCircle className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
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
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No bookings found</p>
              </div>
            )}
          </TabsContent>

          {/* Calendar View Tab */}
          <TabsContent value="calendar" className="mt-0">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading calendar view...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-10">
                <p className="text-destructive">Error loading bookings</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(groupedBookings).sort().map(([date, dayBookings]) => (
                  <Card key={date} className="overflow-hidden">
                    <CardHeader className="bg-muted/50 pb-2">
                      <CardTitle className="text-lg">
                        {new Date(date).toLocaleDateString(undefined, {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </CardTitle>
                      <CardDescription>
                        {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4 px-2">
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {dayBookings.map((booking) => (
                          <div
                            key={booking.id}
                            className="p-2 rounded-md border border-border hover:bg-accent transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div className="font-medium">{booking.facility.name}</div>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              {new Date(booking.startDate).toLocaleTimeString()} - {new Date(booking.endDate).toLocaleTimeString()}
                            </div>
                            <div className="flex items-center mt-2">
                              <Avatar className="h-6 w-6 mr-2">
                                <AvatarImage src={booking.user.avatar} />
                                <AvatarFallback>
                                  {booking.user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{booking.user.name}</span>
                            </div>
                            {booking.status === 'pending' && canManageBookings && (
                              <div className="flex mt-2 gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 w-full py-0 text-xs"
                                  disabled={processingBookingId === booking.id}
                                  onClick={() => handleApproveBooking(booking.id)}
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="h-6 w-full py-0 text-xs"
                                  disabled={processingBookingId === booking.id}
                                  onClick={() => handleRejectBooking(booking.id)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Bookings;
