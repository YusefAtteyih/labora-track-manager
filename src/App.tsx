
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Facilities from "./pages/Facilities";
import FacilityDetails from "./pages/FacilityDetails";
import Bookings from "./pages/Bookings";
import Purchases from "./pages/Purchases";
import Reports from "./pages/Reports";
import Organizations from "./pages/Organizations";
import Users from "./pages/Users";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper with optional role check
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode,
  allowedRoles?: string[]
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  
  if (isLoading) {
    // You could add a loading spinner here
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified, check if the user has the required role
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

// Public route wrapper (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            
            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['org_admin', 'lab_supervisor', 'facility_member']}>
                  <Inventory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities"
              element={
                <ProtectedRoute>
                  <Facilities />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facilities/:id"
              element={
                <ProtectedRoute>
                  <FacilityDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/purchases"
              element={
                <ProtectedRoute allowedRoles={['org_admin', 'lab_supervisor', 'facility_member']}>
                  <Purchases />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['org_admin', 'lab_supervisor']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/organizations"
              element={
                <ProtectedRoute allowedRoles={['org_admin']}>
                  <Organizations />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute allowedRoles={['org_admin']}>
                  <Users />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvals"
              element={
                <ProtectedRoute allowedRoles={['lab_supervisor']}>
                  <Approvals />
                </ProtectedRoute>
              }
            />
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
