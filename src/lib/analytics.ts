import { DashboardAlert, Feedback } from "./types";
import { labelForIssue, labelForRootCause } from "./questions";

export interface KPIs {
  total: number;
  csatPct: number;
  happyPct: number;
  needsAttentionPct: number;
}

export function computeKPIs(data: Feedback[]): KPIs {
  const total = data.length;
  if (total === 0) return { total: 0, csatPct: 0, happyPct: 0, needsAttentionPct: 0 };

  const happyCount = data.filter((f) => f.rating >= 4).length;
  const csatCount = data.filter((f) => f.rating >= 4).length; // CSAT = % rating 4-5
  const needsAttention = total - happyCount;

  return {
    total,
    csatPct: Math.round((csatCount / total) * 100),
    happyPct: Math.round((happyCount / total) * 100),
    needsAttentionPct: Math.round((needsAttention / total) * 100),
  };
}

export interface CountedItem {
  id: string;
  label: string;
  count: number;
}

/** Top unhappy issue categories, most-reported first. */
export function computeTopIssues(data: Feedback[], limit = 5): CountedItem[] {
  const counts = new Map<string, number>();
  data
    .filter((f) => f.branch === "unhappy" && f.issue)
    .forEach((f) => {
      counts.set(f.issue!, (counts.get(f.issue!) ?? 0) + 1);
    });

  return [...counts.entries()]
    .map(([id, count]) => ({ id, label: labelForIssue(id), count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/** Root causes across all unhappy issues, most-reported first. */
export function computeRootCauseInsight(data: Feedback[], limit = 5): CountedItem[] {
  const counts = new Map<string, { label: string; count: number }>();
  data
    .filter((f) => f.branch === "unhappy" && f.issue && f.rootCause)
    .forEach((f) => {
      const key = `${f.issue}:${f.rootCause}`;
      const label = labelForRootCause(f.issue, f.rootCause);
      const existing = counts.get(key);
      counts.set(key, { label, count: (existing?.count ?? 0) + 1 });
    });

  return [...counts.entries()]
    .map(([id, v]) => ({ id, label: v.label, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

const ALERT_WINDOW_MINUTES = 60;
const ALERT_THRESHOLD = 4;

/**
 * Rule-based alert: if any single issue has been reported at least
 * ALERT_THRESHOLD times within the last ALERT_WINDOW_MINUTES, surface it.
 * No ML needed for a prototype — this is enough to demonstrate the value.
 */
export function detectAlert(data: Feedback[]): DashboardAlert | null {
  const cutoff = Date.now() - ALERT_WINDOW_MINUTES * 60_000;
  const recent = data.filter(
    (f) => f.branch === "unhappy" && f.issue && new Date(f.timestamp).getTime() >= cutoff
  );

  const counts = new Map<string, number>();
  recent.forEach((f) => counts.set(f.issue!, (counts.get(f.issue!) ?? 0) + 1));

  let topIssueId: string | null = null;
  let topCount = 0;
  counts.forEach((count, issueId) => {
    if (count > topCount) {
      topCount = count;
      topIssueId = issueId;
    }
  });

  if (!topIssueId || topCount < ALERT_THRESHOLD) return null;

  const issueLabel = labelForIssue(topIssueId);
  return {
    issueLabel,
    count: topCount,
    windowLabel: `${ALERT_WINDOW_MINUTES} phút qua`,
    recommendation: recommendationFor(topIssueId),
  };
}

function recommendationFor(issueId: string): string {
  const map: Record<string, string> = {
    nhan_vien: "Kiểm tra phân ca & nhắc lại chuẩn phục vụ với nhân viên trực.",
    quay_ve: "Mở thêm quầy / kiểm tra năng lực xử lý tại quầy vé.",
    fnb: "Kiểm tra công suất quầy F&B và thời gian pha chế.",
    ve_sinh: "Cử nhân viên vệ sinh kiểm tra khu vực được phản ánh ngay.",
    khong_gian: "Kiểm tra tình trạng cơ sở vật chất tại khu vực liên quan.",
    am_thanh_hinh_anh: "Kiểm tra thiết bị âm thanh / hình ảnh phòng chiếu.",
    lich_chieu: "Rà soát lại lịch chiếu khung giờ đang bị phản ánh.",
    dat_ve: "Kiểm tra hệ thống đặt vé / thanh toán online.",
    khuyen_mai: "Rà soát lại thông tin & điều kiện khuyến mãi đang hiển thị.",
    khac: "Xem chi tiết các phản hồi để xác định hướng xử lý.",
  };
  return map[issueId] ?? "Xem chi tiết feedback để xác định hướng xử lý.";
}
