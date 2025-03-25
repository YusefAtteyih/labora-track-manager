
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/hooks/useUserData';
import { UserRole } from '@/context/AuthContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, UserX, KeyRound, MoreVertical } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface OrganizationMembersProps {
  organizationId: string;
  organizationName: string;
  isOpen: boolean;
  onClose: () => void;
}

const OrganizationMembers = ({ organizationId, organizationName, isOpen, onClose }: OrganizationMembersProps) => {
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasswordResetDialogOpen, setIsPasswordResetDialogOpen] = useState(false);
  const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null);

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

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      // Use Supabase Admin API to delete user
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { 
          action: 'delete',
          userId: userToDelete.id
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "User deleted",
        description: `${userToDelete.name}'s account has been deleted successfully.`,
      });
      
      // Close the dialog and refetch members
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: error.message || "An error occurred while deleting the user.",
        variant: "destructive"
      });
    }
  };

  const handleResetPassword = async () => {
    if (!userToResetPassword) return;
    
    try {
      // Use Supabase Admin API to reset password
      const { error } = await supabase.functions.invoke('admin-manage-users', {
        body: { 
          action: 'reset-password',
          userId: userToResetPassword.id,
          email: userToResetPassword.email
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent",
        description: `A password reset link has been sent to ${userToResetPassword.email}.`,
      });
      
      // Close the dialog
      setIsPasswordResetDialogOpen(false);
      setUserToResetPassword(null);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error resetting password",
        description: error.message || "An error occurred while sending the password reset email.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
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
                    <TableHead className="w-10"></TableHead>
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
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => {
                                setUserToResetPassword(member);
                                setIsPasswordResetDialogOpen(true);
                              }}
                            >
                              <KeyRound className="mr-2 h-4 w-4" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => {
                                setUserToDelete(member);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Delete Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete {userToDelete?.name}'s account and cannot be undone.
              All associated data will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Password Confirmation Dialog */}
      <AlertDialog open={isPasswordResetDialogOpen} onOpenChange={setIsPasswordResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Password</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a password reset email to {userToResetPassword?.email}.
              The user will need to click the link in the email to create a new password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToResetPassword(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetPassword}>
              Send Reset Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default OrganizationMembers;
