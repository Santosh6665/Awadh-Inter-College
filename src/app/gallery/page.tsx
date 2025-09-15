
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

const galleryImages = [
  { id: 1, src: "/images/gallery-1.jpg", alt: "College Campus View", hint: "college campus" },
  { id: 2, src: "/images/gallery-2.jpg", alt: "Students in Library", hint: "students library" },
  { id: 3, src: "/images/gallery-3.jpg", alt: "Science Lab", hint: "science lab" },
  { id: 4, src: "/images/gallery-4.jpg", alt: "Sports Day Event", hint: "sports event" },
  { id: 5, src: "/images/gallery-5.jpg", alt: "Classroom Session", hint: "classroom students" },
  { id: 6, src: "/images/gallery-6.jpg", alt: "Annual Function", hint: "college event" },
  { id: 7, src: "/images/gallery-7.jpg", alt: "Art Competition", hint: "art competition" },
  { id: 8, src: "/images/gallery-8.jpg", alt: "Computer Lab", hint: "computer lab" },
  { id: 9, src: "/images/gallery-9.jpg", alt: "School Auditorium", hint: "school auditorium" },
  { id: 10, src: "/images/gallery-10.jpg", alt: "Outdoor activity", hint: "outdoor activity" },
  { id: 11, src: "/images/gallery-11.jpg", alt: "Group discussion", hint: "group discussion" },
];

export default function GalleryPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Gallery</CardTitle>
              <CardDescription>Moments from our college.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryImages.map(image => (
                  <div key={image.id} className="overflow-hidden rounded-lg group">
                    <Image 
                      src={image.src} 
                      alt={image.alt}
                      width={600}
                      height={400}
                      className="object-cover w-full h-full aspect-video group-hover:scale-105 transition-transform duration-300"
                      data-ai-hint={image.hint}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
