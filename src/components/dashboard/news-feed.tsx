import { Newspaper } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { newsFeed } from '@/lib/data';

export function NewsFeed() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Newspaper className="h-6 w-6 text-accent" />
          College News Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {newsFeed.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{item.summary}</p>
                <Badge variant="outline" className="mt-2">{item.category}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
