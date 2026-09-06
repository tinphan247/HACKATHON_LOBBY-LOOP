import { QRCodeSVG } from "qrcode.react";

function resolveFeedbackUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_URL as string | undefined;
  if (configured && configured.trim().length > 0) return configured.trim();
  return `${window.location.origin}/feedback`;
}

export default function QRPage() {
  const feedbackUrl = resolveFeedbackUrl();
  const isLocalhost = feedbackUrl.includes("localhost") || feedbackUrl.includes("127.0.0.1");

  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-12 text-center"
      style={{ backgroundImage: "url('/cinema-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        <img
          src="/galaxy-logo.png"
          alt="Galaxy Cinema"
          className="h-14 sm:h-16 w-auto object-contain drop-shadow-lg"
        />

        <p className="mt-4 text-base sm:text-lg font-semibold text-white/90">
          Khảo sát trải nghiệm dịch vụ khách hàng
        </p>
        <p className="mt-1 text-xs sm:text-sm text-gray-300">
          Quét mã bằng camera điện thoại để thực hiện đánh giá
        </p>

        {/* QR container */}
        <div className="mt-7 rounded-[28px] bg-white p-6 sm:p-7 shadow-2xl ring-4 ring-white/10">
          <QRCodeSVG
            value={feedbackUrl}
            size={230}
            bgColor="#FFFFFF"
            fgColor="#034EA2"
            level="M"
          />
        </div>

        <p className="mt-5 text-xs text-gray-300">
          Hệ thống khảo sát thông minh phân luồng <strong>Ask Less, Ask Right</strong>
        </p>

        <p className="mt-2 max-w-xs break-all rounded-full bg-white/10 px-4 py-1.5 text-[11px] text-gray-300 font-mono">
          {feedbackUrl}
        </p>

        {isLocalhost && (
          <p className="mt-3 max-w-xs text-xs text-amber-300 bg-amber-950/60 border border-amber-500/30 rounded-xl p-2.5 leading-relaxed">
            Đang trỏ tới "localhost" — điện thoại cùng Wi-Fi cần quét qua IP LAN (đã được cấu hình trong .env).
          </p>
        )}

        <div className="mt-7 flex items-center gap-3">
          <a
            href="/feedback"
            className="rounded-xl bg-[#034EA2] hover:bg-[#023b7a] px-6 py-2.5 text-sm font-semibold text-white transition-all shadow-md"
          >
            Mở thử nghiệm Feedback →
          </a>
          <a
            href="/"
            className="rounded-xl bg-white/15 hover:bg-white/20 px-5 py-2.5 text-sm font-medium text-white transition-all"
          >
            Trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
