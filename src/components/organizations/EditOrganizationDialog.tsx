
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Organization } from '@/hooks/useOrganizationsData';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface EditOrganizationDialogProps {
  organization: Organization | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditOrganizationDialog = ({ organization, isOpen, onClose }: EditOrganizationDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    university: '',
    faculty: '',
    department: '',
    description: ''
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name,
        university: organization.university,
        faculty: organization.faculty,
        department: organization.department,
        description: organization.description
      });
    }
  }, [organization]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async () => {
    if (!organization) return;
    if (!formData.name || !formData.department) {
      toast({
        title: "Missing information",
        description: "Please fill in both name and department fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('faculties')
        .update({
          name: formData.name,
          university: formData.university,
          faculty: formData.faculty,
          department: formData.department,
          description: formData.description
        })
        .eq('id', organization.id);

      if (error) throw error;
      
      toast({
        title: "Faculty updated",
        description: `${formData.name} has been updated`,
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      onClose();
    } catch (error: any) {
      toast({
        title: "Error updating faculty",
        description: error.message || "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="glass-card max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Faculty</DialogTitle>
          <DialogDescription>
            Update the faculty information
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-university">University</Label>
            <Input
              id="edit-university"
              name="university"
              value={formData.university}
              onChange={handleInputChange}
              placeholder="Enter university name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-faculty">Faculty</Label>
            <Input
              id="edit-faculty"
              name="faculty"
              value={formData.faculty}
              onChange={handleInputChange}
              placeholder="Enter faculty name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-department">Department</Label>
            <Input
              id="edit-department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="Enter department name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-name">Faculty Name</Label>
            <Input
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter faculty name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Brief description of the faculty"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Updating...' : 'Update Faculty'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditOrganizationDialog;
