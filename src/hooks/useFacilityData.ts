
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Facility } from '@/types/facility';

export const useFacilityData = () => {
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
      return data.map((facility): Facility => ({
        id: facility.id,
        name: facility.name,
        type: facility.type,
        description: facility.description || '',
        location: facility.location || '',
        capacity: facility.capacity || 0,
        status: facility.status,
        image: facility.image || 'https://via.placeholder.com/400x200?text=No+Image',
        openHours: facility.open_hours || '',
        department: facility.department || '',
        features: facility.features || [],
        availableFor: facility.available_for || [],
        requiresApproval: facility.requires_approval || false
      }));
    }
  });
};
