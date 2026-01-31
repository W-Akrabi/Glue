"use client";

import { useActionState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/lib/actions/settings";

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "";
  if (!source) return "U";
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

type ProfileFormProps = {
  name?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
};

export default function ProfileForm({ name, email, avatarUrl }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(updateProfile, {});
  const router = useRouter();
  const initials = getInitials(name, email);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state?.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-white/10 bg-black/40">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Profile" fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-emerald-200">
              {initials}
            </div>
          )}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="avatarFile">Profile photo</Label>
          <Input id="avatarFile" name="avatarFile" type="file" accept="image/*" />
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP, GIF, or SVG up to 5MB.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" name="name" defaultValue={name || ""} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email || ""} disabled />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {state?.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
        {state?.success ? <p className="text-sm text-emerald-300">Profile updated.</p> : null}
      </div>
    </form>
  );
}
