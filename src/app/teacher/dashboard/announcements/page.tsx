
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function SendAnnouncementsPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        toast({
            title: 'Announcement Sent',
            description: 'Your announcement has been successfully sent.',
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Announcements</CardTitle>
        <CardDescription>Broadcast messages to students, parents, or specific classes.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="recipient">Recipient</Label>
                <Select required>
                    <SelectTrigger id="recipient">
                        <SelectValue placeholder="Select recipient group" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_students">All Students</SelectItem>
                        <SelectItem value="all_parents">All Parents</SelectItem>
                        <SelectItem value="class_12a">Class XII-A</SelectItem>
                        <SelectItem value="class_12b">Class XII-B</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Enter the title of the announcement" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Announcement Message</Label>
                <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    required
                    rows={8}
                />
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Announcement
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
