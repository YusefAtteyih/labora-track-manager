
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Facilities from './pages/Facilities';
import FacilityDetails from './pages/FacilityDetails';
import { AuthProvider } from './context/AuthContext';
import NewFacility from './pages/NewFacility';
import Reports from './pages/Reports';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/facilities" element={<Facilities />} />
            <Route path="/facilities/new" element={<NewFacility />} />
            <Route path="/facilities/:id" element={<FacilityDetails />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
