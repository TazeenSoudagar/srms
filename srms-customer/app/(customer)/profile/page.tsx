"use client";

import { useState, useEffect } from "react";
import { User, Edit2, Mail, Phone, Calendar, Save, X } from "lucide-react";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import { profileApi } from "@/lib/api/profile";
import { UserProfile, UpdateProfileDto } from "@/lib/types/user";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await profileApi.getProfile();
      const userData = response.data as any; // Handle both camelCase and snake_case

      // Map API response (snake_case) to our state format
      const profileData = {
        firstName: userData.first_name || userData.firstName || "",
        lastName: userData.last_name || userData.lastName || "",
        email: userData.email || "",
        phone: userData.phone || "",
        createdAt: userData.created_at || userData.createdAt || "",
      };

      setProfile(profileData as UserProfile);

      // Initialize form with current data
      setFormData({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        phone: profileData.phone,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      const updateData: UpdateProfileDto = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      };

      const response = await profileApi.updateProfile(updateData);

      // Update profile with the response data
      if (response.data) {
        const userData = response.data as any;
        const profileData = {
          firstName: userData.first_name || userData.firstName || "",
          lastName: userData.last_name || userData.lastName || "",
          email: userData.email || "",
          phone: userData.phone || "",
          createdAt: userData.created_at || userData.createdAt || "",
        };
        setProfile(profileData as UserProfile);
      }

      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        email: profile.email || "",
        phone: profile.phone || "",
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Container>
          <div className="py-20 text-center">
            <p className="text-neutral-600">Loading profile...</p>
          </div>
        </Container>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Container>
          <div className="py-20 text-center">
            <p className="text-neutral-600">Failed to load profile</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Container>
        <div className="py-8 md:py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="mb-2">My Profile</h1>
              <p className="text-neutral-600">
                Manage your account information
              </p>
            </div>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="group relative px-6 py-2.5 text-sm font-medium text-neutral-700 transition-all duration-200 hover:text-primary-600"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <Edit2 className="h-4 w-4" />
                  Edit Profile
                </span>
                <span className="absolute inset-0 rounded-lg border border-neutral-200 transition-all duration-200 group-hover:border-primary-300 group-hover:bg-primary-50/50"></span>
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <div className="flex flex-col items-center text-center p-6">
                <div className="h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-primary-600" />
                </div>
                <h3 className="mb-1">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-sm text-neutral-500 mb-4">{profile.email}</p>

                {(profile as UserProfile & { createdAt?: string }).createdAt && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Joined {new Date((profile as UserProfile & { createdAt?: string }).createdAt!).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Profile Details Card */}
            <Card className="md:col-span-2">
              <div className="p-6">
                <h3 className="mb-6">Personal Information</h3>

                {editing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData({ ...formData, firstName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData({ ...formData, lastName: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        disabled
                        value={formData.email}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-500 cursor-not-allowed"
                      />
                      <p className="text-xs text-neutral-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" disabled={saving}>
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={saving}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4 py-3 border-b border-neutral-200">
                      <Mail className="h-5 w-5 text-neutral-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500">Email</p>
                        <p className="font-medium">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 py-3 border-b border-neutral-200">
                      <Phone className="h-5 w-5 text-neutral-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500">Phone</p>
                        <p className="font-medium">
                          {profile.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 py-3">
                      <User className="h-5 w-5 text-neutral-400 mt-1" />
                      <div className="flex-1">
                        <p className="text-sm text-neutral-500">Full Name</p>
                        <p className="font-medium">
                          {profile.firstName} {profile.lastName}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
