
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { InventoryItem } from '@/types/facility';

export const useInventoryData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['inventory'],
    queryFn: async (): Promise<InventoryItem[]> => {
      // First fetch inventory items
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name');
      
      if (inventoryError) {
        console.error('Error fetching inventory items:', inventoryError);
        throw new Error(inventoryError.message);
      }

      // Then fetch all facilities for mapping
      const { data: facilitiesData, error: facilitiesError } = await supabase
        .from('facilities')
        .select('id, name');
      
      if (facilitiesError) {
        console.error('Error fetching facilities:', facilitiesError);
        throw new Error(facilitiesError.message);
      }

      // Create a map of facility IDs to names for quick lookup
      const facilityMap = new Map();
      facilitiesData.forEach(facility => {
        facilityMap.set(facility.id, facility.name);
      });
      
      // Map inventory items to include facility names
      return inventoryData.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        facilityId: item.facility_id || '',
        facilityName: item.facility_id ? facilityMap.get(item.facility_id) || 'Unknown Facility' : 'Unassigned',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });
};
