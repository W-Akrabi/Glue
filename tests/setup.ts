import dotenv from 'dotenv';
import { vi } from 'vitest';

dotenv.config({ path: '.env.test' });
if (process.env.TEST_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
process.env.NODE_ENV = 'test';

vi.mock('next/cache', () => ({
  revalidatePath: () => {},
}));
