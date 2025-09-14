import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

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
  {
    title: 'Library Books Return Deadline',
    date: 'August 5, 2024',
    category: 'General',
    description: 'All students are reminded to return any overdue library books by August 15th to avoid fines. '
  }
];

export default function NoticesPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Notice Board</CardTitle>
              <CardDescription>Latest announcements and notices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notices.map((notice, index) => (
                  <div key={index}>
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold">{notice.title}</h3>
                        <Badge variant={notice.category === 'Academics' ? 'default' : notice.category === 'Event' ? 'secondary' : 'outline'}>
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
      </main>
      <Footer />
    </div>
  );
}
