
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function PrincipalsMessagePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">A Message from the Principal</CardTitle>
              <CardDescription>Words of wisdom and encouragement from our esteemed leader.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                        <Avatar className="h-48 w-48 border-4 border-primary shadow-lg">
                            <AvatarImage src="https://picsum.photos/seed/principal/300" alt="Principal's Photo" data-ai-hint="principal portrait" />
                            <AvatarFallback>S</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-2xl font-bold">Shivam Srivastav</h2>
                        <p className="text-muted-foreground">Principal, Awadh Inter College</p>
                    </div>
                </div>
                <div className="prose max-w-none text-muted-foreground">
                    <p>
                        Welcome to Awadh Inter College, a place where we believe in nurturing the future. Our commitment is to provide a safe, positive, and intellectually stimulating environment that will empower students to become creative problem solvers, critical thinkers, and inspired learners prepared for the challenges of the twenty-first century.
                    </p>
                    <p>
                        At Awadh, we strive to create an atmosphere of respect and inclusion, where each student is valued as an individual. We are dedicated to the academic, social, and emotional growth of our students, and we work in partnership with our parents and community to help our students achieve their full potential.
                    </p>
                     <p>
                        I am honored to lead such a remarkable institution and look forward to working with you to make this academic year a success.
                    </p>
                </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
