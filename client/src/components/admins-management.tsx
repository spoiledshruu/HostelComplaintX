import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ShieldPlus, Search, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type User, type InsertUser } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { z } from "zod";

const adminFormSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
  role: z.literal("admin"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type AdminFormData = z.infer<typeof adminFormSchema>;

export function AdminsManagement() {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "admin",
      roomNumber: "",
      collegeEmail: "",
    },
  });

  const { data: admins = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/users", "admins", search],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("role", "admin");
      if (search) params.append("search", search);
      
      const response = await fetch(`/api/users?${params.toString()}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch admins");
      }
      
      return response.json();
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: async (data: AdminFormData) => {
      const { confirmPassword, ...adminData } = data;
      const res = await apiRequest("POST", "/api/users", adminData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      form.reset();
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: async (adminId: string) => {
      await apiRequest("DELETE", `/api/users/${adminId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
    },
  });

  const handleAddAdmin = (data: AdminFormData) => {
    addAdminMutation.mutate(data);
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm("Are you sure you want to delete this admin?")) {
      deleteAdminMutation.mutate(adminId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-neutral-800">Admin Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={16} />
            <Input
              data-testid="input-search-admins"
              type="text"
              placeholder="Search admins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-admin" className="bg-neutral-800 hover:bg-neutral-700 text-white">
              <ShieldPlus size={16} className="mr-2" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Admin</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddAdmin)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input data-testid="input-admin-name" placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email</FormLabel>
                      <FormControl>
                        <Input data-testid="input-admin-username" placeholder="admin@college.edu" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collegeEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Email</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-admin-email"
                          type="email" 
                          placeholder="admin@college.edu" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-admin-password"
                          type="password" 
                          placeholder="Enter password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          data-testid="input-admin-confirm-password"
                          type="password" 
                          placeholder="Confirm password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    data-testid="button-cancel-add-admin"
                    type="button"
                    variant="ghost"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    data-testid="button-submit-add-admin"
                    type="submit"
                    className="bg-neutral-800 hover:bg-neutral-700 text-white"
                    disabled={addAdminMutation.isPending}
                  >
                    {addAdminMutation.isPending ? "Adding..." : "Add Admin"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Admins Table */}
      <Card className="shadow-material">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-600">Loading admins...</div>
          ) : admins.length === 0 ? (
            <div className="text-center py-8 text-neutral-600">
              <ShieldPlus className="mx-auto mb-4" size={48} />
              <p>No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-neutral-50">
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id} data-testid={`row-admin-${admin.id}`}>
                      <TableCell className="font-medium" data-testid="text-admin-email">
                        {admin.username}
                      </TableCell>
                      <TableCell data-testid="text-admin-name">
                        {admin.name}
                      </TableCell>
                      <TableCell data-testid="badge-admin-role">
                        <Badge className="bg-neutral-800 text-white">Admin</Badge>
                      </TableCell>
                      <TableCell data-testid="text-admin-date">
                        {format(new Date(admin.createdAt), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Button
                          data-testid={`button-delete-admin-${admin.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAdmin(admin.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}