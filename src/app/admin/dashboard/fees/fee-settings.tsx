
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { saveSettings } from './actions';
import { Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function SettingsManagement({ settings }: { settings: any }) {
  const [feeStructure, setFeeStructure] = useState(settings?.feeStructure || {});
  const [resultVisibility, setResultVisibility] = useState(settings?.resultVisibility || {
    quarterly: false,
    halfYearly: false,
    annual: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFeeChange = (className: string, field: string, value: string) => {
    setFeeStructure((prev: any) => ({
      ...prev,
      [className]: {
        ...prev[className],
        [field]: value === '' ? null : Number(value),
      },
    }));
  };
  
  const handleResultVisibilityChange = (exam: 'quarterly' | 'halfYearly' | 'annual', checked: boolean) => {
    setResultVisibility((prev: any) => ({
      ...prev,
      [exam]: checked,
    }));
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    const result = await saveSettings({ feeStructure, resultVisibility });
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
  
  const classes = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const feeHeads = ['tuition', 'transport', 'exam', 'computer', 'miscellaneous', 'discount'];

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

      <Card>
        <CardHeader>
          <CardTitle>Default Fee Structure</CardTitle>
          <CardDescription>Set the default fee amounts for each class. These can be overridden for individual students.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {classes.map((className) => (
              <AccordionItem value={className} key={className}>
                <AccordionTrigger>Class {className}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {feeHeads.map((head) => (
                      <div key={head} className="space-y-1">
                        <label className="text-sm font-medium capitalize">{head}</label>
                        <Input
                          type="number"
                          placeholder="Amount"
                          value={feeStructure[className]?.[head] || ''}
                          onChange={(e) => handleFeeChange(className, head, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <div className="flex justify-end">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save All Settings
        </Button>
      </div>
    </div>
  );
}
