
export interface Facility {
  id: string;
  name: string;
  type: 'lab' | 'equipment' | 'classroom';
  description: string;
  location: string;
  capacity: number;
  status: 'available' | 'booked' | 'maintenance';
  image: string;
  openHours: string;
  department: string;
  features: string[];
  availableFor: ('students' | 'staff' | 'visitors')[];
  requiresApproval: boolean;
}

export interface Booking {
  id: string;
  facilityId: string;
  userId: string;
  userName: string;
  userRole: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  purpose: string;
  attendees: number;
  notes?: string;
}
