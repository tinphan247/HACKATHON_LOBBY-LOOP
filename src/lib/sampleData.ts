import { Feedback } from "./types";
import { HAPPY_REASONS, ROOT_CAUSE_MAP, UNHAPPY_ISSUES } from "./questions";

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function minutesAgo(mins: number): string {
  return new Date(Date.now() - mins * 60_000).toISOString();
}

const LOCATIONS = ["Lobby", "Quầy vé", "Phòng chiếu 3", "Khu F&B"];

/**
 * Builds a believable spread of demo feedback: a mix of happy/neutral/
 * negative ratings, varied issues and root causes, spread across the
 * last ~6 hours — with a deliberate spike on "nhan_vien" (staff attitude)
 * and "quay_ve" (wait time) so the dashboard's alert + insight sections
 * have something real to point at.
 */
export function generateSampleData(): Feedback[] {
  const items: Feedback[] = [];
  let counter = 1;

  const push = (f: Omit<Feedback, "id" | "isDemo">) => {
    items.push({ ...f, id: `FB${String(counter).padStart(3, "0")}`, isDemo: true });
    counter += 1;
  };

  // A deliberate recent spike: 6 staff-attitude complaints in the last 40 min.
  for (let i = 0; i < 6; i++) {
    push({
      rating: randomItem([1, 2, 2, 3]),
      branch: "unhappy",
      issue: "nhan_vien",
      rootCause: "thai_do",
      timestamp: minutesAgo(Math.floor(Math.random() * 40) + 1),
      location: randomItem(LOCATIONS),
    });
  }

  // A secondary spike: 5 ticket-counter wait-time complaints.
  for (let i = 0; i < 5; i++) {
    push({
      rating: randomItem([2, 3]),
      branch: "unhappy",
      issue: "quay_ve",
      rootCause: "cho_lau",
      timestamp: minutesAgo(Math.floor(Math.random() * 90) + 5),
      location: "Quầy vé",
    });
  }

  // General unhappy spread across every other issue category.
  const otherIssues = UNHAPPY_ISSUES.filter(
    (o) => o.id !== "nhan_vien" && o.id !== "quay_ve" && o.id !== "khac"
  );
  for (let i = 0; i < 12; i++) {
    const issue = randomItem(otherIssues);
    const config = ROOT_CAUSE_MAP[issue.id];
    const rootCause = config ? randomItem(config.options).id : undefined;
    push({
      rating: randomItem([1, 2, 3]),
      branch: "unhappy",
      issue: issue.id,
      rootCause,
      timestamp: minutesAgo(Math.floor(Math.random() * 300) + 10),
      location: randomItem(LOCATIONS),
    });
  }

  // A couple of free-text "Khác" complaints.
  push({
    rating: 2,
    branch: "unhappy",
    issue: "khac",
    comment: "Bãi giữ xe hơi xa so với cổng vào.",
    timestamp: minutesAgo(120),
    location: "Lobby",
  });

  // Happy majority, so CSAT lands in a healthy-but-real range.
  for (let i = 0; i < 24; i++) {
    const count = Math.random() > 0.5 ? 2 : 1;
    const reasons = [...HAPPY_REASONS]
      .sort(() => Math.random() - 0.5)
      .slice(0, count)
      .map((r) => r.id);
    push({
      rating: randomItem([4, 4, 5, 5, 5]),
      branch: "happy",
      satisfactionReasons: reasons,
      timestamp: minutesAgo(Math.floor(Math.random() * 360) + 2),
      location: randomItem(LOCATIONS),
    });
  }

  // Sort newest first, matching how live feedback will accumulate.
  return items.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}
