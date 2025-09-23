
import { redirect } from 'next/navigation';

export default function PrincipalsMessagePage() {
  // This page is now part of the About Us page, so we redirect to it.
  redirect('/about');
}
