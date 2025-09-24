
'use client';

import { ParentFeeManagement } from './parent-fee-management';
import type { Student } from '@/lib/types';

interface FeeManagementProps {
  students: Student[];
  feeSettings: any;
  selectedSession: string;
}

export function FeeManagement({ students, feeSettings, selectedSession }: FeeManagementProps) {
  return (
    <ParentFeeManagement students={students} feeSettings={feeSettings} selectedSession={selectedSession} />
  );
}
