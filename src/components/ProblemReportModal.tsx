import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Phone, Camera } from 'lucide-react';

interface ProblemReportModalProps {
  farmerId: string;
  animals: any[];
  trigger?: React.ReactNode;
}

const ProblemReportModal: React.FC<ProblemReportModalProps> = ({
  farmerId,
  animals,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    animal_id: '',
    problem_type: '',
    symptoms: '',
    severity: 'medium',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const problemTypes = [
    'Respiratory Issues',
    'Digestive Problems', 
    'Lameness/Mobility',
    'Reproductive Issues',
    'Skin Conditions',
    'Behavioral Changes',
    'Injury/Trauma',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.problem_type || !formData.symptoms) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('problem_reports')
        .insert({
          farmer_id: farmerId,
          animal_id: formData.animal_id || null,
          problem_type: formData.problem_type,
          symptoms: formData.symptoms,
          severity: formData.severity,
          description: formData.description,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Problem Report Sent",
        description: "A veterinarian will respond to your report shortly",
      });

      setFormData({
        animal_id: '',
        problem_type: '',
        symptoms: '',
        severity: 'medium',
        description: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting problem report:', error);
      toast({
        title: "Error",
        description: "Failed to send report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Phone className="h-4 w-4 mr-2" />
            Report Problem
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <span>Report Animal Health Problem</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animal">Animal (Optional)</Label>
              <Select 
                value={formData.animal_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, animal_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select animal or leave blank for general issue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">General Farm Issue</SelectItem>
                  {animals.map((animal) => (
                    <SelectItem key={animal.id} value={animal.id}>
                      {animal.name || animal.tag_id} - {animal.species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity *</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">Low</Badge>
                      <span className="text-sm">Non-urgent</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Medium</Badge>
                      <span className="text-sm">Needs attention</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center space-x-2">
                      <Badge variant="destructive">High</Badge>
                      <span className="text-sm">Urgent care needed</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="problem_type">Problem Type *</Label>
            <Select 
              value={formData.problem_type} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, problem_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select problem type" />
              </SelectTrigger>
              <SelectContent>
                {problemTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptoms">Symptoms & Observations *</Label>
            <Textarea
              id="symptoms"
              placeholder="Describe what you've observed (e.g., limping, not eating, discharge, etc.)"
              value={formData.symptoms}
              onChange={(e) => setFormData(prev => ({ ...prev, symptoms: e.target.value }))}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details</Label>
            <Textarea
              id="description"
              placeholder="Any additional information, recent changes, or context that might help the vet..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Camera className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-primary mb-1">Pro Tip</h4>
                  <p className="text-sm text-muted-foreground">
                    Take photos or videos of the affected animal if possible. You can attach them after submitting this report through the consultation system.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.problem_type || !formData.symptoms}
              className="flex-1"
            >
              {isSubmitting ? "Sending..." : "Send Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProblemReportModal;