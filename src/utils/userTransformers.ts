
import { User, RawUserData, RawBookingData, Booking } from '@/types/user';
import { UserRole } from '@/context/AuthContext';

export const transformRawUserData = (
  rawUsers: Array<RawUserData & { bookings?: RawBookingData[] }>
): User[] => {
  return rawUsers.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
    avatar: user.avatar || undefined,
    facultyId: user.faculty_id || undefined,
    faculty: user.faculties ? {
      id: user.faculties.id,
      name: user.faculties.name,
      department: user.faculties.department
    } : undefined,
    status: user.status || undefined,
    lastActive: user.last_active || undefined,
    tcNumber: user.tc_number || undefined,
    firstName: user.first_name || undefined,
    lastName: user.last_name || undefined,
    organization: user.organization || undefined,
    organizationId: user.organization_id || undefined,
    department: user.department || undefined,
    bookings: user.bookings ? transformRawBookingData(user.bookings) : undefined
  }));
};

export const transformRawBookingData = (rawBookings: RawBookingData[]): Booking[] => {
  return rawBookings.map(booking => ({
    id: booking.id,
    purpose: booking.purpose || '',
    status: booking.status,
    startDate: booking.start_date,
    endDate: booking.end_date,
    labName: booking.labs?.name,
    equipmentName: booking.equipment?.name
  }));
};
