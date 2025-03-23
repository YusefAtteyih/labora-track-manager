
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Equipment } from '@/types/facility';
import { useEffect } from 'react';

export const useEquipmentData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
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
          queryClient.invalidateQueries({ queryKey: ['equipment'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['equipment'],
    queryFn: async (): Promise<Equipment[]> => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, labs:lab_id(id, name, location)')
        .order('name');

      if (error) {
        console.error('Error fetching equipment:', error);
        throw new Error(error.message);
      }

      // Transform the data to match our Equipment type
      return data.map((equipment): Equipment => {
        // Type cast for status
        let typedStatus: 'available' | 'booked' | 'maintenance';
        switch (equipment.status) {
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
            console.warn(`Unexpected equipment status: ${equipment.status}, defaulting to 'available'`);
            typedStatus = 'available';
        }

        return {
          id: equipment.id,
          name: equipment.name,
          description: equipment.description || '',
          category: equipment.category || '',
          status: typedStatus,
          image: equipment.image || 'https://via.placeholder.com/400x200?text=No+Image',
          labId: equipment.lab_id || null,
          quantity: equipment.quantity || 1,
          model: equipment.model,
          manufacturer: equipment.manufacturer,
          purchaseDate: equipment.purchase_date,
          maintenanceSchedule: equipment.maintenance_schedule,
          lastMaintenance: equipment.last_maintenance,
          features: equipment.features || []
        };
      });
    }
  });
};
