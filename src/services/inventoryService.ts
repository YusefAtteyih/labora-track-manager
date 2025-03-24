
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@/hooks/useUserData";

export const createPurchaseOrderFromInventory = async (
  itemId: string,
  itemName: string,
  user: User | null
) => {
  if (!user) {
    toast({
      title: "Authentication Required",
      description: "You must be logged in to create purchase orders.",
      variant: "destructive"
    });
    return;
  }

  try {
    // First, get the item details
    const { data: itemData, error: itemError } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (itemError) {
      console.error('Error fetching inventory item:', itemError);
      throw new Error(itemError.message);
    }

    // Calculate the quantity to order - restock to a reasonable level above minimum
    const quantityToOrder = Math.max(20 - itemData.quantity, 5); // Minimum order of 5 units
    
    // Create a purchase request
    const purchaseId = `pr-${new Date().getTime()}`;
    const purchasePayload = {
      id: purchaseId,
      title: `Restock ${itemData.name}`,
      department: user.department || "Laboratory",
      priority: itemData.quantity === 0 ? "high" : "medium",
      requested_by_id: user.id.toString(),
      requested_by_name: user.name || user.email.split('@')[0],
      requested_by_role: user.role || "staff",
      requested_by_avatar: user.avatar,
      status: "pending",
      notes: `Automatic purchase request created from low stock alert. Current stock: ${itemData.quantity} ${itemData.unit}.`,
      total_amount: quantityToOrder * 50 // Placeholder price of $50 per unit
    };

    // Insert purchase request
    const { error: purchaseError } = await supabase
      .from('purchase_requests')
      .insert(purchasePayload);

    if (purchaseError) {
      console.error("Error creating purchase request:", purchaseError);
      throw new Error(purchaseError.message);
    }

    // Insert purchase item
    const { error: itemInsertError } = await supabase
      .from('purchase_items')
      .insert({
        purchase_id: purchaseId,
        name: itemData.name,
        quantity: quantityToOrder,
        price: 50 // Placeholder price of $50 per unit
      });

    if (itemInsertError) {
      console.error("Error adding purchase item:", itemInsertError);
      throw new Error(itemInsertError.message);
    }

    toast({
      title: "Purchase Order Created",
      description: `Restock request for ${itemData.name} has been created.`,
    });

    return purchaseId;
  } catch (error) {
    console.error("Error in createPurchaseOrderFromInventory:", error);
    toast({
      title: "Purchase Order Failed",
      description: error instanceof Error ? error.message : "An error occurred while creating the purchase order.",
      variant: "destructive"
    });
  }
};
