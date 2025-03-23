
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
  CircleCheck
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

// Mock data for charts
const inventoryData = [
  { name: 'Chemicals', count: 64 },
  { name: 'Glassware', count: 42 },
  { name: 'Equipment', count: 28 },
  { name: 'Tools', count: 35 },
  { name: 'Safety', count: 18 },
];

const bookingData = [
  { day: 'Mon', count: 12 },
  { day: 'Tue', count: 19 },
  { day: 'Wed', count: 8 },
  { day: 'Thu', count: 15 },
  { day: 'Fri', count: 23 },
  { day: 'Sat', count: 10 },
  { day: 'Sun', count: 4 },
];

// Mock pending approvals
const pendingApprovals = [
  {
    id: 'req-001',
    type: 'Booking',
    user: 'Anna Johnson',
    item: 'Microscopy Lab',
    date: '2023-06-15',
    time: '10:00 AM'
  },
  {
    id: 'req-002',
    type: 'Purchase',
    user: 'Michael Chen',
    item: 'Chemical Reagents',
    amount: '$320.50',
    date: '2023-06-14'
  },
  {
    id: 'req-003',
    type: 'Booking',
    user: 'Sarah Wilson',
    item: 'Spectrophotometer',
    date: '2023-06-16',
    time: '2:30 PM'
  }
];

// Mock upcoming bookings
const upcomingBookings = [
  {
    id: 'book-001',
    lab: 'Biochemistry Lab',
    date: 'Today',
    time: '2:00 PM - 4:00 PM',
    status: 'confirmed'
  },
  {
    id: 'book-002',
    lab: 'Physics Lab 2',
    date: 'Tomorrow',
    time: '10:00 AM - 12:00 PM',
    status: 'pending'
  },
  {
    id: 'book-003',
    lab: 'Computer Lab',
    date: 'Jun 18',
    time: '3:00 PM - 5:00 PM',
    status: 'confirmed'
  }
];

// Mock low stock items
const lowStockItems = [
  {
    id: 'item-001',
    name: 'Microscope Slides',
    current: 8,
    minimum: 20,
    status: 'critical'
  },
  {
    id: 'item-002',
    name: 'Ethanol 95%',
    current: 2,
    minimum: 5,
    status: 'critical'
  },
  {
    id: 'item-003',
    name: 'Nitrile Gloves (M)',
    current: 15,
    minimum: 25,
    status: 'warning'
  }
];

const Dashboard = () => {
  const { user } = useAuth();

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
                  <h3 className="text-2xl font-bold">187</h3>
                  <p className="text-xs text-muted-foreground">Items in stock</p>
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
                  <h3 className="text-2xl font-bold">24</h3>
                  <p className="text-xs text-muted-foreground">For today</p>
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
                  <h3 className="text-2xl font-bold">8</h3>
                  <p className="text-xs text-muted-foreground">Requests waiting</p>
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
                  <h3 className="text-2xl font-bold">42</h3>
                  <p className="text-xs text-muted-foreground">This week</p>
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={inventoryData}
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={bookingData}
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
            </CardContent>
          </Card>
        </div>
        
        {/* Admin/Staff Specific Content */}
        {(user?.role === 'admin' || user?.role === 'staff') && (
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
                  <div className="space-y-4">
                    {pendingApprovals.map((item) => (
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
                  <div className="space-y-4">
                    {lowStockItems.map((item) => (
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
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
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
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
