"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (emailAddress: string): boolean => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailAddress);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate email
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.sendOtp({ email, type: 'login' });
      toast.success(response.message || "OTP sent successfully!");

      // Navigate to OTP verification page
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Send OTP error:", err);
      setError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <Phone className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-neutral-600">
          Enter your email to continue
        </p>
      </div>

      <form onSubmit={handleSendOtp} className="space-y-6">
        <Input
          type="email"
          label="Email Address"
          placeholder="Enter your email address"
          value={email}
          onChange={handleEmailChange}
          error={error}
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={!email || !validateEmail(email)}
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-600 text-center">
          New to SRMS?{" "}
          <span className="text-primary-600 font-medium">
            No worries! We'll create your account automatically.
          </span>
        </p>
      </div>

      {/* Trust Indicators */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">10K+</div>
          <div className="text-xs text-neutral-600">Happy Users</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">500+</div>
          <div className="text-xs text-neutral-600">Professionals</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-600">4.8</div>
          <div className="text-xs text-neutral-600">Avg Rating</div>
        </div>
      </div>
    </Card>
  );
}
