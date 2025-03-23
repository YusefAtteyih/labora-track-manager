import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "./components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";

// Import pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Faculties from "./pages/Faculties";
import Users from "./pages/Users";
import Labs from "./pages/Labs";
import NewLab from "./pages/NewLab";
import FacilityDetails from "./pages/FacilityDetails";
import Bookings from "./pages/Bookings";
import Inventory from "./pages/Inventory";
import Purchases from "./pages/Purchases";
import NewPurchaseRequest from "./pages/NewPurchaseRequest";
import Approvals from "./pages/Approvals";
import Reports from "./pages/Reports";
import Index from "./pages/Index";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/users" element={<Users />} />
            <Route path="/labs" element={<Labs />} />
            <Route path="/labs/new" element={<NewLab />} />
            <Route path="/labs/:id" element={<FacilityDetails />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/purchases/new" element={<NewPurchaseRequest />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/facilities" element={<Navigate to="/labs" replace />} />
            <Route path="/facilities/new" element={<Navigate to="/labs/new" replace />} />
            <Route path="/facilities/:id" element={<Navigate to="/labs/:id" replace />} />
            <Route path="/organizations" element={<Navigate to="/faculties" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
