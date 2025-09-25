
'use client';

import * as React from 'react';
import type { Student, AttendanceRecord, ExamTypes } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StudentDashboard } from '@/app/student/dashboard';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
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

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };

  const handleSessionChange = async (rollNumber: string, session: string) => {
    const newStudentId = `${rollNumber}-${session}`;
    setSelectedSessionPerChild(prev => ({ ...prev, [rollNumber]: session }));

    if (!allChildrenData[newStudentId]) {
      setLoadingStates(prev => ({ ...prev, [newStudentId]: true }));
      try {
        const newChildData = await getChildDataForSession(rollNumber, session);
        if (newChildData) {
          setAllChildrenData(prev => ({ ...prev, [newStudentId]: newChildData as ChildData }));
        } else {
          console.warn(`No data found for student ${rollNumber} in session ${session}`);
        }
      } catch (error) {
        console.error("Error fetching session data:", error);
      } finally {
        setLoadingStates(prev => ({ ...prev, [newStudentId]: false }));
      }
    }
  };

  const childrenNames = initialChildren.map(c => c.student.name).join(', ');

  return (
    <>
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
                  </div>
              </CardHeader>
              <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {initialChildren.map(child => (
                            <Card key={child.student.id}>
                                <CardHeader className="flex flex-row items-center gap-4">
                                    <Avatar className="h-16 w-16 border">
                                        <AvatarImage src={child.student.photoURL} alt={child.student.name} />
                                        <AvatarFallback>{getInitials(child.student.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl">{child.student.name}</CardTitle>
                                        <CardDescription>
                                            Class: {child.student.className}-{child.student.section} | Roll No: {child.student.rollNumber}
                                        </CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
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
                        const childRollNumber = child.student.rollNumber;
                        const childSession = selectedSessionPerChild[childRollNumber];
                        const childIdForSession = `${childRollNumber}-${childSession}`;
                        const childDataForSelectedSession = allChildrenData[childIdForSession];
                        
                        return (
                          <TabsContent key={childRollNumber} value={childRollNumber} className="mt-6">
                            <div className="flex justify-end items-center gap-2 mb-4">
                               <span className="text-sm font-medium">Viewing Session:</span>
                               <Select
                                value={childSession}
                                onValueChange={(session) => handleSessionChange(childRollNumber, session)}
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
