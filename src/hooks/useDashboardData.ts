
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

    const facilitiesChannel = supabase
      .channel('dashboard-facility-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'facilities'
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
      supabase.removeChannel(facilitiesChannel);
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
          facility_id,
          user_name,
          start_date,
          purpose,
          facilities:facility_id (name)
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
          facility_id,
          start_date,
          end_date,
          status,
          facilities:facility_id (name)
        `)
        .or('status.eq.approved,status.eq.pending')
        .gte('start_date', todayISO)
        .order('start_date', { ascending: true })
        .limit(3);
        
      if (upcomingBookingsError) {
        console.error('Error fetching upcoming bookings:', upcomingBookingsError);
      }
      
      // 6. Fetch facilities by type for the inventory chart
      const { data: facilityTypes, error: facilityTypesError } = await supabase
        .from('facilities')
        .select('type');
        
      if (facilityTypesError) {
        console.error('Error fetching facility types:', facilityTypesError);
      }
      
      // Count facilities by type
      const typeCounts: Record<string, number> = {};
      facilityTypes?.forEach(facility => {
        typeCounts[facility.type] = (typeCounts[facility.type] || 0) + 1;
      });
      
      // Create inventory data from facility types
      const inventoryData = Object.entries(typeCounts).map(([name, count]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        count
      }));
      
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
        
        // Add to booking data
        bookingData.push({
          day: dayName,
          count: dayBookings ? parseInt(dayBookings.count as unknown as string, 10) : 0
        });
      }
      
      // Process pending approvals data
      const formattedPendingApprovals = pendingApprovals?.map(item => {
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
        
        return {
          id: item.id,
          type: 'Booking',
          user: item.user_name,
          item: item.facilities?.name || 'Unknown Facility',
          date: formattedDate,
          time: formattedTime,
        };
      }) || [];
      
      // Process upcoming bookings data
      const formattedUpcomingBookings = upcomingBookings?.map(booking => {
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
        
        return {
          id: booking.id,
          lab: booking.facilities?.name || 'Unknown Facility',
          date: dateDisplay,
          time: timeDisplay,
          status: booking.status === 'approved' ? 'confirmed' : 'pending' as 'confirmed' | 'pending',
        };
      }) || [];
      
      // For now, we'll use mock data for low stock items
      // In a real application, you would fetch this from an inventory table
      const lowStockItems = [
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
          totalInventory: inventoryData.reduce((sum, item) => sum + item.count, 0),
          activeBookings: activeBookingsData ? parseInt(activeBookingsData.count as unknown as string, 10) : 0,
          pendingApprovals: pendingApprovalsCount ? parseInt(pendingApprovalsCount.count as unknown as string, 10) : 0,
          activeUsers: activeUsersData ? parseInt(activeUsersData.count as unknown as string, 10) : 0,
        },
        inventoryData,
        bookingData,
        pendingApprovals: formattedPendingApprovals,
        upcomingBookings: formattedUpcomingBookings,
        lowStockItems,
      };
    },
    refetchInterval: 30000, // Refresh dashboard data every 30 seconds
  });
};
