
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tool, Tag, Layers } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Equipment } from '@/types/facility';

interface EquipmentCardProps {
  equipment: Equipment;
}

const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
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
    navigate(`/equipment/${equipment.id}`);
  };

  const handleBookNow = () => {
    navigate(`/equipment/${equipment.id}?book=true`);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 w-full overflow-hidden">
        <img 
          src={equipment.image} 
          alt={equipment.name} 
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
        <Badge className="absolute top-2 right-2">Equipment</Badge>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{equipment.name}</CardTitle>
          <Badge variant="outline" className={getStatusColor(equipment.status)}>
            {equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Tag className="mr-1 h-3.5 w-3.5" />
          <span>{equipment.category || 'Uncategorized'}</span>
        </div>
      </CardHeader>
      
      <CardContent className="text-sm">
        <p className="text-muted-foreground mb-3 line-clamp-2">{equipment.description}</p>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <Layers className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span>Quantity: {equipment.quantity}</span>
          </div>
          {equipment.model && (
            <div className="flex items-center">
              <Tool className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <span>{equipment.model}</span>
            </div>
          )}
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
          disabled={equipment.status !== 'available'}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Reserve
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EquipmentCard;
