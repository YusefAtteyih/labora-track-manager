
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Lab } from '@/types/facility';
import { useEffect } from 'react';

export const useLabsData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('lab-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labs'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['labs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['labs'],
    queryFn: async (): Promise<Lab[]> => {
      const { data, error } = await supabase
        .from('labs')
        .select('*, organizations:faculty_id(id, name)')
        .order('name');

      if (error) {
        console.error('Error fetching labs:', error);
        throw new Error(error.message);
      }

      // Transform the data to match our Lab type
      return data.map((lab) => {
        // Type cast for lab status
        let typedStatus: 'available' | 'booked' | 'maintenance';
        switch (lab.status) {
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
            console.warn(`Unexpected lab status: ${lab.status}, defaulting to 'available'`);
            typedStatus = 'available';
        }

        // Type cast for availableFor array
        const typedAvailableFor: ('students' | 'staff' | 'visitors')[] = [];
        if (lab.available_for && Array.isArray(lab.available_for)) {
          lab.available_for.forEach(item => {
            if (item === 'students' || item === 'staff' || item === 'visitors') {
              typedAvailableFor.push(item);
            } else {
              console.warn(`Unexpected available_for value: ${item}, skipping`);
            }
          });
        }

        return {
          id: lab.id,
          name: lab.name,
          description: lab.description || '',
          location: lab.location || '',
          capacity: lab.capacity || 0,
          status: typedStatus,
          image: lab.image || 'https://via.placeholder.com/400x200?text=No+Image',
          openHours: lab.open_hours || '',
          department: lab.department || '',
          features: lab.features || [],
          availableFor: typedAvailableFor,
          requiresApproval: lab.requires_approval || false,
          facultyId: lab.faculty_id || null
        };
      });
    }
  });
};
