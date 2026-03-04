import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container mx-auto px-4 py-8">
        {/* Logo - TODO: Add dark mode support with logo-dark.png */}
        <Link href="/" className="inline-block mb-8">
          <div className="flex items-center gap-3">
            <img
              src="/logo-1.png"
              alt="SRMS Logo"
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold text-neutral-900">SRMS</span>
          </div>
        </Link>

        {/* Auth Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-neutral-600 mt-8">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-primary-600 hover:text-primary-700">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary-600 hover:text-primary-700">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
