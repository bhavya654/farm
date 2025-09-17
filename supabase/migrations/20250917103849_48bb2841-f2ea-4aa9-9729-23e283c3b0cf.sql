-- Add RLS policies for task_schedule table
CREATE POLICY "Farm owners can manage task schedules for their animals"
ON public.task_schedule
FOR ALL
USING (
  animal_id IN (
    SELECT a.id 
    FROM animals a
    JOIN farms f ON a.farm_id = f.id
    JOIN profiles p ON f.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Vets can view and update task schedules"
ON public.task_schedule
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'veterinarian'
  )
);

-- Add RLS policies for compliance_alerts table
CREATE POLICY "Farm owners can view alerts for their farms"
ON public.compliance_alerts
FOR SELECT
USING (
  farm_id IN (
    SELECT f.id 
    FROM farms f
    JOIN profiles p ON f.owner_id = p.id
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Vets can view all compliance alerts"
ON public.compliance_alerts
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role = 'veterinarian'
  )
);

CREATE POLICY "System can manage compliance alerts"
ON public.compliance_alerts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'veterinarian')
  )
);