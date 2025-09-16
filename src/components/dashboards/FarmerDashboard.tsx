import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar, 
  Award, 
  AlertTriangle, 
  CheckCircle,
  Video,
  Phone,
  User,
  LogOut,
  Bell
} from 'lucide-react';

const FarmerDashboard = () => {
  const { profile, signOut } = useAuth();
  const [animals, setAnimals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch user's farms first
      const { data: farms } = await supabase
        .from('farms')
        .select('id')
        .eq('owner_id', profile?.id);

      if (farms && farms.length > 0) {
        const farmIds = farms.map(farm => farm.id);

        // Fetch animals
        const { data: animalsData } = await supabase
          .from('animals')
          .select('*')
          .in('farm_id', farmIds)
          .order('created_at', { ascending: false });

        // Fetch today's tasks
        const today = new Date().toISOString().split('T')[0];
        const { data: tasksData } = await supabase
          .from('task_schedule')
          .select(`
            *,
            animals(tag_id, name, species)
          `)
          .in('animal_id', animalsData?.map(a => a.id) || [])
          .eq('scheduled_date', today)
          .eq('status', 'pending');

        // Fetch active alerts
        const { data: alertsData } = await supabase
          .from('compliance_alerts')
          .select('*')
          .in('farm_id', farmIds)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        setAnimals(animalsData || []);
        setTasks(tasksData || []);
        setAlerts(alertsData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStats = () => {
    const now = new Date();
    const safeAnimals = animals.filter(animal => {
      const milkSafe = !animal.withdrawal_until_milk || new Date(animal.withdrawal_until_milk) < now;
      const meatSafe = !animal.withdrawal_until_meat || new Date(animal.withdrawal_until_meat) < now;
      return milkSafe && meatSafe;
    });
    
    const withdrawalAnimals = animals.length - safeAnimals.length;
    
    return { safeAnimals: safeAnimals.length, withdrawalAnimals };
  };

  const completeTask = async (taskId: string) => {
    const { error } = await supabase
      .from('task_schedule')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

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

  const { safeAnimals, withdrawalAnimals } = getComplianceStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Top Navigation */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Award className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">FarmGuard</h1>
              </div>
              <Badge variant="secondary" className="ml-4">
                Farmer Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-accent" />
                <span className="font-semibold">{profile?.reward_points || 0} Points</span>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Safe for Sale</p>
                  <p className="text-2xl font-bold text-success">{safeAnimals}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Withdrawal</p>
                  <p className="text-2xl font-bold text-warning">{withdrawalAnimals}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Tasks</p>
                  <p className="text-2xl font-bold text-primary">{tasks.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-destructive">{alerts.length}</p>
                </div>
                <Bell className="h-8 w-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="herd" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="herd">My Herd</TabsTrigger>
            <TabsTrigger value="tasks">Today's Tasks</TabsTrigger>
            <TabsTrigger value="consultation">Consultation</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="herd" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>My Animals</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Animal
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {animals.map((animal: any) => {
                    const now = new Date();
                    const milkSafe = !animal.withdrawal_until_milk || new Date(animal.withdrawal_until_milk) < now;
                    const meatSafe = !animal.withdrawal_until_meat || new Date(animal.withdrawal_until_meat) < now;
                    const isCompliant = milkSafe && meatSafe;
                    
                    return (
                      <Card key={animal.id} className="hover-scale">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-semibold">{animal.name || animal.tag_id}</h3>
                            <Badge variant={isCompliant ? "default" : "destructive"}>
                              {isCompliant ? "Safe" : "Withdrawal"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {animal.species} • {animal.breed || 'Unknown breed'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Tag: {animal.tag_id}
                          </p>
                          {!isCompliant && (
                            <div className="mt-2 text-xs">
                              {!milkSafe && (
                                <p className="text-warning">
                                  Milk safe: {new Date(animal.withdrawal_until_milk).toLocaleDateString()}
                                </p>
                              )}
                              {!meatSafe && (
                                <p className="text-warning">
                                  Meat safe: {new Date(animal.withdrawal_until_meat).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{task.description}</h3>
                        <p className="text-sm text-muted-foreground">
                          Animal: {task.animals?.name || task.animals?.tag_id} ({task.animals?.species})
                        </p>
                        {task.scheduled_time && (
                          <p className="text-xs text-muted-foreground">
                            Time: {task.scheduled_time}
                          </p>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => completeTask(task.id)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  ))}
                  {tasks.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No tasks scheduled for today. Great job!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="consultation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Veterinary Consultation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Video className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Video Consultation</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Schedule a video call with a veterinarian
                      </p>
                      <Button className="w-full">Schedule Video Call</Button>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Emergency Contact</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Report urgent health issues
                      </p>
                      <Button variant="outline" className="w-full">Report Problem</Button>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Rewards & Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center space-x-2 p-4 bg-accent/10 rounded-lg">
                    <Award className="h-8 w-8 text-accent" />
                    <div>
                      <h3 className="text-2xl font-bold">{profile?.reward_points || 0}</h3>
                      <p className="text-sm text-muted-foreground">Total Points</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Daily Tasks Completion</h4>
                    <p className="text-sm text-muted-foreground">+5 points per day</p>
                    <p className="text-xs text-muted-foreground">Complete all scheduled tasks</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Perfect Compliance Week</h4>
                    <p className="text-sm text-muted-foreground">+50 points</p>
                    <p className="text-xs text-muted-foreground">Maintain 100% compliance for 7 days</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">New Animal Registration</h4>
                    <p className="text-sm text-muted-foreground">+10 points</p>
                    <p className="text-xs text-muted-foreground">Add new animal with complete details</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FarmerDashboard;