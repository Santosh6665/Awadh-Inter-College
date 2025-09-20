
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
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Notice Board</CardTitle>
              <CardDescription>Latest announcements and notices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {notices.length > 0 ? (
                  notices.map((notice, index) => (
                    <div key={notice.id}>
                      <div className="mb-2">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                          <h3 className="text-xl font-semibold">{notice.title}</h3>
                          <Badge variant={getBadgeVariant(notice.category)}>
                            {notice.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(notice.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                      </div>
                      <p className="text-muted-foreground">{notice.description}</p>
                      {index < notices.length - 1 && <Separator className="mt-6" />}
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground">No notices have been posted yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
