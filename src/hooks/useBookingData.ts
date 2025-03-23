
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

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

export const useBookingData = (userId?: string) => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async (): Promise<Booking[]> => {
      // Build query based on whether a userId is provided
      let query = supabase
        .from('bookings')
        .select('*, facility_id')
        .order('start_date', { ascending: false });
      
      // If userId is provided, filter by that user
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data: bookingsData, error: bookingsError } = await query;

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

          // Ensure the status is of the correct type
          const validStatus = (booking.status as string).toLowerCase();
          let typedStatus: 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled';
          
          // Map the status from the database to our expected type
          switch (validStatus) {
            case 'pending':
              typedStatus = 'pending';
              break;
            case 'approved':
              typedStatus = 'approved';
              break;
            case 'rejected':
              typedStatus = 'rejected';
              break;
            case 'completed':
              typedStatus = 'completed';
              break;
            case 'cancelled':
              typedStatus = 'cancelled';
              break;
            default:
              // Default to pending if an unexpected status is received
              console.warn(`Unexpected booking status: ${booking.status}, defaulting to 'pending'`);
              typedStatus = 'pending';
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
            status: typedStatus,
            purpose: booking.purpose || '',
            attendees: booking.attendees || 0,
            notes: booking.notes
          };
        })
      );

      return bookings;
    }
  });
};
