
import type { Student } from './types';

// Defines which fee heads are considered monthly recurring costs
const MONTHLY_FEE_HEADS = ['tuition', 'transport'];
// Defines which fee heads are considered one-time or annual costs
const ANNUAL_FEE_HEADS = ['admission', 'exam', 'miscellaneous'];

/**
 * Calculates the monthly due, total annual fee, and total paid for a student.
 * @param student The student object.
 * @param feeSettings The school's fee settings, including feeStructure and sessionStartDate.
 * @param isSibling A boolean indicating if the student is a sibling (eligible for discount).
 * @returns An object with due, totalAnnualFee, and totalPaid amounts.
 */
export function calculateMonthlyDue(
  student: Student,
  feeSettings: any,
  isSibling: boolean
) {
  const { feeStructure, sessionStartDate, siblingDiscount = 0 } = feeSettings;

  if (!feeStructure || !sessionStartDate) {
    // Return zero values if settings are incomplete to avoid crashes
    const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
    return { due: 0, totalAnnualFee: 0, totalPaid, paid: totalPaid };
  }

  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

  // Calculate total monthly and annual fees from the fee structure
  let totalMonthlyFee = 0;
  let totalAnnualFee = 0;

  for (const head of MONTHLY_FEE_HEADS) {
    totalMonthlyFee += finalFeeStructure[head] || 0;
  }
  for (const head of ANNUAL_FEE_HEADS) {
    totalAnnualFee += finalFeeStructure[head] || 0;
  }
  
  // Apply sibling discount to the monthly fee if applicable
  if (isSibling && siblingDiscount > 0) {
    totalMonthlyFee -= siblingDiscount;
  }
  
  // A student-specific discount is applied annually
  totalAnnualFee -= finalFeeStructure.discount || 0;
  
  // The full annual fee is the sum of one-time fees plus 12 months of recurring fees
  totalAnnualFee += totalMonthlyFee * 12;

  // Calculate how many months have passed since the session start date
  const start = new Date(sessionStartDate);
  const now = new Date();
  let monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
  monthsPassed = Math.max(0, monthsPassed); // Ensure it's not negative

  // Total expected fee is the sum of one-time fees plus the recurring fees for the months passed
  const totalExpectedFee = (totalAnnualFee - (totalMonthlyFee * 12)) + (totalMonthlyFee * monthsPassed);
  
  const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
  const due = totalExpectedFee - totalPaid;

  return { 
    due: Math.max(0, due), // Due amount cannot be negative
    totalAnnualFee, 
    totalPaid,
    paid: totalPaid // Keep 'paid' for backward compatibility in some components
  };
}
