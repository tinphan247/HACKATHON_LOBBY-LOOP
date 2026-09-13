import { Feedback } from "./types";
import { generateSampleData } from "./sampleData";
import { supabase, isSupabaseConfigured } from "./supabase";

const STORAGE_KEY = "lobbyloop_feedback";
const EVENT_NAME = "lobbyloop:update";

// In-memory cache to ensure synchronous calls like getAllFeedback() return the latest data
let memoryCache: Feedback[] | null = null;

// Helpers to map between Supabase snake_case columns and TypeScript camelCase
function toSupabaseRow(f: Feedback) {
  return {
    id: f.id,
    rating: f.rating,
    branch: f.branch,
    satisfaction_reasons: f.satisfactionReasons || [],
    issue: f.issue || null,
    root_cause: f.rootCause || null,
    comment: f.comment || null,
    timestamp: f.timestamp,
    location: f.location || "Lobby",
    is_demo: Boolean(f.isDemo),
  };
}

function fromSupabaseRow(row: any): Feedback {
  return {
    id: row.id,
    rating: row.rating,
    branch: row.branch,
    satisfactionReasons: Array.isArray(row.satisfaction_reasons) ? row.satisfaction_reasons : [],
    issue: row.issue || undefined,
    rootCause: row.root_cause || undefined,
    comment: row.comment || undefined,
    timestamp: row.timestamp,
    location: row.location || undefined,
    isDemo: Boolean(row.is_demo),
  };
}

function getLocalFeedback(): Feedback[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistLocal(data: Feedback[]) {
  memoryCache = data;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

export function isSupabaseActive(): boolean {
  return isSupabaseConfigured && supabase !== null;
}

/**
 * Synchronous getter: Returns current cached feedback (either from Supabase sync or localStorage)
 */
export function getAllFeedback(): Feedback[] {
  if (memoryCache !== null) {
    return memoryCache;
  }
  const local = getLocalFeedback();
  memoryCache = local;
  return local;
}

/**
 * Fetches latest feedback from Supabase (if configured) and updates memory & localStorage cache
 */
export async function syncWithSupabase(): Promise<Feedback[]> {
  if (!isSupabaseActive() || !supabase) {
    return getAllFeedback();
  }

  try {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.warn("[LobbyLoop] Supabase fetch error, fallback to local:", error.message);
      return getAllFeedback();
    }

    const feedbacks = (data || []).map(fromSupabaseRow);
    persistLocal(feedbacks);
    return feedbacks;
  } catch (err) {
    console.warn("[LobbyLoop] Supabase connection failed, using local:", err);
    return getAllFeedback();
  }
}

/**
 * Add a new feedback. Writes optimistically to local cache, then pushes to Supabase.
 */
export async function addFeedback(feedback: Feedback): Promise<void> {
  const current = getAllFeedback();
  persistLocal([feedback, ...current]);

  if (isSupabaseActive() && supabase) {
    try {
      const { error } = await supabase.from("feedbacks").insert(toSupabaseRow(feedback));
      if (error) {
        console.error("[LobbyLoop] Error pushing to Supabase:", error.message);
      }
    } catch (err) {
      console.error("[LobbyLoop] Supabase insert failed:", err);
    }
  }
}

/**
 * Delete a specific feedback by ID
 */
export async function deleteFeedback(id: string): Promise<void> {
  const current = getAllFeedback();
  persistLocal(current.filter((f) => f.id !== id));

  if (isSupabaseActive() && supabase) {
    try {
      await supabase.from("feedbacks").delete().eq("id", id);
    } catch (err) {
      console.error("[LobbyLoop] Supabase delete failed:", err);
    }
  }
}

/**
 * Reset to sample demo data
 */
export async function resetToSampleData(): Promise<void> {
  const sample = generateSampleData();
  persistLocal(sample);

  if (isSupabaseActive() && supabase) {
    try {
      // Clear current rows and insert sample data
      await supabase.from("feedbacks").delete().neq("id", "");
      const rows = sample.map(toSupabaseRow);
      await supabase.from("feedbacks").insert(rows);
    } catch (err) {
      console.error("[LobbyLoop] Supabase reset sample data failed:", err);
    }
  }
}

/**
 * Clear all feedback records
 */
export async function clearAllFeedback(): Promise<void> {
  persistLocal([]);

  if (isSupabaseActive() && supabase) {
    try {
      await supabase.from("feedbacks").delete().neq("id", "");
    } catch (err) {
      console.error("[LobbyLoop] Supabase clear failed:", err);
    }
  }
}

/**
 * Ensures there's always something to look at on first dashboard load.
 */
export async function ensureSeeded(): Promise<void> {
  if (isSupabaseActive() && supabase) {
    const data = await syncWithSupabase();
    if (data.length === 0) {
      await resetToSampleData();
    }
    return;
  }

  if (getAllFeedback().length === 0) {
    persistLocal(generateSampleData());
  }
}

/**
 * Subscribe to feedback changes.
 * - In Supabase mode: Subscribes to PostgreSQL realtime changes.
 * - In Local mode: Listens to browser storage and CustomEvents.
 */
export function subscribeToFeedback(callback: () => void): () => void {
  const localHandler = () => callback();
  window.addEventListener(EVENT_NAME, localHandler);
  window.addEventListener("storage", localHandler);

  let supabaseChannel: any = null;

  if (isSupabaseActive() && supabase) {
    supabaseChannel = supabase
      .channel("feedbacks_realtime_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "feedbacks",
        },
        async () => {
          await syncWithSupabase();
          callback();
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          console.log("[LobbyLoop] Connected to Supabase Realtime channel");
        }
      });
  }

  return () => {
    window.removeEventListener(EVENT_NAME, localHandler);
    window.removeEventListener("storage", localHandler);
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Export data to a downloadable CSV file
 */
export function exportFeedbacksToCSV(feedbacks: Feedback[]): void {
  if (feedbacks.length === 0) {
    alert("Không có dữ liệu để xuất!");
    return;
  }

  const headers = [
    "Mã phản hồi",
    "Thời gian",
    "Điểm đánh giá (Sao)",
    "Phân loại",
    "Lý do hài lòng",
    "Vấn đề khiếu nại",
    "Nguyên nhân gốc (Root Cause)",
    "Ý kiến đóng góp",
    "Địa điểm",
    "Dữ liệu Demo",
  ];

  const rows = feedbacks.map((f) => [
    `"${f.id}"`,
    `"${f.timestamp}"`,
    f.rating,
    `"${f.branch === "happy" ? "Hài lòng (Happy)" : "Không hài lòng (Unhappy)"}"`,
    `"${(f.satisfactionReasons || []).join("; ")}"`,
    `"${f.issue || ""}"`,
    `"${f.rootCause || ""}"`,
    `"${(f.comment || "").replace(/"/g, '""')}"`,
    `"${f.location || "Lobby"}"`,
    f.isDemo ? "Có" : "Không",
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `LobbyLoop_Feedback_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
