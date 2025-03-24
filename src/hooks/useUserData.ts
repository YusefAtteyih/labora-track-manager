
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { User, RawUserData } from '@/types/user';
import { fetchUsers, fetchUserRole, fetchUserBookings, organizeBookingsByUser } from '@/services/userService';
import { transformRawUserData } from '@/utils/userTransformers';

// Change from `export { User }` to `export type { User }`
export type { User } from '@/types/user';

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
        const userData = await fetchUsers();
        
        console.log('Users data received:', userData);
        
        if (!userData || userData.length === 0) {
          console.warn('No user data returned from query');
          return [];
        }
        
        // For admin users, fetch booking history for each user
        let usersWithBookings: Array<RawUserData & { bookings?: any[] }> = userData;
        
        if (session && session.user) {
          const currentUserRole = await fetchUserRole(session.user.id);
            
          if (currentUserRole === 'org_admin') {
            // Get all bookings for all users
            const bookingsData = await fetchUserBookings();
                
            if (bookingsData) {
              // Group bookings by user_id
              const bookingsByUser = organizeBookingsByUser(bookingsData);
              
              // Add bookings to each user
              usersWithBookings = userData.map(user => ({
                ...user,
                bookings: bookingsByUser[user.id] || []
              }));
            }
          }
        }
        
        // Transform the data to match our User type
        return transformRawUserData(usersWithBookings);
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
