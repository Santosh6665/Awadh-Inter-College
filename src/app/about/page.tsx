
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="container mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">About Awadh Inter College</CardTitle>
              <CardDescription>A Legacy of Excellence in Education</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
               <div className="overflow-hidden rounded-lg">
                 <Image 
                    src="https://picsum.photos/seed/abouthistory/1200/400"
                    alt="School Building"
                    width={1200}
                    height={400}
                    className="object-cover w-full h-auto"
                    data-ai-hint="school building"
                 />
               </div>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Our History</h2>
                <div className="prose max-w-none text-muted-foreground space-y-4">
                    <p>
                        Founded in 2012, Awadh Inter College started as a small institution with a grand vision: to provide high-quality education to the local community and empower the youth with knowledge and values. Over the decades, we have grown in both size and stature, becoming a premier center for learning in the region.
                    </p>
                    <p>
                        Our journey has been marked by a relentless pursuit of academic excellence, a commitment to holistic student development, and a spirit of innovation. We have continuously adapted our curriculum and infrastructure to meet the evolving needs of education, ensuring our students are well-prepared for the challenges of the future.
                    </p>
                     <p>
                        Today, Awadh Inter College stands as a testament to the enduring power of education to transform lives. We are proud of our rich history and the thousands of alumni who have gone on to make significant contributions in various fields across the globe. As we look to the future, we remain dedicated to our founding principles and committed to shaping the next generation of leaders.
                    </p>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
