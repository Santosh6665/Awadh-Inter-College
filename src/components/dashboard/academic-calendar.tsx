'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { calendarEvents } from '@/lib/data';
import type { CalendarEvent } from '@/lib/types';
import { format } from 'date-fns';

export function AcademicCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const eventDates = calendarEvents.map((event) => event.date);

  const upcomingEvents = calendarEvents
    .filter((event) => event.date >= new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 3);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-6 w-6 text-accent" />
          Academic Calendar
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col items-center gap-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
          modifiers={{ events: eventDates }}
          modifiersClassNames={{
            events: 'bg-primary/20 text-primary rounded-full',
          }}
        />
        <div className="w-full space-y-2">
          <h4 className="font-semibold">Upcoming Events:</h4>
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event, index) => (
              <div key={index} className="text-sm p-2 rounded-md bg-secondary/50">
                <p className="font-medium">{event.title}</p>
                <p className="text-muted-foreground">{format(event.date, 'PPP')}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming events.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
