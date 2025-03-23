
import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShoppingCart, 
  Users,
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";
import { useDashboardData } from '@/hooks/useDashboardData';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error } = useDashboardData();
  
  // Check if user has admin privileges (org_admin or lab_supervisor)
  const hasAdminPrivileges = user?.role === 'org_admin' || user?.role === 'lab_supervisor';

  const handleApprove = (id: string) => {
    toast({
      title: "Approved",
      description: `Request ${id} has been approved`,
    });
  };

  const handleReject = (id: string) => {
    toast({
      title: "Rejected",
      description: `Request ${id} has been rejected`,
    });
  };

  if (error) {
    return (
      <MainLayout>
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-red-800 font-medium">Error loading dashboard data</h2>
          <p className="text-red-600">{(error as Error).message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}. Here's what's happening in the lab.
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Inventory</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{dashboardData?.stats.totalInventory}</h3>
                      <p className="text-xs text-muted-foreground">Items in stock</p>
                    </>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-lab-100 flex items-center justify-center">
                  <ShoppingCart className="h-6 w-6 text-lab-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Bookings</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{dashboardData?.stats.activeBookings}</h3>
                      <p className="text-xs text-muted-foreground">For today</p>
                    </>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-lab-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-lab-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending Approvals</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{dashboardData?.stats.pendingApprovals}</h3>
                      <p className="text-xs text-muted-foreground">Requests waiting</p>
                    </>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-lab-100 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-lab-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card transition-all hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Users</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-1" />
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold">{dashboardData?.stats.activeUsers}</h3>
                      <p className="text-xs text-muted-foreground">This week</p>
                    </>
                  )}
                </div>
                <div className="h-12 w-12 rounded-full bg-lab-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-lab-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
              <CardDescription>
                Current stock levels by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData?.inventoryData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Weekly Bookings</CardTitle>
              <CardDescription>
                Lab usage statistics for this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dashboardData?.bookingData}
                      margin={{
                        top: 20,
                        right: 20,
                        left: 0,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Admin/Staff Specific Content */}
        {hasAdminPrivileges && (
          <>
            <h2 className="text-xl font-semibold mt-6">Approvals & Alerts</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Pending Approvals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg animate-pulse bg-gray-100">
                          <Skeleton className="h-16 w-2/3" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : dashboardData?.pendingApprovals && dashboardData.pendingApprovals.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.pendingApprovals.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-accent p-3 rounded-lg animate-fade-in">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{item.type}</Badge>
                              <span className="font-medium">{item.user}</span>
                            </div>
                            <p className="text-sm">{item.item}</p>
                            <div className="text-xs text-muted-foreground">
                              {item.date} {item.time && `· ${item.time}`} {item.amount && `· ${item.amount}`}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleReject(item.id)}
                            >
                              Reject
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                            >
                              Approve
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No pending approvals</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex justify-between items-center p-3 rounded-lg animate-pulse bg-gray-100">
                          <Skeleton className="h-16 w-2/3" />
                          <Skeleton className="h-8 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : dashboardData?.lowStockItems && dashboardData.lowStockItems.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.lowStockItems.map((item) => (
                        <div 
                          key={item.id} 
                          className={`flex items-center justify-between p-3 rounded-lg animate-fade-in ${
                            item.status === 'critical' ? 'bg-red-50' : 'bg-amber-50'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              {item.status === 'critical' && (
                                <Badge variant="destructive">Critical</Badge>
                              )}
                              {item.status === 'warning' && (
                                <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                                  Warning
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm">
                              {item.current} remaining (min: {item.minimum})
                            </p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Order placed",
                                description: `Order for ${item.name} has been created`,
                              });
                            }}
                          >
                            Order More
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No low stock alerts</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
        
        {/* All Users */}
        <h2 className="text-xl font-semibold mt-6">Your Schedule</h2>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg animate-pulse bg-gray-100">
                    <Skeleton className="h-16 w-2/3" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            ) : dashboardData?.upcomingBookings && dashboardData.upcomingBookings.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.upcomingBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between bg-accent p-3 rounded-lg animate-fade-in">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.lab}</span>
                        {booking.status === 'confirmed' && (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            Confirmed
                          </Badge>
                        )}
                        {booking.status === 'pending' && (
                          <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                            Pending
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm">{booking.date} · {booking.time}</p>
                    </div>
                    <Button 
                      variant={booking.status === 'confirmed' ? "outline" : "secondary"}
                      size="sm"
                      onClick={() => {
                        toast({
                          title: booking.status === 'confirmed' ? "Booking Canceled" : "Reminder Set",
                          description: booking.status === 'confirmed' 
                            ? `Your booking for ${booking.lab} has been canceled` 
                            : `We'll remind you when ${booking.lab} booking is confirmed`,
                        });
                      }}
                    >
                      {booking.status === 'confirmed' ? 'Cancel' : 'Remind Me'}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 text-blue-500 opacity-70" />
                <p>No upcoming bookings</p>
                <Button 
                  className="mt-4" 
                  variant="outline"
                  onClick={() => window.location.href = '/bookings'}
                >
                  Book a Facility
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
