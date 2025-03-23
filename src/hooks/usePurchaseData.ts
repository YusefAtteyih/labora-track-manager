
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

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
    avatar: string;
  };
  items: PurchaseItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered';
  notes: string | null;
  approvedBy: {
    id: string;
    name: string;
    role: string;
  } | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface PurchaseItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

export const usePurchaseData = () => {
  const queryClient = useQueryClient();

  // Set up real-time subscription for both purchase requests and items
  useEffect(() => {
    const requestsChannel = supabase
      .channel('purchase-request-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_requests'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['purchases'] });
        }
      )
      .subscribe();

    const itemsChannel = supabase
      .channel('purchase-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'purchase_items'
        },
        () => {
          // Invalidate and refetch when data changes
          queryClient.invalidateQueries({ queryKey: ['purchases'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsChannel);
      supabase.removeChannel(itemsChannel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ['purchases'],
    queryFn: async (): Promise<PurchaseRequest[]> => {
      // Fetch all purchase requests
      const { data: purchaseRequestsData, error: purchaseRequestsError } = await supabase
        .from('purchase_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (purchaseRequestsError) {
        console.error('Error fetching purchase requests:', purchaseRequestsError);
        throw new Error(purchaseRequestsError.message);
      }

      // For each purchase request, fetch its items
      const purchaseRequests: PurchaseRequest[] = await Promise.all(
        purchaseRequestsData.map(async (purchaseRequest) => {
          // Fetch items for this purchase request
          const { data: itemsData, error: itemsError } = await supabase
            .rpc('get_purchase_items', { purchase_id: purchaseRequest.id });

          if (itemsError) {
            console.error(`Error fetching items for purchase request ${purchaseRequest.id}:`, itemsError);
            throw new Error(itemsError.message);
          }

          // Type casting for status
          let typedStatus: 'pending' | 'approved' | 'rejected' | 'ordered' | 'delivered';
          switch (purchaseRequest.status.toLowerCase()) {
            case 'pending':
              typedStatus = 'pending';
              break;
            case 'approved':
              typedStatus = 'approved';
              break;
            case 'rejected':
              typedStatus = 'rejected';
              break;
            case 'ordered':
              typedStatus = 'ordered';
              break;
            case 'delivered':
              typedStatus = 'delivered';
              break;
            default:
              console.warn(`Unexpected purchase status: ${purchaseRequest.status}, defaulting to 'pending'`);
              typedStatus = 'pending';
          }

          // Type casting for priority
          let typedPriority: 'high' | 'medium' | 'low';
          switch (purchaseRequest.priority.toLowerCase()) {
            case 'high':
              typedPriority = 'high';
              break;
            case 'medium':
              typedPriority = 'medium';
              break;
            case 'low':
              typedPriority = 'low';
              break;
            default:
              console.warn(`Unexpected priority: ${purchaseRequest.priority}, defaulting to 'medium'`);
              typedPriority = 'medium';
          }

          // Transform purchase request data
          return {
            id: purchaseRequest.id,
            title: purchaseRequest.title,
            createdAt: purchaseRequest.created_at,
            priority: typedPriority,
            department: purchaseRequest.department,
            requestedBy: {
              id: purchaseRequest.requested_by_id,
              name: purchaseRequest.requested_by_name,
              role: purchaseRequest.requested_by_role,
              avatar: purchaseRequest.requested_by_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(purchaseRequest.requested_by_name)}&background=38bdf8&color=fff`
            },
            items: itemsData.map(item => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity,
              price: Number(item.price), // Ensure conversion to number
              total: Number(item.total)  // Ensure conversion to number
            })),
            totalAmount: purchaseRequest.total_amount,
            status: typedStatus,
            notes: purchaseRequest.notes,
            approvedBy: purchaseRequest.approved_by_id ? {
              id: purchaseRequest.approved_by_id,
              name: purchaseRequest.approved_by_name || 'Unknown',
              role: 'admin' // Default role for approvers
            } : null,
            approvedAt: purchaseRequest.approved_at,
            rejectionReason: purchaseRequest.rejection_reason
          };
        })
      );

      return purchaseRequests;
    }
  });
};
