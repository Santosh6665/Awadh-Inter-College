
import { TeacherForm } from '@/components/admin/teacher-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AddTeacherPage() {

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Teacher</CardTitle>
        <CardDescription>Fill out the form below to add a new teacher record.</CardDescription>
      </CardHeader>
      <CardContent>
        <TeacherForm />
      </CardContent>
    </Card>
  );
}
