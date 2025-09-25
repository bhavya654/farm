import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, CheckCircle, Star, Pill, Calendar } from 'lucide-react';
import { format, isToday, isPast, startOfDay } from 'date-fns';

interface PrescriptionTask {
  id: string;
  medication_name: string;
  dosage: string;
  scheduled_date: string;
  scheduled_time: string;
  is_completed: boolean;
  completed_at: string | null;
  points_awarded: number;
  animal_name?: string;
  animal_tag_id?: string;
}

interface PrescriptionTasksModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerId: string;
  onTaskComplete?: () => void;
}

const PrescriptionTasksModal: React.FC<PrescriptionTasksModalProps> = ({
  open,
  onOpenChange,
  farmerId,
  onTaskComplete
}) => {
  const [tasks, setTasks] = useState<PrescriptionTask[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('prescription_tasks')
        .select(`
          *,
          animals!prescription_tasks_animal_id_fkey(name, tag_id)
        `)
        .eq('farmer_id', farmerId)
        .gte('scheduled_date', format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
        .order('scheduled_date', { ascending: true })
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      const tasksWithAnimalInfo = data?.map(task => ({
        ...task,
        animal_name: task.animals?.name,
        animal_tag_id: task.animals?.tag_id
      })) || [];

      setTasks(tasksWithAnimalInfo);
    } catch (error) {
      console.error('Error fetching prescription tasks:', error);
      toast({
        title: "Error",
        description: "Failed to load prescription tasks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && farmerId) {
      fetchTasks();
    }
  }, [open, farmerId]);

  const completeTask = async (taskId: string, pointsAwarded: number) => {
    try {
      const { error: taskError } = await supabase
        .from('prescription_tasks')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (taskError) throw taskError;

      // Award points to farmer
      const { error: pointsError } = await supabase.rpc('increment_reward_points', {
        user_id: farmerId,
        points: pointsAwarded
      });

      if (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Don't throw here, task completion is more important
      }

      toast({
        title: "Task Completed!",
        description: `You earned ${pointsAwarded} reward points`,
      });

      await fetchTasks();
      onTaskComplete?.();
    } catch (error) {
      console.error('Error completing task:', error);
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive"
      });
    }
  };

  const getTaskStatus = (task: PrescriptionTask) => {
    if (task.is_completed) return 'completed';
    
    const taskDate = startOfDay(new Date(task.scheduled_date));
    const today = startOfDay(new Date());
    
    if (taskDate < today) return 'overdue';
    if (isToday(new Date(task.scheduled_date))) return 'today';
    return 'upcoming';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'today':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">Due Today</Badge>;
      case 'upcoming':
        return <Badge variant="outline">Upcoming</Badge>;
      default:
        return null;
    }
  };

  const filterTasks = (status: string) => {
    return tasks.filter(task => {
      const taskStatus = getTaskStatus(task);
      if (status === 'today') {
        return taskStatus === 'today' && !task.is_completed;
      }
      if (status === 'overdue') {
        return taskStatus === 'overdue' && !task.is_completed;
      }
      if (status === 'completed') {
        return task.is_completed;
      }
      return true;
    });
  };

  const TaskCard: React.FC<{ task: PrescriptionTask }> = ({ task }) => {
    const status = getTaskStatus(task);
    const canComplete = (status === 'today' || status === 'overdue') && !task.is_completed;

    return (
      <Card className={`transition-all duration-200 ${
        status === 'overdue' ? 'border-destructive bg-destructive/5' : 
        status === 'today' ? 'border-primary bg-primary/5' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between space-x-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center space-x-2">
                <Pill className="h-4 w-4 text-primary" />
                <h4 className="font-semibold">{task.medication_name}</h4>
                {getStatusBadge(status)}
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Dosage:</strong> {task.dosage}</p>
                <p><strong>Animal:</strong> {task.animal_name || task.animal_tag_id || 'General'}</p>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(task.scheduled_date), 'MMM dd, yyyy')}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{task.scheduled_time}</span>
                  </span>
                </div>
              </div>

              {task.is_completed && task.completed_at && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed {format(new Date(task.completed_at), 'MMM dd, HH:mm')}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col items-end space-y-2">
              {!task.is_completed && (
                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{task.points_awarded} pts</span>
                </div>
              )}
              
              {canComplete && (
                <Button
                  size="sm"
                  onClick={() => completeTask(task.id, task.points_awarded)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const todayTasks = filterTasks('today');
  const overdueTasks = filterTasks('overdue');
  const completedTasks = filterTasks('completed').slice(0, 10); // Show last 10 completed

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-primary" />
            <span>Medication Schedule & Tasks</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs defaultValue="today" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today" className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Today ({todayTasks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="overdue" className="flex items-center space-x-2">
                <span className="text-destructive">Overdue ({overdueTasks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Completed</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 max-h-[60vh] overflow-y-auto">
              <TabsContent value="today" className="space-y-4">
                {todayTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tasks for today</h3>
                      <p className="text-muted-foreground">All caught up! Check back tomorrow.</p>
                    </CardContent>
                  </Card>
                ) : (
                  todayTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </TabsContent>

              <TabsContent value="overdue" className="space-y-4">
                {overdueTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No overdue tasks</h3>
                      <p className="text-muted-foreground">Great job staying on schedule!</p>
                    </CardContent>
                  </Card>
                ) : (
                  overdueTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-4">
                {completedTasks.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No completed tasks yet</h3>
                      <p className="text-muted-foreground">Complete your first medication task to see it here.</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedTasks.map(task => <TaskCard key={task.id} task={task} />)
                )}
              </TabsContent>
            </div>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PrescriptionTasksModal;