-- Create testing reports table
CREATE TABLE public.testing_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL,
  vet_id UUID NOT NULL,
  lab_id UUID,
  test_type TEXT NOT NULL,
  test_description TEXT,
  sample_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  received_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  results TEXT,
  notes TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.testing_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for testing reports
CREATE POLICY "Vets can manage testing reports they create"
ON public.testing_reports
FOR ALL
USING (vet_id IN (
  SELECT id FROM profiles 
  WHERE user_id = auth.uid() AND role = 'veterinarian'
));

CREATE POLICY "Labs can view and update assigned testing reports"
ON public.testing_reports
FOR ALL
USING (lab_id IN (
  SELECT id FROM profiles 
  WHERE user_id = auth.uid() AND role = 'lab'
) OR EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() AND role = 'lab'
));

CREATE POLICY "Farmers can view testing reports for their animals"
ON public.testing_reports
FOR SELECT
USING (animal_id IN (
  SELECT a.id FROM animals a
  JOIN farms f ON a.farm_id = f.id
  JOIN profiles p ON f.owner_id = p.id
  WHERE p.user_id = auth.uid()
));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_testing_reports_updated_at
BEFORE UPDATE ON public.testing_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to support lab role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'farmer'),
    NEW.email
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    RAISE LOG 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$function$;