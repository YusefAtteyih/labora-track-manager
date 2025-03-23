
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

      // Then fetch all labs with their faculty information
      const { data: labsData, error: labsError } = await supabase
        .from('labs')
        .select('id, name, faculty_id');
      
      if (labsError) {
        console.error('Error fetching labs:', labsError);
        throw new Error(labsError.message);
      }

      // Create a map of labs IDs to names and faculty IDs for quick lookup
      const labMap = new Map();
      labsData.forEach(lab => {
        labMap.set(lab.id, {
          name: lab.name,
          facultyId: lab.faculty_id
        });
      });
      
      // Map inventory items to include lab names and faculty IDs
      return inventoryData.map(item => ({
        id: item.id,
        name: item.name,
        category: item.category,
        location: item.location,
        quantity: item.quantity,
        unit: item.unit,
        status: item.status,
        facilityId: item.facility_id || '', // Keep for backwards compatibility
        labId: item.lab_id || item.facility_id || '', // Try to map old facility_id to lab_id
        facilityName: item.lab_id 
          ? labMap.get(item.lab_id)?.name || 'Unknown Lab'
          : item.facility_id && labMap.get(item.facility_id)?.name 
            ? labMap.get(item.facility_id)?.name 
            : 'Unassigned',
        facultyId: item.lab_id 
          ? labMap.get(item.lab_id)?.facultyId || null
          : item.facility_id && labMap.get(item.facility_id)?.facultyId 
            ? labMap.get(item.facility_id)?.facultyId
            : null,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    }
  });
};
