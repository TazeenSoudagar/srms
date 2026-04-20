"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Wrench, Users, ArrowLeft, Mail, KeyRound, ExternalLink } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtp, verifyOtp } from "@/lib/api/auth";

type Step = "role" | "email" | "otp";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("role");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const handleSendOtp = async (values: EmailForm) => {
    setLoading(true);
    try {
      await sendOtp(values.email);
      setEmail(values.email);
      setStep("otp");
      toast.success("OTP sent to your email.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { email?: string[] }; message?: string } } })
          ?.response?.data?.errors?.email?.[0] ??
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to send OTP.";
      emailForm.setError("email", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: OtpForm) => {
    setLoading(true);
    try {
      const res = await verifyOtp(email, values.otp);
      const { token, user } = res.data.data;

      if (user.role?.name !== "Support Engineer") {
        toast.error("This portal is for engineers only. Please use the customer app.");
        return;
      }

      login(token, user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid or expired OTP.";
      otpForm.setError("otp", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-neutral-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 rounded-2xl mb-3">
            <Wrench className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SRMS Engineer Portal</h1>
          <p className="text-primary-200 text-sm mt-1">Service Request Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Step: Role selector */}
          {step === "role" && (
            <div>
              <h2 className="text-xl font-semibold text-neutral-800 mb-1">Who are you?</h2>
              <p className="text-neutral-500 text-sm mb-6">Choose your role to continue</p>

              <div className="space-y-3">
                <button
                  onClick={() => setStep("email")}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-primary-600 bg-primary-50 hover:bg-primary-100 transition-colors text-left group"
                >
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Wrench className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-primary-800">Support Engineer</p>
                    <p className="text-xs text-primary-600">Login to manage your assigned requests</p>
                  </div>
                </button>

                <a
                  href="http://localhost:3000"
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-neutral-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-neutral-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-neutral-700">Customer</p>
                    <p className="text-xs text-neutral-500">Register or login to the customer portal</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-400" />
                </a>
              </div>
            </div>
          )}

          {/* Step: Email entry */}
          {step === "email" && (
            <div>
              <button
                onClick={() => setStep("role")}
                className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-2 mb-1">
                <Mail className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-neutral-800">Engineer Login</h2>
              </div>
              <p className="text-neutral-500 text-sm mb-6">
                Enter your work email to receive a one-time password.
              </p>

              <form onSubmit={emailForm.handleSubmit(handleSendOtp)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Work Email
                  </label>
                  <input
                    {...emailForm.register("email")}
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  {emailForm.formState.errors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button type="submit" loading={loading} className="w-full">
                  Send OTP
                </Button>
              </form>
            </div>
          )}

          {/* Step: OTP verification */}
          {step === "otp" && (
            <div>
              <button
                onClick={() => setStep("email")}
                className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 mb-4"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-neutral-800">Enter OTP</h2>
              </div>
              <p className="text-neutral-500 text-sm mb-1">
                We sent a 6-digit code to
              </p>
              <p className="text-primary-700 font-medium text-sm mb-6">{email}</p>

              <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    One-Time Password
                  </label>
                  <input
                    {...otpForm.register("otp")}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm tracking-widest text-center font-mono text-lg"
                  />
                  {otpForm.formState.errors.otp && (
                    <p className="mt-1 text-xs text-red-600">
                      {otpForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>
                <Button type="submit" loading={loading} className="w-full">
                  Verify & Login
                </Button>
                <button
                  type="button"
                  onClick={() => handleSendOtp({ email })}
                  className="w-full text-sm text-primary-600 hover:underline"
                >
                  Resend OTP
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
