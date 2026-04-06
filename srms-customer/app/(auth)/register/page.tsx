"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register(formData);
      toast.success(response.message || "Registration successful!");

      // Navigate to OTP verification page with email
      router.push(`/verify-registration-otp?email=${encodeURIComponent(formData.email)}`);
    } catch (err: any) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <Card variant="elevated" padding="lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <UserPlus className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Create Account
        </h1>
        <p className="text-neutral-600">
          Join SRMS to book professional home services
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="text"
            label="First Name"
            name="first_name"
            placeholder="Enter your first name"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
            required
            disabled={isLoading}
          />

          <Input
            type="text"
            label="Last Name"
            name="last_name"
            placeholder="Enter your last name"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
            required
            disabled={isLoading}
          />
        </div>

        <Input
          type="email"
          label="Email Address"
          name="email"
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          disabled={isLoading}
        />

        <Input
          type="tel"
          label="Phone Number"
          name="phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          {isLoading ? "Creating Account..." : "Register"}
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-neutral-200">
        <p className="text-sm text-neutral-600 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-primary-600 font-medium hover:text-primary-700 transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </Card>
  );
}
