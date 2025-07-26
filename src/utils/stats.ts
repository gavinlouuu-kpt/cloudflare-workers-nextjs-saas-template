import "server-only";
import { getDB } from "@/db";
import { userTable } from "@/db/schema";
import { withKVCache, CACHE_KEYS } from "./with-kv-cache";
import { GITHUB_REPO_URL } from "@/constants";

export async function getTotalUsers() {
  return withKVCache(
    async () => {
      const db = getDB();

      return await db.$count(userTable);
    },
    {
      key: CACHE_KEYS.TOTAL_USERS,
      ttl: "1 hour",
    }
  );
}

export async function getGithubStars() {
  if (!GITHUB_REPO_URL || typeof GITHUB_REPO_URL !== "string") {
    return null;
  }

  // Extract owner and repo from GitHub URL
  const match = (GITHUB_REPO_URL as string)?.match(/github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;

  const [, owner, repo] = match;

  if (!owner || !repo) return null;

  return withKVCache(
    async () => {
      try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'NextJS-SaaS-Template',
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`GitHub API returned ${response.status} for ${owner}/${repo}`);
          return null;
        }

        const data = (await response.json()) as {
          stargazers_count: number;
        };

        return data.stargazers_count;
      } catch (error) {
        // Log the error for debugging but don't throw to prevent app crashes
        console.warn('Failed to fetch GitHub stars:', error);
        return null;
      }
    },
    {
      key: `${CACHE_KEYS.GITHUB_STARS}:${owner}/${repo}`,
      ttl: "1 hour",
    }
  );
}

