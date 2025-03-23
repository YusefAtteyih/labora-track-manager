import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { PurchaseItem, PurchaseRequest } from "@/hooks/usePurchaseData";
import { User } from "@/hooks/useUserData";

export interface PurchaseFormData {
  title: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
  notes?: string;
  items: {
    name: string;
    quantity: number;
    price: number;
  }[];
}

export const createPurchaseRequest = async (data: PurchaseFormData, user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    console.log("Purchase request data:", data);
    console.log("User:", user);
    
    // Calculate total amount
    const totalAmount = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    
    // Create purchase request
    const purchasePayload = {
      id: `pr-${new Date().getTime()}`, // Generate a unique ID
      title: data.title,
      department: data.department,
      priority: data.priority,
      requested_by_id: user.id.toString(), // Ensure user_id is a string to match RLS policy
      requested_by_name: user.name || user.email.split('@')[0],
      requested_by_role: user.role || 'student',
      requested_by_avatar: user.avatar,
      status: 'pending', // All purchase requests start as pending
      notes: data.notes,
      total_amount: totalAmount
    };
    
    console.log("Submitting purchase payload:", purchasePayload);
    
    // Insert purchase request
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_requests')
      .insert(purchasePayload)
      .select();

    if (purchaseError) {
      console.error("Supabase purchase error:", purchaseError);
      throw new Error(purchaseError.message);
    }

    // Insert all items
    const purchaseId = purchasePayload.id;
    const itemPromises = data.items.map(item => {
      return supabase
        .from('purchase_items')
        .insert({
          purchase_id: purchaseId,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        });
    });

    const itemResults = await Promise.all(itemPromises);
    const itemErrors = itemResults.filter(result => result.error);
    
    if (itemErrors.length > 0) {
      console.error("Errors inserting items:", itemErrors);
      throw new Error("Failed to insert some purchase items");
    }

    console.log("Purchase request created successfully:", purchaseData);
    toast({
      title: "Purchase Request Created",
      description: "Your purchase request has been submitted for approval."
    });
    
    return purchaseData;
  } catch (error) {
    console.error("Error in createPurchaseRequest:", error);
    if (error instanceof Error) {
      toast({
        title: "Purchase Request Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    throw error;
  }
};

export const approvePurchaseRequest = async (requestId: string, user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({ 
        status: 'approved',
        approved_by_id: user.id.toString(),
        approved_by_name: user.name,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .select();

    if (error) {
      console.error("Error approving purchase request:", error);
      throw new Error(error.message);
    }

    toast({
      title: "Purchase Request Approved",
      description: "The purchase request has been approved successfully."
    });

    return data;
  } catch (error) {
    console.error("Error in approvePurchaseRequest:", error);
    if (error instanceof Error) {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    throw error;
  }
};

export const rejectPurchaseRequest = async (requestId: string, rejectionReason: string, user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({ 
        status: 'rejected',
        approved_by_id: user.id.toString(), // Still using approved_by for the person who made the decision
        approved_by_name: user.name,
        approved_at: new Date().toISOString(),
        rejection_reason: rejectionReason
      })
      .eq('id', requestId)
      .select();

    if (error) {
      console.error("Error rejecting purchase request:", error);
      throw new Error(error.message);
    }

    toast({
      title: "Purchase Request Rejected",
      description: "The purchase request has been rejected."
    });

    return data;
  } catch (error) {
    console.error("Error in rejectPurchaseRequest:", error);
    if (error instanceof Error) {
      toast({
        title: "Rejection Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    throw error;
  }
};

export const updatePurchaseStatus = async (requestId: string, status: 'ordered' | 'delivered', user: User) => {
  if (!user) {
    throw new Error("User not authenticated");
  }

  try {
    const { data, error } = await supabase
      .from('purchase_requests')
      .update({ status })
      .eq('id', requestId)
      .select();

    if (error) {
      console.error(`Error updating purchase request to ${status}:`, error);
      throw new Error(error.message);
    }

    toast({
      title: `Purchase Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      description: `The purchase request has been marked as ${status}.`
    });

    return data;
  } catch (error) {
    console.error(`Error in updatePurchaseStatus to ${status}:`, error);
    if (error instanceof Error) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
    }
    throw error;
  }
};
