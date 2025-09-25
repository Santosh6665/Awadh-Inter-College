
import { getStudents } from '../students/actions';
import { StudentFeeManagement } from './student-fee-management';
import { firestore } from '@/lib/firebase-admin';

async function getFeeSettings() {
    const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
    return settingsDoc.data() || {};
}

export default async function FeePage() {
    const students = await getStudents();
    const feeSettings = await getFeeSettings();

    return (
        <div className="container mx-auto p-4">
            <StudentFeeManagement students={students} feeSettings={feeSettings} />
        </div>
    );
}
