
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface FacilityStatusBadgeProps {
  status: 'available' | 'booked' | 'maintenance';
}

const FacilityStatusBadge: React.FC<FacilityStatusBadgeProps> = ({ status }) => {
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

export default FacilityStatusBadge;
