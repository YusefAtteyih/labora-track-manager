
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, CheckCircle } from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Button } from "@/components/ui/button";
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { createBooking, BookingFormData } from '@/services/bookingService';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FacilityBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  facilityId: string;
  facilityName: string;
  capacityLimit: number;
}

const FacilityBookingDialog: React.FC<FacilityBookingDialogProps> = ({
  isOpen,
  onOpenChange,
  facilityId,
  facilityName,
  capacityLimit,
}) => {
  const { user } = useAuth();
  const [bookingForm, setBookingForm] = useState<BookingFormData>({
    facilityId: facilityId,
    startDate: new Date(),
    endDate: new Date(new Date().setHours(new Date().getHours() + 1)),
    purpose: '',
    attendees: 1,
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      setIsSubmitting(true);

      console.log("Submitting booking form:", bookingForm);
      
      await createBooking(bookingForm, user);
      
      // Set success state
      setIsSuccess(true);
      
      toast({
        title: "Booking Request Submitted",
        description: "Your booking request has been sent for approval.",
      });
      
      // Close dialog after 3 seconds
      setTimeout(() => {
        onOpenChange(false);
        // Reset success state after dialog closes
        setTimeout(() => {
          setIsSuccess(false);
        }, 300);
      }, 3000);
    } catch (error) {
      console.error("Booking submission error:", error);
      setIsSubmitting(false);
    }
  };

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setIsSubmitting(false);
      // Small delay before resetting success state to allow animation to complete
      setTimeout(() => {
        setIsSuccess(false);
      }, 300);
    }
  }, [isOpen]);

  // Update the facilityId whenever it changes in props
  useEffect(() => {
    setBookingForm(prev => ({
      ...prev,
      facilityId: facilityId
    }));
  }, [facilityId]);

  // If submission was successful, show success view
  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold">Booking Submitted</h2>
            <p className="mt-2 text-muted-foreground">
              Your booking request for {facilityName} has been submitted successfully and is awaiting approval.
            </p>
            <p className="mt-4 text-sm">
              The dialog will close automatically in a few seconds.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book {facilityName}</DialogTitle>
          <DialogDescription>
            Fill out the form below to request a booking for this facility.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription>
              All booking requests need approval from facility administrators before they are confirmed.
            </AlertDescription>
          </Alert>

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
              max={capacityLimit}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleBookingSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Booking Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FacilityBookingDialog;
