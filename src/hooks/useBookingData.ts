
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  facility: {
    id: string;
    name: string;
    location: string;
    type: string;
  };
  user: {
    id: string;
    name: string;
    role: string;
    avatar: string;
  };
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
  purpose: string;
  attendees: number;
  notes?: string;
}

export const useBookingData = () => {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async (): Promise<Booking[]> => {
      // First get all the bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, facility_id')
        .order('start_date', { ascending: false });

      if (bookingsError) {
        console.error('Error fetching bookings:', bookingsError);
        throw new Error(bookingsError.message);
      }

      // For each booking, we need to get the facility details
      const bookings: Booking[] = await Promise.all(
        bookingsData.map(async (booking) => {
          const { data: facilityData, error: facilityError } = await supabase
            .from('facilities')
            .select('id, name, location, type')
            .eq('id', booking.facility_id)
            .single();

          if (facilityError) {
            console.error(`Error fetching facility for booking ${booking.id}:`, facilityError);
            throw new Error(facilityError.message);
          }

          return {
            id: booking.id,
            facility: {
              id: facilityData.id,
              name: facilityData.name,
              location: facilityData.location,
              type: facilityData.type
            },
            user: {
              id: booking.user_id,
              name: booking.user_name,
              role: booking.user_role,
              avatar: booking.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(booking.user_name)}&background=38bdf8&color=fff`
            },
            startDate: booking.start_date,
            endDate: booking.end_date,
            status: booking.status,
            purpose: booking.purpose,
            attendees: booking.attendees,
            notes: booking.notes
          };
        })
      );

      return bookings;
    }
  });
};
