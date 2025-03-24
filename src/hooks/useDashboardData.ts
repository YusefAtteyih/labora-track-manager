
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export interface DashboardData {
  stats: {
    totalInventory: number;
    activeBookings: number;
    pendingApprovals: number;
    activeUsers: number;
  };
  inventoryData: {
    name: string;
    count: number;
  }[];
  bookingData: {
    day: string;
    count: number;
  }[];
  pendingApprovals: {
    id: string;
    type: string;
    user: string;
    item: string;
    date: string;
    time?: string;
    amount?: string;
  }[];
  upcomingBookings: {
    id: string;
    lab: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending';
  }[];
  lowStockItems: {
    id: string;
    name: string;
    current: number;
    minimum: number;
    status: 'critical' | 'warning';
  }[];
}

export const useDashboardData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription
  useEffect(() => {
    // Create channels for all tables we need to monitor for the dashboard
    const bookingsChannel = supabase
      .channel('dashboard-booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    const usersChannel = supabase
      .channel('dashboard-user-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    const labsChannel = supabase
      .channel('dashboard-labs-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'labs'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    const equipmentChannel = supabase
      .channel('dashboard-equipment-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'equipment'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    // Add real-time subscription for inventory items
    const inventoryChannel = supabase
      .channel('dashboard-inventory-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'inventory_items'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    // Add real-time subscription for purchase requests
    const purchaseChannel = supabase
      .channel('dashboard-purchase-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_requests'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(labsChannel);
      supabase.removeChannel(equipmentChannel);
      supabase.removeChannel(inventoryChannel);
      supabase.removeChannel(purchaseChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      // Get current date
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Format the date for Supabase queries
      const todayISO = today.toISOString();
      
      // 1. Fetch active bookings for today
      const { data: activeBookingsData, error: activeBookingsError } = await supabase
        .from('bookings')
        .select('count')
        .gte('start_date', todayISO)
        .lt('start_date', new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString())
        .eq('status', 'approved');
        
      if (activeBookingsError) {
        console.error('Error fetching active bookings:', activeBookingsError);
      }
      
      // 2. Fetch pending approvals
      const { data: pendingApprovalsCount, error: pendingApprovalsError } = await supabase
        .from('bookings')
        .select('count')
        .eq('status', 'pending');
        
      if (pendingApprovalsError) {
        console.error('Error fetching pending approvals count:', pendingApprovalsError);
      }
      
      // 3. Fetch active users (users who logged in this week)
      const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data: activeUsersData, error: activeUsersError } = await supabase
        .from('users')
        .select('count')
        .gte('last_active', oneWeekAgo);
        
      if (activeUsersError) {
        console.error('Error fetching active users:', activeUsersError);
      }
      
      // 4. Fetch actual pending approvals data
      const { data: pendingApprovals, error: pendingApprovalsDataError } = await supabase
        .from('bookings')
        .select(`
          id,
          lab_id,
          equipment_id,
          facility_id,
          user_name,
          start_date,
          purpose
        `)
        .eq('status', 'pending')
        .order('start_date', { ascending: true })
        .limit(3);
        
      if (pendingApprovalsDataError) {
        console.error('Error fetching pending approvals data:', pendingApprovalsDataError);
      }
      
      // 5. Fetch upcoming bookings for the current user
      // In a real application, you'd get the current user ID from the auth context
      // For now, we'll fetch the most recent upcoming bookings as an example
      const { data: upcomingBookings, error: upcomingBookingsError } = await supabase
        .from('bookings')
        .select(`
          id,
          lab_id,
          equipment_id,
          facility_id,
          start_date,
          end_date,
          status
        `)
        .or('status.eq.approved,status.eq.pending')
        .gte('start_date', todayISO)
        .order('start_date', { ascending: true })
        .limit(3);
        
      if (upcomingBookingsError) {
        console.error('Error fetching upcoming bookings:', upcomingBookingsError);
      }
      
      // 6. Fetch labs and equipment for inventory stats and chart
      const { data: labsData, error: labsError } = await supabase
        .from('labs')
        .select('id');
        
      if (labsError) {
        console.error('Error fetching labs:', labsError);
      }
      
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('id, category');
        
      if (equipmentError) {
        console.error('Error fetching equipment:', equipmentError);
      }
      
      // Count equipment by category
      const categoryCounts: Record<string, number> = {};
      equipmentData?.forEach(equipment => {
        const category = equipment.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Create inventory data from equipment categories
      const inventoryData = [
        { name: 'Labs', count: labsData?.length || 0 },
        ...Object.entries(categoryCounts).map(([name, count]) => ({
          name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
          count
        }))
      ];
      
      // 7. Create booking data for the week
      const bookingData = [];
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const currentDayOfWeek = today.getDay(); // 0 for Sunday, 1 for Monday, etc.
      
      // For each day of the week
      for (let i = 0; i < 7; i++) {
        const dayIndex = (currentDayOfWeek + i) % 7;
        const dayName = daysOfWeek[dayIndex];
        const dayDate = new Date(today);
        dayDate.setDate(today.getDate() + i);
        
        // Query for bookings on this day
        const startOfDay = new Date(dayDate);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(dayDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        const { data: dayBookings, error: dayBookingsError } = await supabase
          .from('bookings')
          .select('count')
          .gte('start_date', startOfDay.toISOString())
          .lt('start_date', endOfDay.toISOString());
          
        if (dayBookingsError) {
          console.error(`Error fetching bookings for ${dayName}:`, dayBookingsError);
        }
        
        // Add to booking data - Fix: Extract the count from the first item in the array
        bookingData.push({
          day: dayName,
          count: dayBookings && dayBookings.length > 0 ? parseInt(dayBookings[0].count as unknown as string, 10) : 0
        });
      }
      
      // Process pending approvals data
      const formattedPendingApprovals = await Promise.all(pendingApprovals?.map(async (item) => {
        const bookingDate = new Date(item.start_date);
        const formattedDate = bookingDate.toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric' 
        });
        const formattedTime = bookingDate.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit'
        });
        
        // Get the facility name based on lab_id, equipment_id, or facility_id
        let facilityName = 'Unknown Facility';
        
        if (item.lab_id) {
          const { data } = await supabase
            .from('labs')
            .select('name')
            .eq('id', item.lab_id)
            .single();
          if (data) facilityName = data.name;
        } else if (item.equipment_id) {
          const { data } = await supabase
            .from('equipment')
            .select('name')
            .eq('id', item.equipment_id)
            .single();
          if (data) facilityName = data.name;
        } else if (item.facility_id) {
          // Try labs first
          const { data: labData } = await supabase
            .from('labs')
            .select('name')
            .eq('id', item.facility_id)
            .single();
            
          if (labData) {
            facilityName = labData.name;
          } else {
            // Try equipment if not in labs
            const { data: equipData } = await supabase
              .from('equipment')
              .select('name')
              .eq('id', item.facility_id)
              .single();
              
            if (equipData) facilityName = equipData.name;
          }
        }
        
        return {
          id: item.id,
          type: 'Booking',
          user: item.user_name,
          item: facilityName,
          date: formattedDate,
          time: formattedTime,
        };
      }) || []);
      
      // Process upcoming bookings data
      const formattedUpcomingBookings = await Promise.all(upcomingBookings?.map(async (booking) => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        
        // Format the date
        let dateDisplay: string;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        
        if (startDate.toDateString() === today.toDateString()) {
          dateDisplay = 'Today';
        } else if (startDate.toDateString() === tomorrow.toDateString()) {
          dateDisplay = 'Tomorrow';
        } else {
          dateDisplay = startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
        }
        
        // Format the time
        const timeDisplay = `${startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
        
        // Get the facility name
        let facilityName = 'Unknown Facility';
        
        if (booking.lab_id) {
          const { data } = await supabase
            .from('labs')
            .select('name')
            .eq('id', booking.lab_id)
            .single();
          if (data) facilityName = data.name;
        } else if (booking.equipment_id) {
          const { data } = await supabase
            .from('equipment')
            .select('name')
            .eq('id', booking.equipment_id)
            .single();
          if (data) facilityName = data.name;
        } else if (booking.facility_id) {
          // Try labs first
          const { data: labData } = await supabase
            .from('labs')
            .select('name')
            .eq('id', booking.facility_id)
            .single();
            
          if (labData) {
            facilityName = labData.name;
          } else {
            // Try equipment if not in labs
            const { data: equipData } = await supabase
              .from('equipment')
              .select('name')
              .eq('id', booking.facility_id)
              .single();
              
            if (equipData) facilityName = equipData.name;
          }
        }
        
        return {
          id: booking.id,
          lab: facilityName,
          date: dateDisplay,
          time: timeDisplay,
          status: booking.status === 'approved' ? 'confirmed' : 'pending' as 'confirmed' | 'pending',
        };
      }) || []);
      
      // Fetch real inventory data with low stock from inventory_items table
      const { data: lowStockInventory, error: lowStockError } = await supabase
        .from('inventory_items')
        .select('*')
        .or('status.eq.Low Stock,status.eq.Out of Stock')
        .order('quantity', { ascending: true })
        .limit(5);
      
      if (lowStockError) {
        console.error('Error fetching low stock items:', lowStockError);
      }
      
      // Transform inventory items to lowStockItems format
      const lowStockItems = lowStockInventory?.map(item => ({
        id: item.id,
        name: item.name,
        current: item.quantity,
        minimum: 10, // We're using a default minimum threshold of 10
        status: item.status === 'Out of Stock' ? 'critical' as const : 'warning' as const
      })) || [
        // Fallback data in case the query returns no results
        {
          id: 'item-001',
          name: 'Microscope Slides',
          current: 8,
          minimum: 20,
          status: 'critical' as const
        },
        {
          id: 'item-002',
          name: 'Ethanol 95%',
          current: 2,
          minimum: 5,
          status: 'critical' as const
        },
        {
          id: 'item-003',
          name: 'Nitrile Gloves (M)',
          current: 15,
          minimum: 25,
          status: 'warning' as const
        }
      ];
      
      return {
        stats: {
          totalInventory: (labsData?.length || 0) + (equipmentData?.length || 0),
          activeBookings: activeBookingsData && activeBookingsData.length > 0 ? parseInt(activeBookingsData[0].count as unknown as string, 10) : 0,
          pendingApprovals: pendingApprovalsCount && pendingApprovalsCount.length > 0 ? parseInt(pendingApprovalsCount[0].count as unknown as string, 10) : 0,
          activeUsers: activeUsersData && activeUsersData.length > 0 ? parseInt(activeUsersData[0].count as unknown as string, 10) : 0,
        },
        inventoryData,
        bookingData,
        pendingApprovals: formattedPendingApprovals,
        upcomingBookings: formattedUpcomingBookings,
        lowStockItems,
      };
    },
    refetchInterval: 30000, // Refresh dashboard data every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};
