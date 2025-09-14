
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

export default function CommunicationPage() {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate an API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setLoading(false);
        toast({
            title: 'Message Sent',
            description: 'Your message has been successfully sent.',
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Communication Center</CardTitle>
        <CardDescription>Send announcements and alerts to students, parents, or staff.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="recipient">Recipient Group</Label>
                <Select required>
                    <SelectTrigger id="recipient">
                        <SelectValue placeholder="Select recipients" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all_students">All Students</SelectItem>
                        <SelectItem value="all_parents">All Parents</SelectItem>
                        <SelectItem value="all_teachers">All Teachers</SelectItem>
                        <SelectItem value="class_12a">Class XII-A Students</SelectItem>
                        <SelectItem value="class_12b">Class XII-B Parents</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="title">Title / Subject</Label>
                <Input id="title" placeholder="Enter the title of the message" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    required
                    rows={8}
                />
            </div>
             <div className="space-y-2">
                <Label htmlFor="channel">Communication Channel</Label>
                 <Select required>
                    <SelectTrigger id="channel">
                        <SelectValue placeholder="Select channel" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="sms">SMS (Placeholder)</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp (Placeholder)</SelectItem>
                    </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">SMS and WhatsApp require third-party integration.</p>
            </div>
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                 {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Message
            </Button>
        </form>
      </CardContent>
    </Card>
  );
}
