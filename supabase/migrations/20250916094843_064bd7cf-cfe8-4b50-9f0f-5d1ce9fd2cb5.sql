-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'veterinarian', 'admin')),
  vet_license_id TEXT,
  is_vet_verified BOOLEAN DEFAULT false,
  reward_points INTEGER DEFAULT 0,
  preferred_language TEXT DEFAULT 'en',
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  farm_name TEXT NOT NULL,
  address TEXT NOT NULL,
  location POINT,
  registration_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medications table (pre-populated)
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  med_name TEXT NOT NULL,
  active_ingredient TEXT NOT NULL,
  withdrawal_period_meat_days INTEGER NOT NULL,
  withdrawal_period_milk_hours INTEGER NOT NULL,
  dosage_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create animals table
CREATE TABLE public.animals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL UNIQUE,
  name TEXT,
  species TEXT NOT NULL CHECK (species IN ('cattle', 'buffalo', 'goat', 'sheep', 'pig', 'chicken')),
  breed TEXT,
  birth_date DATE,
  gender TEXT CHECK (gender IN ('male', 'female')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'withdrawal', 'sold', 'deceased')),
  withdrawal_until_milk TIMESTAMP WITH TIME ZONE,
  withdrawal_until_meat TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create treatments table
CREATE TABLE public.treatments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  vet_id UUID NOT NULL REFERENCES public.profiles(id),
  medication_id UUID NOT NULL REFERENCES public.medications(id),
  diagnosis TEXT NOT NULL,
  dosage TEXT NOT NULL,
  route_of_administration TEXT,
  treatment_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  treatment_end_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create compliance alerts table
CREATE TABLE public.compliance_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('mrl_violation', 'amu_anomaly', 'withdrawal_reminder')),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create consultation requests table
CREATE TABLE public.consultation_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vet_id UUID REFERENCES public.profiles(id),
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  symptoms TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'emergency')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled')),
  consultation_type TEXT DEFAULT 'video' CHECK (consultation_type IN ('video', 'visit', 'phone')),
  scheduled_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create FAQs table
CREATE TABLE public.faqs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'farmer', 'vet', 'admin')),
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task schedule table
CREATE TABLE public.task_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  animal_id UUID NOT NULL REFERENCES public.animals(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES public.treatments(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL CHECK (task_type IN ('medication', 'vaccination', 'checkup', 'feeding')),
  description TEXT NOT NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'missed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for farms
CREATE POLICY "Farm owners can manage their farms" ON public.farms
  FOR ALL USING (
    owner_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vets can view farms they serve" ON public.farms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'veterinarian'
    )
  );

-- RLS Policies for animals
CREATE POLICY "Farmers can manage their animals" ON public.animals
  FOR ALL USING (
    farm_id IN (
      SELECT f.id FROM public.farms f
      JOIN public.profiles p ON f.owner_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Vets can view animals they treat" ON public.animals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'veterinarian'
    )
  );

-- RLS Policies for treatments
CREATE POLICY "Farmers can view treatments for their animals" ON public.treatments
  FOR SELECT USING (
    animal_id IN (
      SELECT a.id FROM public.animals a
      JOIN public.farms f ON a.farm_id = f.id
      JOIN public.profiles p ON f.owner_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Vets can manage treatments" ON public.treatments
  FOR ALL USING (
    vet_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'veterinarian'
    )
  );

-- RLS Policies for consultation requests
CREATE POLICY "Farmers can manage their consultation requests" ON public.consultation_requests
  FOR ALL USING (
    farmer_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'farmer'
    )
  );

CREATE POLICY "Vets can view and respond to consultation requests" ON public.consultation_requests
  FOR ALL USING (
    vet_id IN (
      SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'veterinarian'
    ) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'veterinarian'
    )
  );

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'farmer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at BEFORE UPDATE ON public.farms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_animals_updated_at BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultation_requests_updated_at BEFORE UPDATE ON public.consultation_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample medications
INSERT INTO public.medications (med_name, active_ingredient, withdrawal_period_meat_days, withdrawal_period_milk_hours, dosage_instructions) VALUES
('Penicillin G', 'Benzylpenicillin', 10, 96, '10,000-20,000 IU/kg bodyweight, intramuscular injection'),
('Oxytetracycline', 'Oxytetracycline HCl', 21, 120, '10-20 mg/kg bodyweight, intramuscular injection'),
('Sulfadimethoxine', 'Sulfadimethoxine', 7, 60, '25 mg/kg bodyweight, oral administration'),
('Enrofloxacin', 'Enrofloxacin', 14, 72, '2.5-5 mg/kg bodyweight, subcutaneous injection'),
('Tylosin', 'Tylosin tartrate', 21, 96, '10 mg/kg bodyweight, intramuscular injection');

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, language) VALUES
('What is withdrawal period?', 'Withdrawal period is the time required after medication administration before the animal products (milk/meat) can be safely consumed.', 'general', 'en'),
('How do I add a new animal?', 'Go to My Herd section and click on "Add New Animal". Fill in the required details including tag ID, species, and breed.', 'farmer', 'en'),
('How do I prescribe medication?', 'Select the animal, create a new treatment record, choose medication from the formulary, and specify dosage and duration.', 'vet', 'en'),
('How can I check compliance status?', 'The system automatically calculates withdrawal periods and shows compliance status on your dashboard with color-coded indicators.', 'farmer', 'en');