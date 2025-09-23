
import { Header } from '@/components/layout/header';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const galleryImages = PlaceHolderImages.filter(img => img.id.startsWith('gallery-')).map(img => ({
  id: img.id,
  src: img.imageUrl,
  alt: img.description,
  hint: img.imageHint,
}));

export default function GalleryPage() {
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
            </div>
        </section>
      </main>
    </div>
  );
}
