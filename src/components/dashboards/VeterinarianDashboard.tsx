import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Stethoscope,
  Calendar,
  FileText,
  Award,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  Search,
  User,
  LogOut,
  Plus,
  BarChart3
} from 'lucide-react';
import DashboardChart from '@/components/charts/DashboardChart';
import SchedulingModal from '@/components/SchedulingModal';
import PrescriptionDownload from '@/components/PrescriptionDownload';
import Chatbot from '@/components/Chatbot';

const VeterinarianDashboard = () => {
  const { profile, signOut } = useAuth();
  const [consultationRequests, setConsultationRequests] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [medications, setMedications] = useState([]);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [prescriptionData, setPrescriptionData] = useState({
    diagnosis: '',
    medicationId: '',
    dosage: '',
    routeOfAdministration: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [showSchedulingModal, setShowSchedulingModal] = useState(false);

  const getChartData = () => {
    const consultationsByStatus = consultationRequests.reduce((acc, request) => {
      const status = request.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    const consultationChartData = Object.entries(consultationsByStatus).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number
    }));

    const priorityByLevel = consultationRequests.reduce((acc, request) => {
      const priority = request.priority || 'routine';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {});

    const priorityChartData = Object.entries(priorityByLevel).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as number
    }));

    const healthData = [
      { name: 'Mon', value: 12 },
      { name: 'Tue', value: 8 },
      { name: 'Wed', value: 15 },
      { name: 'Thu', value: 11 },
      { name: 'Fri', value: 9 },
      { name: 'Sat', value: 6 },
      { name: 'Sun', value: 4 }
    ];

    return { consultationChartData, priorityChartData, healthData };
  };

  useEffect(() => {
    fetchDashboardData();
    fetchMedications();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch consultation requests
      const { data: requests } = await supabase
        .from('consultation_requests')
        .select(`
          *,
          profiles!consultation_requests_farmer_id_fkey(full_name),
          animals(tag_id, name, species)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      // Fetch all animals (vets can view all animals)
      const { data: animalsData } = await supabase
        .from('animals')
        .select(`
          *,
          farms(farm_name, profiles(full_name))
        `)
        .order('created_at', { ascending: false });

      setConsultationRequests(requests || []);
      setAnimals(animalsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    const { data } = await supabase
      .from('medications')
      .select('*')
      .order('med_name');
    
    setMedications(data || []);
  };

  const acceptConsultation = async (requestId: string) => {
    const { error } = await supabase
      .from('consultation_requests')
      .update({ 
        status: 'accepted',
        vet_id: profile?.id 
      })
      .eq('id', requestId);

    if (!error) {
      fetchDashboardData();
    }
  };

  const createTreatment = async () => {
    if (!selectedAnimal || !prescriptionData.diagnosis || !prescriptionData.medicationId) {
      return;
    }

    try {
      // Create treatment record
      const { error: treatmentError } = await supabase
        .from('treatments')
        .insert({
          animal_id: selectedAnimal.id,
          vet_id: profile?.id,
          medication_id: prescriptionData.medicationId,
          diagnosis: prescriptionData.diagnosis,
          dosage: prescriptionData.dosage,
          route_of_administration: prescriptionData.routeOfAdministration,
          notes: prescriptionData.notes
        });

      if (treatmentError) throw treatmentError;

      // Calculate withdrawal periods
      const medication = medications.find(m => m.id === prescriptionData.medicationId);
      if (medication) {
        const now = new Date();
        const milkWithdrawalEnd = new Date(now.getTime() + medication.withdrawal_period_milk_hours * 60 * 60 * 1000);
        const meatWithdrawalEnd = new Date(now.getTime() + medication.withdrawal_period_meat_days * 24 * 60 * 60 * 1000);

        // Update animal status
        const { error: animalError } = await supabase
          .from('animals')
          .update({
            status: 'withdrawal',
            withdrawal_until_milk: milkWithdrawalEnd.toISOString(),
            withdrawal_until_meat: meatWithdrawalEnd.toISOString()
          })
          .eq('id', selectedAnimal.id);

        if (animalError) throw animalError;
      }

      // Reset form
      setPrescriptionData({
        diagnosis: '',
        medicationId: '',
        dosage: '',
        routeOfAdministration: '',
        notes: ''
      });
      setSelectedAnimal(null);
      
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating treatment:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const highRiskAnimals = animals.filter(animal => animal.status === 'withdrawal').length;
  const pendingConsultations = consultationRequests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Top Navigation */}
      <header className="bg-background/80 backdrop-blur-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Stethoscope className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold text-primary">FarmGuard</h1>
              </div>
              <Badge variant="secondary" className="ml-4">
                Veterinarian Dashboard
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-accent" />
                <span className="font-semibold">{profile?.reward_points || 0} Points</span>
              </div>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Dr. {profile?.full_name}
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
                  <p className="text-sm font-medium text-muted-foreground">Pending Consultations</p>
                  <p className="text-2xl font-bold text-primary">{pendingConsultations}</p>
                </div>
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High-Risk Animals</p>
                  <p className="text-2xl font-bold text-warning">{highRiskAnimals}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-warning" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Animals</p>
                  <p className="text-2xl font-bold text-success">{animals.length}</p>
                </div>
                <Users className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Visits</p>
                  <p className="text-2xl font-bold text-accent">3</p>
                </div>
                <Calendar className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="consultations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="consultations">Consultations</TabsTrigger>
            <TabsTrigger value="animals">Animals</TabsTrigger>
            <TabsTrigger value="prescribe">Prescribe</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="consultations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Consultation Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {consultationRequests.map((request: any) => (
                    <div key={request.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">
                            {request.profiles?.full_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Animal: {request.animals?.name || request.animals?.tag_id} ({request.animals?.species})
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={request.priority === 'emergency' ? 'destructive' : 'default'}>
                            {request.priority}
                          </Badge>
                          <Badge variant="outline">
                            {request.consultation_type}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm">{request.symptoms}</p>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => acceptConsultation(request.id)}
                        >
                          Accept
                        </Button>
                        <Button size="sm" variant="outline">
                          Schedule Later
                        </Button>
                      </div>
                    </div>
                  ))}
                  {consultationRequests.length === 0 && (
                    <p className="text-muted-foreground text-center py-8">
                      No pending consultation requests.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="animals" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Animal Records</CardTitle>
                <div className="flex items-center space-x-2">
                  <Input 
                    placeholder="Search by tag ID or name..." 
                    className="w-64"
                  />
                  <Button variant="outline" size="sm">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {animals.map((animal: any) => {
                    const now = new Date();
                    const milkSafe = !animal.withdrawal_until_milk || new Date(animal.withdrawal_until_milk) < now;
                    const meatSafe = !animal.withdrawal_until_meat || new Date(animal.withdrawal_until_meat) < now;
                    const isCompliant = milkSafe && meatSafe;
                    
                    return (
                      <Card key={animal.id} className="hover-scale cursor-pointer">
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
                          <p className="text-xs text-muted-foreground mb-2">
                            Farm: {animal.farms?.farm_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Owner: {animal.farms?.profiles?.full_name}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            <TabsContent value="analytics">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Practice Analytics
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <DashboardChart
                    title="Consultation Status Distribution"
                    data={getChartData().consultationChartData}
                    type="pie"
                    height={250}
                  />
                  
                  <DashboardChart
                    title="Consultation Priority Levels"
                    data={getChartData().priorityChartData}
                    type="bar"
                    color="hsl(var(--warning))"
                    height={250}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  <DashboardChart
                    title="Animals Under Treatment (Weekly)"
                    data={getChartData().healthData}
                    type="line"
                    color="hsl(var(--info))"
                    height={200}
                  />
                </div>
              </div>
            </TabsContent>

          <TabsContent value="prescribe" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Digital Prescription</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Select Animal</label>
                    <Select onValueChange={(value) => {
                      const animal = animals.find(a => a.id === value);
                      setSelectedAnimal(animal);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose animal..." />
                      </SelectTrigger>
                      <SelectContent>
                        {animals.map((animal: any) => (
                          <SelectItem key={animal.id} value={animal.id}>
                            {animal.name || animal.tag_id} ({animal.species})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Medication</label>
                    <Select onValueChange={(value) => setPrescriptionData({...prescriptionData, medicationId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select medication..." />
                      </SelectTrigger>
                      <SelectContent>
                        {medications.map((med: any) => (
                          <SelectItem key={med.id} value={med.id}>
                            {med.med_name} ({med.active_ingredient})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Diagnosis</label>
                  <Textarea 
                    placeholder="Enter diagnosis..."
                    value={prescriptionData.diagnosis}
                    onChange={(e) => setPrescriptionData({...prescriptionData, diagnosis: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Dosage</label>
                    <Input 
                      placeholder="e.g., 10mg/kg bodyweight"
                      value={prescriptionData.dosage}
                      onChange={(e) => setPrescriptionData({...prescriptionData, dosage: e.target.value})}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Route of Administration</label>
                    <Select onValueChange={(value) => setPrescriptionData({...prescriptionData, routeOfAdministration: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select route..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="intramuscular">Intramuscular</SelectItem>
                        <SelectItem value="subcutaneous">Subcutaneous</SelectItem>
                        <SelectItem value="intravenous">Intravenous</SelectItem>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea 
                    placeholder="Additional notes or instructions..."
                    value={prescriptionData.notes}
                    onChange={(e) => setPrescriptionData({...prescriptionData, notes: e.target.value})}
                  />
                </div>

                <Button 
                  onClick={createTreatment}
                  disabled={!selectedAnimal || !prescriptionData.diagnosis || !prescriptionData.medicationId}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Treatment Record
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Schedule Farm Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowSchedulingModal(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule New Visit
                  </Button>
                  
                  <div className="text-center py-8">
                    <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No scheduled visits. Click above to schedule your first visit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <SchedulingModal 
          open={showSchedulingModal}
          onOpenChange={setShowSchedulingModal}
          vetId={profile?.id || ''}
          onScheduled={() => {
            setShowSchedulingModal(false);
            fetchDashboardData();
          }}
        />
        
        <Chatbot context="vet" />
      </div>
    </div>
  );
};

export default VeterinarianDashboard;