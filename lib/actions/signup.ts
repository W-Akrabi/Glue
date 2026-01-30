'use server';

import { signIn } from '@/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

type SignUpState = {
  error?: string;
};

const DEFAULT_WORKFLOW = [{ step: 1, role: 'ADMIN', approverIds: [] }];

const DEFAULT_ENTITY_SCHEMA = {
  titleField: 'title',
  descriptionField: 'description',
  fields: [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Short summary',
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      required: true,
      placeholder: 'Describe what needs approval',
    },
  ],
  permissions: {
    createRoles: ['MEMBER', 'ADMIN'],
  },
};

function generateInviteCode() {
  const raw = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, '');
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}` || `ORG-${Date.now().toString().slice(-4)}`;
}

export async function signUp(_prevState: SignUpState, formData: FormData) {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim().toLowerCase();
  const password = String(formData.get('password') || '');
  const mode = String(formData.get('mode') || 'join');
  const orgName = String(formData.get('orgName') || '').trim();
  const inviteCode = String(formData.get('inviteCode') || '').trim();

  if (!name || !email || !password) {
    return { error: 'Name, email, and password are required.' };
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' };
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return { error: 'An account with this email already exists.' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  if (mode === 'create') {
    if (!orgName) {
      return { error: 'Organization name is required.' };
    }

    const newInviteCode = generateInviteCode();

    await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: orgName,
          inviteCode: newInviteCode,
        },
      });

      const entityType = await tx.entityType.create({
        data: {
          name: 'General Request',
          organizationId: organization.id,
          schema: DEFAULT_ENTITY_SCHEMA,
        },
      });

      const adminUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'ADMIN',
          organizationId: organization.id,
        },
      });

      await tx.workflowDefinition.create({
        data: {
          entityTypeId: entityType.id,
          steps: [{ step: 1, role: 'ADMIN', approverIds: [adminUser.id] }],
        },
      });
    });

    await signIn('credentials', { email, password, redirectTo: '/dashboard' });
    return;
  }

  if (!inviteCode) {
    return { error: 'Invite code is required.' };
  }

  const normalizedInviteCode = inviteCode.toUpperCase();
  const organization = await prisma.organization.findFirst({
    where: {
      inviteCode: {
        equals: normalizedInviteCode,
        mode: 'insensitive',
      },
    },
  });

  if (!organization) {
    return { error: 'Invalid invite code.' };
  }

  if (organization.inviteCode !== normalizedInviteCode) {
    await prisma.organization.update({
      where: { id: organization.id },
      data: { inviteCode: normalizedInviteCode },
    });
  }

  await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'MEMBER',
      organizationId: organization.id,
    },
  });

  await signIn('credentials', { email, password, redirectTo: '/dashboard' });
}
