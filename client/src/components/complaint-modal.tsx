import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, User, FileText, Tag, MessageSquare } from "lucide-react";
import { type ComplaintWithStudent } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ComplaintModalProps {
  complaint: ComplaintWithStudent | null;
  onClose: () => void;
}

export function ComplaintModal({ complaint, onClose }: ComplaintModalProps) {
  const [status, setStatus] = useState(complaint?.status || "pending");
  const [response, setResponse] = useState(complaint?.adminResponse || "");

  const updateMutation = useMutation({
    mutationFn: async (data: { status: string; adminResponse: string }) => {
      const res = await apiRequest("PATCH", `/api/complaints/${complaint?.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/stats"] });
      onClose();
    },
  });

  const handleSubmit = () => {
    if (complaint) {
      updateMutation.mutate({ status, adminResponse: response });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "inprogress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "resolved":
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!complaint) return null;

  return (
    <Dialog open={!!complaint} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText size={20} />
            <span>Complaint Details</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Complaint Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Complaint Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <User size={16} className="text-neutral-500" />
                  <div>
                    <p className="text-sm text-neutral-600">Student</p>
                    <p className="font-medium">{complaint.student.name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <CalendarDays size={16} className="text-neutral-500" />
                  <div>
                    <p className="text-sm text-neutral-600">Submitted</p>
                    <p className="font-medium">
                      {format(new Date(complaint.createdAt), "MMM dd, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag size={16} className="text-neutral-500" />
                  <span className="text-sm text-neutral-600">Category:</span>
                  <span className="font-medium capitalize">{complaint.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">Status:</span>
                  {getStatusBadge(complaint.status)}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-neutral-700">Subject</Label>
                <p className="mt-1 p-3 bg-neutral-50 rounded-lg">{complaint.subject}</p>
              </div>

              <div>
                <Label className="text-sm font-medium text-neutral-700">Description</Label>
                <p className="mt-1 p-3 bg-neutral-50 rounded-lg whitespace-pre-wrap">
                  {complaint.description}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Admin Response Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <MessageSquare size={18} />
                <span>Admin Response</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="status" className="text-sm font-medium text-neutral-700">
                  Update Status
                </Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger data-testid="select-complaint-status" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="inprogress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="response" className="text-sm font-medium text-neutral-700">
                  Admin Response
                </Label>
                <Textarea
                  data-testid="textarea-admin-response"
                  id="response"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Provide a response to the student..."
                  className="mt-1 min-h-[120px]"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  data-testid="button-cancel-complaint"
                  variant="ghost"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  data-testid="button-update-complaint"
                  onClick={handleSubmit}
                  disabled={updateMutation.isPending}
                  className="bg-primary hover:bg-primary/90 text-white"
                >
                  {updateMutation.isPending ? "Updating..." : "Update Complaint"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}