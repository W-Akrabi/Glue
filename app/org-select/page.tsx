import { auth, signOut } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function OrgSelectPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  const organization = await prisma.organization.findUnique({
    where: { id: session.user.organizationId! },
  });

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 max-w-md w-full">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Organization not found</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your account is missing an organization assignment.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Glue</h1>
              <p className="text-sm text-gray-600">Select an organization</p>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 transition"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available organizations</h2>
          <div className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Organization</p>
              <p className="text-lg font-medium text-gray-900">{organization.name}</p>
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Continue
            </Link>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            This build currently supports a single organization per user.
          </p>
        </div>
      </main>
    </div>
  );
}
