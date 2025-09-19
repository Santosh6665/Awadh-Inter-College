
import { CollegeLogo } from '@/components/icons';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-card text-card-foreground">
      <div className="container mx-auto px-6 py-8 md:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
                <CollegeLogo className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">Awadh Inter College</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A center for academic excellence and holistic development since 2012.
            </p>
          </div>

          <div className="md:col-span-2">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-semibold">Quick Links</h4>
                <nav className="flex flex-col space-y-2 text-sm">
                  <Link href="/about" className="text-muted-foreground hover:text-foreground">About Us</Link>
                  <Link href="/admissions" className="text-muted-foreground hover:text-foreground">Admissions</Link>
                  <Link href="/gallery" className="text-muted-foreground hover:text-foreground">Gallery</Link>
                  <Link href="/notices" className="text-muted-foreground hover:text-foreground">Notices</Link>
                  <Link href="/#contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link>
                </nav>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Portals</h4>
                <nav className="flex flex-col space-y-2 text-sm">
                  <Link href="/student/login" className="text-muted-foreground hover:text-foreground">Student Login</Link>
                  <Link href="/parent/login" className="text-muted-foreground hover:text-foreground">Parent Login</Link>
                  <Link href="/teacher/login" className="text-muted-foreground hover:text-foreground">Teacher Login</Link>
                  <Link href="/admin/login" className="text-muted-foreground hover:text-foreground">Admin Login</Link>
                </nav>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 md:col-span-3">
             <div className="border-t pt-8">
                <h4 className="font-semibold mb-4">Contact Us</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                    <MapPin className="mt-1 h-4 w-4 flex-shrink-0" />
                    <span>Ghosiyari Bazar Marg, Ghosiyari Bazar, Daniawar, Basti, Uttar Pradesh – 272148</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <a href="tel:+916393071946" className="hover:underline">+91 6393071946</a>
                </div>
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <a href="mailto:info@awadhcollege.edu" className="hover:underline">info@awadhcollege.edu</a>
                </div>
                </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Awadh Inter College. All rights reserved.</p>
          <p className="mt-2">
            For technical support, contact our IT Team at <a href="mailto:santoshx.dev@gmail.com" className="underline hover:text-foreground">santoshx.dev@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
