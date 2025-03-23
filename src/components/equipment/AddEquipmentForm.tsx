
import React, { useEffect, useState } from 'react';
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
import { useQueryClient } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLabsData } from '@/hooks/useLabsData';

// Schema for equipment form validation
const equipmentFormSchema = z.object({
  name: z.string().min(3, { message: 'Equipment name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  category: z.string().min(2, { message: 'Category is required' }),
  status: z.enum(['available', 'booked', 'maintenance'], { 
    required_error: 'Please select a status',
  }),
  labId: z.string().optional(),
  quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1' }),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  features: z.string().optional(),
  image: z.string().url({ message: 'Please enter a valid image URL' }).optional(),
});

type FormValues = z.infer<typeof equipmentFormSchema>;

interface AddEquipmentFormProps {
  returnPath?: string;
}

const AddEquipmentForm = ({ returnPath = '/equipment' }: AddEquipmentFormProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: labs, isLoading: labsLoading } = useLabsData();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      status: 'available',
      labId: undefined,
      quantity: 1,
      model: '',
      manufacturer: '',
      features: '',
      image: 'https://via.placeholder.com/400x200?text=Equipment+Image',
    },
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (data: FormValues) => {
    try {
      // Transform string features into array
      const featuresArray = data.features 
        ? data.features.split(',').map(item => item.trim())
        : [];

      // Prepare data for Supabase
      const equipmentData = {
        name: data.name,
        description: data.description,
        category: data.category,
        status: data.status,
        lab_id: data.labId || null,
        quantity: data.quantity,
        model: data.model || null,
        manufacturer: data.manufacturer || null,
        features: featuresArray,
        image: data.image || 'https://via.placeholder.com/400x200?text=Equipment+Image',
      };

      // Insert the new equipment
      const { data: newEquipment, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['equipment'] });

      toast({
        title: 'Success!',
        description: 'Equipment has been added successfully.',
      });

      // Navigate back to equipment list
      navigate(returnPath);
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add equipment',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Equipment</CardTitle>
        <CardDescription>Enter the details for the new laboratory equipment</CardDescription>
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
                    <FormLabel>Equipment Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Microscope XYZ-200" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Microscope">Microscope</SelectItem>
                          <SelectItem value="Spectrometer">Spectrometer</SelectItem>
                          <SelectItem value="Centrifuge">Centrifuge</SelectItem>
                          <SelectItem value="Analyzer">Analyzer</SelectItem>
                          <SelectItem value="Computer">Computer</SelectItem>
                          <SelectItem value="Medical">Medical Equipment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="booked">In Use</SelectItem>
                          <SelectItem value="maintenance">Under Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="labId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned Lab</FormLabel>
                    <FormControl>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select lab (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {labsLoading ? (
                            <SelectItem value="loading" disabled>Loading labs...</SelectItem>
                          ) : (
                            labs?.map(lab => (
                              <SelectItem key={lab.id} value={lab.id}>
                                {lab.name} ({lab.location})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      If this equipment belongs to a specific lab, select it here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity*</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="manufacturer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manufacturer</FormLabel>
                    <FormControl>
                      <Input placeholder="Manufacturer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Input placeholder="Model number or name" {...field} />
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
                      Enter a URL for the equipment image. If left empty, a placeholder will be used.
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
                      <Input placeholder="Digital display, Auto-calibration, USB port" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter features separated by commas
                    </FormDescription>
                    <FormMessage />
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
                      placeholder="Enter a detailed description of the equipment, including specifications and usage instructions"
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
                onClick={() => navigate(returnPath)}
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
                    Add Equipment
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

export default AddEquipmentForm;
