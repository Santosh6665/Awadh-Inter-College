import { FaqAssistant } from '@/components/dashboard/faq-assistant';
import { ResourceLinks } from '@/components/dashboard/resource-links';
import { FacultyDirectory } from '@/components/dashboard/faculty-directory';
import { Header } from '@/components/layout/header';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="grid auto-rows-fr grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-4">
          <div className="xl:col-span-4">
            <FacultyDirectory />
          </div>
          <div className="xl:col-span-2">
            <ResourceLinks />
          </div>
          <div className="xl:col-span-2">
            <FaqAssistant />
          </div>
        </div>
      </main>
    </div>
  );
}
