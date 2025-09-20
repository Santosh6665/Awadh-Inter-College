
'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { saveFeeSettings } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const classes = ['LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const feeHeads = ['tuition', 'transport', 'exam', 'computer', 'miscellaneous'];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Save All Settings
    </Button>
  );
}

export function FeeSettings({ initialData }: { initialData: any }) {
  const [feeSettings, setFeeSettings] = useState(initialData || {});
  const { toast } = useToast();

  const handleInputChange = (className: string, feeHead: string, value: string) => {
    setFeeSettings((prev: any) => ({
      ...prev,
      [className]: {
        ...prev[className],
        [feeHead]: value ? (feeHead === 'paymentPlan' ? value : Number(value)) : null,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await saveFeeSettings(feeSettings);
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
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Structure Settings</CardTitle>
        <CardDescription>
          Define the fee structure for each class. These amounts will be used as defaults for new students.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Accordion type="multiple" className="w-full">
            {classes.map((className) => (
              <AccordionItem value={className} key={className}>
                <AccordionTrigger>Class {className}</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md">
                    {feeHeads.map((head) => (
                      <div className="space-y-2" key={head}>
                        <Label htmlFor={`${className}-${head}`} className="capitalize">{head} Fee</Label>
                        <Input
                          id={`${className}-${head}`}
                          name={`${className}-${head}`}
                          type="number"
                          placeholder="Enter amount"
                          value={feeSettings[className]?.[head] || ''}
                          onChange={(e) => handleInputChange(className, head, e.target.value)}
                        />
                      </div>
                    ))}
                     <div className="space-y-2">
                        <Label htmlFor={`${className}-paymentPlan`}>Payment Plan</Label>
                        <Select
                            value={feeSettings[className]?.paymentPlan || ''}
                            onValueChange={(value) => handleInputChange(className, 'paymentPlan', value)}
                        >
                            <SelectTrigger id={`${className}-paymentPlan`}>
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="quarterly">Quarterly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          <div className="mt-6 flex justify-end">
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
