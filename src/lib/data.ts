import type { NewsArticle, CalendarEvent } from './types';

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
