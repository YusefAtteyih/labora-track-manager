
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useFacilityData } from '@/hooks/useFacilityData';

interface BookingDialogWrapperProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const BookingDialogWrapper: React.FC<BookingDialogWrapperProps> = ({
  isOpen,
  onOpenChange,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>("");
  const { data: facilities, isLoading } = useFacilityData();
  const navigate = useNavigate();

  // Filter only available facilities
  const availableFacilities = facilities?.filter(facility => facility.status === 'available') || [];
  
  const handleContinue = () => {
    if (selectedFacilityId) {
      // Close dialog and navigate to facility details with book parameter
      onOpenChange(false);
      navigate(`/labs/${selectedFacilityId}?book=true`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Booking</DialogTitle>
          <DialogDescription>
            Select a facility to book
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-4">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading facilities...</p>
          ) : availableFacilities.length === 0 ? (
            <p className="text-center text-muted-foreground">No available facilities found</p>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="facility">Select Facility</Label>
              <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a facility" />
                </SelectTrigger>
                <SelectContent>
                  {availableFacilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      {facility.name} - {facility.location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedFacilityId}
          >
            Continue to Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialogWrapper;
