
// This comment is added to force a rebuild and resolve a ChunkLoadError.
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ManageHostelPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Hostel</CardTitle>
        <CardDescription>This feature is not currently available.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Hostel management features have been removed.</p>
      </CardContent>
    </Card>
  );
}
