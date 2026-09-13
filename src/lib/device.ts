/**
 * Nhận diện chi tiết model thiết bị (Android, iPhone, iPad, PC, Mac)
 * Hoàn toàn không sử dụng bất kỳ icon hay emoji nào.
 */

interface NavigatorUAData {
  brands: Array<{ brand: string; version: string }>;
  mobile: boolean;
  platform: string;
  getHighEntropyValues?: (hints: string[]) => Promise<{ model?: string; platformVersion?: string }>;
}

let cachedDeviceModel: string | null = null;

export function getDeviceModel(): string {
  if (cachedDeviceModel) {
    return cachedDeviceModel;
  }

  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "Thiết bị không xác định";
  }

  const ua = navigator.userAgent || "";
  const screenW = Math.min(window.screen.width, window.screen.height);
  const screenH = Math.max(window.screen.width, window.screen.height);
  const dpr = Math.round((window.devicePixelRatio || 1) * 10) / 10;

  // 1. Phân loại Apple iOS (iPhone / iPad)
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  if (isIOS) {
    const isIPad = /iPad/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1 && screenW >= 768);
    if (isIPad) {
      cachedDeviceModel = "iPad";
      return cachedDeviceModel;
    }

    // Nhận diện dòng iPhone dựa trên độ phân giải màn hình logic và devicePixelRatio
    if (screenW === 393 && screenH === 852 && dpr === 3) {
      cachedDeviceModel = "iPhone 14 Pro / 15 / 16";
    } else if (screenW === 430 && screenH === 932 && dpr === 3) {
      cachedDeviceModel = "iPhone 14 Pro Max / 15 Plus / 15 Pro Max";
    } else if (screenW === 390 && screenH === 844 && dpr === 3) {
      cachedDeviceModel = "iPhone 12 / 13 / 14";
    } else if (screenW === 428 && screenH === 926 && dpr === 3) {
      cachedDeviceModel = "iPhone 12 / 13 Pro Max / 14 Plus";
    } else if (screenW === 375 && screenH === 812 && dpr === 3) {
      cachedDeviceModel = "iPhone X / XS / 11 Pro / 13 mini";
    } else if (screenW === 414 && screenH === 896 && dpr === 3) {
      cachedDeviceModel = "iPhone XS Max / 11 Pro Max";
    } else if (screenW === 414 && screenH === 896 && dpr === 2) {
      cachedDeviceModel = "iPhone 11 / XR";
    } else if (screenW === 375 && screenH === 667 && dpr === 2) {
      cachedDeviceModel = "iPhone SE / 8";
    } else if (screenW <= 430) {
      cachedDeviceModel = "iPhone";
    } else {
      cachedDeviceModel = "Thiết bị iOS";
    }

    return cachedDeviceModel;
  }

  // 2. Phân loại Android
  if (/Android/i.test(ua)) {
    // Thử trích xuất mã model từ chuỗi User Agent thông dụng
    // VD: Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/...
    const androidMatch = ua.match(/Android[^;]+;\s*([^;\)]+)\)/i);
    if (androidMatch && androidMatch[1]) {
      let model = androidMatch[1].trim();
      // Loại bỏ build number nếu có
      model = model.replace(/\s*Build\/.*$/i, "").trim();

      // Rút gọn các tiền tố quen thuộc
      if (model.startsWith("SM-")) {
        cachedDeviceModel = `Samsung (${model})`;
      } else if (model.includes("Pixel")) {
        cachedDeviceModel = `Google ${model}`;
      } else if (model.includes("Redmi") || model.includes("Mi ") || model.includes("POCO")) {
        cachedDeviceModel = `Xiaomi ${model}`;
      } else if (model.includes("CPH") || model.includes("OPPO")) {
        cachedDeviceModel = `OPPO (${model})`;
      } else if (model.includes("V2") || model.includes("vivo")) {
        cachedDeviceModel = `Vivo (${model})`;
      } else {
        cachedDeviceModel = `Android (${model})`;
      }
      return cachedDeviceModel;
    }

    cachedDeviceModel = "Thiết bị Android";
    return cachedDeviceModel;
  }

  // 3. Phân loại Desktop / Laptop
  if (/Windows/i.test(ua)) {
    cachedDeviceModel = "Windows PC";
    return cachedDeviceModel;
  }
  if (/Macintosh|Mac OS X/i.test(ua)) {
    cachedDeviceModel = "Mac (macOS)";
    return cachedDeviceModel;
  }
  if (/Linux/i.test(ua)) {
    cachedDeviceModel = "Linux PC";
    return cachedDeviceModel;
  }

  cachedDeviceModel = "Thiết bị khác";
  return cachedDeviceModel;
}
