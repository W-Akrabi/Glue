"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/theme/theme-toggle";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
};

export default function UserMenu({ name, email, role, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const initials = getInitials(name, email);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        className="flex items-center gap-2 rounded-full border border-[#E6E9F4] bg-white/90 px-2 py-1.5 text-left text-sm shadow-[0_8px_20px_rgba(15,23,42,0.08)] hover:border-[#CDD5F0]"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#4F6AFA]/15 text-xs font-semibold text-[#4F6AFA]">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Profile" fill className="object-cover" />
          ) : (
            initials
          )}
        </span>
        <span className="hidden max-w-[140px] truncate text-sm font-medium md:inline">
          {name || email || "User"}
        </span>
      </button>

      <div
        className={cn(
          "absolute right-0 mt-2 w-64 rounded-xl border border-[#E6E9F4] bg-white p-2 shadow-[0_20px_60px_rgba(15,23,42,0.16)]",
          open ? "block" : "hidden"
        )}
        role="menu"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rounded-lg border border-[#E6E9F4] bg-[#F8F9FD] p-3">
          <p className="text-sm font-medium text-[#1F2430]">{name || "User"}</p>
          <p className="text-xs text-[#6B7280]">{email}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-[#8A94A7]">{role}</p>
        </div>
        <div className="mt-2 space-y-1">
          <ThemeToggle label />
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#1F2430] hover:bg-[#F4F6FA]"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              router.push("/settings");
            }}
          >
            Settings
          </button>
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
            role="menuitem"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
