import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ResetPasswordForm from '@/components/auth/reset-password-form';

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }> | { token?: string };
}) {
  const resolved =
    typeof (searchParams as Promise<{ token?: string }>)?.then === 'function'
      ? await (searchParams as Promise<{ token?: string }>)
      : (searchParams as { token?: string } | undefined);

  const token = resolved?.token || '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md border-white/10 bg-card/70">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {token ? (
            <ResetPasswordForm token={token} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Missing reset token. Please request a new link.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
