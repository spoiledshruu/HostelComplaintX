import { useState } from "react";
import { Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
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
  username: z.string().min(1, "Email is required"),
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
      role: "admin",
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
    setShowForgotPassword(false);
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
                    Student Login
                  </>
                ) : (
                  <>
                    <Shield className="mr-2" size={20} />
                    Admin Login
                  </>
                )}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {showForgotPassword ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-neutral-800">Forgot Password</h3>
                  <p className="text-sm text-neutral-600 mt-2">
                    Contact your hostel administrator or IT support to reset your password.
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Contact Information:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Hostel Office: hostel@iiitkottayam.ac.in</li>
                    <li>• IT Support: support@iiitkottayam.ac.in</li>
                    <li>• Phone: +91-XXX-XXX-XXXX</li>
                  </ul>
                </div>
                <Button
                  data-testid="button-back-to-login"
                  onClick={() => setShowForgotPassword(false)}
                  variant="outline"
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            ) : authMode === "student" ? (
              // Student login form (no registration)
              <div className="space-y-4">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>College Email</FormLabel>
                          <FormControl>
                            <Input
                              data-testid="input-username"
                              placeholder="student@iiitkottayam.ac.in"
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
                      className="w-full bg-primary hover:bg-primary/90 text-white"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Signing In..." : "Sign In"}
                    </Button>
                    
                    <div className="text-center">
                      <Button
                        data-testid="button-forgot-password"
                        type="button"
                        variant="link"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-primary hover:text-primary/80"
                      >
                        Forgot Password?
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            ) : (
              // Admin login and registration
              <Tabs value="login">
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
                            <FormLabel>Admin Email</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-username"
                                placeholder="Enter admin email"
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
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
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
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input
                                data-testid="input-register-username"
                                placeholder="Enter your email"
                                {...field}
                              />
                            </FormControl>
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
                        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}