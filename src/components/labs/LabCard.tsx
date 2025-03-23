
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Lab } from '@/types/facility';

interface LabCardProps {
  lab: Lab;
}

const LabCard: React.FC<LabCardProps> = ({ lab }) => {
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

  const handleViewDetails = () => {
    navigate(`/labs/${lab.id}`);
  };

  const handleBookNow = () => {
    navigate(`/labs/${lab.id}?book=true`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={lab.image} 
          alt={lab.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 right-2">Laboratory</Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{lab.name}</CardTitle>
          <Badge variant="outline" className={getStatusColor(lab.status)}>
            {lab.status.charAt(0).toUpperCase() + lab.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <MapPin className="mr-1 h-3.5 w-3.5" />
          <span>{lab.location}</span>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm">
        <p className="text-muted-foreground mb-3 line-clamp-2">{lab.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Users className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>Capacity: {lab.capacity}</span>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>{lab.openHours}</span>
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
          disabled={lab.status !== 'available'}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LabCard;
