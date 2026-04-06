"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

function VerifyRegistrationOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) {
      toast.error("Email is required");
      router.push("/register");
    }
  }, [email, router]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.verifyRegistrationOtp({ email, otp });
      toast.success(response.message || "Email verified successfully!");

      // Navigate to set password page
      router.push(`/set-password?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.response?.data?.message || "Invalid or expired OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      toast.loading("Resending OTP...");
      await authApi.sendOtp({ email, type: 'login' });
      toast.success("OTP resent successfully!");
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      toast.error("Failed to resend OTP. Please try again.");
    }
  };

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
  };

  if (!email) {
    return null;
  }

  return (
    <Card variant="elevated" padding="lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Verify Your Email
        </h1>
        <p className="text-neutral-600">
          We've sent a 6-digit code to
        </p>
        <p className="text-neutral-900 font-medium mt-1">{email}</p>
      </div>

      <form onSubmit={handleVerifyOtp} className="space-y-6">
        <Input
          type="text"
          label="Verification Code"
          placeholder="Enter 6-digit OTP"
          value={otp}
          onChange={handleOtpChange}
          error={error}
          required
          disabled={isLoading}
          maxLength={6}
          className="text-center text-2xl tracking-widest placeholder:text-base placeholder:tracking-normal"
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
          disabled={otp.length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify Email"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-neutral-600">
          Didn't receive the code?{" "}
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
          >
            Resend OTP
          </button>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-600 text-center">
          Wrong email?{" "}
          <Link href="/register" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Go back to registration
          </Link>
        </p>
      </div>
    </Card>
  );
}

export default function VerifyRegistrationOtpPage() {
  return (
    <Suspense fallback={
      <Card variant="elevated" padding="lg">
        <div className="text-center">
          <p className="text-neutral-600">Loading...</p>
        </div>
      </Card>
    }>
      <VerifyRegistrationOtpContent />
    </Suspense>
  );
}
