
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from './actions';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ResultSettings({ settings }: { settings: any }) {
  const [resultVisibility, setResultVisibility] = useState(settings?.resultVisibility || {
    quarterly: false,
    halfYearly: false,
    annual: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const handleVisibilityChange = async (exam: 'quarterly' | 'halfYearly' | 'annual', checked: boolean) => {
    const updatedVisibility = {
      ...resultVisibility,
      [exam]: checked,
    };
    setResultVisibility(updatedVisibility);
    setIsSaving(true);
    
    const result = await saveSettings({ resultVisibility: updatedVisibility });
    
    if (result.success) {
      toast({
        title: 'Success',
        description: `Visibility for ${exam} results updated.`,
      });
    } else {
      toast({
        title: 'Error',
        description: result.message,
        variant: 'destructive',
      });
      // Revert on failure
      setResultVisibility(prev => ({
        ...prev,
        [exam]: !checked,
      }));
    }
    setIsSaving(false);
  };

  return (
    <div className="space-y-6 mb-8">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Result Visibility Settings</CardTitle>
                <CardDescription>Control which exam results are visible to students in their portal.</CardDescription>
            </div>
            {isSaving && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
          </div>
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
                onCheckedChange={(checked) => handleVisibilityChange('quarterly', checked)}
                disabled={isSaving}
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
                onCheckedChange={(checked) => handleVisibilityChange('halfYearly', checked)}
                disabled={isSaving}
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
                onCheckedChange={(checked) => handleVisibilityChange('annual', checked)}
                disabled={isSaving}
              />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
