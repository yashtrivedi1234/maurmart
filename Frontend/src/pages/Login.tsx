import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/logo.png";
import { GoogleLogin } from "@react-oauth/google";

import { useLoginMutation, useRegisterMutation, useVerifyOtpMutation, useResendOtpMutation, useForgotPasswordMutation, useResetPasswordMutation } from "@/store/api/authApi";
import { isValidEmail, isValidName, isValidOtp, isValidPassword, normalizeEmail, normalizeWhitespace, sanitizeNameInput, sanitizeOtpInput } from "@/lib/validation";

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const [login, { isLoading: isLoginLoading }] = useLoginMutation();
  const [register, { isLoading: isRegisterLoading }] = useRegisterMutation();
  const [verifyOtp, { isLoading: isVerifyLoading }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: isResendLoading }] = useResendOtpMutation();
  const [forgotPassword, { isLoading: isForgotLoading }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: isResetLoading }] = useResetPasswordMutation();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const token = credentialResponse.credential;
      
      // Decode JWT to get user info
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const googleData = JSON.parse(jsonPayload);

      // Send to backend for authentication
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/google-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          name: googleData.name,
          email: googleData.email,
          picture: googleData.picture,
        }),
      });

      const result = await response.json();

      if (result.token) {
        // Clear any old admin token to avoid conflicts
        localStorage.removeItem("adminToken");
        
        localStorage.setItem('token', result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        window.dispatchEvent(new Event('tokenChanged'));
        
        toast({
          title: 'Welcome!',
          description: result.message || 'You have signed in successfully with Google.',
        });
        navigate('/');
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Google login failed.',
          variant: 'destructive',
        });
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast({
        title: 'Error',
        description: error.message || 'Google login failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleGoogleError = () => {
    toast({
      title: 'Error',
      description: 'Google login failed. Please try again.',
      variant: 'destructive',
    });
  };

  const handleResendOtp = async () => {
    const normalizedEmail = normalizeEmail(email);

    if (!isValidEmail(normalizedEmail)) {
      toast({
        title: "Error",
        description: "Enter a valid email address first.",
        variant: "destructive",
      });
      return;
    }

    try {
      await resendOtp(normalizedEmail).unwrap();
      toast({
        title: "Code Resent",
        description: "A new verification code has been sent to your email.",
      });
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast({
        title: "Error",
        description: error.data?.message || "Failed to resend code.",
        variant: "destructive",
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    try {
      await forgotPassword(normalizedEmail).unwrap();
      toast({ title: "Code sent!", description: "Check your email for the reset code." });
      setIsResettingPassword(true);
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast({
        title: "Error",
        description: error.data?.message || "Failed to send reset code.",
        variant: "destructive",
      });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const normalizedOtp = otp.trim();

    if (!password || !confirmPassword) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    if (!isValidEmail(normalizedEmail)) {
      toast({ title: "Enter a valid email address", variant: "destructive" });
      return;
    }
    if (!isValidOtp(normalizedOtp)) {
      toast({ title: "Enter a valid 4-digit code", variant: "destructive" });
      return;
    }
    if (!isValidPassword(password)) {
      toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    try {
      await resetPassword({ email: normalizedEmail, code: normalizedOtp, newPassword: password }).unwrap();
      toast({ title: "Password reset successful!", description: "You can now log in with your new password." });
      setIsForgotPassword(false);
      setIsResettingPassword(false);
      setOtp("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast({
        title: "Error",
        description: error.data?.message || "Failed to reset password.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = normalizeEmail(email);
    const normalizedName = normalizeWhitespace(name);
    const normalizedOtp = otp.trim();

    try {
      if (isVerifying) {
        if (!isValidEmail(normalizedEmail)) {
          toast({ title: "Enter a valid email address", variant: "destructive" });
          return;
        }
        if (!isValidOtp(normalizedOtp)) {
          toast({ title: "Enter a valid 4-digit code", variant: "destructive" });
          return;
        }

        const result = await verifyOtp({ email: normalizedEmail, otp: normalizedOtp }).unwrap();
        localStorage.removeItem("adminToken"); // Clear old admin token
        localStorage.setItem("token", result.token);
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        window.dispatchEvent(new Event("tokenChanged"));
        toast({
          title: "Login Successful",
          description: "Welcome back to MaurMart!",
        });
        navigate("/");
      } else if (isSignUp) {
        if (!normalizedName || !normalizedEmail || !password) {
          toast({ title: "Please fill in all fields", variant: "destructive" });
          return;
        }
        if (!isValidName(normalizedName)) {
          toast({ title: "Name should contain only letters", variant: "destructive" });
          return;
        }
        if (!isValidEmail(normalizedEmail)) {
          toast({ title: "Enter a valid email address", variant: "destructive" });
          return;
        }
        if (!isValidPassword(password)) {
          toast({ title: "Password must be at least 6 characters long", variant: "destructive" });
          return;
        }

        const result = await register({ name: normalizedName, email: normalizedEmail, password }).unwrap();
        toast({
          title: "Account Created",
          description: result.message || "Please sign in to verify your account.",
        });
        setIsSignUp(false);
      } else {
        if (!normalizedEmail || !password) {
          toast({ title: "Please fill in all fields", variant: "destructive" });
          return;
        }
        if (!isValidEmail(normalizedEmail)) {
          toast({ title: "Enter a valid email address", variant: "destructive" });
          return;
        }

        const result = await login({ email: normalizedEmail, password }).unwrap();
        if (result.needsVerification) {
          toast({
            title: "Verification Required",
            description: "A 4-digit code has been sent to your email.",
          });
          setIsVerifying(true);
        } else {
          localStorage.removeItem("adminToken"); // Clear old admin token
          localStorage.setItem("token", result.token);
          if (result.user) {
            localStorage.setItem('user', JSON.stringify(result.user));
          }
          window.dispatchEvent(new Event("tokenChanged"));
          toast({
            title: "Welcome Back!",
            description: result.message || "You have signed in successfully.",
          });
          navigate("/");
        }
      }
    } catch (err: unknown) {
      const error = err as { data?: { message?: string } };
      toast({
        title: "Error",
        description: error.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <div className="hidden lg:flex lg:w-1/2 hero-gradient relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(160_50%_40%/0.3),transparent_60%)]" />
        <div className="relative z-10 max-w-md">
          <a href="/" className="flex items-center gap-2 mb-10">
            <img
              src={Logo}
              alt="MaurMart logo"
              className="h-[60px] w-auto object-contain drop-shadow-md"
            />
          </a>
          <h1 className="text-4xl font-display font-bold text-primary-foreground leading-tight mb-4">
            Your Daily Essentials, Delivered Fast
          </h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Shop groceries, electronics, and everyday products at the best prices. Join thousands of happy customers.
          </p>
          <div className="mt-10 flex gap-6 text-primary-foreground/60 text-sm">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Free Delivery</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Secure Payments</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Easy Returns</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            size="sm"
            className="mb-8 text-muted-foreground"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to store
          </Button>

          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <img
                src={Logo}
                alt="MaurMart logo"
                className="h-[60px] w-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-display font-bold text-foreground">
              {isForgotPassword ? (isResettingPassword ? "Reset your password" : "Forgot password?") : isVerifying ? "Verify your email" : isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-muted-foreground mt-1">
              {isForgotPassword
                ? isResettingPassword
                  ? "Enter the code sent to your email and set a new password"
                  : `Enter your email to receive a password reset code`
                : isVerifying
                ? `Enter the 4-digit code sent to ${email}`
                : isSignUp
                ? "Sign up to start shopping"
                : "Sign in to your MaurMart account"}
            </p>
          </div>

          <form onSubmit={isForgotPassword ? (isResettingPassword ? handleResetPassword : handleForgotPassword) : handleSubmit} className="space-y-4">
            {isForgotPassword ? (
              isResettingPassword ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reset-code">Verification Code</Label>
                    <Input
                      id="reset-code"
                      placeholder="4-digit reset code"
                      value={otp}
                      onChange={(e) => setOtp(sanitizeOtpInput(e.target.value))}
                      required
                      maxLength={4}
                      className="h-11 text-center text-2xl tracking-[1em]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="forget-email">Email Address</Label>
                  <Input
                    id="forget-email"
                    type="email"
                    placeholder="registered.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trimStart())}
                    required
                    className="h-11"
                  />
                </div>
              )
            ) : isVerifying ? (
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <Input
                  id="otp"
                  placeholder="4-digit verification code"
                  value={otp}
                  onChange={(e) => setOtp(sanitizeOtpInput(e.target.value))}
                  required
                  maxLength={4}
                  className="h-11 text-center text-2xl tracking-[1em]"
                />
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResendLoading}
                    className="text-sm text-primary hover:underline"
                  >
                    {isResendLoading ? "Sending..." : "Resend code"}
                  </button>
                </div>
              </div>
            ) : (
              <>
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Aman Verma"
                      value={name}
                      onChange={(e) => setName(sanitizeNameInput(e.target.value))}
                      required
                      className="h-11"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="aman.verma@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value.trimStart())}
                    required
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {!isSignUp && !isVerifying && !isForgotPassword && (
              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setIsForgotPassword(true)}
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 rounded-lg text-base" 
              disabled={isForgotPassword ? isResetLoading || isForgotLoading : isLoginLoading || isRegisterLoading || isVerifyLoading}
            >
              {isForgotPassword
                ? isResettingPassword
                  ? isResetLoading ? "Resetting..." : "Reset Password"
                  : isForgotLoading ? "Sending..." : "Send Code"
                : isLoginLoading || isRegisterLoading || isVerifyLoading
                ? "Please wait..."
                : isVerifying
                ? "Verify OTP"
                : isSignUp
                ? "Create Account"
                : "Sign In"}
            </Button>

            {!isSignUp && !isVerifying && !isForgotPassword && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="signin_with"
                  width="100%"
                />
              </>
            )}
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {isForgotPassword ? (
              <button
                onClick={() => {
                  setIsForgotPassword(false);
                  setIsResettingPassword(false);
                  setOtp("");
                  setEmail("");
                  setPassword("");
                  setConfirmPassword("");
                }}
                className="text-primary font-medium hover:underline"
              >
                Back to sign in
              </button>
            ) : isVerifying ? (
              <button
                onClick={() => setIsVerifying(false)}
                className="text-primary font-medium hover:underline"
              >
                Back to sign up
              </button>
            ) : (
              <>
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-primary font-medium hover:underline"
                >
                  {isSignUp ? "Sign in" : "Sign up"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
