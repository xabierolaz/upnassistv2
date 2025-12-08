import Link from 'next/link';
import { GitHubFetcher } from '@/services/githubFetcher';
import { ArrowLeft, BookOpen, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: Promise<{
    course: string;
  }>;
}

export default async function CourseModulesPage(props: PageProps) {
  const params = await props.params;
  const { course } = params;
  
  let modules = [];
  try {
    const contents = await GitHubFetcher.getRepoContents(course);
    modules = contents.filter(item => item.type === 'dir').sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error(`Failed to fetch modules for ${course}`, error);
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/courses">
            <ArrowLeft size={24} />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold capitalize">{course.replace('-', ' ')} Modules</h1>
      </div>
      
      <div className="flex flex-col gap-4">
        {modules.length > 0 ? (
          modules.map((module) => (
            <Link key={module.name} href={`/courses/${course}/${module.name}`}>
              <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                      <BookOpen size={20} />
                    </div>
                    <CardTitle className="text-lg font-medium">{module.name}</CardTitle>
                  </div>
                  <ChevronRight className="text-muted-foreground" />
                </CardHeader>
              </Card>
            </Link>
          ))
        ) : (
          <p className="text-muted-foreground">No modules found for this course.</p>
        )}
      </div>
    </div>
  );
}
