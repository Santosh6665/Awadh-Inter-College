
import type { Student } from './types';

const defaultMultipliers = {
    tuition: 12,
    transport: 12,
    computer: 12,
    admission: 1,
    exam: 3, // Hardcoded to 3
    miscellaneous: 1,
};


/**
 * Calculates the total annual fee based on the defined multipliers.
 * Student-specific discounts are included.
 * @param finalFeeStructure The combined fee structure for the student.
 * @param multipliers The fee multipliers from settings.
 * @returns The total annual fee.
 */
function calculateTotalAnnualFee(finalFeeStructure: any, multipliers: any) {
  let totalAnnualFee = 0;
  // Ensure exam multiplier is always 3, overriding any saved setting.
  const currentMultipliers = { ...defaultMultipliers, ...multipliers, exam: 3 };

  // Dynamically calculate fees based on multipliers
  for (const head in currentMultipliers) {
      totalAnnualFee += (finalFeeStructure[head] || 0) * (currentMultipliers[head] || 0);
  }

  // Student-specific discount is subtracted from the total annual fee
  totalAnnualFee -= finalFeeStructure.discount || 0;
  
  return totalAnnualFee;
}

/**
 * Calculates the total annual due, total annual fee, and total paid for a student.
 * @param student The student object.
 * @param feeSettings The school's fee settings, including feeStructure.
 * @returns An object with due, totalAnnualFee, and totalPaid amounts.
 */
export function calculateAnnualDue(
  student: Student,
  feeSettings: any
) {
  const { feeStructure = {}, feeMultipliers = {} } = feeSettings || {};

  // Separate payments from carried-over dues
  const actualPayments = (student.payments || []).filter(p => p.amount >= 0);
  const carriedOverDues = (student.payments || []).filter(p => p.amount < 0);

  const totalPaid = actualPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCarriedOverDue = carriedOverDues.reduce((acc, p) => acc + Math.abs(p.amount), 0);


  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

  const combinedMultipliers = { ...defaultMultipliers, ...feeMultipliers };
  let totalAnnualFee = calculateTotalAnnualFee(finalFeeStructure, combinedMultipliers);
  
  // The total amount to be paid for this session is the session's fee plus any old dues
  const totalObligation = totalAnnualFee + totalCarriedOverDue;
  
  const due = totalObligation - totalPaid;

  return {
    due: Math.max(0, due), // Due amount cannot be negative
    totalAnnualFee: Math.max(0, totalObligation), // This now represents the total amount to be paid this year
    totalPaid,
    paid: totalPaid,
  };
}
