// This file is deprecated. The new global logout is at /logout
import { redirect } from 'next/navigation';

export async function GET() {
  redirect('/logout');
}
