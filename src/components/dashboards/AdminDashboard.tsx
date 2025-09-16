import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Shield,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  FileText,
  Settings,
  User,
  LogOut,
  Search,
  Eye,
  UserCheck,
  UserX
} from 'lucide-react';

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFarmers: 0,
    totalVets: 0,
    totalAnimals: 0,
    complianceRate: 0,
    activeAlerts: 0
  });
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user statistics
      const { data: usersData } = await supabase
        .from('profiles')
        .select('role, is_vet_verified');

      const { data: animalsData } = await supabase
        .from('animals')
        .select('status, withdrawal_until_milk, withdrawal_until_meat');

      const { data: alertsData } = await supabase
        .from('compliance_alerts')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Calculate stats
      const totalUsers = usersData?.length || 0;
      const totalFarmers = usersData?.filter(u => u.role === 'farmer').length || 0;
      const totalVets = usersData?.filter(u => u.role === 'veterinarian').length || 0;
      const totalAnimals = animalsData?.length || 0;
      
      // Calculate compliance rate
      const now = new Date();
      const compliantAnimals = animalsData?.filter(animal => {
        const milkSafe = !animal.withdrawal_until_milk || new Date(animal.withdrawal_until_milk) < now;
        const meatSafe = !animal.withdrawal_until_meat || new Date(animal.withdrawal_until_meat) < now;
        return milkSafe && meatSafe;
      }).length || 0;
      
      const complianceRate = totalAnimals > 0 ? Math.round((compliantAnimals / totalAnimals) * 100) : 100;

      setStats({
        totalUsers,
        totalFarmers,
        totalVets,
        totalAnimals,
        complianceRate,
        activeAlerts: alertsData?.length || 0
      });

      // Fetch detailed user data
      const { data: detailedUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      setUsers(detailedUsers || []);
      setAlerts(alertsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyVeterinarian = async (userId: string, verify: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_vet_verified: verify })
      .eq('id', userId);

    if (!error) {
      fetchDashboardData();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Top Navigation */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">FarmGuard</h1>
              </div>
              <Badge variant="secondary" className="ml-4">
                Admin Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                {profile?.full_name}
              </Button>
              <Button variant="outline" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalUsers}</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Farmers</p>
                  <p className="text-2xl font-bold text-success">{stats.totalFarmers}</p>
                </div>
                <Users className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Veterinarians</p>
                  <p className="text-2xl font-bold text-accent">{stats.totalVets}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Animals</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalAnimals}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance Rate</p>
                  <p className="text-2xl font-bold text-success">{stats.complianceRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-destructive">{stats.activeAlerts}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Farmers</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-muted rounded">
                          <div 
                            className="h-2 bg-success rounded" 
                            style={{ width: `${(stats.totalFarmers / stats.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.totalFarmers}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Veterinarians</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-muted rounded">
                          <div 
                            className="h-2 bg-accent rounded" 
                            style={{ width: `${(stats.totalVets / stats.totalUsers) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats.totalVets}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {alerts.slice(0, 5).map((alert: any) => (
                      <div key={alert.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="text-sm font-medium">{alert.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(alert.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                          {alert.severity}
                        </Badge>
                      </div>
                    ))}
                    {alerts.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No active alerts
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search users..." 
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Role: {user.role}
                          </p>
                          {user.role === 'veterinarian' && user.vet_license_id && (
                            <p className="text-xs text-muted-foreground">
                              License: {user.vet_license_id}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'veterinarian' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                        {user.role === 'veterinarian' && (
                          <Badge variant={user.is_vet_verified ? 'default' : 'destructive'}>
                            {user.is_vet_verified ? 'Verified' : 'Pending'}
                          </Badge>
                        )}
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {user.role === 'veterinarian' && !user.is_vet_verified && (
                            <Button 
                              size="sm" 
                              onClick={() => verifyVeterinarian(user.id, true)}
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                          {user.role === 'veterinarian' && user.is_vet_verified && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => verifyVeterinarian(user.id, false)}
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-success/10 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-success mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-success">{stats.complianceRate}%</h3>
                    <p className="text-sm text-muted-foreground">Overall Compliance</p>
                  </div>
                  <div className="text-center p-6 bg-warning/10 rounded-lg">
                    <AlertTriangle className="h-12 w-12 text-warning mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-warning">{stats.activeAlerts}</h3>
                    <p className="text-sm text-muted-foreground">Active Alerts</p>
                  </div>
                  <div className="text-center p-6 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="text-2xl font-bold text-primary">+12%</h3>
                    <p className="text-sm text-muted-foreground">Monthly Improvement</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Recent Compliance Issues</h4>
                  {alerts.map((alert: any) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{alert.alert_type.replace('_', ' ').toUpperCase()}</h5>
                        <Badge variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(alert.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Button variant="outline" className="h-32 flex flex-col items-center justify-center space-y-2">
                    <FileText className="h-8 w-8 text-primary" />
                    <span>Compliance Report</span>
                    <span className="text-xs text-muted-foreground">Monthly compliance summary</span>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex flex-col items-center justify-center space-y-2">
                    <BarChart3 className="h-8 w-8 text-primary" />
                    <span>Usage Analytics</span>
                    <span className="text-xs text-muted-foreground">Platform usage statistics</span>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex flex-col items-center justify-center space-y-2">
                    <TrendingUp className="h-8 w-8 text-primary" />
                    <span>AMU Trends</span>
                    <span className="text-xs text-muted-foreground">Antimicrobial usage trends</span>
                  </Button>
                  
                  <Button variant="outline" className="h-32 flex flex-col items-center justify-center space-y-2">
                    <Users className="h-8 w-8 text-primary" />
                    <span>User Activity</span>
                    <span className="text-xs text-muted-foreground">User engagement report</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;