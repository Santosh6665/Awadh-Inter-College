import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { AdmissionForm } from '@/components/admissions/admission-form';

const admissionSteps = [
    "Submit the online application form with all required documents.",
    "Application review by the admissions committee.",
    "Entrance test for eligible candidates.",
    "Interview with the principal.",
    "Notification of admission decision.",
    "Fee payment to confirm the seat.",
];

export default function AdmissionsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-muted/50 py-12 md:py-20">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Admissions</h1>
                <p className="mt-4 text-lg text-muted-foreground">Join our community of learners and innovators.</p>
            </div>
        </section>
        <section className="py-12 md:py-20">
            <div className="container mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
                <Card>
                    <CardHeader>
                    <CardTitle className="text-2xl">Admissions Process</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8">
                    <section>
                        <h3 className="text-xl font-semibold mb-4">Steps to Apply</h3>
                        <ul className="space-y-3">
                        {admissionSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-primary mr-3 mt-1 flex-shrink-0" />
                            <span>{step}</span>
                            </li>
                        ))}
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-4">Eligibility Criteria</h3>
                        <p className="text-muted-foreground">
                        Admission is open to students who have successfully completed the prerequisite level of education from a recognized board. Specific criteria for each class can be found in the admission brochure.
                        </p>
                    </section>
                    
                    <section>
                        <h3 className="text-xl font-semibold mb-4">Important Dates</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Application Start Date: March 1st, 2025</li>
                            <li>Application End Date: April 15th, 2025</li>
                            <li>Entrance Test Date: April 25th, 2025</li>
                        </ul>
                    </section>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                    <CardTitle className="text-2xl">Online Application Form</CardTitle>
                    <CardDescription>Fill out the form below to begin your application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <AdmissionForm />
                    </CardContent>
                </Card>
            </div>
            </div>
        </section>
      </main>
    </div>
  );
}
