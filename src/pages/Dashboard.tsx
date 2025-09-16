import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FarmerDashboard from '@/components/dashboards/FarmerDashboard';
import VeterinarianDashboard from '@/components/dashboards/VeterinarianDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';

const Dashboard = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  switch (profile.role) {
    case 'farmer':
      return <FarmerDashboard />;
    case 'veterinarian':
      return <VeterinarianDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Dashboard;