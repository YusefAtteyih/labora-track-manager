
// Mock data for bookings
export const mockBookingsData = [
  {
    id: '1',
    facility: {
      id: '1',
      name: 'Chemistry Research Lab',
      location: 'Science Building, Room 201',
      type: 'lab'
    },
    user: {
      id: '3',
      name: 'Student User',
      role: 'student',
      avatar: 'https://ui-avatars.com/api/?name=Student+User&background=38bdf8&color=fff'
    },
    startDate: '2023-06-10T09:00:00',
    endDate: '2023-06-10T12:00:00',
    status: 'approved',
    purpose: 'Conducting pH analysis experiments for Biology 101 project',
    attendees: 3,
    notes: 'Will need access to pH meters and titration equipment'
  },
  {
    id: '2',
    facility: {
      id: '5',
      name: 'Computer Science Lab',
      location: 'Technology Building, Room 215',
      type: 'lab'
    },
    user: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    startDate: '2023-06-10T13:00:00',
    endDate: '2023-06-10T17:00:00',
    status: 'completed',
    purpose: 'Workshop on Machine Learning algorithms',
    attendees: 15,
    notes: 'Need all computers to have Python and TensorFlow installed'
  },
  {
    id: '3',
    facility: {
      id: '4',
      name: 'Electron Microscope',
      location: 'Research Center, Room 112',
      type: 'equipment'
    },
    user: {
      id: '1',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    },
    startDate: '2023-06-11T10:00:00',
    endDate: '2023-06-11T12:00:00',
    status: 'pending',
    purpose: 'Analyzing nanomaterial samples for research project',
    attendees: 2,
    notes: 'Samples will be prepared beforehand'
  },
  {
    id: '4',
    facility: {
      id: '3',
      name: 'Molecular Biology Lab',
      location: 'Biomedical Sciences Building, Room 312',
      type: 'lab'
    },
    user: {
      id: '3',
      name: 'Student User',
      role: 'student',
      avatar: 'https://ui-avatars.com/api/?name=Student+User&background=38bdf8&color=fff'
    },
    startDate: '2023-06-12T14:00:00',
    endDate: '2023-06-12T17:00:00',
    status: 'rejected',
    purpose: 'DNA extraction for genetics project',
    attendees: 4,
    notes: 'Request rejected due to maintenance activities'
  },
  {
    id: '5',
    facility: {
      id: '6',
      name: 'Interactive Lecture Hall',
      location: 'Central Building, Room 101',
      type: 'classroom'
    },
    user: {
      id: '2',
      name: 'Staff Member',
      role: 'staff',
      avatar: 'https://ui-avatars.com/api/?name=Staff+Member&background=0ea5e9&color=fff'
    },
    startDate: '2023-06-15T09:00:00',
    endDate: '2023-06-15T11:00:00',
    status: 'approved',
    purpose: 'Guest lecture on biochemistry advances',
    attendees: 80,
    notes: 'Will need video recording setup and microphones'
  },
  {
    id: '6',
    facility: {
      id: '2',
      name: 'Physics Laboratory',
      location: 'Science Building, Room 105',
      type: 'lab'
    },
    user: {
      id: '4',
      name: 'Visitor User',
      role: 'visitor',
      avatar: 'https://ui-avatars.com/api/?name=Visitor+User&background=7dd3fc&color=fff'
    },
    startDate: '2023-06-18T13:00:00',
    endDate: '2023-06-18T16:00:00',
    status: 'approved',
    purpose: 'Demonstration of new physics teaching methods',
    attendees: 10,
    notes: 'Visitor from partner university'
  },
  {
    id: '7',
    facility: {
      id: '1',
      name: 'Chemistry Research Lab',
      location: 'Science Building, Room 201',
      type: 'lab'
    },
    user: {
      id: '3',
      name: 'Student User',
      role: 'student',
      avatar: 'https://ui-avatars.com/api/?name=Student+User&background=38bdf8&color=fff'
    },
    startDate: '2023-06-20T10:00:00',
    endDate: '2023-06-20T12:00:00',
    status: 'cancelled',
    purpose: 'Chemical separation techniques practice',
    attendees: 5,
    notes: 'Cancelled due to student schedule conflict'
  },
  {
    id: '8',
    facility: {
      id: '5',
      name: 'Computer Science Lab',
      location: 'Technology Building, Room 215',
      type: 'lab'
    },
    user: {
      id: '1',
      name: 'Admin User',
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0284c7&color=fff'
    },
    startDate: '2023-06-22T09:00:00',
    endDate: '2023-06-22T17:00:00',
    status: 'pending',
    purpose: 'Department software deployment testing',
    attendees: 3,
    notes: 'Need admin access to all machines'
  }
];
