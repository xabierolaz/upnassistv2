import { GitHubFetcher } from '@/services/githubFetcher';
import { Workspace } from '@/components/Workspace';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    course: string;
    lesson: string;
  }>;
}

export default async function LessonPage(props: PageProps) {
  const params = await props.params;
  const { course, lesson } = params;

  let instructions = '';
  let initialCode = '';
  let language: 'python' | 'java' = 'python';

  try {
    // Determine language based on course name or structure
    if (course.includes('java')) {
      language = 'java';
      initialCode = await GitHubFetcher.getFileContent(`${course}/${lesson}/Main.java`);
    } else {
      language = 'python';
      initialCode = await GitHubFetcher.getFileContent(`${course}/${lesson}/template.py`);
    }

    // Fetch instructions
    instructions = await GitHubFetcher.getFileContent(`${course}/${lesson}/instructions.md`);

  } catch (error) {
    console.error("Error fetching lesson content:", error);
    // If essential files are missing, show 404
    if (!initialCode && !instructions) {
        notFound();
    }
  }

  return (
    <div className="h-screen flex flex-col">
       {/* Header is handled by Layout, but we might want a sub-header here if needed */}
       <Workspace 
         initialCode={initialCode || "// No template found"} 
         instructions={instructions || "# Instructions not found"} 
         language={language}
         lessonName={lesson.replace(/^\d+-/, '').replace(/-/g, ' ')}
       />
    </div>
  );
}
