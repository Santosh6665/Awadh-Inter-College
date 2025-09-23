
'use server';

import { firestore } from '@/lib/firebase-admin';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import { calculateAnnualDue } from '@/lib/fee-utils';

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
    const batch = firestore.batch();

    const studentDocs = await Promise.all(
        studentIds.map(id => firestore.collection('students').doc(id).get())
    );

    const studentDueDetails = studentDocs.map((doc, index) => {
        if (!doc.exists) return null;
        const studentData = doc.data();
        if (!studentData) return null;
        
        // Determine if student is a sibling for discount purposes
        const dobMap = new Map(studentDocs.map(d => [d.id, d.data()?.dob]));
        const sortedSiblings = [...studentIds].sort((a, b) => new Date(dobMap.get(a)!).getTime() - new Date(dobMap.get(b)!).getTime());
        const isSibling = sortedSiblings.indexOf(doc.id) > 0;

        const { due } = calculateAnnualDue(studentData as any, feeSettings, isSibling);
        
        return { id: doc.id, due };
    }).filter(s => s && s.due > 0) as { id: string; due: number }[];

    let paymentDistribution = distributePayment(totalPayment, studentDueDetails);
    
    for (const studentId in paymentDistribution) {
        const paidAmount = paymentDistribution[studentId];
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


function distributePayment(
    totalPayment: number, 
    childrenWithDues: { id: string; due: number }[]
): { [studentId: string]: number } {
    const paymentDistribution: { [studentId: string]: number } = {};
    childrenWithDues.forEach(child => paymentDistribution[child.id] = 0);
    
    let remainingPayment = totalPayment;

    // Distribute payment iteratively to handle surpluses correctly
    let childrenStillWithDues = childrenWithDues.filter(c => c.due > 0);
    
    while (remainingPayment > 0.01 && childrenStillWithDues.length > 0) {
        const totalRemainingDue = childrenStillWithDues.reduce((acc, s) => acc + s.due, 0);
        if (totalRemainingDue <= 0) break;

        let surplus = 0;
        
        // Proportional distribution for this pass
        for (const student of childrenStillWithDues) {
            const proportionalShare = (student.due / totalRemainingDue) * remainingPayment;
            
            // Pay the smaller of the due amount or the proportional share
            const amountToPay = Math.min(student.due, proportionalShare);
            
            paymentDistribution[student.id] = (paymentDistribution[student.id] || 0) + amountToPay;
            student.due -= amountToPay;
        }

        const paidInThisPass = Object.values(paymentDistribution).reduce((acc, val) => acc + val, 0);
        remainingPayment = totalPayment - paidInThisPass;

        // Filter out children who are now fully paid
        const previouslyStillWithDuesCount = childrenStillWithDues.length;
        childrenStillWithDues = childrenStillWithDues.filter(s => s.due > 0.01);

        // Break if no progress is made to prevent infinite loops (e.g., due to rounding)
        if (childrenStillWithDues.length === previouslyStillWithDuesCount && remainingPayment > 0.01) {
             // If there's still money and children with dues, but no progress,
             // it might be due to rounding. Give the remainder to the child with the highest due.
            if (childrenStillWithDues.length > 0) {
                childrenStillWithDues.sort((a,b) => b.due - a.due);
                const amountToPay = Math.min(childrenStillWithDues[0].due, remainingPayment);
                paymentDistribution[childrenStillWithDues[0].id] += amountToPay;
            }
            break; // Exit after this forced allocation
        }
    }
    
    // Final rounding to 2 decimal places to avoid floating point issues
    for(const id in paymentDistribution) {
        paymentDistribution[id] = Math.round(paymentDistribution[id] * 100) / 100;
    }

    return paymentDistribution;
}
