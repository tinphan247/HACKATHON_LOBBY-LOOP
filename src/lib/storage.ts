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
    action_wanted: f.actionWanted || null,
    device: f.device || "Không xác định",
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
    actionWanted: row.action_wanted || undefined,
    device: row.device || undefined,
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
    if (!Array.isArray(parsed)) return [];
    // Tự động dọn dẹp các bản ghi demo cũ còn sót trong localStorage của trình duyệt
    const cleaned = parsed.filter((f) => !f.isDemo);
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function persistLocal(data: Feedback[]) {
  // Loại bỏ hoàn toàn dữ liệu demo khỏi lưu trữ
  const cleaned = data.filter((f) => !f.isDemo);
  memoryCache = cleaned;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
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
    return memoryCache.filter((f) => !f.isDemo);
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
      const fullRow = toSupabaseRow(feedback);
      const { error } = await supabase.from("feedbacks").insert(fullRow);
      if (error) {
        console.warn("[LobbyLoop] Insert with new columns warning:", error.message);
        // Fallback: Nếu DB chưa chạy ALTER TABLE để tạo cột device/action_wanted, gửi các cột chuẩn cơ bản
        if (error.message?.includes("column") || error.message?.includes("schema cache")) {
          const fallbackRow = {
            id: feedback.id,
            rating: feedback.rating,
            branch: feedback.branch,
            satisfaction_reasons: feedback.satisfactionReasons || [],
            issue: feedback.issue || null,
            root_cause: feedback.rootCause || null,
            comment: [
              feedback.device ? `[Thiết bị: ${feedback.device}]` : "",
              feedback.actionWanted ? `[Yêu cầu: ${feedback.actionWanted}]` : "",
              feedback.comment || "",
            ]
              .filter(Boolean)
              .join(" "),
            timestamp: feedback.timestamp,
            location: feedback.location || "Lobby",
            is_demo: Boolean(feedback.isDemo),
          };
          const { error: fbErr } = await supabase.from("feedbacks").insert(fallbackRow);
          if (fbErr) {
            console.error("[LobbyLoop] Supabase fallback insert error:", fbErr.message);
          } else {
            console.log("[LobbyLoop] Supabase fallback insert successful (gộp vào comment)");
          }
        }
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
 * Clear only demo data
 */
export async function clearDemoData(): Promise<void> {
  const current = getAllFeedback().filter((f) => !f.isDemo);
  persistLocal(current);

  if (isSupabaseActive() && supabase) {
    try {
      await supabase.from("feedbacks").delete().eq("is_demo", true);
    } catch (err) {
      console.error("[LobbyLoop] Supabase clear demo failed:", err);
    }
  }
}

/**
 * Sync initial data on dashboard load. Does NOT force demo seeding if empty.
 */
export async function ensureSeeded(): Promise<void> {
  if (isSupabaseActive() && supabase) {
    await syncWithSupabase();
    return;
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

  function formatTimeWithSeconds(iso: string): string {
    try {
      const d = new Date(iso);
      const hours = String(d.getHours()).padStart(2, "0");
      const mins = String(d.getMinutes()).padStart(2, "0");
      const secs = String(d.getSeconds()).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = d.getFullYear();
      return `${hours}:${mins}:${secs} ${day}/${month}/${year}`;
    } catch {
      return iso;
    }
  }

  const headers = [
    "Mã phản hồi",
    "Thời gian (HH:mm:ss DD/MM/YYYY)",
    "Thiết bị (Model)",
    "Điểm đánh giá (Sao)",
    "Phân loại",
    "Lý do hài lòng",
    "Vấn đề khiếu nại",
    "Nguyên nhân gốc (Root Cause)",
    "Ý kiến đóng góp",
    "Yêu cầu hỗ trợ (Xử lý ngay)",
    "Địa điểm",
    "Dữ liệu Demo",
  ];

  const rows = feedbacks.map((f) => [
    `"${f.id}"`,
    `"${formatTimeWithSeconds(f.timestamp)}"`,
    `"${f.device || "Không xác định"}"`,
    f.rating,
    `"${f.branch === "happy" ? "Hài lòng (Happy)" : "Không hài lòng (Unhappy)"}"`,
    `"${(f.satisfactionReasons || []).join("; ")}"`,
    `"${f.issue || ""}"`,
    `"${f.rootCause || ""}"`,
    `"${(f.comment || "").replace(/"/g, '""')}"`,
    `"${(f.actionWanted || "").replace(/"/g, '""')}"`,
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
