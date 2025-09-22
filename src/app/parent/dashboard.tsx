'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, ExamTypes } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentDashboard } from '@/app/student/dashboard';
import { useMemo } from 'react';

interface ParentDashboardProps {
  parent: { id: string; type: string; name: string };
  childrenWithDetails: (Student & { ranks: { [key in ExamTypes]?: number | null }, attendance: AttendanceRecord[] })[];
  settings: any;
}

export function ParentDashboard({ parent, childrenWithDetails, settings }: ParentDashboardProps) {

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const totalDue = useMemo(() => {
    const feeSettings = settings?.feeStructure || {};
    return childrenWithDetails.reduce((parentTotal, student) => {
        const classFeeStructure = feeSettings[student.class] || {};
        const studentFeeOverrides = student.feeStructure || {};
        const finalFeeStructure = { ...classFeeStructure, ...studentFeeOverrides };

        const { tuition = 0, admission = 0, transport = 0, exam = 0, computer = 0, miscellaneous = 0, discount = 0 } = finalFeeStructure;
        const totalFees = (tuition + admission + transport + exam + computer + miscellaneous) - discount;
        const totalPaid = (student.payments || []).reduce((acc, p) => acc + p.amount, 0);
        const due = totalFees - totalPaid;
        return parentTotal + due;
    }, 0);
  }, [childrenWithDetails, settings]);

  const childrenNames = childrenWithDetails.map(c => c.name).join(', ');

  return (
    <div id="parent-dashboard" className="bg-muted/50">
      <div className="container mx-auto py-8">
        <Card className="min-h-screen">
            <CardHeader className="relative flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 print-hidden gap-4">
                 <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
                    <AvatarFallback>{getInitials(parent.name)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                    <CardTitle className="text-2xl md:text-3xl">Welcome, {parent.name}</CardTitle>
                    <CardDescription className="text-base">
                        Viewing dashboard for: {childrenNames}. 
                        <span className="font-bold ml-4">Total Due: Rs{totalDue.toFixed(2)}</span>
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                 <Tabs defaultValue={childrenWithDetails[0].id} className="w-full">
                    <TabsList className="w-full justify-start print-hidden overflow-x-auto whitespace-nowrap">
                        {childrenWithDetails.map(child => (
                            <TabsTrigger key={child.id} value={child.id}>{child.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {childrenWithDetails.map(child => (
                        <TabsContent key={child.id} value={child.id} className="mt-6">
                            <StudentDashboard
                                student={child}
                                ranks={child.ranks}
                                attendance={child.attendance}
                                forcePasswordReset={false} // Parents don't reset passwords this way
                                settings={settings}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
