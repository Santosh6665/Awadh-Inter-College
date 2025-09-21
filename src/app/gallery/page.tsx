
// This comment is added to force a rebuild and potentially resolve a ChunkLoadError.
import { Header } from '@/components/layout/header';
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
];

export default function GalleryPage() {
  const cacheBuster = `?t=${new Date().getTime()}`;
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="bg-muted/50 py-12 md:py-20">
            <div className="container mx-auto text-center">
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Gallery</h1>
                <p className="mt-4 text-lg text-muted-foreground">Moments from our college.</p>
            </div>
        </section>
        <section className="py-12 md:py-20">
            <div className="container mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {galleryImages.map(image => (
                    <div key={image.id} className="overflow-hidden rounded-lg group shadow-md hover:shadow-xl transition-shadow duration-300">
                        <Image 
                        src={`${image.src}${cacheBuster}`} 
                        alt={image.alt}
                        width={600}
                        height={400}
                        className="object-cover w-full h-full aspect-video group-hover:scale-105 transition-transform duration-300"
                        data-ai-hint={image.hint}
                        />
                    </div>
                    ))}
                </div>
            </div>
        </section>
      </main>
    </div>
  );
}
