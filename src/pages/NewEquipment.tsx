
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import AddEquipmentForm from '@/components/equipment/AddEquipmentForm';
import { useAuth } from '@/context/AuthContext';
import { Navigate } from 'react-router-dom';

const NewEquipment = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin';

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/equipment" replace />;
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Add New Equipment</h2>
          <p className="text-muted-foreground">
            Add laboratory equipment that can be reserved and managed
          </p>
        </div>
        
        <AddEquipmentForm returnPath="/equipment" />
      </div>
    </MainLayout>
  );
};

export default NewEquipment;
