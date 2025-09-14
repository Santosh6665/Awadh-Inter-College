
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const feeHistory = [
  { id: 'INV001', month: 'July 2024', amount: '₹2,500', status: 'Paid' },
  { id: 'INV002', month: 'August 2024', amount: '₹2,500', status: 'Paid' },
  { id: 'INV003', month: 'September 2024', amount: '₹2,500', status: 'Due' },
];

export default function FeesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Receipts</CardTitle>
        <CardDescription>View and download your fee payment history.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice ID</TableHead>
              <TableHead>Month</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeHistory.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="font-medium">{fee.id}</TableCell>
                <TableCell>{fee.month}</TableCell>
                <TableCell>{fee.amount}</TableCell>
                <TableCell>
                  <Badge variant={fee.status === 'Paid' ? 'default' : 'destructive'}>
                    {fee.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {fee.status === 'Paid' ? (
                    <Button variant="outline" size="icon">
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download Receipt</span>
                    </Button>
                  ) : (
                    <Button>Pay Now</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
