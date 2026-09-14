/**
 * Module nhận diện chi tiết model thiết bị (Android, iPhone, iPad, PC, Mac)
 * Sử dụng Client Hints API, User-Agent, độ phân giải màn hình và WebGL GPU.
 * Tuyệt đối không sử dụng icon hay emoji.
 */

let cachedDeviceModel: string | null = null;
let clientHintsQueried = false;

// Bảng tra cứu các mã model Samsung phổ biến tại Việt Nam sang tên thương mại
const SAMSUNG_MODEL_MAP: Record<string, string> = {
  // Galaxy S24 Series
  "SM-S928": "Samsung Galaxy S24 Ultra",
  "SM-S926": "Samsung Galaxy S24+",
  "SM-S921": "Samsung Galaxy S24",
  // Galaxy S23 Series
  "SM-S918": "Samsung Galaxy S23 Ultra",
  "SM-S916": "Samsung Galaxy S23+",
  "SM-S911": "Samsung Galaxy S23",
  // Galaxy S22 Series
  "SM-S908": "Samsung Galaxy S22 Ultra",
  "SM-S906": "Samsung Galaxy S22+",
  "SM-S901": "Samsung Galaxy S22",
  // Galaxy S21 Series
  "SM-G998": "Samsung Galaxy S21 Ultra",
  "SM-G996": "Samsung Galaxy S21+",
  "SM-G991": "Samsung Galaxy S21",
  "SM-G990": "Samsung Galaxy S21 FE",
  // Z Fold / Z Flip
  "SM-F946": "Samsung Galaxy Z Fold 5",
  "SM-F936": "Samsung Galaxy Z Fold 4",
  "SM-F926": "Samsung Galaxy Z Fold 3",
  "SM-F731": "Samsung Galaxy Z Flip 5",
  "SM-F721": "Samsung Galaxy Z Flip 4",
  "SM-F711": "Samsung Galaxy Z Flip 3",
  // Galaxy A Series
  "SM-A546": "Samsung Galaxy A54 5G",
  "SM-A536": "Samsung Galaxy A53 5G",
  "SM-A528": "Samsung Galaxy A52s 5G",
  "SM-A346": "Samsung Galaxy A34 5G",
  "SM-A336": "Samsung Galaxy A33 5G",
  "SM-A245": "Samsung Galaxy A24",
  "SM-A146": "Samsung Galaxy A14 5G",
  "SM-A145": "Samsung Galaxy A14",
  "SM-A057": "Samsung Galaxy A05s",
};

function formatSamsungModel(rawModel: string): string {
  const clean = rawModel.replace(/Build\/.*$/i, "").trim();
  // Khớp 7 ký tự đầu, ví dụ SM-S928B -> SM-S928
  const prefix = clean.substring(0, 7).toUpperCase();
  if (SAMSUNG_MODEL_MAP[prefix]) {
    return SAMSUNG_MODEL_MAP[prefix];
  }
  return `Samsung (${clean})`;
}

function formatAndroidModel(rawModel: string): string {
  let model = rawModel.replace(/\s*Build\/.*$/i, "").trim();

  // Bỏ qua giá trị "K" giả định từ chính sách User-Agent Freeze của Google
  if (!model || model === "K" || model === "Linux" || model.toLowerCase() === "android") {
    return "";
  }

  if (model.startsWith("SM-")) {
    return formatSamsungModel(model);
  }
  if (model.includes("Pixel")) {
    return `Google ${model}`;
  }
  if (
    model.includes("Redmi") ||
    model.includes("Mi ") ||
    model.includes("POCO") ||
    model.startsWith("23") ||
    model.startsWith("22")
  ) {
    return `Xiaomi ${model}`;
  }
  if (model.includes("CPH") || model.includes("OPPO") || model.includes("PGEM") || model.includes("PFFM")) {
    return `OPPO (${model})`;
  }
  if (model.includes("V2") || model.includes("vivo")) {
    return `Vivo (${model})`;
  }
  if (model.includes("RMX")) {
    return `Realme (${model})`;
  }

  return `Android (${model})`;
}

/**
 * Thử lấy thông tin GPU Renderer qua WebGL để bổ sung nhận diện
 */
function getGpuRenderer(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl || !(gl instanceof WebGLRenderingContext)) return "";

    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    if (!ext) return "";

    const renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
    return typeof renderer === "string" ? renderer : "";
  } catch {
    return "";
  }
}

/**
 * Nhận diện thiết bị đồng bộ cơ bản (dùng screen, userAgent và WebGL)
 */
