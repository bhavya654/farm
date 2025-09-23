import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface TestingReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  animalId?: string;
  onReportCreated?: () => void;
}

interface Animal {
  id: string;
  name: string;
  tag_id: string;
  species: string;
}

export default function TestingReportsModal({
  open,
  onOpenChange,
  animalId,
  onReportCreated,
}: TestingReportsModalProps) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [formData, setFormData] = useState({
    animal_id: animalId || '',
    test_type: '',
    test_description: '',
    sample_type: '',
    priority: 'medium',
    notes: '',
  });

  useEffect(() => {
    if (open) {
      fetchAnimals();
      if (animalId) {
        setFormData(prev => ({ ...prev, animal_id: animalId }));
      }
    }
  }, [open, animalId]);

  const fetchAnimals = async () => {
    if (!profile) return;

    try {
      // For vets, get all animals they can access
      const { data, error } = await supabase
        .from('animals')
        .select('id, name, tag_id, species')
        .order('name');

      if (error) throw error;
      setAnimals(data || []);
    } catch (error) {
      console.error('Error fetching animals:', error);
    }
  };

  const handleSubmit = async () => {
    if (!profile || !formData.animal_id || !formData.test_type || !formData.sample_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('testing_reports')
        .insert([{
          animal_id: formData.animal_id,
          vet_id: profile.id,
          test_type: formData.test_type,
          test_description: formData.test_description,
          sample_type: formData.sample_type,
          priority: formData.priority,
          notes: formData.notes,
          status: 'pending',
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testing report request created successfully",
      });

      onReportCreated?.();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error('Error creating testing report:', error);
      toast({
        title: "Error",
        description: "Failed to create testing report request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      animal_id: animalId || '',
      test_type: '',
      test_description: '',
      sample_type: '',
      priority: 'medium',
      notes: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Lab Testing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Animal *</label>
            <Select 
              value={formData.animal_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, animal_id: value }))}
              disabled={!!animalId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select animal" />
              </SelectTrigger>
              <SelectContent>
                {animals.map((animal) => (
                  <SelectItem key={animal.id} value={animal.id}>
                    {animal.name} ({animal.tag_id}) - {animal.species}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Test Type *</label>
            <Select 
              value={formData.test_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, test_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select test type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blood_test">Blood Test</SelectItem>
                <SelectItem value="urine_test">Urine Test</SelectItem>
                <SelectItem value="fecal_test">Fecal Test</SelectItem>
                <SelectItem value="milk_test">Milk Test</SelectItem>
                <SelectItem value="bacterial_culture">Bacterial Culture</SelectItem>
                <SelectItem value="viral_test">Viral Test</SelectItem>
                <SelectItem value="parasitology">Parasitology</SelectItem>
                <SelectItem value="histopathology">Histopathology</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Test Description</label>
            <Textarea
              placeholder="Describe the specific tests needed..."
              value={formData.test_description}
              onChange={(e) => setFormData(prev => ({ ...prev, test_description: e.target.value }))}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Sample Type *</label>
            <Select 
              value={formData.sample_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, sample_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sample type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blood">Blood</SelectItem>
                <SelectItem value="serum">Serum</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="urine">Urine</SelectItem>
                <SelectItem value="feces">Feces</SelectItem>
                <SelectItem value="milk">Milk</SelectItem>
                <SelectItem value="tissue">Tissue</SelectItem>
                <SelectItem value="swab">Swab</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Priority</label>
            <Select 
              value={formData.priority} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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

          <div>
            <label className="text-sm font-medium">Additional Notes</label>
            <Textarea
              placeholder="Any additional information or special instructions..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading || !formData.animal_id || !formData.test_type || !formData.sample_type}
            >
              {loading ? "Creating..." : "Create Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}