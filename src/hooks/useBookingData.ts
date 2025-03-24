
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

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
    console.log("Setting up real-time subscription for bookings");
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        (payload) => {
          console.log("Booking data changed:", payload);
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      console.log("Removing real-time subscription for bookings");
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: async (): Promise<Booking[]> => {
      try {
        console.log("Fetching bookings data, for userId:", userId || "all");
        
        // Build query based on whether a userId is provided
        let query = supabase
          .from('bookings')
          .select('*')
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

        console.log(`Retrieved ${bookingsData?.length || 0} bookings from database`);

        // For each booking, we need to get the associated facility (lab or equipment) details
        const bookings: Booking[] = await Promise.all(
          bookingsData.map(async (booking) => {
            let facilityData;
            let facilityError;

            // Check if the booking is for a lab
            if (booking.lab_id) {
              const response = await supabase
                .from('labs')
                .select('id, name, location')
                .eq('id', booking.lab_id)
                .single();
              
              facilityData = response.data;
              facilityError = response.error;
              
              if (facilityData) {
                facilityData.type = 'lab';
              }
            }
            // Check if the booking is for equipment
            else if (booking.equipment_id) {
              const response = await supabase
                .from('equipment')
                .select('id, name')
                .eq('id', booking.equipment_id)
                .single();
              
              facilityData = response.data;
              facilityError = response.error;
              
              if (facilityData) {
                facilityData.type = 'equipment';
                facilityData.location = 'Equipment';
              }
            }
            // If it's a legacy booking with facility_id, handle that too
            else if (booking.facility_id) {
              // Try labs first
              let response = await supabase
                .from('labs')
                .select('id, name, location')
                .eq('id', booking.facility_id)
                .single();
              
              if (response.data) {
                facilityData = response.data;
                facilityData.type = 'lab';
              } else {
                // Try equipment if not found in labs
                response = await supabase
                  .from('equipment')
                  .select('id, name')
                  .eq('id', booking.facility_id)
                  .single();
                
                if (response.data) {
                  facilityData = response.data;
                  facilityData.type = 'equipment';
                  facilityData.location = 'Equipment';
                }
              }
              
              facilityError = response.error;
            }

            if (facilityError && !facilityData) {
              console.error(`Error fetching facility for booking ${booking.id}:`, facilityError);
              // Provide a fallback for missing facility data rather than failing
              facilityData = {
                id: booking.facility_id || booking.lab_id || booking.equipment_id || 'unknown',
                name: 'Unknown Facility',
                location: 'Unknown Location',
                type: 'unknown'
              };
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
      } catch (error) {
        console.error('Error in useBookingData:', error);
        if (error instanceof Error) {
          toast({
            title: "Error Loading Bookings",
            description: error.message,
            variant: "destructive"
          });
        }
        throw error;
      }
    }
  });
};