function detectDeviceSync(): string {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "Thiết bị không xác định";
  }

  const ua = navigator.userAgent || "";
  const screenW = Math.min(window.screen.width, window.screen.height);
  const screenH = Math.max(window.screen.width, window.screen.height);
  const dpr = Math.round((window.devicePixelRatio || 1) * 10) / 10;

  // 1. Phân loại Apple iOS (iPhone / iPad)
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const isIPad =
      /iPad/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1 && screenW >= 744);

    if (isIPad) {
      if (screenW >= 1024 && screenH >= 1366) return "iPad Pro 12.9\"";
      if (screenW >= 834 && screenH >= 1194) return "iPad Pro 11\"";
      if (screenW >= 820 && screenH >= 1180) return "iPad Air";
      if (screenW >= 744 && screenH >= 1133) return "iPad mini";
      return "iPad";
    }

    // Nhận diện dòng iPhone chi tiết theo độ phân giải màn hình logic và dpr
    if (screenW === 440 && screenH === 956 && dpr === 3) {
      return "iPhone 16 Pro Max";
    }
    if (screenW === 402 && screenH === 874 && dpr === 3) {
      return "iPhone 16 Pro";
    }
    if (screenW === 430 && screenH === 932 && dpr === 3) {
      return "iPhone 14 Pro Max / 15 Plus / 15 Pro Max / 16 Plus";
    }
    if (screenW === 393 && screenH === 852 && dpr === 3) {
      return "iPhone 14 Pro / 15 / 16";
    }
    if (screenW === 428 && screenH === 926 && dpr === 3) {
      return "iPhone 12 Pro Max / 13 Pro Max / 14 Plus";
    }
    if (screenW === 390 && screenH === 844 && dpr === 3) {
      return "iPhone 12 / 12 Pro / 13 / 13 Pro / 14";
    }
    if (screenW === 375 && screenH === 812 && dpr === 3) {
      return "iPhone X / XS / 11 Pro / 12 mini / 13 mini";
    }
    if (screenW === 414 && screenH === 896 && dpr === 3) {
      return "iPhone XS Max / 11 Pro Max";
    }
    if (screenW === 414 && screenH === 896 && dpr === 2) {
      return "iPhone 11 / XR";
    }
    if (screenW === 414 && screenH === 736 && dpr === 3) {
      return "iPhone 6 Plus / 7 Plus / 8 Plus";
    }
    if (screenW === 375 && screenH === 667 && dpr === 2) {
      return "iPhone SE / 8";
    }
    if (screenW <= 440) {
      return "iPhone";
    }
    return "Thiết bị iOS";
  }

  // 2. Phân loại Android
  if (/Android/i.test(ua)) {
    // Thử trích xuất từ chuỗi UA truyền thống
    const androidMatch = ua.match(/Android[^;]+;\s*([^;\)]+)\)/i);
    if (androidMatch && androidMatch[1]) {
      const parsed = formatAndroidModel(androidMatch[1]);
      if (parsed) return parsed;
    }

    // Fallback qua GPU Renderer nếu bị Google đóng băng UA thành "Android 10; K"
    const gpu = getGpuRenderer();
    if (gpu) {
      if (gpu.includes("Adreno")) {
        const adrenoMatch = gpu.match(/Adreno[^)]*(\d+)/i);
        return adrenoMatch ? `Android (Snapdragon Adreno ${adrenoMatch[1]})` : "Android (Snapdragon)";
      }
      if (gpu.includes("Mali")) {
        const maliMatch = gpu.match(/Mali[^)\s]*/i);
        return maliMatch ? `Android (${maliMatch[0]})` : "Android (Mali GPU)";
      }
    }

    return "Thiết bị Android";
  }

  // 3. Phân loại Desktop / Laptop
  if (/Windows/i.test(ua)) {
    return "Windows PC";
  }
  if (/Macintosh|Mac OS X/i.test(ua)) {
    return "Mac (macOS)";
  }
  if (/Linux/i.test(ua)) {
    return "Linux PC";
  }

  return "Thiết bị khác";
}

/**
 * Hàm bất đồng bộ nâng cao: Sử dụng Client Hints API (getHighEntropyValues)
 * để lấy chính xác tuyệt đối tên model trên máy Android hiện đại (Chrome, Samsung Browser, Edge).
 */
export async function getAccurateDeviceModel(): Promise<string> {
  if (cachedDeviceModel && clientHintsQueried) {
    return cachedDeviceModel;
  }

  // Khởi tạo model sơ bộ từ nhận diện đồng bộ
  let result = cachedDeviceModel || detectDeviceSync();

  try {
    const uaData = (navigator as any)?.userAgentData;
    if (uaData && typeof uaData.getHighEntropyValues === "function") {
      const hints = await uaData.getHighEntropyValues(["model", "platform", "platformVersion"]);
      clientHintsQueried = true;

      if (hints && hints.model && typeof hints.model === "string" && hints.model.trim()) {
        const parsed = formatAndroidModel(hints.model.trim());
        if (parsed) {
          result = parsed;
        }
      }
    }
  } catch {
    // Client Hints không khả dụng hoặc bị từ chối
  }

  cachedDeviceModel = result;
  return result;
}

/**
 * Hàm đồng bộ trả về kết quả ngay lập tức (dùng cache nếu đã có, hoặc chạy logic nhận diện nhanh)
 */
export function getDeviceModel(): string {
  if (cachedDeviceModel) {
    return cachedDeviceModel;
  }
  cachedDeviceModel = detectDeviceSync();
  return cachedDeviceModel;
}
