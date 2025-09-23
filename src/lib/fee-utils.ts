
import type { Student } from './types';

const defaultMultipliers = {
    tuition: 12,
    transport: 12,
    computer: 12,
    admission: 1,
    exam: 1,
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
  const currentMultipliers = { ...defaultMultipliers, ...multipliers };

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
  const { feeStructure = {}, feeMultipliers = defaultMultipliers } = feeSettings;

  const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);

  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

  let totalAnnualFee = calculateTotalAnnualFee(finalFeeStructure, feeMultipliers);
  
  const due = totalAnnualFee - totalPaid;

  return {
    due: Math.max(0, due), // Due amount cannot be negative
    totalAnnualFee: Math.max(0, totalAnnualFee),
    totalPaid,
    paid: totalPaid,
  };
}

    