
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from './actions';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsManagement({ settings }: { settings: any }) {
  const [resultVisibility, setResultVisibility] = useState(settings?.resultVisibility || {
    quarterly: false,
    halfYearly: false,
    annual: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleResultVisibilityChange = (exam: 'quarterly' | 'halfYearly' | 'annual', checked: boolean) => {
    setResultVisibility((prev: any) => ({
      ...prev,
      [exam]: checked,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const result = await saveSettings({ resultVisibility });
    if (result.success) {
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
          <CardTitle>Result Visibility Settings</CardTitle>
          <CardDescription>Control which exam results are visible to students in their portal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="quarterly-results" className="text-base">Quarterly Results</Label>
                <p className="text-sm text-muted-foreground">
                  Allow students to view their quarterly exam results.
                </p>
              </div>
              <Switch
                id="quarterly-results"
                checked={resultVisibility.quarterly}
                onCheckedChange={(checked) => handleResultVisibilityChange('quarterly', checked)}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="halfYearly-results" className="text-base">Half-Yearly Results</Label>
                 <p className="text-sm text-muted-foreground">
                  Allow students to view cumulative half-yearly results.
                </p>
              </div>
              <Switch
                id="halfYearly-results"
                checked={resultVisibility.halfYearly}
                onCheckedChange={(checked) => handleResultVisibilityChange('halfYearly', checked)}
              />
            </div>
             <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="annual-results" className="text-base">Annual Results</Label>
                 <p className="text-sm text-muted-foreground">
                  Allow students to view final annual results.
                </p>
              </div>
              <Switch
                id="annual-results"
                checked={resultVisibility.annual}
                onCheckedChange={(checked) => handleResultVisibilityChange('annual', checked)}
              />
            </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </div>
    </div>
  );
}
