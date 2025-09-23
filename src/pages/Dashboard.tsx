import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FarmerDashboard from '@/components/dashboards/FarmerDashboard';
import VeterinarianDashboard from '@/components/dashboards/VeterinarianDashboard';
import AdminDashboard from '@/components/dashboards/AdminDashboard';
import LabDashboard from '@/components/dashboards/LabDashboard';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  console.log('Dashboard render - User:', user?.email, 'Profile:', profile?.role, 'Loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!profile) {
    console.log('No profile found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  console.log('Rendering dashboard for role:', profile.role);

  switch (profile.role as 'farmer' | 'veterinarian' | 'admin' | 'lab') {
    case 'farmer':
      return <FarmerDashboard />;
    case 'veterinarian':
      return <VeterinarianDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'lab':
      return <LabDashboard />;
    default:
      console.error('Unknown role:', profile.role);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Error</h1>
            <p className="text-muted-foreground mb-4">Invalid user role: {profile.role}</p>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="bg-primary text-primary-foreground px-4 py-2 rounded"
            >
              Return to Login
            </button>
          </div>
        </div>
      );
  }
};

export default Dashboard;