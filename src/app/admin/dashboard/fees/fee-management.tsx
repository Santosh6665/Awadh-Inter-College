
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentFeeManagement } from './student-fee-management';
import { ParentFeeManagement } from './parent-fee-management';
import type { Student } from '@/lib/types';

interface FeeManagementProps {
  students: Student[];
  feeSettings: any;
}

export function FeeManagement({ students, feeSettings }: FeeManagementProps) {
  return (
    <Tabs defaultValue="by-student" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="by-student">Manage by Student</TabsTrigger>
        <TabsTrigger value="by-parent">Manage by Parent</TabsTrigger>
      </TabsList>
      <TabsContent value="by-student" className="mt-4">
        <StudentFeeManagement students={students} feeSettings={feeSettings} />
      </TabsContent>
      <TabsContent value="by-parent" className="mt-4">
        <ParentFeeManagement students={students} feeSettings={feeSettings} />
      </TabsContent>
    </Tabs>
  );
}
