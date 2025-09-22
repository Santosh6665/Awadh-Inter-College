
import { z } from 'zod';

export type NewsArticle = {
  id: string;
  title: string;
  summary: string;
  date: string;
  category: string;
};

export type CalendarEvent = {
  date: Date;
  title: string;
  description: string;
};

export type Marks = {
  oral?: number;
  englishOral?: number;
  english?: number;
  hindiOral?: number;
  hindi?: number;
  mathematicsOral?: number;
  mathematics?: number;
  science?: number;
  computer?: number;
  socialScience?: number;
  art?: number;
  homeScience?: number;
  physics?: number;
  chemistry?: number;
  biology?: number;
};

export type ExamTypes = 'quarterly' | 'halfYearly' | 'annual';

export type FeeStructure = {
  tuition?: number;
  transport?: number;
  exam?: number;
  computer?: number;
  miscellaneous?: number;
  admission?: number;
  discount?: number;
  discountType?: 'percentage' | 'fixed';
  paymentPlan?: 'monthly' | 'quarterly' | 'yearly';
};

export type Payment = {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Card' | 'Online';
  month?: string;
};


export type Student = {
    id: string;
    name: string;
    email: string;
    rollNumber: string;
    class: string;
    section: string;
    dob: string;
    phone: string;
    fatherName: string;
    address: string;
    photoUrl?: string;
    marks?: {
      quarterly?: Marks;
      halfYearly?: Marks;
      annual?: Marks;
    };
    // Password should not be sent to client, but exists in DB
    password?: string;
    feeStructure?: FeeStructure;
    payments?: Payment[];
};

export type SalaryPayment = {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Bank Transfer' | 'Cheque';
  month?: string;
};

export type Teacher = {
    id: string;
    name: string;
    email: string;
    subject: string;
    phone: string;
    photoUrl?: string;
    dob?: string;
    qualification?: string;
    password?: string;
    baseSalary?: number;
    salaryPayments?: SalaryPayment[];
    canEditAttendance?: boolean;
    canEditResults?: boolean;
    isTeacher?: boolean;
};

export type Book = {
    id: string;
    title: string;
    author: string;
    status: 'Available' | 'Issued';
    issuedTo?: string; // Student ID
    issuedToName?: string;
};

export type BusRoute = {
    id: string;
    routeNumber: string;
    driverName: string;
    driverPhone: string;
    capacity: number;
};

export type AttendanceRecord = {
  date: string;
  status: 'present' | 'absent';
};

export type Notice = {
  id: string;
  title: string;
  date: string;
  category: 'Academics' | 'Event' | 'General' | 'Holiday';
  description: string;
};
