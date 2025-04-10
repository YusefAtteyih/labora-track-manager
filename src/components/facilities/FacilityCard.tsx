
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Facility } from '@/types/facility';
import { trackButtonClick, trackEvent } from '@/utils/analytics';

interface FacilityCardProps {
  facility: Facility;
}

const FacilityCard: React.FC<FacilityCardProps> = ({ facility }) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'booked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'lab':
        return 'Laboratory';
      case 'equipment':
        return 'Equipment';
      case 'classroom':
        return 'Classroom';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const handleViewDetails = () => {
    // Track the view details button click
    trackButtonClick('view_facility_details', `/facilities/${facility.id}`);
    navigate(`/facilities/${facility.id}`);
  };

  const handleBookNow = () => {
    // Track the booking button click
    trackEvent('facility_booking_initiated', {
      facility_id: facility.id,
      facility_name: facility.name,
      facility_type: facility.type,
      facility_status: facility.status
    });
    navigate(`/facilities/${facility.id}?book=true`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={facility.image} 
          alt={facility.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onLoad={() => trackEvent('facility_image_loaded', { facility_id: facility.id })}
        />
        <Badge className="absolute top-2 right-2">{getTypeLabel(facility.type)}</Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{facility.name}</CardTitle>
          <Badge variant="outline" className={getStatusColor(facility.status)}>
            {facility.status.charAt(0).toUpperCase() + facility.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <span>{facility.location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm">
        <p className="text-muted-foreground mb-3 line-clamp-2">{facility.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Users className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>Capacity: {facility.capacity}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>{facility.openHours}</span>
          </div>
        </div>
      </CardContent>
      
      <Separator />
      
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" size="sm" onClick={handleViewDetails}>
          View Details
        </Button>
        <Button 
          size="sm" 
          onClick={handleBookNow}
          disabled={facility.status !== 'available'}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FacilityCard;
