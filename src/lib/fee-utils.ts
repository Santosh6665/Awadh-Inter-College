
import type { Student } from './types';

// Defines which fee heads are considered monthly recurring costs
const MONTHLY_FEE_HEADS = ['tuition', 'transport', 'computer'];
// Defines which fee heads are considered one-time or annual costs
const ANNUAL_FEE_HEADS = ['admission', 'miscellaneous'];

/**
 * Calculates the total annual fee based on the defined multipliers.
 * Student-specific discounts are included, but sibling discounts are not,
 * as they apply to the monthly due amount, not the gross annual fee.
 * @param finalFeeStructure The combined fee structure for the student.
 * @returns The total annual fee.
 */
function calculateTotalAnnualFee(finalFeeStructure: any) {
  let totalAnnualFee = 0;

  // Monthly fees (x12)
  for (const head of MONTHLY_FEE_HEADS) {
    totalAnnualFee += (finalFeeStructure[head] || 0) * 12;
  }

  // Annual fees (x1)
  for (const head of ANNUAL_FEE_HEADS) {
    totalAnnualFee += finalFeeStructure[head] || 0;
  }
  
  // Exam fee (x3)
  totalAnnualFee += (finalFeeStructure.exam || 0) * 3;

  // Student-specific discount is subtracted from the total annual fee
  totalAnnualFee -= finalFeeStructure.discount || 0;
  
  return totalAnnualFee;
}


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

  const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);

  if (!feeStructure || !sessionStartDate) {
    return { due: 0, totalAnnualFee: 0, totalPaid, paid: totalPaid };
  }

  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };
  
  // Calculate the gross total annual fee without the sibling discount
  const totalAnnualFee = calculateTotalAnnualFee(finalFeeStructure);

  // Calculate total monthly recurring amount
  let totalMonthlyFee = 0;
  for (const head of MONTHLY_FEE_HEADS) {
    totalMonthlyFee += finalFeeStructure[head] || 0;
  }
  
  const annualOnlyFees = totalAnnualFee - (totalMonthlyFee * 12) + (finalFeeStructure.discount || 0);
  
  // Apply sibling discount to the monthly fee if applicable for due calculation
  let monthlyFeeForDueCalc = totalMonthlyFee;
  if (isSibling && siblingDiscount > 0) {
    monthlyFeeForDueCalc -= siblingDiscount;
  }
  
  // Calculate how many months have passed since the session start date
  const start = new Date(sessionStartDate);
  const now = new Date();
  let monthsPassed = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
  monthsPassed = Math.max(0, monthsPassed); // Ensure it's not negative

  // Total expected fee is the sum of one-time fees plus the recurring fees (with sibling discount) for the months passed
  const totalExpectedFee = annualOnlyFees + (monthlyFeeForDueCalc * monthsPassed);
  
  const due = totalExpectedFee - totalPaid;

  return { 
    due: Math.max(0, due), // Due amount cannot be negative
    totalAnnualFee, 
    totalPaid,
    paid: totalPaid // Keep 'paid' for backward compatibility in some components
  };
}


/**
 * Calculates the total annual due, total annual fee, and total paid for a student.
 * @param student The student object.
 * @param feeSettings The school's fee settings, including feeStructure.
 * @param isSibling A boolean indicating if the student is a sibling (eligible for discount).
 * @returns An object with due, totalAnnualFee, and totalPaid amounts.
 */
export function calculateAnnualDue(
  student: Student,
  feeSettings: any,
  isSibling: boolean
) {
  const { feeStructure, siblingDiscount = 0 } = feeSettings;

  const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);

  if (!feeStructure) {
    return { due: 0, totalAnnualFee: 0, totalPaid, paid: totalPaid };
  }

  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

  let totalAnnualFee = calculateTotalAnnualFee(finalFeeStructure);

  // If student is a sibling, apply the sibling discount for 12 months
  if (isSibling && siblingDiscount > 0) {
    totalAnnualFee -= siblingDiscount * 12;
  }
  
  const due = totalAnnualFee - totalPaid;

  return {
    due: Math.max(0, due), // Due amount cannot be negative
    totalAnnualFee: Math.max(0, totalAnnualFee),
    totalPaid,
    paid: totalPaid,
  };
}
