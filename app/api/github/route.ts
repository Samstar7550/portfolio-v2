import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type RawEvent = {
  id: string;
  type: string;
  repo: { name: string };
  payload: Record<string, unknown>;
  created_at: string;
};

function describe(e: RawEvent): string {
  const short = e.repo.name.replace("Samstar7550/", "");
  switch (e.type) {
    case "PushEvent": {
      const n = (e.payload.commits as unknown[])?.length ?? 1;
      return n === 1 ? `Pushed a commit to ${short}` : `Pushed ${n} commits to ${short}`;
    }
    case "CreateEvent": {
      const rt = e.payload.ref_type as string;
      const ref = e.payload.ref as string;
      if (rt === "repository") return `Created repository ${short}`;
      if (rt === "branch") return `Created branch ${ref} in ${short}`;
      return `Created ${rt} in ${short}`;
    }
    case "PullRequestEvent": {
      const pr = (e.payload.pull_request as { title: string; merged: boolean }) ?? {};
      const merged = e.payload.action === "closed" && pr.merged;
      return merged ? `Merged PR: ${pr.title}` : `Opened PR: ${pr.title}`;
    }
    case "WatchEvent": return `Starred ${short}`;
    case "ForkEvent": return `Forked ${short}`;
    case "IssuesEvent": {
      const action = e.payload.action as string;
      return `${action === "opened" ? "Opened" : "Updated"} issue in ${short}`;
    }
    default: return `Activity in ${short}`;
  }
}

export async function GET() {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "portfolio-site",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(
      "https://api.github.com/users/Samstar7550/events/public?per_page=12",
      { headers, cache: "no-store" }
    );
    if (!res.ok) return NextResponse.json({ events: [] });

    const raw: RawEvent[] = await res.json();
    const events = raw
      .filter((e) => !["DeleteEvent", "WatchEvent"].includes(e.type))
      .slice(0, 6)
      .map((e) => ({
        id: e.id,
        type: e.type,
        repo: e.repo.name,
        description: describe(e),
        url: `https://github.com/${e.repo.name}`,
        createdAt: e.created_at,
      }));

    return NextResponse.json({ events });
  } catch {
    return NextResponse.json({ events: [] });
  }
}
