
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
      // In a real application, we would fetch users from the database
      // Since we don't have a users table yet, we'll use mock data for now
      // but this hook is structured to work with a real database when available
      
      // This would be the real implementation when a users table exists:
      // const { data, error } = await supabase
      //   .from('users')
      //   .select('*, organizations(*)')
      //   .order('name');
      
      // if (error) {
      //   console.error('Error fetching users:', error);
      //   throw new Error(error.message);
      // }
      
      // For demonstration purposes only - using mock data until users table is created
      console.warn('Mock user data being used - create a users table in Supabase for real data');
      
      // This simulates the data structure we'd get from Supabase
      const mockUsers = [
        {
          id: '1',
          name: 'Organization Admin',
          email: 'org_admin@university.edu',
          role: 'org_admin',
          avatar: 'https://ui-avatars.com/api/?name=Org+Admin&background=0284c7&color=fff',
          organization_id: '1',
          organizations: {
            id: '1',
            name: 'Science Department',
            department: 'Chemistry'
          }
        },
        {
          id: '2',
          name: 'Lab Supervisor',
          email: 'lab_supervisor@university.edu',
          role: 'lab_supervisor',
          avatar: 'https://ui-avatars.com/api/?name=Lab+Supervisor&background=0ea5e9&color=fff',
          organization_id: '1',
          organizations: {
            id: '1',
            name: 'Science Department',
            department: 'Chemistry'
          }
        },
        {
          id: '3',
          name: 'Facility Member',
          email: 'facility_member@university.edu',
          role: 'facility_member',
          avatar: 'https://ui-avatars.com/api/?name=Facility+Member&background=38bdf8&color=fff',
          organization_id: '1',
          organizations: {
            id: '1',
            name: 'Science Department',
            department: 'Chemistry'
          }
        },
        {
          id: '4',
          name: 'Student User',
          email: 'student@university.edu',
          role: 'student',
          avatar: 'https://ui-avatars.com/api/?name=Student+User&background=7dd3fc&color=fff',
          organization_id: '2',
          organizations: {
            id: '2',
            name: 'Engineering Department',
            department: 'Computer Science'
          }
        },
        {
          id: '5',
          name: 'Visitor User',
          email: 'visitor@example.com',
          role: 'visitor',
          avatar: 'https://ui-avatars.com/api/?name=Visitor+User&background=bae6fd&color=fff',
          organization_id: null,
          organizations: null
        }
      ];
      
      // Transform the data to match our User type
      return mockUsers.map(user => ({
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
