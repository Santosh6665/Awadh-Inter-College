
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getBusRoutes, addBusRoute, updateBusRoute, deleteBusRoute } from '@/lib/firebase/firestore';
import type { BusRoute } from '@/lib/types';
import { Loader2, PlusCircle, MoreHorizontal, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


export default function ManageTransportPage() {
  const [routes, setRoutes] = useState<BusRoute[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null);
  const { toast } = useToast();

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const routeList = await getBusRoutes();
      setRoutes(routeList);
    } catch (error) {
      toast({
        title: 'Error fetching routes',
        description: 'Could not load transport data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const routeData: Omit<BusRoute, 'id'> = {
      routeNumber: formData.get('routeNumber') as string,
      driverName: formData.get('driverName') as string,
      driverPhone: formData.get('driverPhone') as string,
      capacity: Number(formData.get('capacity')),
    };

    try {
      if (selectedRoute) {
        await updateBusRoute(selectedRoute.id, routeData);
        toast({ title: 'Route Updated', description: 'The bus route has been updated.' });
      } else {
        await addBusRoute(routeData);
        toast({ title: 'Route Added', description: 'The new bus route has been added.' });
      }
      fetchRoutes();
    } catch (error) {
      toast({ title: 'Error', description: 'Could not save the route.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
      setIsEditDialogOpen(false);
      setSelectedRoute(null);
    }
  };
  
  const handleDelete = async (id: string) => {
    try {
        await deleteBusRoute(id);
        toast({ title: 'Route Deleted', description: 'The bus route has been deleted.'});
        fetchRoutes();
    } catch (error) {
        toast({ title: 'Error', description: 'Could not delete the route.', variant: 'destructive' });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Transport</CardTitle>
          <CardDescription>Manage bus routes, vehicle details, and student transport assignments.</CardDescription>
        </div>
        <Button onClick={() => { setSelectedRoute(null); setIsEditDialogOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Route
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route No.</TableHead>
                <TableHead>Driver Name</TableHead>
                <TableHead>Driver Phone</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id}>
                  <TableCell>{route.routeNumber}</TableCell>
                  <TableCell>{route.driverName}</TableCell>
                  <TableCell>{route.driverPhone}</TableCell>
                  <TableCell>{route.capacity}</TableCell>
                  <TableCell className="text-right">
                     <AlertDialog>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                           <DropdownMenuItem onClick={() => { setSelectedRoute(route); setIsEditDialogOpen(true); }}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                           </DropdownMenuItem>
                           <AlertDialogTrigger asChild>
                             <DropdownMenuItem className="text-destructive">
                               <Trash2 className="mr-2 h-4 w-4" /> Delete
                             </DropdownMenuItem>
                           </AlertDialogTrigger>
                         </DropdownMenuContent>
                       </DropdownMenu>
                       <AlertDialogContent>
                         <AlertDialogHeader>
                           <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                           <AlertDialogDescription>
                             This will permanently delete the bus route. This action cannot be undone.
                           </AlertDialogDescription>
                         </AlertDialogHeader>
                         <AlertDialogFooter>
                           <AlertDialogCancel>Cancel</AlertDialogCancel>
                           <AlertDialogAction onClick={() => handleDelete(route.id)}>
                             Continue
                           </AlertDialogAction>
                         </AlertDialogFooter>
                       </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoute ? 'Edit' : 'Add'} Bus Route</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="routeNumber" className="text-right">Route No.</Label>
                <Input id="routeNumber" name="routeNumber" defaultValue={selectedRoute?.routeNumber} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="driverName" className="text-right">Driver Name</Label>
                <Input id="driverName" name="driverName" defaultValue={selectedRoute?.driverName} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="driverPhone" className="text-right">Driver Phone</Label>
                <Input id="driverPhone" name="driverPhone" defaultValue={selectedRoute?.driverPhone} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="capacity" className="text-right">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue={selectedRoute?.capacity} className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
