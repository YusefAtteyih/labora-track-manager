
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/context/AuthContext';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  facultyId?: string;
  faculty?: {
    id: string;
    name: string;
    department: string;
  };
  status?: string;
  lastActive?: string;
  tcNumber?: string;
  firstName?: string;
  lastName?: string;
  organization?: string;
  organizationId?: string;
  department?: string;
  bookings?: Array<{
    id: string;
    purpose: string;
    status: string;
    startDate: string;
    endDate: string;
    labName?: string;
    equipmentName?: string;
  }>;
}

// Define a type for the raw user data from Supabase
interface RawUserData {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  faculty_id: string | null;
  status: string | null;
  last_active: string | null;
  tc_number: string | null;
  first_name: string | null;
  last_name: string | null;
  organization: string | null;
  organization_id: string | null;
  department: string | null;
  faculties: {
    id: string;
    name: string;
    department: string;
  } | null;
}

// Define a type for the raw booking data
interface RawBookingData {
  id: string;
  purpose: string | null;
  status: string;
  start_date: string;
  end_date: string;
  user_id: string;
  labs?: { name: string } | null;
  equipment?: { name: string } | null;
}

export const useUserData = () => {
  const queryClient = useQueryClient();
  const { session, isAuthenticated } = useAuth();

  // Set up real-time subscription
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const channel = supabase
      .channel('users-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['users'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, isAuthenticated]);

  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      try {
        console.log('Fetching users data, auth state:', isAuthenticated);
        
        // Check if authenticated
        if (!isAuthenticated || !session) {
          console.warn('No active session, returning empty users array');
          return [];
        }
        
        // Fetch users from the database with their faculty details
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select(`
            id,
            name,
            email,
            role,
            avatar,
            faculty_id,
            status,
            last_active,
            tc_number,
            first_name,
            last_name,
            organization,
            organization_id,
            department,
            faculties:faculty_id (
              id,
              name,
              department
            )
          `)
          .order('name');
        
        if (userError) {
          console.error('Error fetching users:', userError);
          throw new Error(userError.message);
        }
        
        console.log('Users data received:', userData);
        
        if (!userData || userData.length === 0) {
          console.warn('No user data returned from query');
          return [];
        }
        
        // For admin users, fetch booking history for each user
        let usersWithBookings: Array<RawUserData & { bookings?: RawBookingData[] }> = userData as RawUserData[];
        
        if (session && session.user) {
          const { data: currentUserData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (currentUserData && currentUserData.role === 'org_admin') {
            // Get all bookings for all users
            const { data: bookingsData, error: bookingsError } = await supabase
              .from('bookings')
              .select(`
                id,
                purpose,
                status,
                start_date,
                end_date,
                user_id,
                lab_id,
                equipment_id,
                labs:lab_id (name),
                equipment:equipment_id (name)
              `)
              .order('start_date', { ascending: false });
                
            if (!bookingsError && bookingsData) {
              // Group bookings by user_id
              const bookingsByUser = bookingsData.reduce((acc, booking) => {
                if (!acc[booking.user_id]) {
                  acc[booking.user_id] = [];
                }
                acc[booking.user_id].push(booking);
                return acc;
              }, {});
              
              // Add bookings to each user
              usersWithBookings = userData.map(user => ({
                ...user,
                bookings: bookingsByUser[user.id] || []
              })) as Array<RawUserData & { bookings?: RawBookingData[] }>;
            }
          }
        }
        
        // Transform the data to match our User type
        return usersWithBookings.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as UserRole,
          avatar: user.avatar || undefined,
          facultyId: user.faculty_id || undefined,
          faculty: user.faculties ? {
            id: user.faculties.id,
            name: user.faculties.name,
            department: user.faculties.department
          } : undefined,
          status: user.status || undefined,
          lastActive: user.last_active || undefined,
          tcNumber: user.tc_number || undefined,
          firstName: user.first_name || undefined,
          lastName: user.last_name || undefined,
          organization: user.organization || undefined,
          organizationId: user.organization_id || undefined,
          department: user.department || undefined,
          bookings: user.bookings ? user.bookings.map(b => ({
            id: b.id,
            purpose: b.purpose || '',
            status: b.status,
            startDate: b.start_date,
            endDate: b.end_date,
            labName: b.labs?.name,
            equipmentName: b.equipment?.name
          })) : undefined
        }));
      } catch (error) {
        console.error('Failed to fetch users:', error);
        throw error;
      }
    },
    enabled: isAuthenticated && !!session,
    retry: 1,
    refetchOnWindowFocus: false
  });
};
