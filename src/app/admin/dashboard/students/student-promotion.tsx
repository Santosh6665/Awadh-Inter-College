
'use client';

import { useState, useMemo, useEffect } from 'react';
import type { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { promoteStudents } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];

export function StudentPromotion({ students, settings }: { students: Student[], settings: any }) {
  const [fromClass, setFromClass] = useState('');
  const [toClass, setToClass] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isPromoting, setIsPromoting] = useState(false);
  const { toast } = useToast();

  const [activeSession, setActiveSession] = useState(settings?.activeSession);
  const [nextSession, setNextSession] = useState(settings?.nextSession);

  // Effect to update sessions if settings change from the parent component
  useEffect(() => {
    setActiveSession(settings?.activeSession);
    setNextSession(settings?.nextSession);
  }, [settings]);

  const studentsToPromote = useMemo(() => {
    if (!fromClass || !activeSession || !nextSession) return [];
    
    // Filter students from the active session who are in the selected class
    return students
      .filter(s => 
        s.class === fromClass && 
        s.session === activeSession
      )
      .sort((a, b) => a.name.localeCompare(b.name));
      
  }, [students, fromClass, activeSession]);
  
  // When the class filter changes, reset the selection.
  useEffect(() => {
    setSelectedStudents([]);
  }, [fromClass]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudents(studentsToPromote.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };
  
  const handleSelectSingle = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const handlePromotion = async () => {
    if (selectedStudents.length === 0 || !toClass || !activeSession || !nextSession) {
      toast({
        title: 'Error',
        description: 'Please select students, a target class, and ensure sessions are configured correctly.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsPromoting(true);
    const result = await promoteStudents(selectedStudents, fromClass, toClass, activeSession, nextSession);
    
    if (result.success) {
      toast({
        title: 'Success',
        description: result.message,
      });
      setSelectedStudents([]);
    } else {
      toast({
        title: 'Promotion Failed',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsPromoting(false);
  };
  
  if (!activeSession || !nextSession) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Student Promotion Tool</CardTitle>
                <CardDescription>Promote students from one class to another for the next academic session.</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant="destructive">
                  <AlertTitle>Configuration Error</AlertTitle>
                  <AlertDescription>
                    Please set both an "Active Session" and a "Next Session" in the Settings {'>'} Sessions tab before you can promote students.
                  </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Promotion Tool</CardTitle>
        <CardDescription>Promote students from session <span className="font-bold">{activeSession}</span> to <span className="font-bold">{nextSession}</span>.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <Select value={fromClass} onValueChange={setFromClass}>
            <SelectTrigger>
              <SelectValue placeholder="Promote From Class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
            </SelectContent>
          </Select>
          <ArrowRight className="hidden md:block h-6 w-6 text-muted-foreground" />
          <Select value={toClass} onValueChange={setToClass}>
            <SelectTrigger>
              <SelectValue placeholder="Promote To Class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => <SelectItem key={c} value={c}>Class {c}</SelectItem>)}
              <SelectItem value="Pass Out">Pass Out</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedStudents.length === studentsToPromote.length && studentsToPromote.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Section</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsToPromote.length > 0 ? (
                studentsToPromote.map(student => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedStudents.includes(student.id)}
                        onCheckedChange={(checked) => handleSelectSingle(student.id, !!checked)}
                      />
                    </TableCell>
                    <TableCell>{student.rollNumber}</TableCell>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.section}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center h-24">
                    {fromClass ? 'No students available for promotion in this class.' : 'Please select a class to see students.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={handlePromotion} disabled={isPromoting || selectedStudents.length === 0}>
            {isPromoting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Promote {selectedStudents.length} Students
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
