import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SchedulingData {
  farmer_id: string;
  scheduled_at: string;
  consultation_type: string;
  priority: string;
  symptoms: string;
  notes: string;
  animal_id?: string;
}

interface SchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vetId: string;
  onScheduled: () => void;
}

interface Farm {
  id: string;
  farm_name: string;
  address: string;
  owner_id: string;
  profiles: {
    full_name: string;
    phone: string;
  };
}

interface Animal {
  id: string;
  name: string;
  tag_id: string;
  species: string;
}

const SchedulingModal: React.FC<SchedulingModalProps> = ({
  open,
  onOpenChange,
  vetId,
  onScheduled
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string>('');
  
  const [schedulingData, setSchedulingData] = useState<SchedulingData>({
    farmer_id: '',
    scheduled_at: '',
    consultation_type: 'visit',
    priority: 'medium',
    symptoms: '',
    notes: '',
    animal_id: ''
  });

  useEffect(() => {
    if (open) {
      fetchFarms();
    }
  }, [open]);

  useEffect(() => {
    if (selectedFarm) {
      fetchAnimals(selectedFarm);
      // Find the farm owner profile ID
      const farm = farms.find(f => f.id === selectedFarm);
      if (farm) {
        setSchedulingData(prev => ({ ...prev, farmer_id: farm.owner_id }));
      }
    }
  }, [selectedFarm, farms]);

  const fetchFarms = async () => {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select(`
          id,
          farm_name,
          address,
          owner_id,
          profiles:owner_id (
            full_name,
            phone
          )
        `);

      if (error) throw error;
      setFarms(data || []);
    } catch (error: any) {
      console.error('Error fetching farms:', error);
      toast({
        title: "Error",
        description: "Failed to load farms",
        variant: "destructive",
      });
    }
  };

  const fetchAnimals = async (farmId: string) => {
    try {
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag_id, species')
        .eq('farm_id', farmId);

      if (error) throw error;
      setAnimals(data || []);
    } catch (error: any) {
      console.error('Error fetching animals:', error);
    }
  };

  const handleInputChange = (field: keyof SchedulingData, value: string) => {
    setSchedulingData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = (): boolean => {
    if (!schedulingData.farmer_id) {
      toast({
        title: "Validation Error",
        description: "Please select a farm",
        variant: "destructive",
      });
      return false;
    }
    if (!schedulingData.scheduled_at) {
      toast({
        title: "Validation Error",
        description: "Please select a date and time",
        variant: "destructive",
      });
      return false;
    }
    if (!schedulingData.symptoms.trim()) {
      toast({
        title: "Validation Error",
        description: "Please describe the reason for the visit",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('consultation_requests')
        .insert([{
          ...schedulingData,
          vet_id: vetId,
          status: 'scheduled'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Visit scheduled successfully",
      });

      onScheduled();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to schedule visit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSchedulingData({
      farmer_id: '',
      scheduled_at: '',
      consultation_type: 'visit',
      priority: 'medium',
      symptoms: '',
      notes: '',
      animal_id: ''
    });
    setSelectedFarm('');
    setAnimals([]);
  };

  const selectedFarmData = farms.find(f => f.id === selectedFarm);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Schedule Farm Visit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Farm Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="h-5 w-5" />
                Farm Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Farm</Label>
                <Select value={selectedFarm} onValueChange={setSelectedFarm}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a farm to visit" />
                  </SelectTrigger>
                  <SelectContent>
                    {farms.map((farm) => (
                      <SelectItem key={farm.id} value={farm.id}>
                        {farm.farm_name} - {farm.profiles?.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFarmData && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="font-medium">{selectedFarmData.farm_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedFarmData.address}</p>
                  <p className="text-sm text-muted-foreground">
                    Contact: {selectedFarmData.profiles?.full_name} 
                    {selectedFarmData.profiles?.phone && ` - ${selectedFarmData.profiles.phone}`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Visit Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Visit Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={schedulingData.scheduled_at}
                    onChange={(e) => handleInputChange('scheduled_at', e.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visit Type</Label>
                  <Select 
                    value={schedulingData.consultation_type} 
                    onValueChange={(value) => handleInputChange('consultation_type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visit">Farm Visit</SelectItem>
                      <SelectItem value="video">Video Consultation</SelectItem>
                      <SelectItem value="emergency">Emergency Visit</SelectItem>
                      <SelectItem value="routine">Routine Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select 
                    value={schedulingData.priority} 
                    onValueChange={(value) => handleInputChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Specific Animal (Optional)</Label>
                  <Select 
                    value={schedulingData.animal_id || ''} 
                    onValueChange={(value) => handleInputChange('animal_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select animal if specific" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No specific animal</SelectItem>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name || animal.tag_id} ({animal.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Reason for Visit *</Label>
                <Textarea
                  value={schedulingData.symptoms}
                  onChange={(e) => handleInputChange('symptoms', e.target.value)}
                  placeholder="Describe the reason for the visit, symptoms, or concerns..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  value={schedulingData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional information or special requirements..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            className="gradient-primary"
          >
            {loading ? "Scheduling..." : "Schedule Visit"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SchedulingModal;