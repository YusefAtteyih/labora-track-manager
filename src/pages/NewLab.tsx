
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AddFacilityForm from '@/components/facilities/AddFacilityForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const NewLab = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin';

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/labs" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Laboratory</h2>
          <p className="text-muted-foreground">
            Create a new research, teaching, or specialized laboratory
          </p>
        </div>
        
        <AddFacilityForm defaultType="research" returnPath="/labs" />
      </div>
    </MainLayout>
  );
};

export default NewLab;
