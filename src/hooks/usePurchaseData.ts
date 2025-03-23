
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Define types for purchases
export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

export interface PurchaseRequest {
  id: string;
  title: string;
  createdAt: string;
  priority: 'high' | 'medium' | 'low';
  department: string;
  requestedBy: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered';
  notes?: string;
  approvedBy?: {
    id: string;
    name: string;
    role: string;
  } | null;
  approvedAt?: string | null;
  rejectionReason?: string | null;
}

export const usePurchaseData = () => {
  return useQuery({
    queryKey: ['purchases'],
    queryFn: async (): Promise<PurchaseRequest[]> => {
      const { data: purchaseRequests, error: purchaseError } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchaseError) {
        console.error('Error fetching purchase requests:', purchaseError);
        throw new Error(purchaseError.message);
      }

      const transformedRequests: PurchaseRequest[] = await Promise.all(
        purchaseRequests.map(async (request) => {
          // Fetch items for each purchase request
          const { data: items, error: itemsError } = await supabase
            .from('purchase_items')
            .select('*')
            .eq('purchase_id', request.id);

          if (itemsError) {
            console.error(`Error fetching items for purchase ${request.id}:`, itemsError);
            throw new Error(itemsError.message);
          }

          const transformedItems: PurchaseItem[] = items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.quantity * item.price
          }));

          return {
            id: request.id,
            title: request.title,
            createdAt: request.created_at,
            priority: request.priority as 'high' | 'medium' | 'low',
            department: request.department,
            requestedBy: {
              id: request.requested_by_id,
              name: request.requested_by_name,
              role: request.requested_by_role,
              avatar: request.requested_by_avatar
            },
            items: transformedItems,
            totalAmount: request.total_amount,
            status: request.status as 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered',
            notes: request.notes,
            approvedBy: request.approved_by_id ? {
              id: request.approved_by_id,
              name: request.approved_by_name,
              role: 'admin' // Default role as it's not stored in the DB
            } : null,
            approvedAt: request.approved_at,
            rejectionReason: request.rejection_reason
          };
        })
      );

      return transformedRequests;
    }
  });
};
