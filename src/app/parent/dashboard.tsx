
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, ExamTypes, Parent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentDashboard } from '@/app/student/dashboard';
import { useMemo, useState } from 'react';
import { Banknote, Users } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { Button } from '@/components/ui/button';
import { CombinedFeeHistoryDialog } from '../admin/dashboard/fees/combined-fee-history-dialog';

interface ParentDashboardProps {
  parent: { id: string; type: string; name: string };
  childrenWithDetails: (Student & { ranks: { [key in ExamTypes]?: number | null }, attendance: AttendanceRecord[] })[];
  settings: any;
}

export function ParentDashboard({ parent, childrenWithDetails, settings }: ParentDashboardProps) {
  const [isCombinedHistoryOpen, setIsCombinedHistoryOpen] = useState(false);

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const parentData: Parent = useMemo(() => {
    let totalFees = 0;
    let totalPaid = 0;
    let totalDue = 0;

    childrenWithDetails.forEach((child) => {
      const { due, totalAnnualFee, paid } = calculateAnnualDue(child, settings);
      totalDue += due;
      totalFees += totalAnnualFee;
      totalPaid += paid;
    });

    return {
      id: parent.id,
      parentName: parent.name,
      children: childrenWithDetails,
      totalFees,
      totalPaid,
      totalDue,
    };
  }, [childrenWithDetails, parent, settings]);

  const childrenNames = childrenWithDetails.map(c => c.name).join(', ');

  return (
    <>
      <CombinedFeeHistoryDialog
        isOpen={isCombinedHistoryOpen}
        setIsOpen={setIsCombinedHistoryOpen}
        parent={parentData}
        feeSettings={settings}
      />
      <div id="parent-dashboard" className="bg-muted/50">
        <div className="container mx-auto py-8">
          <Card className="min-h-screen">
              <CardHeader className="relative flex flex-col md:flex-row items-start md:items-center p-4 md:p-6 print-hidden gap-4">
                   <Avatar className="h-20 w-20 md:h-24 md:w-24 border">
                      <AvatarFallback>{getInitials(parent.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                      <CardTitle className="text-2xl md:text-3xl">Welcome, {parent.name}</CardTitle>
                      <CardDescription className="text-base mt-1">
                          Viewing dashboard for: <span className="font-semibold">{childrenNames}</span>.
                      </CardDescription>
                      {parentData.totalDue > 0 && (
                           <Alert variant="destructive" className="mt-2">
                              <Banknote className="h-4 w-4" />
                              <AlertTitle>Outstanding Balance</AlertTitle>
                              <AlertDescription>
                                  The total pending fee for your children is <strong>Rs{parentData.totalDue.toFixed(2)}</strong>. Please see payment instructions below.
                              </AlertDescription>
                          </Alert>
                      )}
                  </div>
                  {childrenWithDetails.length > 1 && (
                    <Button onClick={() => setIsCombinedHistoryOpen(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Family Summary
                    </Button>
                  )}
              </CardHeader>
              <CardContent>
                   <Tabs defaultValue={childrenWithDetails[0].id} className="w-full">
                      <div className="flex flex-col md:flex-row gap-4 mb-6 print-hidden">
                          <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap md:w-auto">
                              {childrenWithDetails.map(child => (
                                  <TabsTrigger key={child.id} value={child.id}>{child.name}</TabsTrigger>
                              ))}
                          </TabsList>
                           <Card className="flex-1">
                              <CardContent className="p-4">
                                  <h4 className="font-semibold text-lg mb-2">How to Pay Fees</h4>
                                  <p className="text-sm text-muted-foreground">
                                      Online payment is not yet available. Please pay fees at the school office or contact us for bank transfer details.
                                  </p>
                              </CardContent>
                          </Card>
                      </div>
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
    </>
  );
}
