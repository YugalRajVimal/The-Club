import type { ReactNode } from "react";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex bg-[#FAF8F4]">
      {/* Brand panel — hidden below lg, this is an internal tool so density wins on small screens */}
      <div className="hidden lg:flex lg:w-[42%] flex-col justify-between bg-[#1F1B16] text-[#F4F1EA] px-14 py-12 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full border border-[#C9A227]/20" />
        <div className="absolute top-1/3 -right-16 w-48 h-48 rounded-full border border-[#C9A227]/10" />

        <div className="relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#C9A227] flex items-center justify-center">
              <span className="font-serif text-[#C9A227] text-sm">A</span>
            </div>
            <span className="font-serif text-lg tracking-wide">Ashworth Club</span>
          </div>
          <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[#C9A227]/70">Admin Console</p>
        </div>

        <div className="relative">
          <p className="font-serif text-3xl leading-snug text-[#F4F1EA]">
            Membership, documents, and approvals — in one place.
          </p>
          <p className="mt-4 text-sm text-[#C9B8A0] max-w-sm">
            Sign in with your administrator or sub-administrator account to manage clubs, members, and staff access.
          </p>
        </div>

        <p className="relative text-xs text-[#8A8072]">Internal tool — for authorized Ashworth Club staff only.</p>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <div className="w-8 h-8 rounded-full border border-[#C9A227] flex items-center justify-center">
              <span className="font-serif text-[#C9A227] text-sm">A</span>
            </div>
            <span className="font-serif text-lg tracking-wide text-[#3A3530]">Ashworth Club</span>
          </div>

          <p className="text-[11px] uppercase tracking-[0.18em] text-[#A6844F] font-medium">{eyebrow}</p>
          <h1 className="mt-2 font-serif text-2xl text-[#221D17]">{title}</h1>
          <p className="mt-2 text-sm text-[#78716C]">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
