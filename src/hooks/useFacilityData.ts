
import { useQuery } from '@tanstack/react-query';
import { Facility } from '@/types/facility';

// Mock data for facilities
const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Chemistry Research Lab',
    type: 'lab',
    description: 'Fully equipped chemistry laboratory with advanced analytical instruments, fume hoods, and safety equipment.',
    location: 'Science Building, Floor 2, Room 201',
    capacity: 24,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&q=80',
    openHours: '8:00 AM - 6:00 PM',
    department: 'Chemistry',
    features: ['Fume Hoods', 'Gas Chromatography', 'Spectrophotometers', 'Safety Showers'],
    availableFor: ['students', 'staff'],
    requiresApproval: true
  },
  {
    id: '2',
    name: 'Physics Laboratory',
    type: 'lab',
    description: 'Specialized lab for physics experiments with precision measurement equipment and data analysis workstations.',
    location: 'Science Building, Floor 1, Room 105',
    capacity: 30,
    status: 'maintenance',
    image: 'https://images.unsplash.com/photo-1575318634028-6a0cfcb60c59?auto=format&fit=crop&q=80',
    openHours: '9:00 AM - 5:00 PM',
    department: 'Physics',
    features: ['Oscilloscopes', 'Laser Equipment', 'Optics Bench', 'Computing Stations'],
    availableFor: ['students', 'staff', 'visitors'],
    requiresApproval: true
  },
  {
    id: '3',
    name: 'Molecular Biology Lab',
    type: 'lab',
    description: 'State-of-the-art laboratory for molecular biology research, gene sequencing, and cell culture studies.',
    location: 'Biomedical Sciences Building, Floor 3, Room 312',
    capacity: 18,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1614308287921-a2e72839fdb9?auto=format&fit=crop&q=80',
    openHours: '8:00 AM - 8:00 PM',
    department: 'Biology',
    features: ['PCR Machines', 'Centrifuges', 'Incubators', 'Microscopes'],
    availableFor: ['staff'],
    requiresApproval: true
  },
  {
    id: '4',
    name: 'Electron Microscope',
    type: 'equipment',
    description: 'High-resolution scanning electron microscope for detailed material and biological sample analysis.',
    location: 'Research Center, Floor 1, Room 112',
    capacity: 2,
    status: 'booked',
    image: 'https://images.unsplash.com/photo-1606206873764-fd15e242df52?auto=format&fit=crop&q=80',
    openHours: '9:00 AM - 4:00 PM',
    department: 'Materials Science',
    features: ['SEM', 'TEM', 'Sample Preparation Station'],
    availableFor: ['staff', 'visitors'],
    requiresApproval: true
  },
  {
    id: '5',
    name: 'Computer Science Lab',
    type: 'lab',
    description: 'Laboratory equipped with high-performance computers for software development, AI research, and simulations.',
    location: 'Technology Building, Floor 2, Room 215',
    capacity: 40,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&q=80',
    openHours: '7:00 AM - 11:00 PM',
    department: 'Computer Science',
    features: ['GPU Workstations', 'Development Servers', 'VR Equipment'],
    availableFor: ['students', 'staff', 'visitors'],
    requiresApproval: false
  },
  {
    id: '6',
    name: 'Interactive Lecture Hall',
    type: 'classroom',
    description: 'Modern lecture hall with interactive display technology, recording capabilities, and flexible seating.',
    location: 'Central Building, Floor 1, Room 101',
    capacity: 120,
    status: 'available',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80',
    openHours: '8:00 AM - 9:00 PM',
    department: 'All Departments',
    features: ['Video Conferencing', 'Interactive Displays', 'Recording System'],
    availableFor: ['students', 'staff', 'visitors'],
    requiresApproval: true
  }
];

export const useFacilityData = () => {
  return useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockFacilities;
    }
  });
};

export const useFacilityById = (id: string) => {
  return useQuery({
    queryKey: ['facility', id],
    queryFn: async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      const facility = mockFacilities.find(f => f.id === id);
      if (!facility) {
        throw new Error('Facility not found');
      }
      return facility;
    }
  });
};
