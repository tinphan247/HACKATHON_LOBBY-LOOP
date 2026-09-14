/**
 * Module thu thập địa chỉ IP công khai của khách hàng
 * Sử dụng API siêu nhẹ, hỗ trợ CORS, có timeout và fallback an toàn.
 */

let cachedIp: string | null = null;
let inFlightPromise: Promise<string> | null = null;

/**
 * Lấy địa chỉ IP công khai của thiết bị khách hàng.
 * Tự động cache lại để tránh spam request.
 */
export async function fetchClientIp(): Promise<string> {
  if (cachedIp) {
    return cachedIp;
  }

  if (inFlightPromise) {
    return inFlightPromise;
  }

  inFlightPromise = (async (): Promise<string> => {
    // 1. Thử api.ipify.org (rất nhanh, độ trễ thấp)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500); // 2.5s timeout

      const res = await fetch("https://api.ipify.org?format=json", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.ip === "string" && data.ip.trim()) {
          const ipVal = data.ip.trim();
          cachedIp = ipVal;
          return ipVal;
        }
      }
    } catch {
      // Tiếp tục thử fallback 2
    }

    // 2. Fallback sang api64.ipify.org (hỗ trợ cả IPv4 & IPv6)
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("https://api64.ipify.org?format=json", {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.ip === "string" && data.ip.trim()) {
          const ipVal = data.ip.trim();
          cachedIp = ipVal;
          return ipVal;
        }
      }
    } catch {
      // Tiếp tục thử fallback 3
    }

    // 3. Fallback sang myip.dnsomatic.com hoặc ipapi nếu cần
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);

      const res = await fetch("https://api.db-ip.com/v2/free/myip", {
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.ipAddress === "string" && data.ipAddress.trim()) {
          const ipVal = data.ipAddress.trim();
          cachedIp = ipVal;
          return ipVal;
        }
      }
    } catch {
      // Không lấy được
    }

    const fallback = "Không xác định";
    cachedIp = fallback;
    return fallback;
  })();

  try {
    const res = await inFlightPromise;
    return res;
  } finally {
    inFlightPromise = null;
  }
}

/**
 * Trả về IP đã được cache (hoặc 'Không xác định' nếu chưa kịp lấy)
 */
export function getCachedIp(): string {
  return cachedIp || "Không xác định";
}
