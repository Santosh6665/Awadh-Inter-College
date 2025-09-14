import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Camera, Info, LogIn } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full">
          <Image
            src="https://picsum.photos/seed/1/1200/800"
            alt="College Campus"
            fill
            className="object-cover"
            data-ai-hint="college campus"
          />
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-center text-white p-4">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Awadh Narayan Pratap Lal Intermediate College
            </h2>
            <p className="mt-4 max-w-2xl text-lg md:text-xl">
              A center for academic excellence and holistic development.
            </p>
            <Button asChild className="mt-8">
              <Link href="/admissions">Apply for Admission</Link>
            </Button>
          </div>
        </section>

        <section id="about" className="py-12 md:py-20 px-4 sm:px-6 md:px-8">
          <div className="container mx-auto">
            <h3 className="text-3xl font-bold text-center mb-8">About Our College</h3>
            <p className="max-w-3xl mx-auto text-center text-muted-foreground">
              Founded with a vision to provide quality education, ANP Inter College has been a cornerstone of learning in the community. We are dedicated to nurturing young minds, fostering critical thinking, and preparing students for a successful future. Our experienced faculty and state-of-the-art facilities provide an ideal environment for growth and discovery.
            </p>
          </div>
        </section>

        <section className="bg-muted py-12 md:py-20 px-4 sm:px-6 md:px-8">
          <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="text-accent" /> Portals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Access for students, parents, and faculty.</p>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/login">Login Now</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="text-accent" /> Admissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Learn about our admission process and criteria.</p>
                 <Button variant="outline" asChild className="mt-4">
                  <Link href="/admissions">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="text-accent" /> Gallery
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Explore moments and events from our campus life.</p>
                 <Button variant="outline" asChild className="mt-4">
                  <Link href="/gallery">View Gallery</Link>
                </Button>
              </CardContent>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="text-accent" /> Notices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Stay updated with the latest school announcements.</p>
                 <Button variant="outline" asChild className="mt-4">
                  <Link href="/notices">Check Notices</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
