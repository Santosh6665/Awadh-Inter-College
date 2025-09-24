
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { calculateAnnualDue } from '@/lib/fee-utils';
import type { Student } from '@/lib/types';

const StudentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.'),
  rollNumber: z.string().min(1, 'Roll number is required.'),
  class: z.string().min(1, 'Class is required.'),
  section: z.string().min(1, 'Section is required.'),
  dob: z.string().min(1, 'Date of birth is required.'),
  phone: z.string().optional(),
  fatherName: z.string().min(2, "Father's name is required."),
  address: z.string().min(5, 'Address is required.'),
  parentPhone: z.string().optional(),
  session: z.string().min(1, 'Session is required.'),
});

// Update schema doesn't require password, as it's handled by the student now
const UpdateStudentSchema = StudentSchema.omit({ rollNumber: true });


export type StudentFormState = {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  } | null;
};

export async function addStudent(
  prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const validatedFields = StudentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  try {
    const studentData = validatedFields.data;
    const studentsCollection = firestore.collection('students');
    
    // Construct a unique ID combining roll number and session to avoid collisions
    const studentId = `${studentData.rollNumber}-${studentData.session}`;
    const studentDoc = studentsCollection.doc(studentId);

    const docSnapshot = await studentDoc.get();
    if (docSnapshot.exists) {
        return { success: false, message: `A student with Roll Number ${studentData.rollNumber} already exists in session ${studentData.session}.` };
    }

    // Fetch school settings to get default fee structure
    const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
    const settings = settingsDoc.data();
    const classFeeStructure = settings?.feeStructure?.[studentData.class] || {};

    await studentDoc.set({
      ...studentData,
      id: studentId, // Also store the ID in the document
      feeStructure: classFeeStructure, // Assign default fees for the class
      createdAt: new Date(),
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Student added successfully.' };
  } catch (error) {
    console.error('Error adding student:', error);
    return { success: false, message: 'An unexpected error occurred while adding the student.' };
  }
}

export async function updateStudent(
  id: string,
  prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  if (!id) {
    return { success: false, message: 'Student ID is missing.' };
  }
  
  const rawData = Object.fromEntries(formData.entries());
  // The roll number is read-only and should not be part of the update.
  delete rawData.rollNumber;

  const validatedFields = UpdateStudentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fields.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const studentData = validatedFields.data;
    const updateData: { [key: string]: any } = { ...studentData, updatedAt: new Date() };

    const studentDoc = firestore.collection('students').doc(id);
    await studentDoc.update(updateData);

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Student updated successfully.' };
  } catch (error) {
    console.error('Error updating student:', error);
    return { success: false, message: 'An unexpected error occurred while updating the student.' };
  }
}

export async function deleteStudent(id: string) {
  if (!id) {
    return { success: false, message: 'Student ID is missing.' };
  }
  try {
    await firestore.collection('students').doc(id).delete();
    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Student deleted successfully.' };
  } catch (error) {
    console.error('Error deleting student:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function getStudents() {
  try {
    const studentsSnapshot = await firestore.collection('students').orderBy('name').get();
    if (studentsSnapshot.empty) {
      return [];
    }
    return studentsSnapshot.docs.map(doc => {
      const data = doc.data();
      // Convert Firestore Timestamps to strings to make them serializable
      const serializedData = Object.fromEntries(
        Object.entries(data).map(([key, value]) => {
          if (value && typeof value.toDate === 'function') {
            return [key, value.toDate().toISOString()];
          }
          return [key, value];
        })
      );
      // Ensure password is not sent to the client
      delete serializedData.password;

      return {
        id: doc.id,
        ...serializedData,
      };
    }) as any[]; // Using any to avoid TS errors with Firestore data types
  } catch (error) {
    console.error('Error fetching students:', error);
    return [];
  }
}

export async function promoteStudents(
  studentIds: string[],
  fromClass: string,
  toClass: string,
  fromSession: string,
  toSession: string,
) {
  if (!studentIds || studentIds.length === 0 || !toClass || !fromSession || !toSession) {
    return { success: false, message: 'Missing required information for promotion.' };
  }
  
  try {
    const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
    const feeSettings = settingsDoc.data() || {};

    const batch = firestore.batch();
    const studentsCollection = firestore.collection('students');
    
    for (const studentId of studentIds) {
      const studentDoc = await studentsCollection.doc(studentId).get();
      if (studentDoc.exists) {
        const studentData = studentDoc.data() as Student;
        
        const { due: pendingDue } = calculateAnnualDue(studentData, feeSettings);
        
        const newPayments = [];
        if (pendingDue > 0) {
          // Carry forward the pending due as a negative payment (a debit)
          newPayments.push({
            id: `due-${fromSession}`,
            amount: -pendingDue,
            date: new Date().toISOString(),
            method: 'System', // Special method for system-generated entries
            months: [`Due from ${fromSession}`],
          });
        }
        
        // Prepare new student data for the next session
        const newStudentData: Omit<Student, 'id'> = {
          ...studentData,
          class: toClass,
          session: toSession,
          marks: {},
          payments: newPayments,
        };
        
        // Create a new document for the student in the new session
        const newStudentId = `${studentData.rollNumber}-${toSession}`;
        const newStudentRef = studentsCollection.doc(newStudentId);
        
        // To avoid TypeScript errors about 'id', we create a version without it for batch.set
        const { id, ...dataToSet } = newStudentData;
        
        batch.set(newStudentRef, { ...dataToSet, id: newStudentId });
      }
    }
    
    await batch.commit();
    revalidatePath('/admin/dashboard');
    return { success: true, message: `${studentIds.length} students promoted successfully to session ${toSession}.` };
  } catch (error) {
    console.error('Error promoting students:', error);
    return { success: false, message: 'An unexpected error occurred during promotion.' };
  }
}
