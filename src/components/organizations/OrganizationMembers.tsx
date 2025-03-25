
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/hooks/useUserData';
import { UserRole } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface OrganizationMembersProps {
  organizationId: string;
  organizationName: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrganizationMembers = ({ organizationId, organizationName, isOpen, onClose }: OrganizationMembersProps) => {
  const { data: members, isLoading } = useQuery({
    queryKey: ['organization-members', organizationId],
    queryFn: async (): Promise<User[]> => {
      console.log('Fetching members for organization:', organizationId);
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, avatar')
        .eq('faculty_id', organizationId);
        
      if (error) {
        console.error('Error fetching organization members:', error);
        throw new Error(error.message);
      }
      
      console.log('Members data received:', data);
      
      if (!data || data.length === 0) {
        console.log('No members found for this organization');
        return [];
      }
      
      return data.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        avatar: user.avatar
      }));
    },
    enabled: isOpen && !!organizationId,
  });

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{organizationName} Members</DialogTitle>
          <DialogDescription>
            View all members associated with this organization
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : members && members.length > 0 ? (
          <div className="max-h-[60vh] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map(member => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <Avatar className="h-8 w-8">
                        <img src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=38bdf8&color=fff`} alt={member.name} />
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No members found in this organization
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OrganizationMembers;
