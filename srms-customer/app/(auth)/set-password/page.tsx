"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { login } = useAuth();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!email) {
      toast.error("Email is required");
      router.push("/register");
    }
  }, [email, router]);

  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return "Password must be at least 8 characters";
    }
    if (!/[a-z]/.test(pwd)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[A-Z]/.test(pwd)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/\d/.test(pwd)) {
      return "Password must contain at least one number";
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setErrors({ password: passwordError });
      return;
    }

    // Check if passwords match
    if (password !== passwordConfirmation) {
      setErrors({ password_confirmation: "Passwords do not match" });
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.setPassword({
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      toast.success("Password set successfully! Welcome to SRMS!");

      // Auto-login after setting password
      if (response.token && response.user) {
        login(response.token, response.user);

        // Redirect to home page
        router.push("/");
      }
    } catch (err: any) {
      console.error("Set password error:", err);
      const errorMessage = err.response?.data?.message || "Failed to set password. Please try again.";

      // Handle validation errors
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrength = (pwd: string): { strength: string; color: string; width: string } => {
    if (pwd.length === 0) return { strength: "", color: "", width: "0%" };
    if (pwd.length < 8) return { strength: "Weak", color: "bg-red-500", width: "33%" };

    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    const strength = [hasLower, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;

    if (strength <= 2) return { strength: "Weak", color: "bg-red-500", width: "33%" };
    if (strength === 3) return { strength: "Medium", color: "bg-yellow-500", width: "66%" };
    return { strength: "Strong", color: "bg-green-500", width: "100%" };
  };

  const passwordStrength = getPasswordStrength(password);

  if (!email) {
    return null;
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Set Your Password
        </h1>
        <p className="text-neutral-600">
          Create a secure password for your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.password;
                  return newErrors;
                });
              }
            }}
            error={errors.password}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-700"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Strength Indicator */}
        {password && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-neutral-600">Password Strength:</span>
              <span className={`text-xs font-medium ${
                passwordStrength.strength === "Strong" ? "text-green-600" :
                passwordStrength.strength === "Medium" ? "text-yellow-600" :
                "text-red-600"
              }`}>
                {passwordStrength.strength}
              </span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${passwordStrength.color} transition-all duration-300`}
                style={{ width: passwordStrength.width }}
              />
            </div>
          </div>
        )}

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={passwordConfirmation}
            onChange={(e) => {
              setPasswordConfirmation(e.target.value);
              if (errors.password_confirmation) {
                setErrors(prev => {
                  const newErrors = { ...prev };
                  delete newErrors.password_confirmation;
                  return newErrors;
                });
              }
            }}
            error={errors.password_confirmation}
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-neutral-500 hover:text-neutral-700"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Password Requirements */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <p className="text-xs font-medium text-neutral-700 mb-2">Password must contain:</p>
          <ul className="text-xs text-neutral-600 space-y-1">
            <li className="flex items-center gap-2">
              <span className={password.length >= 8 ? "text-green-600" : "text-neutral-400"}>✓</span>
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <span className={/[a-z]/.test(password) ? "text-green-600" : "text-neutral-400"}>✓</span>
              One lowercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/[A-Z]/.test(password) ? "text-green-600" : "text-neutral-400"}>✓</span>
              One uppercase letter
            </li>
            <li className="flex items-center gap-2">
              <span className={/\d/.test(password) ? "text-green-600" : "text-neutral-400"}>✓</span>
              One number
            </li>
            <li className="flex items-center gap-2">
              <span className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : "text-neutral-400"}>✓</span>
              One special character
            </li>
          </ul>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={!password || !passwordConfirmation}
        >
          {isLoading ? "Setting Password..." : "Complete Registration"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>
    </Card>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={
      <Card variant="elevated" padding="lg">
        <div className="text-center">
          <p className="text-neutral-600">Loading...</p>
        </div>
      </Card>
    }>
      <SetPasswordContent />
    </Suspense>
  );
}
