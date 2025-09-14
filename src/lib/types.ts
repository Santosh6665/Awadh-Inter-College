
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
};
