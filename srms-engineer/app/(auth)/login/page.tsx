"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Wrench, Users, ArrowLeft, Mail, KeyRound, Lock, ExternalLink, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { sendOtp, verifyOtp, loginWithPassword } from "@/lib/api/auth";

type Step = "role" | "email" | "otp";
type LoginMethod = "otp" | "password";

const otpEmailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

const passwordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric"),
});

type OtpEmailForm = z.infer<typeof otpEmailSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;
type OtpForm = z.infer<typeof otpSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [step, setStep] = useState<Step>("role");
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("otp");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const otpEmailForm = useForm<OtpEmailForm>({ resolver: zodResolver(otpEmailSchema) });
  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });
  const otpForm = useForm<OtpForm>({ resolver: zodResolver(otpSchema) });

  const handleSendOtp = async (values: OtpEmailForm) => {
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
      otpEmailForm.setError("email", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (values: PasswordForm) => {
    setLoading(true);
    try {
      const res = await loginWithPassword(values.email, values.password);
      const { token, user } = res.data;

      if (user.role?.name !== "Support Engineer") {
        toast.error("This portal is for engineers only. Please use the customer app.");
        return;
      }

      login(token, user);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Invalid email or password.";
      passwordForm.setError("password", { message: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: OtpForm) => {
    setLoading(true);
    try {
      const res = await verifyOtp(email, values.otp);
      const { token, user } = res.data;

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

          {/* Step: Email / Password entry */}
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

              {/* Login method toggle */}
              <div className="flex rounded-lg border border-neutral-200 p-1 mt-4 mb-5 bg-neutral-50">
                <button
                  type="button"
                  onClick={() => setLoginMethod("otp")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === "otp"
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" /> OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod("password")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    loginMethod === "password"
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" /> Password
                </button>
              </div>

              {/* OTP flow — email entry */}
              {loginMethod === "otp" && (
                <form onSubmit={otpEmailForm.handleSubmit(handleSendOtp)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Work Email
                    </label>
                    <input
                      {...otpEmailForm.register("email")}
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    {otpEmailForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {otpEmailForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" loading={loading} className="w-full">
                    Send OTP
                  </Button>
                </form>
              )}

              {/* Password flow */}
              {loginMethod === "password" && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Work Email
                    </label>
                    <input
                      {...passwordForm.register("email")}
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    {passwordForm.formState.errors.email && (
                      <p className="mt-1 text-xs text-red-600">
                        {passwordForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...passwordForm.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className="w-full px-4 py-2.5 pr-10 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password && (
                      <p className="mt-1 text-xs text-red-600">
                        {passwordForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <Button type="submit" loading={loading} className="w-full">
                    Login
                  </Button>
                </form>
              )}
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
              <p className="text-neutral-500 text-sm mb-1">We sent a 6-digit code to</p>
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
                    className="w-full px-4 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-lg tracking-widest text-center font-mono"
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
