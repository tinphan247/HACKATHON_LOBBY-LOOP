import { Link } from "react-router-dom";

const links = [
  {
    to: "/qr",
    title: "1. Màn hình QR Lobby",
    subtitle: "Trình chiếu quầy",
    desc: "Màn hình đặt tại quầy sảnh để khách và Ban Giám Khảo quét mã bằng điện thoại thật.",
    btnText: "Mở màn hình QR →",
  },
  {
    to: "/feedback",
    title: "2. Ứng dụng Khách hàng",
    subtitle: "Giao diện Mobile",
    desc: "Màn hình khách hàng nhận được sau khi quét QR. Phân luồng câu hỏi 10 giây thông minh.",
    btnText: "Thử làm khảo sát →",
  },
  {
    to: "/dashboard",
    title: "3. Dashboard Quản trị",
    subtitle: "Real-time Analytics",
    desc: "Theo dõi chỉ số CSAT, bóc tách nguyên nhân cốt lõi (Root Cause) và cảnh báo Lobby Alert.",
    btnText: "Xem Dashboard →",
  },
];

export default function LandingPage() {
  return (
    <div
      className="relative flex min-h-dvh flex-col items-center justify-center bg-cover bg-center bg-no-repeat px-6 py-12"
      style={{ backgroundImage: "url('/cinema-bg.png')" }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <img
          src="/galaxy-logo.png"
          alt="Galaxy Cinema"
          className="mx-auto h-14 sm:h-16 w-auto object-contain drop-shadow-lg"
        />

        <div className="mt-4 inline-block rounded-full bg-amber-500/20 border border-amber-400/40 px-4 py-1 text-xs font-semibold text-amber-300 uppercase tracking-wider">
          Hệ sinh thái vận hành Lobby Loop
        </div>

        <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          HỆ THỐNG KHẢO SÁT & QUẢN TRỊ TRẢI NGHIỆM KHÁCH HÀNG
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm sm:text-base text-gray-300 leading-relaxed">
          Triết lý: <strong>Ask Less — Ask Right — Act Fast</strong>. Bán nhiều hơn, vận hành tự động, thấu hiểu khách hàng tức thì.
        </p>

        {/* 3 Action Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3 text-left">
          {links.map(({ to, title, subtitle, desc, btnText }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col justify-between rounded-2xl bg-white/95 hover:bg-white p-5 sm:p-6 shadow-xl transition-all duration-200 hover:-translate-y-1"
            >
              <div>
                <span className="text-[11px] font-bold text-[#034EA2] uppercase tracking-wider">
                  {subtitle}
                </span>
                <h2 className="mt-1 text-base sm:text-lg font-bold text-gray-900 leading-snug">
                  {title}
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {desc}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-[#034EA2] group-hover:text-[#023b7a]">
                <span>{btnText}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-xs text-gray-400">
          Galaxy Cinema · Bản quyền hệ thống vận hành Lobby Loop Prototype
        </div>
      </div>
    </div>
  );
}
