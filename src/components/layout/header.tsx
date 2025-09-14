import { CollegeLogo } from '@/components/icons';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-2">
        <CollegeLogo className="h-8 w-8 text-primary" />
        <h1 className="font-headline text-xl font-bold tracking-tight text-primary">
          ANP Inter College Hub
        </h1>
      </div>
    </header>
  );
}
