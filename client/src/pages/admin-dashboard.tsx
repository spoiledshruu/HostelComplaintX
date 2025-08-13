import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, FileText, Clock, Cog, CheckCircle, LogOut, Eye, Settings } from "lucide-react";
import { type ComplaintWithStudent } from "@shared/schema";
import { format } from "date-fns";
import { ComplaintModal } from "@/components/complaint-modal";
import { AdminNav } from "@/components/admin-nav";
import { StudentsManagement } from "@/components/students-management";
import { AdminsManagement } from "@/components/admins-management";

export default function AdminDashboard() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<"complaints" | "students" | "admins">("complaints");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintWithStudent | null>(null);

  const { data: stats } = useQuery<{
    total: number;
    pending: number;
    inprogress: number;
    resolved: number;
  }>({
    queryKey: ["/api/complaints/stats"],
  });

  const { data: complaints = [], isLoading } = useQuery<ComplaintWithStudent[]>({
    queryKey: ["/api/complaints", { search, status: statusFilter, category: categoryFilter }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (categoryFilter) params.append("category", categoryFilter);
      
      const response = await fetch(`/api/complaints?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }
      
      return response.json();
    },
  });

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

  const handleApplyFilters = () => {
    // Filters are applied automatically via useQuery dependencies
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center mr-3">
                <Shield className="text-white" size={16} />
              </div>
              <h1 className="text-lg font-semibold text-neutral-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-neutral-600">
                Welcome, <span data-testid="text-admin-name">{user?.name}</span>
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
        {/* Navigation Tabs */}
        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Stats - Only show for complaints tab */}
        {activeTab === "complaints" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <Cog className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-neutral-800" data-testid="stat-inprogress">
                      {stats?.inprogress || 0}
                    </p>
                    <p className="text-sm text-neutral-600">In Progress</p>
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
        )}

        {/* Tab Content */}
        {activeTab === "complaints" && (
          <>
            {/* Filters and Search */}
            <Card className="shadow-material mb-8">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
                    <Input
                      data-testid="input-search"
                      type="text"
                      placeholder="Search complaints..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inprogress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger data-testid="select-category-filter">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="food">Food & Catering</SelectItem>
                        <SelectItem value="cleanliness">Cleanliness</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="wifi">Internet/WiFi</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      data-testid="button-apply-filters"
                      onClick={handleApplyFilters}
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Complaints Table */}
            <Card className="shadow-material overflow-hidden">
              <CardHeader className="border-b border-neutral-200">
                <CardTitle>All Complaints</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="text-center py-8 text-neutral-600">Loading complaints...</div>
                ) : complaints.length === 0 ? (
                  <div className="text-center py-8 text-neutral-600">
                    <FileText className="mx-auto mb-4" size={48} />
                    <p>No complaints found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-neutral-50">
                        <TableRow>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">ID</TableHead>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Student</TableHead>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Subject</TableHead>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</TableHead>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</TableHead>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Date</TableHead>
                          <TableHead className="text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="bg-white divide-y divide-neutral-200">
                        {complaints.map((complaint) => (
                          <TableRow key={complaint.id} data-testid={`row-complaint-${complaint.id}`}>
                            <TableCell className="font-medium text-neutral-900" data-testid="text-complaint-id">
                              #{complaint.id.slice(-6)}
                            </TableCell>
                            <TableCell className="text-neutral-500" data-testid="text-student-info">
                              {complaint.student.name}
                            </TableCell>
                            <TableCell className="text-neutral-900" data-testid="text-complaint-subject">
                              {complaint.subject}
                            </TableCell>
                            <TableCell className="text-neutral-500 capitalize" data-testid="text-complaint-category">
                              {complaint.category}
                            </TableCell>
                            <TableCell data-testid="badge-status">
                              {getStatusBadge(complaint.status)}
                            </TableCell>
                            <TableCell className="text-neutral-500" data-testid="text-complaint-date">
                              {format(new Date(complaint.createdAt), "MMM dd, yyyy")}
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  data-testid={`button-view-${complaint.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedComplaint(complaint)}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <Eye size={16} className="mr-1" />
                                  View
                                </Button>
                                <Button
                                  data-testid={`button-update-${complaint.id}`}
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedComplaint(complaint)}
                                  className="text-neutral-600 hover:text-neutral-800"
                                >
                                  <Settings size={16} className="mr-1" />
                                  Update
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {activeTab === "students" && <StudentsManagement />}
        {activeTab === "admins" && <AdminsManagement />}
      </div>

      {/* Complaint Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          isOpen={!!selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
}
