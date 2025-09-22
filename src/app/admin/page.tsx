import { redirect } from 'next/navigation';
import { getLoggedInUser } from '../auth/actions';

export default async function AdminPage() {
    const user = await getLoggedInUser();

    if (!user || user.type !== 'admin') {
        redirect('/login');
    }
    
    redirect('/admin/dashboard');
}
