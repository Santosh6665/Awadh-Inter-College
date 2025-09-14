import { BookText, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { resourceLinks } from '@/lib/data';
import { Button } from '../ui/button';

export function ResourceLinks() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookText className="h-6 w-6 text-accent" />
          Important Resources
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {resourceLinks.map((link) => (
            <li key={link.id}>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between text-sm font-medium p-2 rounded-md hover:bg-secondary transition-colors"
              >
                <span>{link.title}</span>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
