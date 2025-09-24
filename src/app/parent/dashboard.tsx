
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, ExamTypes, Parent } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentDashboard } from '@/app/student/dashboard';
import { useMemo, useState, useEffect } from 'react';
import { Banknote, Users, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { calculateAnnualDue } from '@/lib/fee-utils';
import { Button } from '@/components/ui/button';
import { CombinedFeeHistoryDialog } from '@/app/parent/combined-fee-history-dialog';
import { getChildDataForSession } from './actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type ChildData = {
  student: Student;
  ranks: { [key in ExamTypes]?: number | null };
  attendance: AttendanceRecord[];
};

interface ParentDashboardProps {
  parent: { id: string; type: string; name: string };
  childrenWithDetails: ChildData[];
  settings: any;
  allSessions: string[];
}

export function ParentDashboard({ parent, childrenWithDetails: initialChildren, settings, allSessions }: ParentDashboardProps) {
  const [isCombinedHistoryOpen, setIsCombinedHistoryOpen] = useState(false);
  
  const [allChildrenData, setAllChildrenData] = useState<Record<string, ChildData>>(() => {
    const initialData: Record<string, ChildData> = {};
    initialChildren.forEach(child => {
      initialData[child.student.id] = child;
    });
    return initialData;
  });
  
  const [loadingStates, setLoadingStates] = useState<{[key: string]: boolean}>({});

  const firstChildRollNumber = initialChildren[0]?.student.rollNumber || '';
  const [activeChildRollNumber, setActiveChildRollNumber] = useState(firstChildRollNumber);
  
  const [selectedSessionPerChild, setSelectedSessionPerChild] = useState<Record<string, string>>(() => {
    const initialState: Record<string, string> = {};
    initialChildren.forEach(child => {
        initialState[child.student.rollNumber] = child.student.session;
    });
    return initialState;
  });

  const activeChildSession = selectedSessionPerChild[activeChildRollNumber];
  const activeChildId = `${activeChildRollNumber}-${activeChildSession}`;
  const activeChildData = allChildrenData[activeChildId];
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const handleSessionChange = async (rollNumber: string, session: string) => {
    const newStudentId = `${rollNumber}-${session}`;
    setSelectedSessionPerChild(prev => ({...prev, [rollNumber]: session}));

    if (!allChildrenData[newStudentId]) {
        setLoadingStates(prev => ({...prev, [newStudentId]: true}));
        const newChildData = await getChildDataForSession(rollNumber, session);
        if(newChildData) {
            setAllChildrenData(prev => ({...prev, [newStudentId]: newChildData as ChildData}));
        }
        setLoadingStates(prev => ({...prev, [newStudentId]: false}));
    }
  };

  const parentDataForDialog: Parent | null = useMemo(() => {
    const sessionForDialog = selectedSessionPerChild[activeChildRollNumber];
    if (!sessionForDialog) return null;
    
    // Get all unique children records across all fetched sessions
    const allUniqueChildrenRecords = Object.values(
      initialChildren.reduce((acc, child) => {
        acc[child.student.rollNumber] = child.student;
        return acc;
      }, {} as Record<string, Student>)
    );

    let totalFees = 0;
    let totalPaid = 0;
    let totalDue = 0;

    allUniqueChildrenRecords.forEach((child) => {
      // Find the specific session record for the child if it exists
      const sessionSpecificId = `${child.rollNumber}-${sessionForDialog}`;
      const studentForCalc = allChildrenData[sessionSpecificId]?.student || child;

      const { due, totalAnnualFee, totalPaid: paid } = calculateAnnualDue(studentForCalc, settings, sessionForDialog);
      totalDue += due;
      totalFees += totalAnnualFee;
      totalPaid += paid;
    });
    
    return {
      id: parent.id,
      parentName: parent.name,
      children: allUniqueChildrenRecords,
      totalFees,
      totalPaid,
      totalDue,
    };
  }, [activeChildRollNumber, selectedSessionPerChild, allChildrenData, initialChildren, parent, settings]);

  const childrenNames = initialChildren.map(c => c.student.name).join(', ');

  return (
    <>
      <CombinedFeeHistoryDialog
        isOpen={isCombinedHistoryOpen}
        setIsOpen={setIsCombinedHistoryOpen}
        parent={parentDataForDialog}
        feeSettings={settings}
        selectedSession={activeChildData ? selectedSessionPerChild[activeChildData.student.rollNumber] : ''}
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
                      {parentDataForDialog && parentDataForDialog.totalDue > 0 && (
                           <Alert variant="destructive" className="mt-2">
                              <Banknote className="h-4 w-4" />
                              <AlertTitle>Outstanding Balance</AlertTitle>
                              <AlertDescription>
                                  The total pending fee for your children is <strong>Rs{parentDataForDialog.totalDue.toFixed(2)}</strong>. Please see payment instructions below.
                              </AlertDescription>
                          </Alert>
                      )}
                  </div>
                  {initialChildren.length > 1 && (
                    <Button onClick={() => setIsCombinedHistoryOpen(true)}>
                        <Users className="mr-2 h-4 w-4" />
                        View Family Summary
                    </Button>
                  )}
              </CardHeader>
              <CardContent>
                   <Tabs defaultValue={firstChildRollNumber} className="w-full" onValueChange={setActiveChildRollNumber}>
                      <div className="flex flex-col md:flex-row gap-4 mb-6 print-hidden">
                          <TabsList className="w-full justify-start overflow-x-auto whitespace-nowrap md:w-auto">
                              {initialChildren.map(child => (
                                  <TabsTrigger key={child.student.rollNumber} value={child.student.rollNumber}>{child.student.name}</TabsTrigger>
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
                      {initialChildren.map(child => {
                        const childSession = selectedSessionPerChild[child.student.rollNumber];
                        const childIdForSession = `${child.student.rollNumber}-${childSession}`;
                        const childDataForSelectedSession = allChildrenData[childIdForSession];
                        
                        return (
                          <TabsContent key={child.student.rollNumber} value={child.student.rollNumber} className="mt-6">
                            <div className="flex justify-end items-center gap-2 mb-4">
                               <span className="text-sm font-medium">Viewing Session:</span>
                               <Select
                                value={selectedSessionPerChild[child.student.rollNumber]}
                                onValueChange={(session) => handleSessionChange(child.student.rollNumber, session)}
                               >
                                 <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Session" />
                                 </SelectTrigger>
                                 <SelectContent>
                                    {allSessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                 </SelectContent>
                               </Select>
                            </div>
                             {loadingStates[childIdForSession] ? (
                                <div className="flex justify-center items-center h-96">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                             ) : childDataForSelectedSession ? (
                                <StudentDashboard
                                    student={childDataForSelectedSession.student}
                                    ranks={childDataForSelectedSession.ranks}
                                    attendance={childDataForSelectedSession.attendance}
                                    settings={settings}
                                    allSessions={allSessions}
                                    isParentView={true}
                                />
                             ): (
                               <div className="flex justify-center items-center h-96">
                                    <p>Could not load data for this session.</p>
                                </div>
                             )}
                          </TabsContent>
                        )
                      })}
                  </Tabs>
              </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
