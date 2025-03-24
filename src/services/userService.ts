
import { supabase } from '@/integrations/supabase/client';
import { RawUserData, RawBookingData } from '@/types/user';

export const fetchUsers = async () => {
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select(`
      id,
      name,
      email,
      role,
      avatar,
      faculty_id,
      status,
      last_active,
      tc_number,
      first_name,
      last_name,
      organization,
      organization_id,
      department,
      faculties:faculty_id (
        id,
        name,
        department
      )
    `)
    .order('name');
  
  if (userError) {
    console.error('Error fetching users:', userError);
    throw new Error(userError.message);
  }
  
  return userData as RawUserData[];
};

export const fetchUserRole = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error) {
    console.error('Error fetching user role:', error);
    throw new Error(error.message);
  }
  
  return data?.role;
};

export const fetchUserBookings = async () => {
  const { data: bookingsData, error: bookingsError } = await supabase
    .from('bookings')
    .select(`
      id,
      purpose,
      status,
      start_date,
      end_date,
      user_id,
      lab_id,
      equipment_id,
      labs:lab_id (name),
      equipment:equipment_id (name)
    `)
    .order('start_date', { ascending: false });
      
  if (bookingsError) {
    console.error('Error fetching bookings:', bookingsError);
    throw new Error(bookingsError.message);
  }
  
  return bookingsData as RawBookingData[];
};

export const organizeBookingsByUser = (bookings: RawBookingData[]) => {
  return bookings.reduce<Record<string, RawBookingData[]>>((acc, booking) => {
    if (!acc[booking.user_id]) {
      acc[booking.user_id] = [];
    }
    acc[booking.user_id].push(booking);
    return acc;
  }, {});
};
