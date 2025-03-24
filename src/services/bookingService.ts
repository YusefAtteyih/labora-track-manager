
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@/context/AuthContext";

export interface BookingFormData {
  facilityId: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  attendees: number;
  notes?: string;
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
    console.log("Approving booking:", bookingId);
    
    // Verify the current user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error("Authentication error: " + sessionError.message);
    if (!sessionData.session) throw new Error("You must be logged in to approve bookings");
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'approved',
        // You might want to store who approved it and when
        // approved_by: sessionData.session.user.id,
        // approved_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select();

    if (error) {
      console.error("Error approving booking:", error);
      
      // Handle specific error cases
      if (error.code === '42501') {
        throw new Error("You don't have permission to approve this booking");
      }
      
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Booking not found or you don't have permission to approve it");
    }

    console.log("Booking approved successfully:", data);
    return data[0];
  } catch (error) {
    console.error("Error in approveBooking:", error);
    throw error;
  }
};

export const rejectBooking = async (bookingId: string) => {
  try {
    console.log("Rejecting booking:", bookingId);
    
    // Verify the current user is authenticated
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw new Error("Authentication error: " + sessionError.message);
    if (!sessionData.session) throw new Error("You must be logged in to reject bookings");
    
    const { data, error } = await supabase
      .from('bookings')
      .update({ 
        status: 'rejected',
        // You might want to store who rejected it and when
        // rejected_by: sessionData.session.user.id,
        // rejected_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select();

    if (error) {
      console.error("Error rejecting booking:", error);
      
      // Handle specific error cases
      if (error.code === '42501') {
        throw new Error("You don't have permission to reject this booking");
      }
      
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      throw new Error("Booking not found or you don't have permission to reject it");
    }

    console.log("Booking rejected successfully:", data);
    return data[0];
  } catch (error) {
    console.error("Error in rejectBooking:", error);
    throw error;
  }
};

export const getBookingById = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
};

export const cancelBooking = async (bookingId: string) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId)
      .select();

    if (error) throw new Error(error.message);
    
    if (!data || data.length === 0) {
      throw new Error("Booking not found or you don't have permission to cancel it");
    }
    
    return data[0];
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
};
