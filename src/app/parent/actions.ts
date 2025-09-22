'use server';

import { firestore } from '@/lib/firebase-admin';
import type { Student } from '@/lib/types';
import { getStudentAttendance, getStudentsByClass } from '@/app/student/actions';

export async function getChildrenForParent(parentPhone: string): Promise<Student[]> {
  try {
    const studentsSnapshot = await firestore.collection('students')
      .where('parentPhone', '==', parentPhone)
      .orderBy('name')
      .get();
      
    if (studentsSnapshot.empty) {
      return [];
    }

    return studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      const serializedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value && typeof value.toDate === 'function') {
            return [key, value.toDate().toISOString()];
          }
          return [key, value];
        })
      );
      delete serializedData.password;
      return { id: doc.id, ...serializedData } as Student;
    });
  } catch (error) {
    console.error('Error fetching children for parent:', error);
    return [];
  }
}
