import { FaqAssistant } from '@/components/dashboard/faq-assistant';
import { Header } from '@/components/layout/header';

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex justify-center items-center">
        <div className="w-full max-w-4xl h-[60vh]">
          <FaqAssistant />
        </div>
      </main>
    </div>
  );
}
