
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from './actions';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SessionSettings({ settings }: { settings: any }) {
  const [sessions, setSessions] = useState<string[]>(settings?.sessions || []);
  const [activeSession, setActiveSession] = useState(settings?.activeSession || '');
  const [nextSession, setNextSession] = useState(settings?.nextSession || '');
  const [newSession, setNewSession] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleAddSession = () => {
    if (newSession && !sessions.includes(newSession) && /^\d{4}-\d{4}$/.test(newSession)) {
      setSessions([...sessions, newSession].sort());
      setNewSession('');
    } else {
      toast({
        title: 'Invalid Session Format',
        description: 'Please use the YYYY-YYYY format (e.g., 2024-2025).',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveSession = (sessionToRemove: string) => {
    setSessions(sessions.filter(s => s !== sessionToRemove));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveSettings({ sessions, activeSession, nextSession });
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Session settings saved successfully.',
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>Define academic sessions and set the active and upcoming sessions.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Session Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="activeSession">Active Session</Label>
              <Select value={activeSession} onValueChange={setActiveSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select active session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextSession">Next Session (for Promotions)</Label>
               <Select value={nextSession} onValueChange={setNextSession}>
                <SelectTrigger>
                  <SelectValue placeholder="Select next session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Manage Session List</h3>
            <div className="flex items-center gap-2 mb-4">
              <Input
                placeholder="Enter new session (e.g., 2025-2026)"
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
              />
              <Button onClick={handleAddSession} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="space-y-2 rounded-md border p-4 max-h-60 overflow-y-auto">
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session} className="flex items-center justify-between">
                  <span>{session}</span>
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveSession(session)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center">No sessions defined.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
