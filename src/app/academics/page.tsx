
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Target, Microscope, Palette, Dumbbell, Computer } from 'lucide-react';

const subjects = [
  { name: 'English', icon: BookOpen },
  { name: 'Hindi', icon: BookOpen },
  { name: 'Mathematics', icon: BookOpen },
  { name: 'Science (Physics, Chemistry, Biology)', icon: Microscope },
  { name: 'Social Science', icon: BookOpen },
  { name: 'Computer Science', icon: Computer },
  { name: 'Art & Craft', icon: Palette },
  { name: 'Physical Education', icon: Dumbbell },
];

export default function AcademicsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-muted/50 py-12 md:py-20">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Academics</h1>
                <p className="mt-4 text-lg text-muted-foreground">Fostering knowledge and skills for a bright future.</p>
            </div>
        </section>
        <section className="py-12 md:py-20">
            <div className="container mx-auto space-y-12">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl flex items-center gap-3"><Target className="h-6 w-6 text-primary" /> Our Curriculum</CardTitle>
                        <CardDescription>
                            Our curriculum is designed to be comprehensive, balanced, and relevant to the needs of the 21st century.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="prose max-w-none text-muted-foreground">
                        <p>
                            We follow the curriculum prescribed by the Central Board of Secondary Education (CBSE), which is renowned for its rigorous academic standards and holistic approach. Our teaching methodology is student-centric, encouraging active participation, critical thinking, and a love for learning.
                        </p>
                        <p>
                            We integrate modern technology with traditional teaching methods to create a dynamic learning environment. Our focus extends beyond textbooks to include project-based learning, practical experiments, and real-world applications of knowledge.
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Subjects Offered</CardTitle>
                         <CardDescription>A wide range of subjects to cater to diverse interests and career paths.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {subjects.map((subject) => (
                                <div key={subject.name} className="flex items-center gap-4 rounded-lg border p-4 bg-background">
                                    <subject.icon className="h-8 w-8 text-primary" />
                                    <span className="font-medium">{subject.name}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
      </main>
    </div>
  );
}
