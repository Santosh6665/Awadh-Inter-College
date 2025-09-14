
'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Camera, Info, LogIn, Target, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const carouselImages = [
  { src: "https://picsum.photos/seed/1/1200/400", alt: "College Campus", hint: "college campus" },
  { src: "https://picsum.photos/seed/2/1200/400", alt: "Students learning in a classroom", hint: "students classroom" },
  { src: "https://picsum.photos/seed/3/1200/400", alt: "University library with students", hint: "university library" },
  { src: "https://picsum.photos/seed/4/1200/400", alt: "Graduation ceremony", hint: "graduation ceremony" },
  { src: "https://picsum.photos/seed/5/1200/400", alt: "Students participating in a sports event", hint: "students sports" },
];

export default function HomePage() {
   const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true, stopOnLastSnap: false })
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="w-full relative mt-1">
           <Carousel
              plugins={[plugin.current]}
              className="w-full"
              onMouseEnter={plugin.current.stop}
              onMouseLeave={plugin.current.play}
              opts={{
                loop: true,
                duration: 60,
              }}
            >
              <CarouselContent>
                {carouselImages.map((image, index) => (
                  <CarouselItem key={index} className="pl-0">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={1200}
                        height={400}
                        className="object-cover w-full h-64 md:h-[400px]"
                        data-ai-hint={image.hint}
                        priority={index === 0}
                      />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hover:bg-primary hover:text-primary-foreground" />
            </Carousel>
          <div className="container mx-auto">
            <div className="text-center mt-8">
              <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground">
                A center for academic excellence and holistic development.
              </p>
              <Button asChild className="mt-8">
                <Link href="/admissions">Apply for Admission</Link>
              </Button>
            </div>
          </div>
        </section>

        
        <section id="vision-mission" className="py-12 md:py-20 bg-background px-4 sm:px-6 md:px-8">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold text-center mb-10">Our Vision & Mission</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="text-accent" />
                    Our Vision
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To be a leading institution in providing quality education, empowering students with knowledge, skills, and values to become responsible global citizens and leaders of tomorrow.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-left">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="text-accent" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    To create a dynamic and inclusive learning environment that fosters academic excellence, critical thinking, and holistic development through innovative teaching and a commitment to lifelong learning.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="principal-message" className="py-12 md:py-20 bg-muted px-4 sm:px-6 md:px-8">
          <div className="container mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-center">A Message from the Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-shrink-0">
                          <Avatar className="h-48 w-48 border-4 border-primary shadow-lg">
                              <AvatarImage src="https://picsum.photos/seed/principal/300" alt="Principal's Photo" data-ai-hint="principal portrait" />
                              <AvatarFallback>P</AvatarFallback>
                          </Avatar>
                      </div>
                      <div className="text-center md:text-left">
                          <h2 className="text-2xl font-bold">Dr. Evelyn Reed</h2>
                          <p className="text-muted-foreground">Principal, ANP Inter College</p>
                           <div className="prose max-w-none text-muted-foreground mt-4">
                              <p>
                                  Welcome to ANP Inter College, a place where we believe in nurturing the future. Our commitment is to provide a safe, positive, and intellectually stimulating environment that will empower students to become creative problem solvers, critical thinkers, and inspired learners prepared for the challenges of the twenty-first century.
                              </p>
                          </div>
                      </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </section>


        <section className="bg-background py-12 md:py-20 px-4 sm:px-6 md:px-8">
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
