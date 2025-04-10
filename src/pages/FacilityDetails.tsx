import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { format, addHours } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Users, 
  Clock, 
  Building, 
  Check,
  BookOpen,
  AlertTriangle
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/hooks/use-toast';
import { useFacilityData } from '@/hooks/useFacilityData';
import { useAuth } from '@/context/AuthContext';
import { createBooking, BookingFormData } from '@/services/bookingService';

const FacilityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: facilities, isLoading } = useFacilityData();
  const [facility, setFacility] = useState<any>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    facilityId: id || '',
    startDate: new Date(),
    endDate: addHours(new Date(), 1),
    purpose: '',
    attendees: 1,
    notes: ''
  });

  // Check if the URL includes the book parameter and open booking dialog if it does
  useEffect(() => {
    console.log("Checking URL for booking parameter:", location.search);
    const shouldOpenBookingDialog = new URLSearchParams(location.search).get('book') === 'true';
    if (shouldOpenBookingDialog) {
      console.log("Opening booking dialog from URL parameter");
      setIsBookingDialogOpen(true);
      // Clean up the URL without triggering a navigation
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  // Find the facility with the matching id
  useEffect(() => {
    if (facilities && id) {
      console.log("Looking for facility with ID:", id);
      const foundFacility = facilities.find(facility => facility.id === id);
      if (foundFacility) {
        console.log("Found facility:", foundFacility.name);
        setFacility(foundFacility);
      } else {
        console.log("Facility not found in loaded facilities data");
      }
    }
  }, [facilities, id]);

  const handleBookingSubmit = async () => {
    try {
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to make a booking",
          variant: "destructive"
        });
        return;
      }

      if (!bookingForm.purpose.trim()) {
        toast({
          title: "Validation Error",
          description: "Please provide a purpose for your booking",
          variant: "destructive"
        });
        return;
      }

      if (bookingForm.startDate >= bookingForm.endDate) {
        toast({
          title: "Validation Error",
          description: "End time must be after start time",
          variant: "destructive"
        });
        return;
      }

      // Set form to loading state
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
      }

      console.log("Submitting booking form:", bookingForm);
      
      await createBooking(bookingForm, user);
      
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been sent for approval.",
      });
      
      setIsBookingDialogOpen(false);
      
      // Reset submit button
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      
      // Reset submit button
      const submitButton = document.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = false;
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Available</Badge>;
      case 'maintenance':
        return <Badge className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case 'booked':
        return <Badge className="bg-red-100 text-red-800">Booked</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading facility details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!facility) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-2">Facility Not Found</h2>
          <p className="text-muted-foreground mb-4">The facility you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/facilities')}>Return to Facilities</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{facility.name}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="mr-1.5 h-4 w-4" />
              <span>{facility.location}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusBadge(facility.status)}
            {facility.status === 'available' && (
              <Button onClick={() => setIsBookingDialogOpen(true)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Facility
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{facility.description}</p>
              </CardContent>
            </Card>

            <Tabs defaultValue="details">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        Capacity
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{facility.capacity} people</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        Operating Hours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{facility.openHours}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Building className="mr-2 h-4 w-4" />
                        Department
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{facility.department}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Available For
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {facility.availableFor.map((userType: string) => (
                          <Badge key={userType} variant="outline" className="capitalize">
                            {userType}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {facility.requiresApproval && (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">Approval Required</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>Bookings for this facility require approval from a supervisor.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Facility Features</CardTitle>
                    <CardDescription>
                      Equipment and amenities available in this facility
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {facility.features.map((feature: string) => (
                        <li key={feature} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="availability" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability Calendar</CardTitle>
                    <CardDescription>
                      Check when this facility is available for booking
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-4 text-center">
                      <p className="text-muted-foreground">
                        Detailed availability calendar coming soon
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div>
            <Card className="sticky top-6">
              <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                <img 
                  src={facility.image} 
                  alt={facility.name} 
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle>Quick Booking</CardTitle>
                <CardDescription>
                  Reserve this facility for your needs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm">
                  <div className="font-medium mb-1">Status</div>
                  {getStatusBadge(facility.status)}
                </div>
                
                <Separator />
                
                <div className="text-sm">
                  <div className="font-medium mb-1">Department</div>
                  <div>{facility.department}</div>
                </div>
                
                <Separator />
                
                <div className="text-sm">
                  <div className="font-medium mb-1">Operating Hours</div>
                  <div>{facility.openHours}</div>
                </div>
                
                <Button 
                  className="w-full" 
                  disabled={facility.status !== 'available'}
                  onClick={() => setIsBookingDialogOpen(true)}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Book Now
                </Button>
                
                {facility.status !== 'available' && (
                  <p className="text-xs text-center text-muted-foreground">
                    This facility is currently {facility.status.toLowerCase()} and cannot be booked.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Book {facility.name}</DialogTitle>
            <DialogDescription>
              Fill out the form below to request a booking for this facility.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(bookingForm.startDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingForm.startDate}
                      onSelect={(date) => date && setBookingForm({...bookingForm, startDate: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={format(bookingForm.startDate, "HH:mm")}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(bookingForm.startDate);
                    newDate.setHours(hours, minutes);
                    setBookingForm({...bookingForm, startDate: newDate});
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(bookingForm.endDate, "PPP")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={bookingForm.endDate}
                      onSelect={(date) => date && setBookingForm({...bookingForm, endDate: date})}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={format(bookingForm.endDate, "HH:mm")}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newDate = new Date(bookingForm.endDate);
                    newDate.setHours(hours, minutes);
                    setBookingForm({...bookingForm, endDate: newDate});
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose of Booking</Label>
              <Input
                id="purpose"
                value={bookingForm.purpose}
                onChange={(e) => setBookingForm({...bookingForm, purpose: e.target.value})}
                placeholder="Lab experiment, class project, research, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="attendees">Number of Attendees</Label>
              <Input
                id="attendees"
                type="number"
                min="1"
                max={facility.capacity}
                value={bookingForm.attendees}
                onChange={(e) => setBookingForm({...bookingForm, attendees: parseInt(e.target.value)})}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes || ''}
                onChange={(e) => setBookingForm({...bookingForm, notes: e.target.value})}
                placeholder="Any special requirements or information"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBookingSubmit} type="submit">
              Submit Booking Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default FacilityDetails;
