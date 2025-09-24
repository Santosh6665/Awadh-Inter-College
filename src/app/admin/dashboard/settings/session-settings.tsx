
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from './actions';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function SessionSettings({ settings, onSettingsSave }: { settings: any, onSettingsSave: (newSettings: any) => void }) {
  const [sessions, setSessions] = useState<string[]>(settings?.sessions || []);
  const [activeSession, setActiveSession] = useState(settings?.activeSession || '');
  const [nextSession, setNextSession] = useState(settings?.nextSession || '');
  const [newSession, setNewSession] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (settings) {
      setSessions(settings.sessions || []);
      setActiveSession(settings.activeSession || '');
      setNextSession(settings.nextSession || '');
    }
  }, [settings]);

  const handleAddSession = () => {
    // Regex to validate YYYY-YYYY or YYYY-YY format
    const sessionRegex = /^\d{4}-(\d{4}|\d{2})$/;
    if (newSession && sessionRegex.test(newSession)) {
        if (!sessions.includes(newSession)) {
            setSessions([...sessions, newSession].sort().reverse());
            setNewSession('');
        } else {
             toast({
                title: 'Session Exists',
                description: `The session "${newSession}" has already been added.`,
                variant: 'destructive',
            });
        }
    } else {
      toast({
        title: 'Invalid Session Format',
        description: 'Please use the YYYY-YYYY or YYYY-YY format (e.g., 2024-2025 or 2024-25).',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveSession = (sessionToRemove: string) => {
    setSessions(sessions.filter(s => s !== sessionToRemove));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const newSettings = { ...settings, sessions, activeSession, nextSession };
    const result = await saveSettings(newSettings);
    if (result.success) {
      onSettingsSave(newSettings);
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
                <SelectTrigger id="activeSession">
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
                <SelectTrigger id="nextSession">
                  <SelectValue placeholder="Select next session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label htmlFor="new-session-input">Manage Session List</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input
                id="new-session-input"
                placeholder="Enter new session (e.g., 2025-26)"
                value={newSession}
                onChange={(e) => setNewSession(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSession()}
              />
              <Button onClick={handleAddSession} variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" /> Add
              </Button>
            </div>
            <div className="space-y-2 rounded-md border p-4 mt-4 max-h-60 overflow-y-auto">
              {sessions.length > 0 ? sessions.map(session => (
                <div key={session} className="flex items-center justify-between hover:bg-muted/50 p-1 rounded-md">
                  <span>{session}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRemoveSession(session)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              )) : <p className="text-sm text-muted-foreground text-center py-4">No sessions defined.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
