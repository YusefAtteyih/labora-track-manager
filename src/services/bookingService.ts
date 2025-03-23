
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface BookingFormData {
  facilityId: string;
  startDate: Date;
  endDate: Date;
  purpose: string;
  attendees: number;
  notes?: string;
}

export const createBooking = async (bookingData: BookingFormData) => {
  const { user } = useAuth();
  
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        facility_id: bookingData.facilityId,
        user_id: user.id,
        user_name: user.name || user.email.split('@')[0],
        user_role: user.role || 'student',
        user_avatar: user.avatar,
        start_date: bookingData.startDate.toISOString(),
        end_date: bookingData.endDate.toISOString(),
        purpose: bookingData.purpose,
        attendees: bookingData.attendees,
        notes: bookingData.notes,
        status: 'pending' // All bookings start as pending and need approval
      });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
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
      .eq('id', bookingId);

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
      .eq('id', bookingId);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    throw error;
  }
};
