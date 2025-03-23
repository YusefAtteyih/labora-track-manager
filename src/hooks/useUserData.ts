
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/context/AuthContext';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organizationId?: string;
  organization?: {
    id: string;
    name: string;
    department: string;
  };
}

export const useUserData = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<User[]> => {
      // Fetch users from the database with their organization details
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          id,
          name,
          email,
          role,
          avatar,
          organization_id,
          organizations:organization_id (
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
      
      // Transform the data to match our User type
      return userData.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        avatar: user.avatar,
        organizationId: user.organization_id || undefined,
        organization: user.organizations ? {
          id: user.organizations.id,
          name: user.organizations.name,
          department: user.organizations.department
        } : undefined
      }));
    }
  });
};
