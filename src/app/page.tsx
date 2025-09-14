
'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Camera, Info, LogIn, Target, Zap } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

const carouselImages = [
  { src: "https://picsum.photos/seed/1/1200/800", alt: "College Campus", hint: "college campus" },
  { src: "https://picsum.photos/seed/2/1200/800", alt: "Students learning in a classroom", hint: "students classroom" },
  { src: "https://picsum.photos/seed/3/1200/800", alt: "University library with students", hint: "university library" },
  { src: "https://picsum.photos/seed/4/1200/800", alt: "Graduation ceremony", hint: "graduation ceremony" },
  { src: "https://picsum.photos/seed/5/1200/800", alt: "Students participating in a sports event", hint: "students sports" },
];

export default function HomePage() {
   const plugin = React.useRef(
    Autoplay({ delay: 2000, stopOnInteraction: true })
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="relative h-[60vh] w-full">
           <Carousel
            plugins={[plugin.current]}
            className="w-full h-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
              loop: true,
            }}
          >
            <CarouselContent className="h-full">
              {carouselImages.map((image, index) => (
                <CarouselItem key={index} className="h-full relative">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    data-ai-hint={image.hint}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 text-white bg-black/30 hover:bg-black/50 border-none" />
          </Carousel>
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
        
        <section id="vision-mission" className="py-12 md:py-20 bg-muted px-4 sm:px-6 md:px-8">
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
