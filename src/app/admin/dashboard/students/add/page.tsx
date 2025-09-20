
import { AddStudentForm } from '@/components/admin/add-student-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddStudentPage() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Student</CardTitle>
        <CardDescription>Fill out the form below to add a new student record.</CardDescription>
      </CardHeader>
      <CardContent>
        <AddStudentForm />
      </CardContent>
    </Card>
  );
}
