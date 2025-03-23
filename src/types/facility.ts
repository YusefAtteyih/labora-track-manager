// Define the Lab entity
export interface Lab {
  id: string;
  name: string;
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
  facultyId?: string | null;
}

// Define the Equipment entity
export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  status: 'available' | 'booked' | 'maintenance';
  image: string;
  labId?: string | null;
  quantity: number;
  model?: string;
  manufacturer?: string;
  purchaseDate?: string;
  maintenanceSchedule?: string;
  lastMaintenance?: string;
  features: string[];
}

// Keep the Facility interface for backward compatibility during transition
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
  facultyId?: string | null;
}

export interface Booking {
  id: string;
  facilityId?: string;
  labId?: string;
  equipmentId?: string;
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
  facilityId?: string;  // Maintain for backward compatibility
  labId?: string;       // New reference to lab
  facilityName: string; // This will store the name of the facility for display
  facultyId?: string | null; // This will store the faculty ID associated with the facility
  created_at?: string;
  updated_at?: string;
}
