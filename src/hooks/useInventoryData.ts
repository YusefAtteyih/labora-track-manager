
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
      // Fetch inventory items from the database with facility information
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          facilities:facility_id (
            name
          )
        `)
        .order('name');
      
      if (error) {
        console.error('Error fetching inventory items:', error);
        throw new Error(error.message);
      }
      
      return data.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        facilityId: item.facility_id,
        facilityName: item.facilities ? item.facilities.name : 'Unknown Facility',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });
};
