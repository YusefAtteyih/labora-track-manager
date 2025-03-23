
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface BookingFormData {
  facilityId: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  attendees: number;
  notes?: string;
}

export interface User {
  id: string;
  name?: string;
  email: string;
  role?: string;
  avatar?: string;
}

export const createBooking = async (bookingData: BookingFormData, user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("Booking data:", bookingData);
    console.log("User:", user);
    
    // Ensure user_id is stored as text to match RLS policy expectations
    const bookingPayload = {
      facility_id: bookingData.facilityId,
      user_id: user.id.toString(), // Ensure user_id is a string
      user_name: user.name || user.email.split('@')[0],
      user_role: user.role || 'student',
      user_avatar: user.avatar,
      start_date: bookingData.startDate.toISOString(),
      end_date: bookingData.endDate.toISOString(),
      purpose: bookingData.purpose,
      attendees: bookingData.attendees,
      notes: bookingData.notes,
      status: 'pending' // All bookings start as pending and need approval
    };
    
    console.log("Submitting booking payload:", bookingPayload);
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingPayload)
      .select();

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    console.log("Booking created successfully:", data);
    return data;
  } catch (error) {
    console.error("Error in createBooking:", error);
    if (error instanceof Error) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    throw error;
  }
};

export const approveBooking = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'approved' })
      .eq('id', bookingId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const rejectBooking = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'rejected' })
      .eq('id', bookingId)
      .select();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
