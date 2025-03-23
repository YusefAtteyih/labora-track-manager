
// Mock data for purchase requests
export const mockPurchaseRequestsData = [
  {
    id: 'PR-2023-001',
    title: 'Chemistry Lab Supplies Restock',
    createdAt: '2023-06-01T10:15:00',
    priority: 'high',
    department: 'chemistry',
    requestedBy: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    items: [
      { id: '1', name: 'Beakers (100ml)', quantity: 20, price: 8.50 },
      { id: '2', name: 'Erlenmeyer Flasks (250ml)', quantity: 15, price: 12.75 },
      { id: '3', name: 'pH Buffer Solutions Set', quantity: 5, price: 45.99 }
    ],
    totalAmount: 577.45,
    status: 'approved',
    notes: 'Urgent restock needed for upcoming laboratory sessions',
    approvedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin'
    },
    approvedAt: '2023-06-02T14:30:00'
  },
  {
    id: 'PR-2023-002',
    title: 'Molecular Biology Reagents',
    createdAt: '2023-06-05T09:22:00',
    priority: 'medium',
    department: 'biology',
    requestedBy: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    items: [
      { id: '1', name: 'PCR Master Mix (200 reactions)', quantity: 2, price: 125.00 },
      { id: '2', name: 'DNA Ladder (1kb)', quantity: 3, price: 85.50 },
      { id: '3', name: 'Taq Polymerase', quantity: 1, price: 195.75 }
    ],
    totalAmount: 702.25,
    status: 'pending',
    notes: 'Required for ongoing research project on gene expression',
    approvedBy: null,
    approvedAt: null
  },
  {
    id: 'PR-2023-003',
    title: 'Computer Lab Equipment Upgrade',
    createdAt: '2023-06-08T13:45:00',
    priority: 'low',
    department: 'computerScience',
    requestedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    },
    items: [
      { id: '1', name: 'Graphics Cards (NVIDIA RTX 3060)', quantity: 5, price: 450.00 },
      { id: '2', name: 'RAM Modules (32GB DDR4)', quantity: 10, price: 120.00 },
      { id: '3', name: 'SSD Drives (1TB)', quantity: 8, price: 95.00 }
    ],
    totalAmount: 4310.00,
    status: 'approved',
    notes: 'Equipment upgrade for AI research laboratory',
    approvedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin'
    },
    approvedAt: '2023-06-09T10:15:00'
  },
  {
    id: 'PR-2023-004',
    title: 'Physics Lab Oscilloscopes',
    createdAt: '2023-06-10T11:30:00',
    priority: 'medium',
    department: 'physics',
    requestedBy: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    items: [
      { id: '1', name: 'Digital Oscilloscope (100MHz)', quantity: 3, price: 1250.00 },
      { id: '2', name: 'Oscilloscope Probes Set', quantity: 6, price: 125.00 }
    ],
    totalAmount: 4225.00,
    status: 'ordered',
    notes: 'Replacement for aging equipment in the undergraduate physics lab',
    approvedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin'
    },
    approvedAt: '2023-06-11T09:45:00'
  },
  {
    id: 'PR-2023-005',
    title: 'Safety Equipment Restock',
    createdAt: '2023-06-12T14:20:00',
    priority: 'high',
    department: 'chemistry',
    requestedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    },
    items: [
      { id: '1', name: 'Safety Goggles', quantity: 50, price: 12.50 },
      { id: '2', name: 'Lab Coats (Medium)', quantity: 20, price: 35.00 },
      { id: '3', name: 'Lab Coats (Large)', quantity: 15, price: 35.00 },
      { id: '4', name: 'Chemical Spill Kits', quantity: 5, price: 95.00 }
    ],
    totalAmount: 2350.00,
    status: 'delivered',
    notes: 'Annual safety equipment refresh',
    approvedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin'
    },
    approvedAt: '2023-06-12T16:10:00'
  },
  {
    id: 'PR-2023-006',
    title: 'Microscope Maintenance Parts',
    createdAt: '2023-06-15T09:30:00',
    priority: 'medium',
    department: 'biology',
    requestedBy: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    items: [
      { id: '1', name: 'Objective Lens (40x)', quantity: 2, price: 230.00 },
      { id: '2', name: 'Light Source Assembly', quantity: 1, price: 180.00 },
      { id: '3', name: 'Fine Focus Knob', quantity: 3, price: 45.00 }
    ],
    totalAmount: 775.00,
    status: 'pending',
    notes: 'Required parts for scheduled maintenance of teaching microscopes',
    approvedBy: null,
    approvedAt: null
  },
  {
    id: 'PR-2023-007',
    title: 'Software Licenses for Data Analysis',
    createdAt: '2023-06-18T15:45:00',
    priority: 'low',
    department: 'computerScience',
    requestedBy: {
      id: '3',
      name: 'Student User',
      role: 'student',
      avatar: 'https://ui-avatars.com/api/?name=Student+User&background=38bdf8&color=fff'
    },
    items: [
      { id: '1', name: 'MATLAB Academic License (Annual)', quantity: 10, price: 500.00 },
      { id: '2', name: 'SPSS Statistics Package', quantity: 5, price: 300.00 }
    ],
    totalAmount: 6500.00,
    status: 'rejected',
    notes: 'Licenses for graduate student research projects',
    approvedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin'
    },
    approvedAt: '2023-06-19T10:30:00',
    rejectionReason: 'Open-source alternatives available. Please consult with IT department.'
  },
  {
    id: 'PR-2023-008',
    title: 'Electronic Components for Robotics Lab',
    createdAt: '2023-06-20T13:15:00',
    priority: 'medium',
    department: 'physics',
    requestedBy: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    items: [
      { id: '1', name: 'Arduino Mega Boards', quantity: 8, price: 45.00 },
      { id: '2', name: 'Servo Motors', quantity: 20, price: 12.50 },
      { id: '3', name: 'Sensor Kit Assortment', quantity: 5, price: 75.00 },
      { id: '4', name: 'Breadboards', quantity: 15, price: 8.50 }
    ],
    totalAmount: 1087.50,
    status: 'ordered',
    notes: 'Components for undergraduate robotics course project',
    approvedBy: {
      id: '1',
      name: 'Admin User',
      role: 'admin'
    },
    approvedAt: '2023-06-21T09:20:00'
  }
];
