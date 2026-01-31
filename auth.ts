import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from './lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { organization: true },
    });
    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              organizationId: user.organizationId,
              avatarUrl: user.avatarUrl,
            };
          }
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.organizationId = user.organizationId;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.organizationId = token.organizationId as string;

        // Always load current profile details so header stays in sync.
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, email: true, avatarUrl: true },
        });
        if (user) {
          session.user.name = user.name;
          session.user.email = user.email;
          (session.user as { avatarUrl?: string | null }).avatarUrl = user.avatarUrl;
        } else {
          (session.user as { avatarUrl?: string | null }).avatarUrl =
            (token.avatarUrl as string | null | undefined) ?? null;
        }
      }
      return session;
    },
  },
});
