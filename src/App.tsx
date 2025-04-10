import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "./components/ui/toaster";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useEffect } from "react";
import { trackPageView } from "./utils/analytics";

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

// PageTracker component to track page views
const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track page view when location changes
    trackPageView(location.pathname);
  }, [location]);
  
  return null;
};

// PrivateRoute component to protect routes that require authentication
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing or a loading indicator
  if (isLoading) {
    return null; // or return a loading spinner
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected route
  return <>{children}</>;
};

// Facility redirect component to handle parameter passing
const FacilityRedirect = () => {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={`/labs/${id}${location.search}`} replace />;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <PageTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            <Route path="/faculties" element={
              <PrivateRoute>
                <Faculties />
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            } />
            <Route path="/labs" element={
              <PrivateRoute>
                <Labs />
              </PrivateRoute>
            } />
            <Route path="/labs/new" element={
              <PrivateRoute>
                <NewLab />
              </PrivateRoute>
            } />
            <Route path="/labs/:id" element={
              <PrivateRoute>
                <FacilityDetails />
              </PrivateRoute>
            } />
            <Route path="/bookings" element={
              <PrivateRoute>
                <Bookings />
              </PrivateRoute>
            } />
            <Route path="/inventory" element={
              <PrivateRoute>
                <Inventory />
              </PrivateRoute>
            } />
            <Route path="/purchases" element={
              <PrivateRoute>
                <Purchases />
              </PrivateRoute>
            } />
            <Route path="/purchases/new" element={
              <PrivateRoute>
                <NewPurchaseRequest />
              </PrivateRoute>
            } />
            <Route path="/approvals" element={
              <PrivateRoute>
                <Approvals />
              </PrivateRoute>
            } />
            <Route path="/reports" element={
              <PrivateRoute>
                <Reports />
              </PrivateRoute>
            } />
            
            {/* Redirects */}
            <Route path="/facilities" element={<Navigate to="/labs" replace />} />
            <Route path="/facilities/new" element={<Navigate to="/labs/new" replace />} />
            <Route path="/facilities/:id" element={<FacilityRedirect />} />
            <Route path="/organizations" element={<Navigate to="/faculties" replace />} />
            
            {/* Not found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
