
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

async function getFeeSettings() {
    const settingsDoc = await firestore.collection('settings').doc('schoolSettings').get();
    if (settingsDoc.exists) {
        const settings = settingsDoc.data();
        return {
            feeStructure: settings?.feeStructure || {},
            siblingDiscount: settings?.siblingDiscount || 0,
        };
    }
    return { feeStructure: {}, siblingDiscount: 0 };
}

function calculateTotalFees(studentData: any, feeSettings: any, isSibling: boolean) {
    const classFeeStructure = feeSettings.feeStructure[studentData.class] || {};
    const studentFeeOverrides = studentData.feeStructure || {};
    const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

    const { tuition = 0, admission = 0, transport = 0, exam = 0, computer = 0, miscellaneous = 0, discount = 0 } = finalFeeStructure;
    let totalFees = (tuition + admission + transport + exam + computer + miscellaneous) - discount;

    if (isSibling && feeSettings.siblingDiscount > 0) {
        totalFees -= feeSettings.siblingDiscount;
    }
    return totalFees;
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

  const { amount: totalPayment, method, date } = validatedFields.data;
  let remainingPayment = totalPayment;

  try {
    const feeSettings = await getFeeSettings();
    const batch = firestore.batch();

    const studentDueDetails = await Promise.all(
      studentIds.map(async (studentId) => {
        const studentDoc = await firestore.collection('students').doc(studentId).get();
        if (!studentDoc.exists) return null;
        
        const studentData = studentDoc.data();
        if (!studentData) return null;

        const isSibling = studentIds.length > 1 && studentIds[0] !== studentId;
        const totalFees = calculateTotalFees(studentData, feeSettings, isSibling);
        const totalPaid = (studentData.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0);
        const due = Math.max(0, totalFees - totalPaid);
        
        return { id: studentId, due, ref: studentDoc.ref };
      })
    );

    let childrenWithDues = studentDueDetails.filter(s => s && s.due > 0) as { id: string; due: number; ref: FirebaseFirestore.DocumentReference }[];
    let paymentDistribution: { [studentId: string]: number } = {};

    // This loop continues as long as there's money to distribute and children who owe money
    while (remainingPayment > 0 && childrenWithDues.length > 0) {
        const totalDueOfRemainingChildren = childrenWithDues.reduce((acc, s) => acc + s.due, 0);
        if (totalDueOfRemainingChildren === 0) break;

        let surplus = 0;
        
        for (const student of childrenWithDues) {
            // Proportional distribution for the current remaining amount
            const proportionalShare = (student.due / totalDueOfRemainingChildren) * remainingPayment;
            const amountToPay = Math.min(student.due, proportionalShare);
            
            paymentDistribution[student.id] = (paymentDistribution[student.id] || 0) + amountToPay;
            student.due -= amountToPay;
            surplus += (proportionalShare - amountToPay);
        }

        remainingPayment = surplus;
        childrenWithDues = childrenWithDues.filter(s => s.due > 0);
    }

    // After loops, if there's still money, distribute it to anyone still owing
    if (remainingPayment > 0 && childrenWithDues.length > 0) {
        for (const student of childrenWithDues) {
            const amountToPay = Math.min(student.due, remainingPayment);
            paymentDistribution[student.id] = (paymentDistribution[student.id] || 0) + amountToPay;
            student.due -= amountToPay;
            remainingPayment -= amountToPay;
            if (remainingPayment <= 0) break;
        }
    }


    // Now, commit the payments to Firestore
    for (const studentId in paymentDistribution) {
        const paidAmount = paymentDistribution[studentId];
        if (paidAmount > 0) {
            const newPayment = {
                id: `${new Date().getTime().toString()}-${studentId}`,
                amount: paidAmount,
                method: method,
                date: date,
                month: new Date(date).toLocaleString('default', { month: 'long' }),
            };
            const studentRef = firestore.collection('students').doc(studentId);
            batch.update(studentRef, {
                payments: FieldValue.arrayUnion(newPayment),
                updatedAt: new Date()
            });
        }
    }

    await batch.commit();
    
    revalidatePath('/admin/dashboard');
    return { success: true, message: `Combined payment of Rs${totalPayment} recorded successfully.` };
  } catch (error) {
    console.error('Error in combined payment:', error);
    return { success: false, message: 'An unexpected error occurred during combined payment.' };
  }
}
