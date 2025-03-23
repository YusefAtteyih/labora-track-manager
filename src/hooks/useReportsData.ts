
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ReportSummaryItem {
  label: string;
  value: string;
  trend: number;
}

export interface ReportChartDataPoint {
  name: string;
  value: number;
}

export interface MonthlyUsageDataPoint {
  month: string;
  laboratories: number;
  equipment: number;
  classrooms: number;
}

export interface BookingStatusDataPoint {
  status: string;
  count: number;
}

export interface InventoryCategoryDataPoint {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

export interface ReportsData {
  usageSummary: ReportSummaryItem[];
  bookingSummary: ReportSummaryItem[];
  inventorySummary: ReportSummaryItem[];
  usageByType: ReportChartDataPoint[];
  usageOverTime: MonthlyUsageDataPoint[];
  bookingsByStatus: BookingStatusDataPoint[];
  inventoryByCategory: InventoryCategoryDataPoint[];
}

export const useReportsData = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<ReportsData> => {
      // Fetch all the data we need from Supabase to generate reports
      
      // 1. Get facility and booking data
      const { data: facilities, error: facilitiesError } = await supabase
        .from('facilities')
        .select('*');
      
      if (facilitiesError) {
        console.error('Error fetching facilities for reports:', facilitiesError);
        throw new Error(facilitiesError.message);
      }
      
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');
      
      if (bookingsError) {
        console.error('Error fetching bookings for reports:', bookingsError);
        throw new Error(bookingsError.message);
      }
      
      // Calculate usage statistics
      const totalBookings = bookings.length;
      const totalFacilities = facilities.length;
      
      // Calculate unique users
      const uniqueUsers = new Set(bookings.map(b => b.user_id)).size;
      
      // Calculate average booking duration in hours
      const avgDuration = bookings.length > 0 
        ? bookings.reduce((sum, booking) => {
            const start = new Date(booking.start_date);
            const end = new Date(booking.end_date);
            const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return sum + durationHours;
          }, 0) / bookings.length
        : 0;
      
      // Calculate utilization rate (bookings / total possible slots)
      // This is a simplified calculation
      const utilizationRate = totalFacilities > 0 
        ? (totalBookings / (totalFacilities * 30)) * 100 // assuming 30 possible booking slots per facility
        : 0;
      
      // Count bookings by status
      const statusCounts = bookings.reduce((acc, booking) => {
        acc[booking.status] = (acc[booking.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Count facilities by type
      const typeCounts = facilities.reduce((acc, facility) => {
        acc[facility.type] = (acc[facility.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Generate mock trends since we don't have historical data
      // In a real application, you would compare with previous periods
      const generateTrend = () => Math.round((Math.random() * 40 - 20) * 10) / 10;
      
      // Calculate usage by type percentage
      const totalByType = Object.values(typeCounts).reduce((a, b) => a + b, 0);
      const usageByTypePercentage = Object.entries(typeCounts).map(([name, value]) => ({
        name: name === 'lab' ? 'Laboratories' : name === 'equipment' ? 'Equipment' : 'Classrooms',
        value: totalByType > 0 ? Math.round((value / totalByType) * 100) : 0
      }));
      
      // Format the data for the reports
      return {
        usageSummary: [
          { label: 'Total Bookings', value: totalBookings.toString(), trend: generateTrend() },
          { label: 'Utilization Rate', value: `${Math.round(utilizationRate)}%`, trend: generateTrend() },
          { label: 'Avg. Duration', value: `${avgDuration.toFixed(1)}h`, trend: generateTrend() },
          { label: 'Unique Users', value: uniqueUsers.toString(), trend: generateTrend() },
        ],
        bookingSummary: [
          { label: 'Pending Approvals', value: (statusCounts['pending'] || 0).toString(), trend: generateTrend() },
          { label: 'Approved Bookings', value: (statusCounts['approved'] || 0).toString(), trend: generateTrend() },
          { label: 'Rejected Bookings', value: (statusCounts['rejected'] || 0).toString(), trend: generateTrend() },
          { label: 'Cancelled', value: (statusCounts['cancelled'] || 0).toString(), trend: generateTrend() },
        ],
        inventorySummary: [
          // We'll mock inventory data until we have an inventory table
          { label: 'Total Items', value: '1,245', trend: generateTrend() },
          { label: 'Low Stock Items', value: '37', trend: generateTrend() },
          { label: 'Out of Stock', value: '18', trend: generateTrend() },
          { label: 'On Order', value: '42', trend: generateTrend() },
        ],
        usageByType: usageByTypePercentage,
        usageOverTime: [
          // Mock monthly data until we have historical data
          { month: 'Jan', laboratories: 65, equipment: 42, classrooms: 38 },
          { month: 'Feb', laboratories: 58, equipment: 35, classrooms: 42 },
          { month: 'Mar', laboratories: 70, equipment: 48, classrooms: 40 },
          { month: 'Apr', laboratories: 75, equipment: 52, classrooms: 45 },
          { month: 'May', laboratories: 80, equipment: 55, classrooms: 48 },
          { month: 'Jun', laboratories: 70, equipment: 50, classrooms: 38 },
        ],
        bookingsByStatus: Object.entries(statusCounts).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count
        })),
        inventoryByCategory: [
          // Mock inventory data until we have an inventory table
          { category: 'Chemicals', inStock: 240, lowStock: 15, outOfStock: 5 },
          { category: 'Glassware', inStock: 180, lowStock: 8, outOfStock: 2 },
          { category: 'Equipment Parts', inStock: 95, lowStock: 12, outOfStock: 8 },
          { category: 'Safety Supplies', inStock: 120, lowStock: 0, outOfStock: 0 },
          { category: 'Electronics', inStock: 75, lowStock: 5, outOfStock: 3 },
        ],
      };
    }
  });
};
