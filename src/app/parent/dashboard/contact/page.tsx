
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export default function ContactTeachersPage() {
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
            description: 'Your message has been successfully sent to the teacher.',
        });
    };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Teacher</CardTitle>
        <CardDescription>Send a message directly to your child's teachers.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="teacher">Select Teacher</Label>
                <Select required>
                    <SelectTrigger id="teacher">
                        <SelectValue placeholder="Select a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="teacher_physics">Mr. Sharma (Physics)</SelectItem>
                        <SelectItem value="teacher_maths">Mrs. Gupta (Mathematics)</SelectItem>
                        <SelectItem value="teacher_english">Mr. Singh (English)</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="message">Your Message</Label>
                <Textarea
                    id="message"
                    placeholder="Type your message here..."
                    required
                    rows={6}
                />
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
