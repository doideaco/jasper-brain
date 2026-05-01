import { auth } from '@clerk/nextjs/server';

export type Role = 'editor' | 'admin';

function adminUserIds(): Set<string> {
  const raw = process.env.ADMIN_USER_IDS ?? '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/** True if no allowlist is configured — every signed-in user is an admin. */
function hasAllowlist(): boolean {
  return adminUserIds().size > 0;
}

export async function getCurrentUser(): Promise<{
  userId: string;
  role: Role;
} | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const role: Role = !hasAllowlist() || adminUserIds().has(userId)
    ? 'admin'
    : 'editor';
  return { userId, role };
}

export async function requireUser(): Promise<{
  userId: string;
  role: Role;
}> {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not signed in.');
  return user;
}

export async function requireAdmin(): Promise<{
  userId: string;
  role: Role;
}> {
  const user = await requireUser();
  if (user.role !== 'admin') {
    throw new Error(
      'This action requires admin role. Add your user ID to ADMIN_USER_IDS to proceed.',
    );
  }
  return user;
}
