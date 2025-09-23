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
    method: z.enum(['Cash', 'Card', 'Online', 'Bank Transfer', 'Cheque']),
    date: z.string().min(1, 'Date is required.'),
    months: z.preprocess((val) => {
        if (Array.isArray(val)) {
             // Flatten the array if it contains comma-separated strings
            return val.flatMap(item => typeof item === 'string' ? item.split(',') : item);
        }
        if (typeof val === 'string') return val.split(',');
        return [];
    }, z.array(z.string()).optional()),
});

const CombinedPaymentSchema = z.object({
    amount: z.coerce.number().min(1, 'Amount must be greater than 0.'),
    method: z.enum(['Cash', 'Card', 'Online', 'Bank Transfer', 'Cheque']),
    date: z.string().min(1, 'Date is required.'),
    months: z.preprocess((val) => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string') return [val];
        return [];
    }, z.array(z.string()).optional()),
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
  
  const rawData = {
    amount: formData.get('amount'),
    method: formData.get('method'),
    date: formData.get('date'),
    months: formData.getAll('months'),
  };

  const validatedFields = PaymentSchema.safeParse(rawData);
  
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
            sessionStartDate: settings?.sessionStartDate,
        };
    }
    return { feeStructure: {}, siblingDiscount: 0, sessionStartDate: null };
}

// Defines which fee heads are considered monthly recurring costs
const MONTHLY_FEE_HEADS = ['tuition', 'transport', 'computer'];
// Defines which fee heads are considered one-time or annual costs
const ANNUAL_FEE_HEADS = ['admission', 'miscellaneous'];

function calculateTotalAnnualFee(finalFeeStructure: any) {
  let totalAnnualFee = 0;
  for (const head of MONTHLY_FEE_HEADS) {
    totalAnnualFee += (finalFeeStructure[head] || 0) * 12;
  }
  for (const head of ANNUAL_FEE_HEADS) {
    totalAnnualFee += finalFeeStructure[head] || 0;
  }
  totalAnnualFee += (finalFeeStructure.exam || 0) * 3;
  totalAnnualFee -= finalFeeStructure.discount || 0;
  return totalAnnualFee;
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
  
  const rawData = {
    amount: formData.get('amount'),
    method: formData.get('method'),
    date: formData.get('date'),
    months: formData.getAll('months'),
  };

  const validatedFields = CombinedPaymentSchema.safeParse(rawData);
  
  if (!validatedFields.success) {
    return { success: false, message: 'Validation failed. Please check payment details.' };
  }

  const { amount: totalPayment, method, date, months } = validatedFields.data;

  try {
    const feeSettings = await getFeeSettings();
    if (!feeSettings.sessionStartDate) {
        return { success: false, message: 'Session Start Date is not set in Fee Settings.' };
    }
    const batch = firestore.batch();

    const studentDueDetails = await Promise.all(
      studentIds.map(async (studentId, index) => {
        const studentDoc = await firestore.collection('students').doc(studentId).get();
        if (!studentDoc.exists) return null;
        
        const studentData = studentDoc.data();
        if (!studentData) return null;

        const isSibling = studentIds.length > 1 && index > 0;
        const { due } = calculateDues(studentData, feeSettings, isSibling);
        
        return { id: studentId, due, ref: studentDoc.ref };
      })
    );

    let childrenWithDues = studentDueDetails.filter(s => s && s.due > 0) as { id: string; due: number; ref: FirebaseFirestore.DocumentReference }[];
    let paymentDistribution = distributePayment(totalPayment, childrenWithDues);
    
    for (const studentId in paymentDistribution) {
        const paidAmount = Math.round(paymentDistribution[studentId] * 100) / 100;
        if (paidAmount > 0) {
            const newPayment = {
                id: `${new Date().getTime().toString()}-${studentId}`,
                amount: paidAmount,
                method: method,
                date: date,
                months: months || [],
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
    return { success: true, message: `Combined payment of Rs ${totalPayment} recorded successfully.` };
  } catch (error) {
    console.error('Error in combined payment:', error);
    return { success: false, message: 'An unexpected error occurred during combined payment.' };
  }
}

function calculateDues(studentData: any, feeSettings: any, isSibling: boolean) {
    const { feeStructure, sessionStartDate, siblingDiscount = 0 } = feeSettings;
    const classFeeStructure = feeStructure[studentData.class] || {};
    const studentFeeOverrides = studentData.feeStructure || {};
    const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

    const totalPaid = (studentData.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0);
    const totalAnnualFee = calculateTotalAnnualFee(finalFeeStructure);

    let totalMonthlyFee = 0;
    for (const head of MONTHLY_FEE_HEADS) {
        totalMonthlyFee += finalFeeStructure[head] || 0;
    }
    
    const annualOnlyFees = totalAnnualFee - (totalMonthlyFee * 12) + (finalFeeStructure.discount || 0);
    
    let monthlyFeeForDueCalc = totalMonthlyFee;
    if (isSibling && siblingDiscount > 0) {
        monthlyFeeForDueCalc -= siblingDiscount;
    }

    const start = new Date(sessionStartDate);
    const now = new Date();
    let monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
    monthsPassed = Math.max(0, monthsPassed);

    const totalExpectedFee = annualOnlyFees + (monthlyFeeForDueCalc * monthsPassed);
    const due = totalExpectedFee - totalPaid;
    return { due: Math.max(0, due) };
}

function distributePayment(totalPayment: number, childrenWithDues: { id: string; due: number }[]) {
    let paymentDistribution: { [studentId: string]: number } = {};
    let remainingPayment = totalPayment;

    // First pass: Pay off dues proportionally
    let totalDue = childrenWithDues.reduce((acc, s) => acc + s.due, 0);
    if (totalDue > 0) {
        for (const student of childrenWithDues) {
            const proportionalShare = (student.due / totalDue) * remainingPayment;
            const amountToPay = Math.min(student.due, proportionalShare);
            paymentDistribution[student.id] = amountToPay;
        }
    }
    
    let paidSoFar = Object.values(paymentDistribution).reduce((acc, val) => acc + val, 0);
    remainingPayment -= paidSoFar;

    // Second pass: if there's remaining payment, distribute it among those still with dues
    if (remainingPayment > 0) {
        let remainingChildren = childrenWithDues.filter(s => (paymentDistribution[s.id] || 0) < s.due);
        while(remainingPayment > 0.01 && remainingChildren.length > 0) {
            const amountPerChild = remainingPayment / remainingChildren.length;
            for (let i = remainingChildren.length - 1; i >= 0; i--) {
                const student = remainingChildren[i];
                const dueAfterInitialPayment = student.due - (paymentDistribution[student.id] || 0);
                const paymentToAdd = Math.min(amountPerChild, dueAfterInitialPayment);
                
                paymentDistribution[student.id] = (paymentDistribution[student.id] || 0) + paymentToAdd;
                remainingPayment -= paymentToAdd;
                
                if (paymentDistribution[student.id] >= student.due) {
                    remainingChildren.splice(i, 1);
                }
            }
        }
    }
    return paymentDistribution;
}
