-- Add prescription tasks table for daily medication reminders
CREATE TABLE public.prescription_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  treatment_id UUID NOT NULL,
  animal_id UUID NOT NULL,
  farmer_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  points_awarded INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add problem reports table for detailed issue reporting
CREATE TABLE public.problem_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL,
  animal_id UUID,
  problem_type TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  severity TEXT DEFAULT 'medium',
  description TEXT,
  images JSONB,
  status TEXT DEFAULT 'pending',
  vet_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  vet_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prescription_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for prescription_tasks
CREATE POLICY "Farmers can view their prescription tasks" 
ON public.prescription_tasks 
FOR SELECT 
USING (farmer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Farmers can update their prescription tasks" 
ON public.prescription_tasks 
FOR UPDATE 
USING (farmer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vets can create prescription tasks" 
ON public.prescription_tasks 
FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'veterinarian'));

-- RLS Policies for problem_reports
CREATE POLICY "Farmers can manage their problem reports" 
ON public.problem_reports 
FOR ALL 
USING (farmer_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

CREATE POLICY "Vets can view and respond to problem reports" 
ON public.problem_reports 
FOR ALL 
USING (TRUE);

-- Create trigger for prescription_tasks updated_at
CREATE TRIGGER update_prescription_tasks_updated_at
BEFORE UPDATE ON public.prescription_tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for problem_reports updated_at
CREATE TRIGGER update_problem_reports_updated_at
BEFORE UPDATE ON public.problem_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();