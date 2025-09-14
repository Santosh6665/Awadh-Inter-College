

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
  physics?: number;
  chemistry?: number;
  maths?: number;
  english?: number;
  computerScience?: number;
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
    feeStatus?: 'Paid' | 'Due' | 'Overdue';
    amountDue?: number;
    marks?: Marks;
};

export type Teacher = {
    id: string;
    name: string;
    email: string;
    subject: string;
    phone: string;
    photoUrl?: string;
};

export type AttendanceRecord = {
    studentId: string;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent' | 'Late';
};
