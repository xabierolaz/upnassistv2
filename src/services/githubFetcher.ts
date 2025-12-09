
const REPO_OWNER = 'xabierolaz';
const REPO_NAME = 'upnassistv2';
const BASE_PATH = 'upn-curriculum'; // Subdirectory for content
const BASE_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`;

export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: 'file' | 'dir';
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

export const GitHubFetcher = {
  async getRepoContents(path: string = ''): Promise<GitHubFile[]> {
    try {
      // Construct the full path including the base content directory
      const fullPath = path ? `${BASE_PATH}/${path}` : BASE_PATH;
      
      const response = await fetch(`${BASE_URL}/contents/${fullPath}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add cache control if needed, e.g., 'Cache-Control': 'no-cache'
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch repo contents: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // The API returns an object for a single file, and an array for a directory.
      // We want to ensure we return an array.
      if (Array.isArray(data)) {
        return data as GitHubFile[];
      } else {
         return [data] as GitHubFile[];
      }

    } catch (error) {
      console.error('Error fetching GitHub repo contents:', error);
      throw error;
    }
  },

  async getFileContent(path: string): Promise<string> {
      try {
           const fullPath = `${BASE_PATH}/${path}`;
           const response = await fetch(`${BASE_URL}/contents/${fullPath}`, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw', // Request raw content
            },
             next: { revalidate: 3600 }
          });

          if (!response.ok) {
            throw new Error(`Failed to fetch file content: ${response.status} ${response.statusText}`);
          }
          
          return await response.text();

      } catch (error) {
          console.error('Error fetching file content:', error);
          throw error;
      }
  }
};
