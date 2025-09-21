
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getNotices } from '@/app/admin/dashboard/notices/actions';
import type { Notice } from '@/lib/types';

export default async function NoticesPage() {
  const notices: Notice[] = await getNotices();

  const getBadgeVariant = (category: string) => {
    switch (category) {
      case 'Academics':
        return 'default';
      case 'Event':
        return 'secondary';
      case 'Holiday':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
         <section className="bg-muted/50 py-12 md:py-20">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Notice Board</h1>
                <p className="mt-4 text-lg text-muted-foreground">Latest announcements and notices from the college.</p>
            </div>
        </section>
        <section className="py-12 md:py-20">
            <div className="container mx-auto max-w-4xl">
              <Card>
                <CardContent className="p-6 md:p-8">
                  <div className="space-y-8">
                    {notices.length > 0 ? (
                      notices.map((notice, index) => (
                        <div key={notice.id}>
                          <div className="mb-2">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              <h2 className="text-xl font-semibold">{notice.title}</h2>
                              <Badge variant={getBadgeVariant(notice.category)}>
                                {notice.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                          </div>
                          <p className="text-muted-foreground">{notice.description}</p>
                          {index < notices.length - 1 && <Separator className="mt-8" />}
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-12">No notices have been posted yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
        </section>
      </main>
    </div>
  );
}
