-- Fix security issues from linter

-- Enable RLS on missing tables
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medications (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view medications" ON public.medications
  FOR SELECT TO authenticated USING (true);

-- Create RLS policies for faqs (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view faqs" ON public.faqs
  FOR SELECT TO authenticated USING (true);

-- Admin users can manage faqs
CREATE POLICY "Admins can manage faqs" ON public.faqs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- Fix function search path issues
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;