
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

const SalarySchema = z.object({
  baseSalary: z.coerce.number().min(0, 'Base salary must be a positive number.'),
});

const PaymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
    method: z.enum(['Cash', 'Bank Transfer', 'Cheque']),
    date: z.string().min(1, 'Date is required.'),
    remarks: z.string().optional(),
});


export type FormState = {
  success: boolean;
  message: string;
};

export async function updateTeacherSalary(
  teacherId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!teacherId) {
    return { success: false, message: 'Teacher ID is missing.' };
  }

  const validatedFields = SalarySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the base salary amount.',
    };
  }

  try {
    const { baseSalary } = validatedFields.data;
    const teacherDoc = firestore.collection('teachers').doc(teacherId);
    await teacherDoc.update({
        baseSalary: baseSalary,
        updatedAt: new Date()
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Teacher salary updated successfully.' };
  } catch (error) {
    console.error('Error updating teacher salary:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}


export async function recordSalaryPayment(
  teacherId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!teacherId) {
    return { success: false, message: 'Teacher ID is missing.' };
  }
  
  const validatedFields = PaymentSchema.safeParse(Object.fromEntries(formData.entries()));
  
  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the payment details.',
    };
  }

  try {
    const paymentData = validatedFields.data;
    const newPayment = {
        id: new Date().getTime().toString(), // simple unique id
        ...paymentData,
    };
    
    const teacherDoc = firestore.collection('teachers').doc(teacherId);
    await teacherDoc.update({
        salaryPayments: FieldValue.arrayUnion(newPayment),
        updatedAt: new Date()
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Salary payment recorded successfully.' };
  } catch (error) {
    console.error('Error recording salary payment:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}
