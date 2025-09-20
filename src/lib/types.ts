

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
    // Password should not be sent to client, but exists in DB
    password?: string; 
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
    id: string; // Composite key like YYYY-MM-DD_studentId
    studentId: string;
    studentName: string;
    class: string;
    section: string;
    date: string; // YYYY-MM-DD
    status: 'Present' | 'Absent' | 'Late';
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
