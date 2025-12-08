import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 px-4">
      <main className="text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
          UPN <span className="text-blue-600 dark:text-blue-500">ASSIST</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Your intelligent coding companion for the University of Helsinki curriculum. 
          Learn Python and Java with interactive feedback.
        </p>
        
        <div className="flex gap-4 justify-center">
          <Button size="lg" asChild className="text-lg px-8">
            <Link href="/courses">
              Browse Courses
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="text-lg px-8">
            <Link href="https://github.com/xabierolaz/upn-curriculum" target="_blank">
              View Curriculum
            </Link>
          </Button>
        </div>
      </main>
      
      <footer className="mt-20 text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} UPN Assist. Powered by Gemini.</p>
      </footer>
    </div>
  );
}