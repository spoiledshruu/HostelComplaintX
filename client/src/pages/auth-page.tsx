import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, GraduationCap, Shield, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema, type InsertUser } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";

type LoginFormData = {
  username: string;
  password: string;
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [authMode, setAuthMode] = useState<"select" | "student" | "admin">("select");
  const [isRegistering, setIsRegistering] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "student",
      roomNumber: "",
      collegeEmail: "",
    },
  });

  // Redirect if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    registerMutation.mutate(registerData);
  };

  const resetForms = () => {
    loginForm.reset();
    registerForm.reset();
    setIsRegistering(false);
  };

  if (authMode === "select") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-neutral-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-material">
              <Building className="text-white text-2xl" size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-neutral-800 mb-2">Hostel Management</h1>
            <p className="text-neutral-600">Complaint Management System</p>
          </div>

          <Card className="shadow-material">
            <CardHeader>
              <CardTitle className="text-center">Select Login Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                data-testid="button-student-login"
                onClick={() => {
                  setAuthMode("student");
                  resetForms();
                }}
                className="w-full bg-primary hover:bg-primary/90 text-white"
                size="lg"
              >
                <GraduationCap className="mr-2" size={20} />
                Student Login
              </Button>
              
              <Button
                data-testid="button-admin-login"
                onClick={() => {
                  setAuthMode("admin");
                  resetForms();
                }}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
                size="lg"
              >
                <Shield className="mr-2" size={20} />
                Admin Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-material">
          <CardHeader>
            <div className="flex items-center mb-4">
              <Button
                data-testid="button-back"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAuthMode("select");
                  resetForms();
                }}
                className="text-neutral-600 hover:text-neutral-800 mr-3 p-0"
              >
                <ArrowLeft size={16} />
              </Button>
              <CardTitle className="flex items-center">
                {authMode === "student" ? (
                  <>
                    <GraduationCap className="mr-2" size={20} />
                    Student {isRegistering ? "Registration" : "Login"}
                  </>
                ) : (
                  <>
                    <Shield className="mr-2" size={20} />
                    Admin {isRegistering ? "Registration" : "Login"}
                  </>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={isRegistering ? "register" : "login"} onValueChange={(value) => setIsRegistering(value === "register")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger data-testid="tab-login" value="login">Login</TabsTrigger>
                <TabsTrigger data-testid="tab-register" value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {authMode === "student" ? "Student ID" : "Admin Email"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-username"
                              placeholder={authMode === "student" ? "Enter your student ID" : "Enter admin email"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-password"
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      data-testid="button-submit-login"
                      type="submit"
                      className={`w-full ${
                        authMode === "student" 
                          ? "bg-primary hover:bg-primary/90" 
                          : "bg-neutral-800 hover:bg-neutral-700"
                      } text-white`}
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-name"
                              placeholder="Enter your full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {authMode === "student" ? "Student ID" : "Email"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-register-username"
                              placeholder={authMode === "student" ? "Enter your student ID" : "Enter your email"}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={registerForm.control}
                      name="collegeEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College Email</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-college-email"
                              type="email"
                              placeholder="your.name@college.edu"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {authMode === "student" && (
                      <FormField
                        control={registerForm.control}
                        name="roomNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Room Number</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-room-number"
                                placeholder="e.g., A-101"
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={registerForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Role</FormLabel>
                          <Select onValueChange={field.onChange} value={authMode}>
                            <FormControl>
                              <SelectTrigger data-testid="select-role">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-register-password"
                              type="password"
                              placeholder="Enter your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-confirm-password"
                              type="password"
                              placeholder="Confirm your password"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      data-testid="button-submit-register"
                      type="submit"
                      className={`w-full ${
                        authMode === "student" 
                          ? "bg-primary hover:bg-primary/90" 
                          : "bg-neutral-800 hover:bg-neutral-700"
                      } text-white`}
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
