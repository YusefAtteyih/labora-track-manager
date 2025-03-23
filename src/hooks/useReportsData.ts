import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mockReportsData } from '@/data/reports';

export interface Report {
  id: string;
  title: string;
  category: string;
  createdOn: string;
  createdBy: {
    name: string;
    role: string;
    avatar: string;
  };
  status: 'published' | 'draft' | 'archived';
  summary: string;
  views: number;
  downloads: number;
}

export interface ReportSummary {
  reportsCreated: number;
  totalViews: number;
  popularCategories: { name: string; count: number }[];
  recentReports: { id: string; title: string; date: string }[];
}

export interface ReportsData {
  reports: Report[];
  summary: ReportSummary;
  // Add the missing properties that are used in Reports.tsx
  usageSummary: { label: string; value: string; trend: number }[];
  bookingSummary: { label: string; value: string; trend: number }[];
  inventorySummary: { label: string; value: string; trend: number }[];
  usageByType: { name: string; value: number }[];
  usageOverTime: { month: string; laboratories: number; equipment: number; classrooms: number }[];
  bookingsByStatus: { status: string; count: number }[];
  inventoryByCategory: { category: string; inStock: number; lowStock: number; outOfStock: number }[];
}

export const useReportsData = () => {
  return useQuery({
    queryKey: ['reports'],
    queryFn: async (): Promise<ReportsData> => {
      try {
        console.log('Fetching reports data');
        
        // Fetch labs data for category summary
        const { data: labsData, error: labsError } = await supabase
          .from('labs')
          .select('id, type:department');
          
        if (labsError) {
          console.error('Error fetching labs for reports:', labsError);
          throw new Error(labsError.message);
        }
        
        console.log('Labs data received for reports:', labsData);
        
        // Fetch equipment data for category summary
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, category');
          
        if (equipmentError) {
          console.error('Error fetching equipment for reports:', equipmentError);
          throw new Error(equipmentError.message);
        }
        
        console.log('Equipment data received for reports:', equipmentData);
        
        // Count items by category
        const categoryCounts: Record<string, number> = {};
        
        // Count labs by department
        labsData.forEach(lab => {
          const category = lab.type || 'Uncategorized';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        // Count equipment by category
        equipmentData.forEach(equip => {
          const category = equip.category || 'Uncategorized';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        // Sort categories by count and get top ones
        const popularCategories = Object.entries(categoryCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
          
        // Fetch booking data for report stats
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('id, start_date, purpose')
          .order('start_date', { ascending: false })
          .limit(5);
          
        if (bookingError) {
          console.error('Error fetching bookings for reports:', bookingError);
          throw new Error(bookingError.message);
        }
        
        console.log('Booking data received for reports:', bookingData);
        
        // Format recent bookings as reports
        const recentReports = bookingData.map(booking => ({
          id: booking.id,
          title: booking.purpose || 'Untitled Booking',
          date: new Date(booking.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })
        }));
        
        // Since we don't have actual report data, we'll generate mock reports
        const mockReports: Report[] = [
          {
            id: '1',
            title: 'Lab Usage Analysis - Q1 2023',
            category: 'Lab Usage',
            createdOn: '2023-03-31',
            createdBy: {
              name: 'Dr. Sarah Johnson',
              role: 'Lab Manager',
              avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0D8ABC&color=fff'
            },
            status: 'published',
            summary: 'Comprehensive analysis of laboratory usage across departments for Q1 2023.',
            views: 245,
            downloads: 87
          },
          {
            id: '2',
            title: 'Equipment Maintenance Schedule',
            category: 'Maintenance',
            createdOn: '2023-02-15',
            createdBy: {
              name: 'Michael Chen',
              role: 'Equipment Technician',
              avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=5a67d8&color=fff'
            },
            status: 'published',
            summary: 'Detailed maintenance schedule for all laboratory equipment for the current year.',
            views: 189,
            downloads: 56
          },
          {
            id: '3',
            title: 'Resource Allocation Proposal',
            category: 'Planning',
            createdOn: '2023-04-10',
            createdBy: {
              name: 'Prof. Robert Wilson',
              role: 'Department Chair',
              avatar: 'https://ui-avatars.com/api/?name=Robert+Wilson&background=047857&color=fff'
            },
            status: 'draft',
            summary: 'Proposal for optimizing resource allocation across research labs for the upcoming academic year.',
            views: 32,
            downloads: 0
          },
          {
            id: '4',
            title: 'Safety Compliance Audit',
            category: 'Safety',
            createdOn: '2023-03-05',
            createdBy: {
              name: 'Emily Rodriguez',
              role: 'Safety Officer',
              avatar: 'https://ui-avatars.com/api/?name=Emily+Rodriguez&background=dc2626&color=fff'
            },
            status: 'published',
            summary: 'Results from the annual safety compliance audit for all laboratories.',
            views: 312,
            downloads: 145
          },
          {
            id: '5',
            title: 'Student Access Analysis',
            category: 'Usage Analytics',
            createdOn: '2023-04-05',
            createdBy: {
              name: 'Dr. James Lee',
              role: 'Academic Coordinator',
              avatar: 'https://ui-avatars.com/api/?name=James+Lee&background=7c3aed&color=fff'
            },
            status: 'published',
            summary: 'Analysis of student laboratory access patterns and correlation with academic performance.',
            views: 187,
            downloads: 43
          }
        ];
        
        // Import the mock data from src/data/reports.ts
        return {
          reports: mockReports,
          summary: {
            reportsCreated: mockReports.length,
            totalViews: mockReports.reduce((sum, report) => sum + report.views, 0),
            popularCategories,
            recentReports
          },
          // Add the mock data properties required by Reports.tsx
          usageSummary: mockReportsData.usageSummary,
          bookingSummary: mockReportsData.bookingSummary,
          inventorySummary: mockReportsData.inventorySummary,
          usageByType: mockReportsData.usageByType,
          usageOverTime: mockReportsData.usageOverTime,
          bookingsByStatus: mockReportsData.bookingsByStatus,
          inventoryByCategory: mockReportsData.inventoryByCategory
        };
      } catch (error) {
        console.error('Failed to fetch reports data:', error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });
};
