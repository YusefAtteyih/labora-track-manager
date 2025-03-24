
import { UserRole } from '@/context/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  facultyId?: string;
  faculty?: {
    id: string;
    name: string;
    department: string;
  };
  status?: string;
  lastActive?: string;
  tcNumber?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  organizationId?: string;
  department?: string;
  bookings?: Array<Booking>;
}

export interface Booking {
  id: string;
  purpose: string;
  status: string;
  startDate: string;
  endDate: string;
  labName?: string;
  equipmentName?: string;
}

export interface RawUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  faculty_id: string | null;
  status: string | null;
  last_active: string | null;
  tc_number: string | null;
  first_name: string | null;
  last_name: string | null;
  organization: string | null;
  organization_id: string | null;
  department: string | null;
  faculties: {
    id: string;
    name: string;
    department: string;
  } | null;
}

export interface RawBookingData {
  id: string;
  purpose: string | null;
  status: string;
  start_date: string;
  end_date: string;
  user_id: string;
  labs?: { name: string } | null;
  equipment?: { name: string } | null;
}
