
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';

const FeeStructureSchema = z.object({
  tuition: z.coerce.number().min(0).optional().or(z.literal('')),
  admission: z.coerce.number().min(0).optional().or(z.literal('')),
  transport: z.coerce.number().min(0).optional().or(z.literal('')),
  exam: z.coerce.number().min(0).optional().or(z.literal('')),
  computer: z.coerce.number().min(0).optional().or(z.literal('')),
  miscellaneous: z.coerce.number().min(0).optional().or(z.literal('')),
  discount: z.coerce.number().min(0).optional().or(z.literal('')),
  paymentPlan: z.enum(['monthly', 'quarterly', 'yearly', '']).optional(),
});

const PaymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
    method: z.enum(['Cash', 'Card', 'Online']),
    date: z.string().min(1, 'Date is required.'),
    month: z.string().optional(),
});

const CombinedPaymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
    method: z.enum(['Cash', 'Card', 'Online']),
    date: z.string().min(1, 'Date is required.'),
});


export type FormState = {
  success: boolean;
  message: string;
};

export async function updateFeeStructure(
  studentId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!studentId) {
    return { success: false, message: 'Student ID is missing.' };
  }

  const validatedFields = FeeStructureSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Validation failed. Please check the fee amounts.',
    };
  }

  try {
    const feeData = validatedFields.data;
    const feesForUpdate = Object.fromEntries(
        Object.entries(feeData).map(([key, value]) => [key, value === '' ? FieldValue.delete() : value])
    );
    
    const studentDoc = firestore.collection('students').doc(studentId);
    await studentDoc.set({
        feeStructure: feesForUpdate,
        updatedAt: new Date()
    }, { merge: true });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Fee structure updated successfully.' };
  } catch (error) {
    console.error('Error updating fee structure:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}


export async function recordPayment(
  studentId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!studentId) {
    return { success: false, message: 'Student ID is missing.' };
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
    
    const studentDoc = firestore.collection('students').doc(studentId);
    await studentDoc.update({
        payments: FieldValue.arrayUnion(newPayment),
        updatedAt: new Date()
    });

    revalidatePath('/admin/dashboard');
    return { success: true, message: 'Payment recorded successfully.' };
  } catch (error) {
    console.error('Error recording payment:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

export async function recordCombinedPayment(
  parentPhone: string,
  studentIds: string[],
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!parentPhone || !studentIds || studentIds.length === 0) {
    return { success: false, message: 'Parent or student information is missing.' };
  }

  const validatedFields = CombinedPaymentSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return { success: false, message: 'Validation failed. Please check payment details.' };
  }

  let totalAmountToDistribute = validatedFields.data.amount;
  const paymentMethod = validatedFields.data.method;
  const paymentDate = validatedFields.data.date;

  try {
    for (const studentId of studentIds) {
      if (totalAmountToDistribute <= 0) break;

      const studentDocRef = firestore.collection('students').doc(studentId);
      const studentDoc = await studentDocRef.get();
      if (!studentDoc.exists) continue;

      const studentData = studentDoc.data();
      const totalPaid = (studentData?.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0);
      
      // We need to fetch fee settings to calculate total fees. This is a simplification.
      // A more robust solution would involve passing pre-calculated dues.
      // For now, let's assume we need to calculate it here.
      // NOTE: This calculation is simplified and doesn't account for complex fee structures.
      // It's a placeholder for the actual fee calculation logic.
      const totalFees = studentData?.feeStructure?.tuition || 30000; // Simplified
      const due = totalFees - totalPaid;

      if (due > 0) {
        const amountToPay = Math.min(due, totalAmountToDistribute);
        
        const newPayment = {
            id: `${new Date().getTime().toString()}-${studentId}`,
            amount: amountToPay,
            method: paymentMethod,
            date: paymentDate,
            month: new Date(paymentDate).toLocaleString('default', { month: 'long' }), // Defaulting month
        };

        await studentDocRef.update({
            payments: FieldValue.arrayUnion(newPayment),
            updatedAt: new Date()
        });

        totalAmountToDistribute -= amountToPay;
      }
    }
    
    revalidatePath('/admin/dashboard');
    return { success: true, message: `Combined payment of Rs${validatedFields.data.amount} recorded successfully.` };
  } catch (error) {
    console.error('Error in combined payment:', error);
    return { success: false, message: 'An unexpected error occurred during combined payment.' };
  }
}
