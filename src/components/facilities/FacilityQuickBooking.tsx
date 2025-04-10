
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BookOpen } from 'lucide-react';
import FacilityStatusBadge from './FacilityStatusBadge';
import { Facility } from '@/types/facility';

interface FacilityQuickBookingProps {
  facility: Facility;
  onBookNow: () => void;
}

const FacilityQuickBooking: React.FC<FacilityQuickBookingProps> = ({ facility, onBookNow }) => {
  return (
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
          <FacilityStatusBadge status={facility.status} />
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
          onClick={onBookNow}
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
  );
};

export default FacilityQuickBooking;
