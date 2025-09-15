
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';

const notices = [
  {
    title: 'Mid-term Examination Schedule',
    date: 'August 12, 2024',
    category: 'Academics',
    description: 'The schedule for the upcoming mid-term examinations has been released. Please check the notice board for detailed timings and subjects.'
  },
  {
    title: 'Annual Sports Day Postponed',
    date: 'August 10, 2024',
    category: 'Event',
    description: 'The Annual Sports Day, originally scheduled for August 20th, has been postponed due to unforeseen circumstances. A new date will be announced shortly.'
  },
];

export default function NoticesCalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Notices</CardTitle>
            <CardDescription>Latest announcements and updates.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-6">
                {notices.map((notice, index) => (
                  <div key={index}>
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{notice.title}</h3>
                        <Badge variant={notice.category === 'Academics' ? 'default' : 'secondary'}>
                          {notice.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{notice.date}</p>
                    </div>
                    <p className="text-muted-foreground">{notice.description}</p>
                    {index < notices.length - 1 && <Separator className="mt-6" />}
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
            <CardHeader>
                <CardTitle>Event Calendar</CardTitle>
                <CardDescription>Upcoming school events.</CardDescription>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                />
                 <div className="mt-4 space-y-2 text-sm">
                    <p><span className="font-semibold">Sept 5:</span> Teacher's Day Celebration</p>
                    <p><span className="font-semibold">Sept 20:</span> Annual Sports Day</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
