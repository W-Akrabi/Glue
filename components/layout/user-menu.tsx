"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

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
        className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 text-left text-sm hover:border-white/20"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-400/20 text-xs font-semibold text-emerald-200">
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
          "absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[#141821] p-2 shadow-xl",
          open ? "block" : "hidden"
        )}
        role="menu"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
          <p className="text-sm font-medium text-white">{name || "User"}</p>
          <p className="text-xs text-gray-400">{email}</p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-500">{role}</p>
        </div>
        <div className="mt-2 space-y-1">
          <button
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-gray-200 hover:bg-white/5"
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
            className="w-full rounded-lg px-3 py-2 text-left text-sm text-rose-200 hover:bg-white/5"
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
