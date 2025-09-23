
'use client';

import { ParentFeeManagement } from './parent-fee-management';
import type { Student } from '@/lib/types';

interface FeeManagementProps {
  students: Student[];
  feeSettings: any;
}

export function FeeManagement({ students, feeSettings }: FeeManagementProps) {
  return (
    <ParentFeeManagement students={students} feeSettings={feeSettings} />
  );
}
