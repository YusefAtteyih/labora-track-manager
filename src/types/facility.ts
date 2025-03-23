
export interface Facility {
  id: string;
  name: string;
  type: 'lab' | 'equipment';
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

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  status: string;
  facilityId: string;  // This will store the UUID of the associated facility
  facilityName: string; // This will store the name of the facility for display
  created_at?: string;
  updated_at?: string;
}
