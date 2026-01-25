import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { updateSubscription } from '@/lib/actions/billing';
import { getOrgSubscriptionStatus } from '@/lib/billing';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const org = await getOrgSubscriptionStatus(session.user.organizationId);
  if (!org) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <Card className="w-full max-w-lg border-white/10 bg-neutral-900/80">
          <CardHeader>
            <CardTitle>Billing unavailable</CardTitle>
            <CardDescription>
              We could not load your organization. Try signing in again.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Link href="/login" className="text-sm text-emerald-300 hover:text-emerald-200">
              Back to sign in
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const price = `$${(org.planPriceCents / 100).toFixed(2)} / month`;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Glue</h1>
              <p className="text-sm text-gray-400">Billing</p>
            </div>
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white">
              Back to dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Card className="border-white/10 bg-neutral-900/70">
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              {org.subscriptionStatus === 'active'
                ? 'Your subscription is active.'
                : 'Activate your subscription to unlock the app.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                {price} per org
              </div>
              {org.billingCardLast4 ? (
                <p className="text-sm text-gray-400">
                  {org.billingCardBrand} •••• {org.billingCardLast4}
                </p>
              ) : null}
            </div>

            {session.user.role !== 'ADMIN' ? (
              <div className="rounded-md border border-white/10 bg-black/40 p-4 text-sm text-gray-300">
                Ask your admin to add a payment method.
              </div>
            ) : (
              <form action={updateSubscription} className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-300">Cardholder name</label>
                  <input
                    name="cardName"
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-300">Card number</label>
                  <input
                    name="cardNumber"
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">Expiry</label>
                  <input
                    name="cardExpiry"
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    placeholder="12/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-300">CVC</label>
                  <input
                    name="cardCvc"
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-gray-300">Card brand</label>
                  <input
                    name="cardBrand"
                    className="h-10 w-full rounded-md border border-white/10 bg-black px-3 text-sm text-white"
                    placeholder="Visa"
                  />
                </div>
                <CardFooter className="px-0 md:col-span-2">
                  <Button type="submit">Activate subscription</Button>
                </CardFooter>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
