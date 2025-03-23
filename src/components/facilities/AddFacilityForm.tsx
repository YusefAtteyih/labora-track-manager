import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckIcon, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Facility } from '@/types/facility';
import { useQueryClient } from '@tanstack/react-query';

// Schema for facility form validation
const facilityFormSchema = z.object({
  name: z.string().min(3, { message: 'Facility name must be at least 3 characters' }),
  type: z.enum(['lab', 'equipment'], { 
    required_error: 'Please select a facility type',
  }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  location: z.string().min(3, { message: 'Location must be at least 3 characters' }),
  capacity: z.coerce.number().min(1, { message: 'Capacity must be at least 1' }),
  status: z.enum(['available', 'booked', 'maintenance'], { 
    required_error: 'Please select a status',
  }),
  openHours: z.string().min(3, { message: 'Open hours information is required' }),
  department: z.string().min(2, { message: 'Department is required' }),
  features: z.string().optional(),
  image: z.string().url({ message: 'Please enter a valid image URL' }).optional(),
  requiresApproval: z.boolean().default(false),
  availableFor: z.string().optional(),
});

type FormValues = z.infer<typeof facilityFormSchema>;

const AddFacilityForm = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(facilityFormSchema),
    defaultValues: {
      name: '',
      type: 'lab',
      description: '',
      location: '',
      capacity: 1,
      status: 'available',
      openHours: '9:00 AM - 5:00 PM',
      department: '',
      features: '',
      image: 'https://via.placeholder.com/400x200?text=Facility+Image',
      requiresApproval: false,
      availableFor: 'students,staff',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      // Transform string features into array
      const featuresArray = data.features 
        ? data.features.split(',').map(item => item.trim())
        : [];
      
      // Transform string availableFor into array
      const availableForArray = data.availableFor 
        ? data.availableFor.split(',').map(item => item.trim()) as ('students' | 'staff' | 'visitors')[]
        : ['students', 'staff'];

      // Prepare data for Supabase
      const facilityData = {
        name: data.name,
        type: data.type,
        description: data.description,
        location: data.location,
        capacity: data.capacity,
        status: data.status,
        open_hours: data.openHours,
        department: data.department,
        features: featuresArray,
        image: data.image || 'https://via.placeholder.com/400x200?text=Facility+Image',
        requires_approval: data.requiresApproval,
        available_for: availableForArray,
      };

      // Insert the new facility
      const { data: newFacility, error } = await supabase
        .from('facilities')
        .insert(facilityData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['facilities'] });

      toast({
        title: 'Success!',
        description: 'Facility has been added successfully.',
      });

      // Navigate back to facilities list
      navigate('/facilities');
    } catch (error) {
      console.error('Error adding facility:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add facility',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Facility</CardTitle>
        <CardDescription>Enter the details for the new facility</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Chemistry Lab 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facility Type*</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="lab">Laboratory</option>
                        <option value="equipment">Equipment</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <FormControl>
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        {...field}
                      >
                        <option value="available">Available</option>
                        <option value="booked">Booked</option>
                        <option value="maintenance">Under Maintenance</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="Building A, Room 203" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity*</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department*</FormLabel>
                    <FormControl>
                      <Input placeholder="Chemistry Department" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="openHours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Open Hours*</FormLabel>
                    <FormControl>
                      <Input placeholder="9:00 AM - 5:00 PM" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/image.jpg" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter a URL for the facility image. If left empty, a placeholder will be used.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="features"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Features</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer, Projector, Whiteboard" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter features separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableFor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available For</FormLabel>
                    <FormControl>
                      <Input placeholder="students, staff, visitors" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter user types separated by commas (students, staff, visitors)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-4 w-4 mt-1"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Requires Approval</FormLabel>
                      <FormDescription>
                        Check if this facility requires admin approval for booking
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description*</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter a detailed description of the facility"
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/facilities')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckIcon className="mr-2 h-4 w-4" />
                    Add Facility
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddFacilityForm;
