import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.png";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import adminApi from "@/lib/adminApi";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Clear any existing admin session when visiting login page
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credentials.email.trim() || !credentials.password.trim()) {
      toast({ title: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      // Call backend to verify admin credentials
      const response = await adminApi.post("/admin/login", credentials);

      const data = response.data;

      // Store admin token in localStorage
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("isAdmin", "true");

      toast({ title: "Login successful!", description: "Welcome to admin panel" });
      navigate("/admin");
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Invalid email or password";
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={Logo} alt="Maurya Mart" className="h-16 w-auto object-contain" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Admin Login</h1>
          <p className="text-muted-foreground">Enter your credentials to access the admin panel</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  name="email"
                  placeholder="admin@email.com"
                  value={credentials.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-12 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={credentials.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="pl-12 h-12 rounded-xl"
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-base"
            >
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          {/* Info Box */}
         
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Protected Admin Panel • Access Restricted
        </p>
      </div>
    </div>
  );
}
