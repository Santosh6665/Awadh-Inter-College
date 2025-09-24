
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
function calculateCurrentSessionFee(finalFeeStructure: any, multipliers: any) {
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
 * Can be scoped to a specific session for historical views.
 * @param student The student object for a specific session.
 * @param feeSettings The school's fee settings.
 * @param asOfSession The session to calculate fees for. If not provided, uses the student's session.
 * @returns An object with due, totalAnnualFee, totalPaid, and previousSessionDue amounts.
 */
export function calculateAnnualDue(
  student: Student,
  feeSettings: any,
  asOfSession?: string
) {
  const { feeStructure = {}, feeMultipliers = {} } = feeSettings || {};
  const targetSession = asOfSession || student.session;

  // Payments and dues only relevant to the target session and prior.
  const relevantPayments = (student.payments || []).filter(p => {
    // A simple way to check if payment belongs to the session or is a carry-over.
    // This assumes carry-over entries are made correctly.
    // A payment date could also be used but session is more explicit.
    if (p.months?.some(m => m.includes('Due from'))) {
      const dueFromSession = p.months[0].replace('Due from ', '');
      return dueFromSession < targetSession;
    }
    // For regular payments, we'd need to associate them with a session,
    // which we're not doing explicitly. We'll rely on the student record's session.
    // This means we should only pass the student object for the session we're interested in.
    return true; 
  });


  const actualPayments = relevantPayments.filter(p => p.amount >= 0);
  const carriedOverDues = relevantPayments.filter(p => p.amount < 0);

  const totalPaid = actualPayments.reduce((acc, p) => acc + p.amount, 0);
  const previousSessionDue = carriedOverDues.reduce((acc, p) => acc + Math.abs(p.amount), 0);

  // If we are viewing a session that the student is not in, they have no new fees for that session.
  if (student.session !== targetSession) {
    return {
      due: Math.max(0, previousSessionDue - totalPaid),
      totalAnnualFee: 0,
      totalPaid,
      previousSessionDue,
    };
  }

  const classFeeStructure = feeStructure[student.class] || {};
  const studentFeeOverrides = student.feeStructure || {};
  const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

  const combinedMultipliers = { ...defaultMultipliers, ...feeMultipliers };
  let totalAnnualFee = calculateCurrentSessionFee(finalFeeStructure, combinedMultipliers);
  
  const totalObligation = totalAnnualFee + previousSessionDue;
  
  const due = totalObligation - totalPaid;

  return {
    due: Math.max(0, due),
    totalAnnualFee: Math.max(0, totalAnnualFee),
    totalPaid,
    previousSessionDue,
  };
}
