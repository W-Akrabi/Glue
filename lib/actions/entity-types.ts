'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { EntityFieldSchema } from '@/lib/records';
import { revalidatePath } from 'next/cache';

type EntityTypeState = {
  error?: string;
  success?: boolean;
};

const ALLOWED_FIELD_TYPES = new Set(['text', 'textarea', 'select', 'number', 'date']);
const ALLOWED_ROLES = new Set(['MEMBER', 'APPROVER', 'ADMIN']);

export async function createEntityType(_prevState: EntityTypeState, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: 'Unauthorized' };
  }

  if (session.user.role !== 'ADMIN') {
    return { error: 'Forbidden' };
  }

  const name = String(formData.get('name') || '').trim();
  if (!name) {
    return { error: 'Name is required' };
  }

  const rawFields = String(formData.get('fields') || '[]');
  const titleField = String(formData.get('titleField') || '').trim();
  const descriptionField = String(formData.get('descriptionField') || '').trim();
  const rawRoles = String(formData.get('createRoles') || '');

  let fields: EntityFieldSchema[] = [];
  try {
    fields = JSON.parse(rawFields) as EntityFieldSchema[];
  } catch {
    return { error: 'Invalid fields payload' };
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    return { error: 'At least one field is required' };
  }

  const fieldKeys = new Set(fields.map((field) => String(field.key)));

  for (const field of fields) {
    if (!field.key || !field.label) {
      return { error: 'Each field requires a key and label' };
    }
    if (!ALLOWED_FIELD_TYPES.has(field.type)) {
      return { error: `Unsupported field type: ${field.type}` };
    }
    if (field.type === 'select' && (!field.options || field.options.length === 0)) {
      return { error: `Select field "${field.label}" requires options` };
    }
  }

  if (titleField && !fieldKeys.has(titleField)) {
    return { error: 'Title field must match a field key' };
  }

  if (descriptionField && !fieldKeys.has(descriptionField)) {
    return { error: 'Description field must match a field key' };
  }

  const createRoles = rawRoles
    .split(',')
    .map((role) => role.trim().toUpperCase())
    .filter(Boolean);

  for (const role of createRoles) {
    if (!ALLOWED_ROLES.has(role)) {
      return { error: `Invalid role: ${role}` };
    }
  }

  const schema = {
    titleField: titleField || undefined,
    descriptionField: descriptionField || undefined,
    fields,
    permissions: {
      createRoles,
    },
  };

  try {
    await prisma.entityType.create({
      data: {
        name,
        organizationId: session.user.organizationId!,
        schema,
      },
    });
  } catch (error) {
    console.error('Failed to create entity type:', error);
    return { error: 'Failed to create entity type' };
  }

  revalidatePath('/admin/entity-types');
  revalidatePath('/admin/workflows');
  revalidatePath('/requests/new');

  return { success: true };
}
