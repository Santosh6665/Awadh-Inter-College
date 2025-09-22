import { logout } from '@/app/auth/actions';
import { redirect } from 'next/navigation';

export async function GET() {
  await logout();
  redirect('/login');
}
