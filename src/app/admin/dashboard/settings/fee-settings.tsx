'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { saveSettings } from './actions';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const classes = ["Nursery", "LKG", "UKG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const feeHeads = [
    { key: 'tuition', label: 'Tuition Fee (Monthly)' },
    { key: 'transport', label: 'Transport Fee (Monthly)' },
    { key: 'computer', label: 'Computer Fee (Monthly)' },
    { key: 'admission', label: 'Admission Fee (Annual)' },
    { key: 'exam', label: 'Exam Fee (Per Term)' },
    { key: 'miscellaneous', label: 'Miscellaneous (Annual)' },
];

export function FeeSettings({ settings }: { settings: any }) {
  const [feeStructure, setFeeStructure] = useState(settings?.feeStructure || {});
  const [siblingDiscount, setSiblingDiscount] = useState(settings?.siblingDiscount || '');
  const [sessionStartDate, setSessionStartDate] = useState(settings?.sessionStartDate || '');
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
  
  const handleSave = async () => {
    setIsSaving(true);
    const result = await saveSettings({ 
        feeStructure, 
        sessionStartDate,
        siblingDiscount: Number(siblingDiscount) || 0 
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Global Fee Settings</CardTitle>
              <CardDescription>Define default fee structures, session dates, and discounts for all students.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
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
               <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Sibling Discount</CardTitle>
                    <CardDescription className="text-sm">A fixed monthly discount for each sibling after the first child.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sibling-discount">Discount Amount (Rs)</Label>
                    <Input
                        id="sibling-discount"
                        type="number"
                        placeholder="e.g., 500"
                        value={siblingDiscount}
                        onChange={(e) => setSiblingDiscount(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Class-wise Fee Structure Defaults</h3>
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
                            placeholder="Amount"
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
