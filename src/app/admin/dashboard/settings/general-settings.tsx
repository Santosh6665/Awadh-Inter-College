
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { setSchoolStatusForToday } from './actions';
import { getSchoolStatus } from '../attendance/actions';
import { format } from 'date-fns';

export function GeneralSettings({ settings }: { settings: any }) {
  const [isSchoolClosed, setIsSchoolClosed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchStatus = async () => {
        setIsLoadingStatus(true);
        const today = format(new Date(), 'yyyy-MM-dd');
        const status = await getSchoolStatus(today);
        setIsSchoolClosed(status.isClosed);
        setIsLoadingStatus(false);
    };
    fetchStatus();
  }, []);

  const handleStatusChange = async (checked: boolean) => {
    setIsSaving(true);
    const result = await setSchoolStatusForToday(checked);
    
    if (result.success) {
      setIsSchoolClosed(checked);
      toast({
        title: 'Success',
        description: result.message,
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
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>General School Settings</CardTitle>
                <CardDescription>Manage school-wide settings like daily closures.</CardDescription>
            </div>
            {(isSaving || isLoadingStatus) && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="school-status" className="text-base">School Status for Today</Label>
                <p className="text-sm text-muted-foreground">
                  Mark the school as closed for today. This will disable attendance marking.
                </p>
              </div>
              <Switch
                id="school-status"
                checked={isSchoolClosed}
                onCheckedChange={handleStatusChange}
                disabled={isSaving || isLoadingStatus}
              />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
