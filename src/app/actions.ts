"use server";

import { GitHubFetcher } from '@/services/githubFetcher';

export async function getTestCode(course: string, lesson: string, language: 'python' | 'java') {
    try {
        const filename = language === 'python' ? 'tests.py' : 'TestMain.java';
        // Remove numeric prefix if needed or standardise path
        // The current structure seems to be course/lesson/filename
        const content = await GitHubFetcher.getFileContent(`${course}/${lesson}/${filename}`);
        return content;
    } catch (error) {
        console.error("Failed to fetch test code:", error);
        return null;
    }
}
