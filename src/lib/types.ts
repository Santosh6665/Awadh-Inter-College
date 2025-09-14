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

export type FacultyMember = {
  id: string;
  name: string;
  department: string;
  title: string;
  email: string;
  phone: string;
};

export type ResourceLink = {
  id: string;
  title: string;
  url: string;
};
