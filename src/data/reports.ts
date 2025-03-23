
// Mock data for reports
export const mockReportsData = {
  usageSummary: [
    { label: 'Total Bookings', value: '428', trend: 12.5 },
    { label: 'Utilization Rate', value: '74%', trend: 5.2 },
    { label: 'Avg. Duration', value: '3.2h', trend: -2.1 },
    { label: 'Unique Users', value: '156', trend: 8.7 },
  ],
  bookingSummary: [
    { label: 'Pending Approvals', value: '24', trend: -8.3 },
    { label: 'Approved Bookings', value: '168', trend: 15.7 },
    { label: 'Rejected Bookings', value: '12', trend: -22.5 },
    { label: 'Cancelled', value: '8', trend: -5.2 },
  ],
  inventorySummary: [
    { label: 'Total Items', value: '1,245', trend: 3.2 },
    { label: 'Low Stock Items', value: '37', trend: -12.5 },
    { label: 'Out of Stock', value: '18', trend: -5.6 },
    { label: 'On Order', value: '42', trend: 18.4 },
  ],
  usageByType: [
    { name: 'Laboratories', value: 45 },
    { name: 'Equipment', value: 30 },
    { name: 'Classrooms', value: 25 },
  ],
  usageOverTime: [
    { month: 'Jan', laboratories: 65, equipment: 42, classrooms: 38 },
    { month: 'Feb', laboratories: 58, equipment: 35, classrooms: 42 },
    { month: 'Mar', laboratories: 70, equipment: 48, classrooms: 40 },
    { month: 'Apr', laboratories: 75, equipment: 52, classrooms: 45 },
    { month: 'May', laboratories: 80, equipment: 55, classrooms: 48 },
    { month: 'Jun', laboratories: 70, equipment: 50, classrooms: 38 },
  ],
  bookingsByStatus: [
    { status: 'Pending', count: 24 },
    { status: 'Approved', count: 168 },
    { status: 'Completed', count: 223 },
    { status: 'Rejected', count: 12 },
    { status: 'Cancelled', count: 8 },
  ],
  inventoryByCategory: [
    { category: 'Chemicals', inStock: 240, lowStock: 15, outOfStock: 5 },
    { category: 'Glassware', inStock: 180, lowStock: 8, outOfStock: 2 },
    { category: 'Equipment Parts', inStock: 95, lowStock: 12, outOfStock: 8 },
    { category: 'Safety Supplies', inStock: 120, lowStock: 0, outOfStock: 0 },
    { category: 'Electronics', inStock: 75, lowStock: 5, outOfStock: 3 },
  ],
};
