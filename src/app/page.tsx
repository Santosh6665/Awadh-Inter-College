
'use client';

import React from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Camera, Info, LogIn, Target, Zap, Phone, Mail, MapPin, Megaphone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';


const carouselImages = [
  { src: "/images/hero-1.jpg", alt: "College Campus", hint: "college campus" },
  { src: "/images/hero-2.jpg", alt: "Students learning in a classroom", hint: "students classroom" },
  { src: "/images/hero-3.jpg", alt: "University library with students", hint: "university library" },
  { src: "/images/hero-4.jpg", alt: "Graduation ceremony", hint: "graduation ceremony" },
  { src: "/images/hero-5.jpg", alt: "Students participating in a sports event", hint: "students sports" },
];

export default function HomePage() {
   const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true, stopOnLastSnap: false })
  );
  const [isHistoryExpanded, setIsHistoryExpanded] = React.useState(false);
  const [isPrincipalMessageExpanded, setIsPrincipalMessageExpanded] = React.useState(false);
  const [isFounderMessageExpanded, setIsFounderMessageExpanded] = React.useState(false);
  
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
              <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hover:bg-primary hover:text-primary-foreground" />
            </Carousel>
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center p-4">
            <div className="container mx-auto">
                <Card className="max-w-xs md:max-w-2xl mx-auto bg-black/60 backdrop-blur-sm text-center p-6 text-white border-white/20">
                    <h2 className="text-3xl md:text-4xl font-bold">
                        Awadh Inter College
                    </h2>
                    <p className="mt-4 text-white/80">
                        Learning with Excellence, Living with Purpose.
                    </p>
                    <Button asChild size="lg" className="mt-8">
                        <Link href="/admissions">Apply for Admission</Link>
                    </Button>
                </Card>
            </div>
          </div>
        </section>

        <section className="bg-muted text-muted-foreground py-3">
            <div className="container mx-auto">
                <div className="flex items-center justify-center gap-4">
                    <Megaphone className="h-5 w-5 text-primary" />
                    <p className="text-sm font-medium">
                        Admissions for the 2025-2026 session are now open. <Link href="/admissions" className="underline text-blue-600 hover:text-primary">Apply Now!</Link>
                    </p>
                </div>
            </div>
        </section>

        <section id="about-us" className="py-12 md:py-20 bg-card px-4 sm:px-6 md:px-8">
          <div className="container mx-auto text-center">
            <h3 className="text-3xl font-bold text-center mb-10">About Our School</h3>
             <Card className="text-left max-w-4xl mx-auto">
                <CardHeader>
                    <div className="overflow-hidden rounded-lg">
                        <Image 
                        src="/images/about-school.jpg"
                        alt="School Building"
                        width={1200}
                        height={400}
                        className="object-cover w-full h-auto"
                        data-ai-hint="school building"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <h4 className="text-2xl font-semibold mb-4 text-center">Our History</h4>
                    <div className={cn("prose max-w-none text-muted-foreground space-y-4 relative overflow-hidden", !isHistoryExpanded && "max-h-40")}>
                        <p>
                            Founded in 1965, Awadh Inter College started as a small institution with a grand vision: to provide high-quality education to the local community and empower the youth with knowledge and values. Over the decades, we have grown in both size and stature, becoming a premier center for learning in the region.
                        </p>
                        
                        <p>
                            Our journey has been marked by a relentless pursuit of academic excellence, a commitment to holistic student development, and a spirit of innovation. We have continuously adapted our curriculum and infrastructure to meet the evolving needs of education, ensuring our students are well-prepared for the challenges of the future.
                        </p>
                        <p>
                            Today, Awadh Inter College stands as a testament to the enduring power of education to transform lives. We are proud of our rich history and the thousands of alumni who have gone on to make significant contributions in various fields across the globe. As we look to the future, we remain dedicated to our founding principles and committed to shaping the next generation of leaders.
                        </p>
                        {!isHistoryExpanded && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-card to-transparent" />}
                    </div>
                    <div className="text-center mt-4">
                       <Button variant="link" onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
                            {isHistoryExpanded ? 'Read Less' : 'Read More'}
                       </Button>
                    </div>
                </CardContent>
             </Card>
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

        <section id="principal-message" className="pt-12 bg-muted px-4 sm:px-6 md:px-8">
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
                          <p className="text-muted-foreground">Principal, Awadh Inter College</p>
                           <div className={cn("prose max-w-none text-muted-foreground mt-4 space-y-4 relative overflow-hidden", !isPrincipalMessageExpanded && "max-h-40")}>
                              <p>
                                  Welcome to Awadh Inter College, a place where we believe in nurturing the future. Our commitment is to provide a safe, positive, and intellectually stimulating environment that will empower students to become creative problem solvers, critical thinkers, and inspired learners prepared for the challenges of the twenty-first century.
                              </p>
                                
                                  <p>
                                    At Awadh, we strive to create an atmosphere of respect and inclusion, where each student is valued as an individual. We are dedicated to the academic, social, and emotional growth of our students, and we work in partnership with our parents and community to help our students achieve their full potential.
                                  </p>
                                  <p>
                                    I am honored to lead such a remarkable institution and look forward to working with you to make this academic year a success.
                                  </p>
                                
                              {!isPrincipalMessageExpanded && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-card to-transparent" />}
                          </div>
                          <div className="text-center md:text-left">
                             <Button variant="link" onClick={() => setIsPrincipalMessageExpanded(!isPrincipalMessageExpanded)}>
                                {isPrincipalMessageExpanded ? 'Read Less' : 'Read More'}
                            </Button>
                          </div>
                      </div>
                  </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="founder-message" className="py-12 bg-muted px-4 sm:px-6 md:px-8">
          <div className="container mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-center">Our Founder's Vision</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-shrink-0">
                          <Avatar className="h-48 w-48 border-4 border-primary shadow-lg">
                              <AvatarImage src="/images/founder.jpg" alt="Founder's Photo" data-ai-hint="founder portrait" />
                              <AvatarFallback>F</AvatarFallback>
                          </Avatar>
                      </div>
                      <div className="text-center md:text-left">
                           <h2 className="text-2xl font-bold">Mr. Arjun Singh</h2>
                           <p className="text-muted-foreground">Founder, Awadh Inter College</p>
                           <div className={cn("prose max-w-none text-muted-foreground mt-4 space-y-4 relative overflow-hidden", !isFounderMessageExpanded && "max-h-40")}>
                              <p>
                                The Awad Inter College School Management System (SMS) is initiated and conceptualized by the Founder of Awad Inter College, who envisioned a digital platform to streamline administrative, academic, and communication processes.
                                The Founder’s mission is to modernize the institution’s operations, provide transparency for parents, empower teachers with digital tools, and improve the overall learning experience for students.
                              </p>
                              {!isFounderMessageExpanded && <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-card to-transparent" />}
                            </div>
                            <div className="text-center md:text-left">
                               <Button variant="link" onClick={() => setIsFounderMessageExpanded(!isFounderMessageExpanded)}>
                                  {isFounderMessageExpanded ? 'Read Less' : 'Read More'}
                              </Button>
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
                <CardDescription>Stay updated with the latest school announcements.</CardDescription>
              </CardHeader>
              <CardContent>
                 <Button variant="outline" asChild className="mt-4">
                  <Link href="/notices">Check Notices</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        
        <section id="contact" className="py-12 md:py-20 bg-muted px-4 sm:px-6 md:px-8">
          <div className="container mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl text-center">Contact Us</CardTitle>
                <CardDescription className="text-center">
                  We'd love to hear from you. Reach out to us with any questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="h-6 w-6 text-accent mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold">Address</h3>
                        <p className="text-muted-foreground">
                          Ghosiyari Bazar Marg, Ghosiyari Bazar, Daniawar, Basti, Uttar Pradesh – 272148
                        </p>
                      </div>
                    </div>
                     <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-accent mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold">Phone</h3>
                        <p className="text-muted-foreground">
                          +91 6393071946
                        </p>
                      </div>
                    </div>
                     <div className="flex items-start gap-4">
                      <Mail className="h-6 w-6 text-accent mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold">Email</h3>
                        <p className="text-muted-foreground">
                          info@awadhcollege.edu
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-lg overflow-hidden">
                     <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d113947.88601614902!2d82.8249903!3d27.0345786!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3996d52f5f17ae31%3A0xd62c60629abe5491!2s2WM4%2BRXR%2C%20Nikhoria%2C%20Uttar%20Pradesh%20272153!5e0!3m2!1sen!2sin!4v1719504547926!5m2!1sen!2sin"
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      ></iframe>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
