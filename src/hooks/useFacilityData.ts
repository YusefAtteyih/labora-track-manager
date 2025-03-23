
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Facility } from '@/types/facility';
import { useEffect } from 'react';

export const useFacilityData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('facility-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facilities'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['facilities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<Facility[]> => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching facilities:', error);
        throw new Error(error.message);
      }

      // Transform the data to match our Facility type
      return data.map((facility): Facility => {
        // Type cast for facility type
        let typedType: 'lab' | 'equipment' | 'classroom';
        switch (facility.type) {
          case 'lab':
            typedType = 'lab';
            break;
          case 'equipment':
            typedType = 'equipment';
            break;
          case 'classroom':
            typedType = 'classroom';
            break;
          default:
            console.warn(`Unexpected facility type: ${facility.type}, defaulting to 'lab'`);
            typedType = 'lab';
        }
        
        // Type cast for facility status
        let typedStatus: 'available' | 'booked' | 'maintenance';
        switch (facility.status) {
          case 'available':
            typedStatus = 'available';
            break;
          case 'booked':
            typedStatus = 'booked';
            break;
          case 'maintenance':
            typedStatus = 'maintenance';
            break;
          default:
            console.warn(`Unexpected facility status: ${facility.status}, defaulting to 'available'`);
            typedStatus = 'available';
        }

        // Type cast for availableFor array
        const typedAvailableFor: ('students' | 'staff' | 'visitors')[] = [];
        if (facility.available_for && Array.isArray(facility.available_for)) {
          facility.available_for.forEach(item => {
            if (item === 'students' || item === 'staff' || item === 'visitors') {
              typedAvailableFor.push(item);
            } else {
              console.warn(`Unexpected available_for value: ${item}, skipping`);
            }
          });
        }

        return {
          id: facility.id,
          name: facility.name,
          type: typedType,
          description: facility.description || '',
          location: facility.location || '',
          capacity: facility.capacity || 0,
          status: typedStatus,
          image: facility.image || 'https://via.placeholder.com/400x200?text=No+Image',
          openHours: facility.open_hours || '',
          department: facility.department || '',
          features: facility.features || [],
          availableFor: typedAvailableFor,
          requiresApproval: facility.requires_approval || false
        };
      });
    }
  });
};
