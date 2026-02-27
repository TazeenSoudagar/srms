"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { authApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.push("/login");
    }
  }, [email, router]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits entered
    if (index === 5 && value) {
      const fullOtp = [...newOtp.slice(0, 5), value].join("");
      if (fullOtp.length === 6) {
        handleVerifyOtp(fullOtp);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const digits = pastedData.split("").filter((char) => /^\d$/.test(char));

    const newOtp = [...otp];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const lastIndex = Math.min(digits.length, 5);
    inputRefs.current[lastIndex]?.focus();

    // Auto-submit if 6 digits pasted
    if (digits.length === 6) {
      handleVerifyOtp(digits.join(""));
    }
  };

  const handleVerifyOtp = async (otpValue?: string) => {
    const otpCode = otpValue || otp.join("");

    if (otpCode.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await authApi.verifyOtp({ email, otp: otpCode, type: 'login' });
      const { token, user } = response;

      // Login using auth context
      login(token, user);

      toast.success("Login successful!");

      // Redirect to home page
      router.push("/");
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      await authApi.sendOtp({ email, type: 'login' });
      toast.success("OTP resent successfully!");
      setResendTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Verify OTP
        </h1>
        <p className="text-neutral-600">
          Enter the 6-digit code sent to
        </p>
        <p className="text-neutral-900 font-semibold mt-1">
          {email}
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleVerifyOtp(); }} className="space-y-6">
        {/* OTP Input */}
        <div>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-colors
                  ${error
                    ? "border-red-500 bg-red-50"
                    : digit
                    ? "border-primary-500 bg-primary-50"
                    : "border-neutral-300 bg-white"
                  }
                  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              />
            ))}
          </div>
          {error && (
            <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
          )}
        </div>

        {/* Verify Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={isLoading}
          disabled={otp.join("").length !== 6}
        >
          {isLoading ? "Verifying..." : "Verify & Continue"}
        </Button>

        {/* Resend OTP */}
        <div className="text-center">
          {canResend ? (
            <button
              type="button"
              onClick={handleResendOtp}
              className="text-primary-600 font-medium hover:text-primary-700 transition-colors"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-sm text-neutral-600">
              Resend OTP in{" "}
              <span className="font-semibold text-neutral-900">
                {resendTimer}s
              </span>
            </p>
          )}
        </div>
      </form>

      {/* Back to Login */}
      <div className="mt-6 pt-6 border-t border-neutral-200">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to login</span>
        </Link>
      </div>

      {/* Help Text */}
      <div className="mt-6 text-center">
        <p className="text-xs text-neutral-500">
          Didn't receive the code? Check your phone or try resending.
        </p>
      </div>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      </Card>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
