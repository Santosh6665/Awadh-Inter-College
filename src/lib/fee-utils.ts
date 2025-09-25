
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
 * Calculates the total annual fee for a student based on their fee structure.
 * @param finalFeeStructure The combined class and student-specific fee structure.
 * @param multipliers The fee multipliers from settings.
 * @returns The total annual fee.
 */
function calculateCurrentSessionFee(finalFeeStructure: any, multipliers: any) {
  let totalAnnualFee = 0;
  const currentMultipliers = { ...defaultMultipliers, ...multipliers, exam: 3 };

  for (const head in currentMultipliers) {
      totalAnnualFee += (finalFeeStructure[head] || 0) * (currentMultipliers[head] || 0);
  }

  totalAnnualFee -= finalFeeStructure.discount || 0;
  return totalAnnualFee;
}

/**
 * Calculates the annual due for a single student for their enrolled session.
 * @param student The student object.
 * @param feeSettings The school's fee settings.
 * @returns An object with due, totalAnnualFee, and totalPaid amounts.
 */
export function calculateAnnualDue(
  student: Student,
  feeSettings: any,
) {
  const { feeStructure = {}, feeMultipliers = {} } = feeSettings || {};

  const relevantPayments = student.payments || [];
  const totalPaid = relevantPayments.reduce((acc, p) => acc + p.amount, 0);
  
  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

  const combinedMultipliers = { ...defaultMultipliers, ...feeMultipliers };
  const totalAnnualFee = calculateCurrentSessionFee(finalFeeStructure, combinedMultipliers);
  
  const due = totalAnnualFee - totalPaid;

  return {
    due: Math.max(0, due),
    totalAnnualFee: Math.max(0, totalAnnualFee),
    totalPaid,
  };
}
