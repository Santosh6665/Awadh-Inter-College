
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
 * Helper function to get the previous session from a sorted list of sessions.
 * @param currentSession The session for which to find the previous one.
 * @param allSessions A list of all available sessions.
 * @returns The previous session string or null if none exists.
 */
function getPreviousSession(currentSession: string, allSessions: string[]): string | null {
    const sortedSessions = [...allSessions].sort();
    const currentIndex = sortedSessions.indexOf(currentSession);
    return currentIndex > 0 ? sortedSessions[currentIndex - 1] : null;
}

/**
 * Calculates the total annual fee for a student in a given session based on their fee structure.
 * @param finalFeeStructure The combined class and student-specific fee structure.
 * @param multipliers The fee multipliers from settings.
 * @returns The total annual fee for the current session.
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
 * Calculates the annual due for a single student.
 * This function can now accept an injected "previous session due" to support family-level due calculations.
 * If injectedPreviousSessionDue is provided, it is used instead of calculating from the student's payment history.
 *
 * @param student The student object.
 * @param feeSettings The school's fee settings.
 * @param asOfSession The session for which to calculate the due. Defaults to the student's session.
 * @param injectedPreviousSessionDue Optional. An amount to be treated as the due carried over from the previous session.
 * @returns An object with due, totalAnnualFee, totalPaid, and previousSessionDue amounts.
 */
export function calculateAnnualDue(
  student: Student,
  feeSettings: any,
  asOfSession?: string,
  injectedPreviousSessionDue?: number
) {
  const { feeStructure = {}, feeMultipliers = {} } = feeSettings || {};
  const targetSession = asOfSession || student.session;

  const relevantPayments = student.payments || [];
  const totalPaid = relevantPayments.reduce((acc, p) => acc + p.amount, 0);
  
  let previousSessionDue = 0;
  if (injectedPreviousSessionDue !== undefined) {
      previousSessionDue = injectedPreviousSessionDue;
  } else {
      // Fallback to old logic if no injected due is provided
      const carriedOverDues = (student.payments || []).filter(p => p.amount < 0);
      previousSessionDue = carriedOverDues.reduce((acc, p) => acc + Math.abs(p.amount), 0);
  }

  // If we are viewing a session that the student is not a part of, they only have liability from carried-over dues.
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
  const totalAnnualFee = calculateCurrentSessionFee(finalFeeStructure, combinedMultipliers);
  
  const totalObligation = totalAnnualFee + previousSessionDue;
  const due = totalObligation - totalPaid;

  return {
    due: Math.max(0, due),
    totalAnnualFee: Math.max(0, totalAnnualFee),
    totalPaid,
    previousSessionDue,
  };
}

/**
 * Implements the new family-wide due calculation logic.
 * It calculates the total outstanding due from the previous session for all children
 * and distributes it equally among the children present in the target session.
 *
 * @param allChildrenOfParent An array of all student objects for a parent, across all sessions.
 * @param feeSettings The school's fee settings.
 * @param targetSession The session for which to calculate the family dues.
 * @returns An object containing the total family due, a breakdown per child, and the total carried-over due.
 */
export function calculateFamilyDues(
  allChildrenOfParent: Student[],
  feeSettings: any,
  targetSession: string
) {
  const previousSession = getPreviousSession(targetSession, feeSettings.sessions || []);

  // 1. Calculate the family's total outstanding due from the previous session.
  let totalPreviousSessionDue = 0;
  if (previousSession) {
    const childrenInPreviousSession = allChildrenOfParent.filter(
      c => c.session === previousSession
    );

    let previousSessionTotalObligation = 0;
    let previousSessionTotalPaid = 0;

    childrenInPreviousSession.forEach(child => {
      // Here, we use the original calculateAnnualDue logic for the past session.
      const { totalAnnualFee, totalPaid, previousSessionDue } = calculateAnnualDue(child, feeSettings, previousSession);
      previousSessionTotalObligation += totalAnnualFee + previousSessionDue;
      // Sum up all payments made by the child in that session record.
      const paidInSession = (child.payments || []).reduce((acc, p) => acc + p.amount, 0);
      previousSessionTotalPaid += paidInSession;
    });

    totalPreviousSessionDue = Math.max(0, previousSessionTotalObligation - previousSessionTotalPaid);
  }

  // 2. Identify children active in the target session.
  const childrenInTargetSession = allChildrenOfParent.filter(
    c => c.session === targetSession
  );

  // 3. Distribute the total previous due equally among the children in the target session.
  const numChildrenInTarget = childrenInTargetSession.length;
  const previousDuePerChild = numChildrenInTarget > 0 ? totalPreviousSessionDue / numChildrenInTarget : 0;

  // 4. Calculate dues for each child in the target session, injecting the distributed previous due.
  const duesForTargetSession = childrenInTargetSession.map(child => {
    const { due, totalAnnualFee, totalPaid } = calculateAnnualDue(
        child,
        feeSettings,
        targetSession,
        previousDuePerChild // Inject the family-level carried-over due.
    );

    return {
      studentId: child.id,
      rollNumber: child.rollNumber,
      name: child.name,
      due,
      totalAnnualFee,
      totalPaid,
      carriedOverDue: previousDuePerChild
    };
  });

  // 5. Sum up the dues for the final family total.
  const totalFamilyDue = duesForTargetSession.reduce((acc, d) => acc + d.due, 0);

  return {
    totalFamilyDue,
    duesPerChild: duesForTargetSession,
    totalPreviousSessionDue,
  };
}
