
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Facility } from '@/types/facility';
import { useEffect } from 'react';

export const useFacilityData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for labs
  useEffect(() => {
    const labsChannel = supabase
      .channel('labs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labs'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['facilities'] });
        }
      )
      .subscribe();

    // Set up real-time subscription for equipment
    const equipmentChannel = supabase
      .channel('equipment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['facilities'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(labsChannel);
      supabase.removeChannel(equipmentChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['facilities'],
    queryFn: async (): Promise<Facility[]> => {
      // Fetch labs
      const { data: labsData, error: labsError } = await supabase
        .from('labs')
        .select('*, faculties:faculty_id(id, name)')
        .order('name');

      if (labsError) {
        console.error('Error fetching labs:', labsError);
        throw new Error(labsError.message);
      }

      // Fetch equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (equipmentError) {
        console.error('Error fetching equipment:', equipmentError);
        throw new Error(equipmentError.message);
      }

      // Transform labs data to match Facility type
      const labs = labsData.map((lab): Facility => {
        // Type cast for facility status
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
          type: 'lab', // Always lab for labs table
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

      // Transform equipment data to match Facility type
      const equipment = equipmentData.map((equip): Facility => {
        // Type cast for facility status
        let typedStatus: 'available' | 'booked' | 'maintenance';
        switch (equip.status) {
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
            console.warn(`Unexpected equipment status: ${equip.status}, defaulting to 'available'`);
            typedStatus = 'available';
        }

        return {
          id: equip.id,
          name: equip.name,
          type: 'equipment', // Always equipment for equipment table
          description: equip.description || '',
          location: equip.lab_id ? `Lab equipment - ID: ${equip.lab_id}` : 'General inventory',
          capacity: equip.quantity || 1,
          status: typedStatus,
          image: equip.image || 'https://via.placeholder.com/400x200?text=No+Image',
          openHours: 'N/A', // Equipment doesn't have open hours
          department: '', // Equipment doesn't have department directly
          features: equip.features || [],
          availableFor: ['students', 'staff'], // Default
          requiresApproval: true, // Equipment usually requires approval
          facultyId: null // Equipment doesn't have faculty directly
        };
      });

      // Combine both arrays and return
      return [...labs, ...equipment];
    }
  });
};
