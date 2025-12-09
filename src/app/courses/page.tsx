import Link from 'next/link';
import { GitHubFetcher, GitHubFile } from '@/services/githubFetcher';
import { Folder, Code2, Terminal } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default async function CoursesPage() {
  let courses: GitHubFile[] = [];
  try {
    const contents = await GitHubFetcher.getRepoContents('');
    // Filter for directories that likely represent courses (e.g., python-intro, java-poo)
    courses = contents.filter(item => item.type === 'dir' && !item.name.startsWith('.'));
  } catch (error) {
    console.error("Failed to fetch courses", error);
    // Fallback UI or empty state handled in JSX
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Available Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link key={course.name} href={`/courses/${course.name}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                    {course.name.includes('java') ? <Code2 size={24} /> : <Terminal size={24} />}
                  </div>
                  <CardTitle className="capitalize text-xl">
                    {course.name.replace('-', ' ')}
                  </CardTitle>
                  <CardDescription>
                    Explore the {course.name} curriculum.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Folder size={16} />
                    <span>View Modules</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-10">
            <p className="text-muted-foreground">Unable to load courses. Please check your connection or API limits.</p>
          </div>
        )}
      </div>
    </div>
  );
}
