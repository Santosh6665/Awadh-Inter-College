import type { NewsArticle, CalendarEvent, FacultyMember, ResourceLink } from './types';

export const newsFeed: NewsArticle[] = [
  {
    id: '1',
    title: 'Annual Sports Day Announced',
    summary: 'The annual sports day will be held on the 20th of next month. All students are invited to participate.',
    date: '2024-08-15',
    category: 'Event',
  },
  {
    id: '2',
    title: 'Mid-term Examinations Schedule',
    summary: 'The schedule for the upcoming mid-term examinations has been released. Please check the notice board.',
    date: '2024-08-12',
    category: 'Academics',
  },
  {
    id: '3',
    title: 'Guest Lecture on Quantum Physics',
    summary: 'Dr. Alok Nath will be giving a guest lecture on Quantum Physics this Friday. Open for all science students.',
    date: '2024-08-10',
    category: 'Academics',
  },
];

export const calendarEvents: CalendarEvent[] = [
  {
    date: new Date(2024, 8, 5),
    title: 'Mid-term Exams Start',
    description: 'Mid-term examinations for all classes will commence.',
  },
  {
    date: new Date(2024, 8, 20),
    title: 'Annual Sports Day',
    description: 'Annual inter-house sports competition.',
  },
  {
    date: new Date(2024, 9, 2),
    title: 'Gandhi Jayanti',
    description: 'Holiday on account of Gandhi Jayanti.',
  },
];

export const facultyDirectory: FacultyMember[] = [
  {
    id: 'f1',
    name: 'Dr. Ramesh Sharma',
    department: 'Physics',
    title: 'Head of Department',
    email: 'ramesh.sharma@anpcollege.edu',
    phone: '+91-9876543210',
  },
  {
    id: 'f2',
    name: 'Mrs. Sunita Verma',
    department: 'Chemistry',
    title: 'Senior Lecturer',
    email: 'sunita.verma@anpcollege.edu',
    phone: '+91-9876543211',
  },
  {
    id: 'f3',
    name: 'Mr. Anil Kumar',
    department: 'Mathematics',
    title: 'Lecturer',
    email: 'anil.kumar@anpcollege.edu',
    phone: '+91-9876543212',
  },
  {
    id: 'f4',
    name: 'Dr. Priya Singh',
    department: 'Biology',
    title: 'Lecturer',
    email: 'priya.singh@anpcollege.edu',
    phone: '+91-9876543213',
  },
];

export const resourceLinks: ResourceLink[] = [
  {
    id: 'r1',
    title: 'Academic Calendar 2024-25',
    url: '#',
  },
  {
    id: 'r2',
    title: 'Examination Timetable',
    url: '#',
  },
  {
    id: 'r3',
    title: 'Student Handbook',
    url: '#',
  },
  {
    id: 'r4',
    title: 'Library Portal',
    url: '#',
  },
];
