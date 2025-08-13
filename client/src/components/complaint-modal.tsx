import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateComplaintSchema, type UpdateComplaint, type ComplaintWithStudent } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";

interface ComplaintModalProps {
  complaint: ComplaintWithStudent;
  isOpen: boolean;
  onClose: () => void;
}

export function ComplaintModal({ complaint, isOpen, onClose }: ComplaintModalProps) {
  const form = useForm<UpdateComplaint>({
    resolver: zodResolver(updateComplaintSchema),
    defaultValues: {
      status: complaint.status,
      adminResponse: complaint.adminResponse || "",
    },
  });

  const updateComplaintMutation = useMutation({
    mutationFn: async (data: UpdateComplaint) => {
      const res = await apiRequest("PATCH", `/api/complaints/${complaint.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/complaints"] });
      queryClient.invalidateQueries({ queryKey: ["/api/complaints/stats"] });
      onClose();
    },
  });

  const handleUpdateStatus = (data: UpdateComplaint) => {
    updateComplaintMutation.mutate(data);
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-complaint">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Complaint Details</span>
            <Button
              data-testid="button-close-modal"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-600"
            >
              <X size={16} />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-neutral-700">Complaint ID</Label>
              <p className="text-sm text-neutral-900" data-testid="text-modal-complaint-id">
                #{complaint.id.slice(-6)}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Student</Label>
              <p className="text-sm text-neutral-900" data-testid="text-modal-student">
                {complaint.student.name} ({complaint.student.username})
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Category</Label>
              <p className="text-sm text-neutral-900 capitalize" data-testid="text-modal-category">
                {complaint.category}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Room Number</Label>
              <p className="text-sm text-neutral-900" data-testid="text-modal-room">
                {complaint.roomNumber}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Submitted</Label>
              <p className="text-sm text-neutral-900" data-testid="text-modal-date">
                {format(new Date(complaint.createdAt), "MMM dd, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium text-neutral-700">Current Status</Label>
              <div data-testid="badge-modal-status">
                {getStatusBadge(complaint.status)}
              </div>
            </div>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-neutral-700">Subject</Label>
            <p className="text-sm text-neutral-900" data-testid="text-modal-subject">
              {complaint.subject}
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium text-neutral-700">Description</Label>
            <p className="text-sm text-neutral-700" data-testid="text-modal-description">
              {complaint.description}
            </p>
          </div>

          {/* Status Update Form */}
          <div className="border-t border-neutral-200 pt-6">
            <h4 className="text-md font-medium text-neutral-800 mb-4">Update Status</h4>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleUpdateStatus)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-modal-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="inprogress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="adminResponse"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Response</FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="textarea-modal-response"
                          rows={3}
                          placeholder="Add a response for the student..."
                          className="resize-none"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3">
                  <Button
                    data-testid="button-modal-cancel"
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="button-modal-update"
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-white"
                    disabled={updateComplaintMutation.isPending}
                  >
                    {updateComplaintMutation.isPending ? "Updating..." : "Update Status"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
