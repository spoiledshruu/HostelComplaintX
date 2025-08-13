import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Building, FileText, Clock, CheckCircle, LogOut } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertComplaintSchema, type InsertComplaint, type Complaint } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";

export default function StudentDashboard() {
  const { user, logoutMutation } = useAuth();

  const form = useForm<InsertComplaint>({
    resolver: zodResolver(insertComplaintSchema),
    defaultValues: {
      subject: "",
      description: "",
      category: "maintenance",
      roomNumber: user?.roomNumber || "",
    },
  });

  const { data: complaints = [], isLoading: complaintsLoading } = useQuery<Complaint[]>({
    queryKey: ["/api/complaints/my"],
  });

  const { data: stats } = useQuery<{
    total: number;
    pending: number;
    resolved: number;
  }>({
    queryKey: ["/api/complaints/stats/my"],
  });

  const submitComplaintMutation = useMutation({
    mutationFn: async (data: InsertComplaint) => {
      const res = await apiRequest("POST", "/api/complaints", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/my"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/stats/my"] });
      form.reset({
        subject: "",
        description: "",
        category: "maintenance",
        roomNumber: user?.roomNumber || "",
      });
    },
  });

  const handleSubmitComplaint = (data: InsertComplaint) => {
    submitComplaintMutation.mutate(data);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "inprogress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Building className="text-white" size={16} />
              </div>
              <h1 className="text-lg font-semibold text-neutral-800">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-600">
                Welcome, <span data-testid="text-student-name">{user?.name}</span>
              </div>
              <Button
                data-testid="button-logout"
                variant="ghost"
                size="sm"
                onClick={() => logoutMutation.mutate()}
                className="text-neutral-600 hover:text-neutral-800"
              >
                <LogOut size={16} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                  <FileText className="text-primary" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-neutral-800" data-testid="stat-total">
                    {stats?.total || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Total Complaints</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                  <Clock className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-neutral-800" data-testid="stat-pending">
                    {stats?.pending || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-material">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <CheckCircle className="text-green-600" size={24} />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-neutral-800" data-testid="stat-resolved">
                    {stats?.resolved || 0}
                  </p>
                  <p className="text-sm text-neutral-600">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* New Complaint Form */}
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle>Submit New Complaint</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmitComplaint)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="food">Food & Catering</SelectItem>
                            <SelectItem value="cleanliness">Cleanliness</SelectItem>
                            <SelectItem value="security">Security</SelectItem>
                            <SelectItem value="wifi">Internet/WiFi</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-subject"
                            placeholder="Brief subject of your complaint"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            data-testid="textarea-description"
                            rows={4}
                            placeholder="Describe your complaint in detail..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="roomNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Room Number</FormLabel>
                        <FormControl>
                          <Input
                            data-testid="input-room"
                            placeholder="e.g., A-101"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    data-testid="button-submit-complaint"
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white"
                    disabled={submitComplaintMutation.isPending}
                  >
                    {submitComplaintMutation.isPending ? "Submitting..." : "Submit Complaint"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* My Complaints */}
          <Card className="shadow-material">
            <CardHeader>
              <CardTitle>My Recent Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              {complaintsLoading ? (
                <div className="text-center py-8 text-neutral-600">Loading complaints...</div>
              ) : complaints.length === 0 ? (
                <div className="text-center py-8 text-neutral-600">
                  <FileText className="mx-auto mb-4" size={48} />
                  <p>No complaints submitted yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {complaints.map((complaint) => (
                    <Card key={complaint.id} className="border border-neutral-200" data-testid={`complaint-${complaint.id}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-medium text-neutral-800" data-testid="text-complaint-subject">
                            {complaint.subject}
                          </h3>
                          <span data-testid="badge-complaint-status">
                            {getStatusBadge(complaint.status)}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 mb-2 capitalize" data-testid="text-complaint-category">
                          {complaint.category}
                        </p>
                        <p className="text-sm text-neutral-700 mb-3" data-testid="text-complaint-description">
                          {complaint.description}
                        </p>
                        {complaint.adminResponse && (
                          <div className="bg-green-50 border border-green-200 rounded p-2 mb-3">
                            <p className="text-sm text-green-800">
                              <strong>Admin Response:</strong> {complaint.adminResponse}
                            </p>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <span data-testid="text-complaint-date">
                            {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                          </span>
                          <span data-testid="text-complaint-id">#{complaint.id.slice(-6)}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
