import { ArrowLeft, Compass, Home } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="grain flex min-h-[100dvh] items-center justify-center bg-primary px-5 py-10 text-primary-foreground">
      <div className="w-full max-w-xl text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-foreground/10 text-[hsl(var(--sidebar-primary))]">
          <Compass className="size-8" />
        </div>
        <div className="mt-8 font-mono text-[10px] uppercase tracking-[.25em] text-primary-foreground/55">Record not found</div>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-.07em] md:text-7xl">This page wandered off.</h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-primary-foreground/65">
          The school day is still here. This particular view is not. Let’s get you back to the records that matter.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link data-testid="link-not-found-home" href="/" className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--sidebar-primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--sidebar-primary-foreground))] transition hover:brightness-110">
            <Home className="size-4" /> Back to today
          </Link>
          <button data-testid="button-not-found-back" onClick={() => window.history.back()} className="inline-flex items-center gap-2 rounded-xl border border-primary-foreground/15 px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10">
            <ArrowLeft className="size-4" /> Go back
          </button>
        </div>
      </div>
    </div>
  );
}