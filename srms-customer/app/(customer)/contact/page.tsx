"use client";

import { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle, Clock, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import Container from "@/components/layout/Container";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import { apiClient } from "@/lib/api/client";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiClient.post("/contact", formData);

      setSubmitted(true);
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      toast.success("Message sent! We'll get back to you shortly.");
      setTimeout(() => setSubmitted(false), 8000);
    } catch {
      setError("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone",
      value: "+91 98765 43210",
      description: "Mon-Sat, 9AM - 8PM",
      href: "tel:+919876543210",
    },
    {
      icon: Mail,
      title: "Email",
      value: "support@srms.com",
      description: "24/7 support",
      href: "mailto:support@srms.com",
    },
    {
      icon: MapPin,
      title: "Office",
      value: "Bangalore, Karnataka, India",
      description: "Visit us",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8 md:py-16">
      <Container>
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-3">
            Get in Touch
          </h1>
          <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
            Have questions? We're here to help. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Contact Information Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Methods */}
            <Card variant="elevated" padding="none">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900 mb-5">
                  Contact Information
                </h2>
                <div className="space-y-5">
                  {contactMethods.map((method) => (
                    <div key={method.title} className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                        <method.icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-900 mb-0.5">
                          {method.title}
                        </p>
                        {method.href ? (
                          <a
                            href={method.href}
                            className="text-sm text-neutral-700 hover:text-primary-600 transition-colors break-words"
                          >
                            {method.value}
                          </a>
                        ) : (
                          <p className="text-sm text-neutral-700 break-words">
                            {method.value}
                          </p>
                        )}
                        <p className="text-xs text-neutral-500 mt-1">
                          {method.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Response Time */}
            <Card variant="default" padding="md">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900 mb-1">
                    Quick Response Time
                  </p>
                  <p className="text-xs text-neutral-600">
                    We typically respond within 24 hours on business days
                  </p>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card variant="default" padding="md">
              <div className="flex items-start gap-3 mb-3">
                <HelpCircle className="h-5 w-5 text-primary-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-neutral-900">
                  Need quick answers?
                </p>
              </div>
              <div className="space-y-2 ml-8">
                <a
                  href="/faqs"
                  className="block text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  View FAQs
                </a>
                <a
                  href="/services"
                  className="block text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Browse Services
                </a>
                <a
                  href="/how-it-works"
                  className="block text-sm text-primary-600 hover:text-primary-700 transition-colors"
                >
                  How It Works
                </a>
              </div>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card variant="elevated" padding="none">
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                  Send us a Message
                </h2>
                <p className="text-sm text-neutral-600 mb-6">
                  Fill out the form below and we'll get back to you shortly
                </p>

                {submitted && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-green-900 mb-0.5">
                        Message sent successfully!
                      </p>
                      <p className="text-xs text-green-700">
                        Thank you for contacting us. We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      label="Your Name"
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      disabled={loading}
                    />

                    <Input
                      label="Email Address"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      disabled={loading}
                    />
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      disabled={loading}
                    />

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleChange}
                        disabled={loading}
                        className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors disabled:bg-neutral-100 disabled:cursor-not-allowed text-neutral-900 bg-white"
                      >
                        <option value="">Select a subject</option>
                        <option value="general">General Inquiry</option>
                        <option value="service">Service Question</option>
                        <option value="booking">Booking Issue</option>
                        <option value="technical">Technical Support</option>
                        <option value="feedback">Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none disabled:bg-neutral-100 disabled:cursor-not-allowed text-neutral-900 placeholder:text-sm"
                      placeholder="Tell us how we can help you..."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={loading}
                    disabled={loading}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>
            </Card>

            {/* Help Banner */}
            <div className="mt-6 p-5 bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl border border-primary-200">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-neutral-900 mb-1">
                    Need immediate assistance?
                  </p>
                  <p className="text-xs text-neutral-600">
                    For urgent matters, call our customer support hotline
                  </p>
                </div>
                <a
                  href="tel:+919876543210"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white text-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors text-sm whitespace-nowrap border border-primary-200"
                >
                  <Phone className="h-4 w-4" />
                  +91 98765 43210
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
