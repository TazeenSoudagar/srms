"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, Lock, Camera, Briefcase, Star } from "lucide-react";
import { Button } from "@/components/common/Button";
import { useAuth } from "@/contexts/AuthContext";
import { getProfile, updateProfile, uploadAvatar } from "@/lib/api/profile";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().optional(),
  bio: z.string().optional(),
  availability_status: z.enum(["available", "busy", "offline"]).optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const AVAILABILITY_OPTIONS = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "busy", label: "Busy", color: "bg-amber-500" },
  { value: "offline", label: "Offline", color: "bg-neutral-400" },
] as const;

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [ratingAggregate, setRatingAggregate] = useState<{ avg: number; count: number } | null>(null);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? "",
      last_name: user?.last_name ?? "",
      bio: user?.bio ?? "",
      availability_status: user?.availability_status ?? "available",
    },
  });

  useEffect(() => {
    getProfile().then((res) => {
      const u = res.data.data;
      form.reset({
        first_name: u.first_name,
        last_name: u.last_name ?? "",
        bio: u.bio ?? "",
        availability_status: u.availability_status ?? "available",
      });
    });
  }, [form]);

  const handleSave = async (values: ProfileForm) => {
    setLoading(true);
    try {
      await updateProfile(values);
      await refreshUser();
      toast.success("Profile updated successfully.");
    } catch {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
      toast.success("Avatar updated.");
    } catch {
      toast.error("Failed to upload avatar.");
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">My Profile</h1>
        <p className="text-neutral-500 text-sm mt-1">Manage your profile information</p>
      </div>

      {/* Avatar */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            {user?.avatar?.url ? (
              <img
                src={user.avatar.url}
                alt="avatar"
                className="w-20 h-20 rounded-full object-cover border-2 border-neutral-200"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700 border-2 border-neutral-200">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors">
              <Camera className="w-3.5 h-3.5 text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </label>
          </div>
          <div>
            <p className="font-semibold text-neutral-800 text-lg">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-sm text-neutral-500">{user?.role?.name}</p>
            {avatarLoading && <p className="text-xs text-primary-600 mt-1">Uploading...</p>}
          </div>
        </div>
      </div>

      {/* Read-only contact info */}
      <div className="bg-neutral-50 rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-neutral-400" />
          <h2 className="font-semibold text-neutral-700 text-sm">Contact Details</h2>
          <span className="text-xs text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full">
            Read-only · Contact admin to update
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { label: "Email", value: user?.email },
            { label: "Phone", value: user?.phone ?? "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-medium text-neutral-500 mb-1">{label}</p>
              <p className="text-sm text-neutral-700 bg-white rounded-lg border border-neutral-200 px-3 py-2">
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Editable profile form */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-neutral-800">Profile Information</h2>
        </div>

        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">First Name</label>
              <input
                {...form.register("first_name")}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
              {form.formState.errors.first_name && (
                <p className="mt-1 text-xs text-red-600">{form.formState.errors.first_name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Last Name</label>
              <input
                {...form.register("last_name")}
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Bio</label>
            <textarea
              {...form.register("bio")}
              rows={3}
              placeholder="Tell customers a bit about yourself..."
              className="w-full px-3 py-2.5 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Availability</label>
            <div className="flex gap-2">
              {AVAILABILITY_OPTIONS.map((opt) => {
                const selected = form.watch("availability_status") === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setValue("availability_status", opt.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selected
                        ? "border-primary-600 bg-primary-50 text-primary-700"
                        : "border-neutral-200 text-neutral-600 hover:bg-neutral-50"
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button type="submit" loading={loading}>
            Save Changes
          </Button>
        </form>
      </div>

      {/* Engineer stats */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <Briefcase className="w-4 h-4 text-primary-600" />
          <h2 className="font-semibold text-neutral-800">Professional Details</h2>
          <span className="text-xs text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
            Managed by admin
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Hourly Rate</p>
            <p className="text-lg font-bold text-neutral-800">
              {user?.hourly_rate ? `₹${user.hourly_rate}` : "—"}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <p className="text-xs text-neutral-500 mb-1">Experience</p>
            <p className="text-lg font-bold text-neutral-800">
              {user?.years_of_experience != null ? `${user.years_of_experience} yrs` : "—"}
            </p>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-amber-500 fill-current" />
              <p className="text-lg font-bold text-neutral-800">
                {ratingAggregate?.avg?.toFixed(1) ?? "—"}
              </p>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              {ratingAggregate?.count != null ? `${ratingAggregate.count} reviews` : "Avg Rating"}
            </p>
          </div>
        </div>

        {user?.specializations && user.specializations.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-neutral-500 mb-2">Specializations</p>
            <div className="flex flex-wrap gap-2">
              {user.specializations.map((s) => (
                <span key={s} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
