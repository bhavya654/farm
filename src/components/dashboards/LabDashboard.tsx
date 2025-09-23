import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { TestTube, Clock, CheckCircle, Send, FileText, User, Stethoscope } from "lucide-react";

interface TestingReport {
  id: string;
  animal_id: string;
  vet_id: string;
  lab_id?: string;
  test_type: string;
  test_description?: string;
  sample_type: string;
  status: string;
  priority: string;
  requested_at: string;
  received_at?: string;
  completed_at?: string;
  results?: string;
  notes?: string;
  animals?: {
    name: string;
    tag_id: string;
    species: string;
  } | null;
  vet_profile?: {
    full_name: string;
    email: string;
  } | null;
}

export default function LabDashboard() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [testingReports, setTestingReports] = useState<TestingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<TestingReport | null>(null);
  const [results, setResults] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchTestingReports();
  }, [profile]);

  const fetchTestingReports = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('testing_reports')
        .select(`
          *,
          animals!inner (name, tag_id, species),
          vet_profile:profiles!testing_reports_vet_id_fkey (full_name, email)
        `)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setTestingReports(data as any || []);
    } catch (error) {
      console.error('Error fetching testing reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch testing reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, results?: string, notes?: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'received' && !testingReports.find(r => r.id === reportId)?.received_at) {
        updateData.received_at = new Date().toISOString();
        updateData.lab_id = profile?.id;
      }
      
      if (status === 'completed') {
        updateData.completed_at = new Date().toISOString();
        updateData.results = results;
        updateData.notes = notes;
      }

      const { error } = await supabase
        .from('testing_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Report ${status} successfully`,
      });
      
      fetchTestingReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock },
      received: { variant: "default" as const, icon: TestTube },
      completed: { variant: "default" as const, icon: CheckCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const variant = priority === 'high' ? 'destructive' : priority === 'medium' ? 'default' : 'secondary';
    return <Badge variant={variant}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</Badge>;
  };

  const pendingReports = testingReports.filter(report => report.status === 'pending');
  const receivedReports = testingReports.filter(report => report.status === 'received');
  const completedReports = testingReports.filter(report => report.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lab Dashboard</h1>
          <p className="text-muted-foreground">Manage testing reports and results</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{receivedReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReports.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{testingReports.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="received">In Progress ({receivedReports.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedReports.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Test Requests</CardTitle>
              <CardDescription>Tests waiting to be received and processed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Sample Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Requested By</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.animals?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.animals?.tag_id} • {report.animals?.species}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{report.test_type}</TableCell>
                      <TableCell>{report.sample_type}</TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{report.vet_profile?.full_name}</div>
                            <div className="text-sm text-muted-foreground">{report.vet_profile?.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(report.requested_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'received')}
                        >
                          Accept
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tests In Progress</CardTitle>
              <CardDescription>Tests currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Sample Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Received At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receivedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.animals?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.animals?.tag_id} • {report.animals?.species}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{report.test_type}</TableCell>
                      <TableCell>{report.sample_type}</TableCell>
                      <TableCell>{getPriorityBadge(report.priority)}</TableCell>
                      <TableCell>{report.received_at ? new Date(report.received_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setResults('');
                                setNotes('');
                              }}
                            >
                              Complete Test
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Complete Test Report</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Test Results</label>
                                <Textarea
                                  placeholder="Enter test results..."
                                  value={results}
                                  onChange={(e) => setResults(e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">Additional Notes</label>
                                <Textarea
                                  placeholder="Enter additional notes..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                />
                              </div>
                              <Button
                                onClick={() => selectedReport && updateReportStatus(selectedReport.id, 'completed', results, notes)}
                                disabled={!results.trim()}
                              >
                                Complete Test
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Completed Tests</CardTitle>
              <CardDescription>Tests that have been completed and results sent</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal</TableHead>
                    <TableHead>Test Type</TableHead>
                    <TableHead>Results</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{report.animals?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {report.animals?.tag_id} • {report.animals?.species}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{report.test_type}</TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate">{report.results}</div>
                      </TableCell>
                      <TableCell>{report.completed_at ? new Date(report.completed_at).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">View Details</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Test Report Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Animal</label>
                                <p>{report.animals?.name} ({report.animals?.tag_id})</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Test Type</label>
                                <p>{report.test_type}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Results</label>
                                <p className="whitespace-pre-wrap">{report.results}</p>
                              </div>
                              {report.notes && (
                                <div>
                                  <label className="text-sm font-medium">Notes</label>
                                  <p className="whitespace-pre-wrap">{report.notes}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}