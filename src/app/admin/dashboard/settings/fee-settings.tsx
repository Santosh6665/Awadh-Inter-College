
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from './actions';
import { Loader2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const feeHeads = [
    { key: 'tuition', label: 'Tuition Fee' },
    { key: 'transport', label: 'Transport Fee' },
    { key: 'computer', label: 'Computer Fee' },
    { key: 'admission', label: 'Admission Fee' },
    { key: 'exam', label: 'Exam Fee' },
    { key: 'miscellaneous', label: 'Miscellaneous/Enrolment' },
];

const defaultMultipliers = {
    tuition: 12,
    transport: 12,
    computer: 12,
    admission: 1,
    exam: 1,
    miscellaneous: 1,
};


export function FeeSettings({ settings }: { settings: any }) {
  const [feeStructure, setFeeStructure] = useState(settings?.feeStructure || {});
  const [siblingDiscount, setSiblingDiscount] = useState(settings?.siblingDiscount || '');
  const [sessionStartDate, setSessionStartDate] = useState(settings?.sessionStartDate || '');
  const [feeMultipliers, setFeeMultipliers] = useState(settings?.feeMultipliers || defaultMultipliers);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleFeeChange = (className: string, feeHead: string, value: string) => {
    setFeeStructure((prev: any) => ({
      ...prev,
      [className]: {
        ...prev[className],
        [feeHead]: value === '' ? undefined : Number(value),
      },
    }));
  };

  const handleMultiplierChange = (feeHead: string, value: string) => {
    setFeeMultipliers((prev: any) => ({
        ...prev,
        [feeHead]: value === '' ? undefined : Number(value)
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveSettings({ 
        feeStructure, 
        sessionStartDate,
        siblingDiscount: Number(siblingDiscount) || 0,
        feeMultipliers
    });
    if (result.success) {
      toast({
        title: 'Success',
        description: 'Fee settings saved successfully.',
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
              <CardTitle>Global Fee Settings</CardTitle>
              <CardDescription>Define default fee structures and session dates for all students.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving} className="w-full md:w-auto">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save All Fee Settings
            </Button>
          </div>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Session Start Date</CardTitle>
                    <CardDescription className="text-sm">The start of the academic year for fee calculations (e.g., 2024-04-01).</CardDescription>
                </CardHeader>
                <CardContent>
                    <Input
                        type="date"
                        value={sessionStartDate}
                        onChange={(e) => setSessionStartDate(e.target.value)}
                    />
                </CardContent>
              </Card>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-2">Class-wise Fee Structure Defaults</h3>
             <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md mb-4">
                <Info className="h-4 w-4" />
                <span>Enter the base amount for each fee head here (e.g., monthly tuition fee). The multipliers above will be applied to these amounts.</span>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {classes.map((className) => (
                <AccordionItem value={className} key={className}>
                  <AccordionTrigger>Class {className}</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 p-2">
                      {feeHeads.map(head => (
                        <div key={head.key} className="space-y-2">
                          <Label htmlFor={`${className}-${head.key}`}>{head.label}</Label>
                          <Input
                            id={`${className}-${head.key}`}
                            type="number"
                            placeholder="Amount (Rs)"
                            value={feeStructure[className]?.[head.key] || ''}
                            onChange={(e) => handleFeeChange(className, head.key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

    