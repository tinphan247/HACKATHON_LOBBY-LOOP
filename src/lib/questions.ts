export interface ChoiceOption {
  id: string;
  label: string;
}

export const RATING_SCALE = [
  { value: 1, label: "Rất không hài lòng" },
  { value: 2, label: "Không hài lòng" },
  { value: 3, label: "Bình thường" },
  { value: 4, label: "Hài lòng" },
  { value: 5, label: "Rất hài lòng" },
] as const;

export const CSAT_QUESTION =
  "Bạn hài lòng với trải nghiệm hôm nay tại Galaxy như thế nào?";

// ---------- BRANCH 1: HAPPY (rating >= 4) ----------
export const HAPPY_QUESTION = "Điều gì khiến bạn hài lòng nhất hôm nay?";
export const HAPPY_MAX_SELECT = 1;

export const HAPPY_REASONS: ChoiceOption[] = [
  { id: "phong_chieu", label: "Chất lượng phòng chiếu" },
  { id: "nhan_vien", label: "Nhân viên phục vụ tận tình" },
  { id: "fnb", label: "Bắp & nước ngon, phục vụ nhanh" },
  { id: "ve_sinh", label: "Không gian vệ sinh sạch sẽ" },
  { id: "khong_gian", label: "Không gian & cơ sở vật chất rạp" },
  { id: "dat_ve", label: "Đặt vé & giao dịch nhanh chóng" },
  { id: "khuyen_mai", label: "Chương trình khuyến mãi & ưu đãi" },
  { id: "khac", label: "Lý do khác" },
];

// ---------- BRANCH 2: UNHAPPY (rating <= 3) ----------
export const UNHAPPY_QUESTION = "Điều gì khiến bạn chưa hài lòng nhất hôm nay?";

export const UNHAPPY_ISSUES: ChoiceOption[] = [
  { id: "quay_ve", label: "Quầy vé / thời gian chờ đợi" },
  { id: "nhan_vien", label: "Thái độ & phục vụ của nhân viên" },
  { id: "fnb", label: "Bắp nước / dịch vụ F&B" },
  { id: "ve_sinh", label: "Vệ sinh khu vực rạp" },
  { id: "khong_gian", label: "Không gian & cơ sở vật chất" },
  { id: "am_thanh_hinh_anh", label: "Chất lượng âm thanh / hình ảnh chiếu" },
  { id: "lich_chieu", label: "Lịch chiếu / suất chiếu" },
  { id: "dat_ve", label: "Đặt vé / giao dịch online" },
  { id: "khuyen_mai", label: "Khuyến mãi / ưu đãi thành viên" },
  { id: "khac", label: "Vấn đề khác" },
];

interface RootCauseConfig {
  question: string;
  options: ChoiceOption[];
}

// Maps each unhappy issue id -> its root-cause drill-down question.
export const ROOT_CAUSE_MAP: Record<string, RootCauseConfig> = {
  nhan_vien: {
    question: "Điều gì về phục vụ khiến bạn chưa hài lòng?",
    options: [
      { id: "thai_do", label: "Thái độ chưa thân thiện, niềm nở" },
      { id: "phuc_vu_cham", label: "Tốc độ phục vụ còn chậm" },
      { id: "chua_chu_dong", label: "Chưa chủ động hỗ trợ khách hàng" },
      { id: "tu_van", label: "Tư vấn chưa rõ ràng / chưa giải đáp thắc mắc" },
      { id: "xu_ly_tinh_huong", label: "Cách xử lý tình huống chưa thỏa đáng" },
      { id: "khac", label: "Lý do khác" },
    ],
  },
  quay_ve: {
    question: "Bạn gặp vấn đề gì tại khu vực quầy vé?",
    options: [
      { id: "cho_lau", label: "Thời gian chờ gọi số / đến lượt quá lâu" },
      { id: "xep_hang", label: "Hàng chờ đông, điều phối chưa tốt" },
      { id: "thanh_toan", label: "Thanh toán (tiền mặt / POS / QR) bị lỗi" },
      { id: "nhan_ve", label: "Khó khăn khi in / nhận vé đã đặt" },
      { id: "khac", label: "Lý do khác" },
    ],
  },
  fnb: {
    question: "Bạn chưa hài lòng về điều gì ở bắp nước?",
    options: [
      { id: "huong_vi", label: "Hương vị bắp / nước chưa đạt chuẩn" },
      { id: "nhiet_do", label: "Bắp nguội / nước ngọt ít đá hoặc quá ngọt" },
      { id: "sai_thieu_mon", label: "Giao sai hoặc thiếu món trong combo" },
      { id: "cho_lau", label: "Thời gian chờ lấy bắp nước quá lâu" },
      { id: "gia", label: "Giá cả / combo chưa tương xứng chất lượng" },
      { id: "khac", label: "Lý do khác" },
    ],
  },
  ve_sinh: {
    question: "Bạn nhận thấy vấn đề vệ sinh ở khu vực nào?",
    options: [
      { id: "phong_chieu", label: "Rác trong phòng chiếu chưa được dọn sạch" },
      { id: "nha_ve_sinh", label: "Khu vực nhà vệ sinh chưa sạch sẽ" },
      { id: "lobby", label: "Sảnh chờ (Lobby) bừa bộn" },
      { id: "ghe", label: "Ghế ngồi có vết bẩn / dính nước" },
      { id: "khac", label: "Khu vực khác" },
    ],
  },
  khong_gian: {
    question: "Bạn chưa hài lòng về cơ sở vật chất ở điểm nào?",
    options: [
      { id: "ghe_ngoi", label: "Ghế ngồi không thoải mái / bị kẹt" },
      { id: "nhiet_do_dieu_hoa", label: "Nhiệt độ phòng quá lạnh hoặc quá nóng" },
      { id: "khong_gian", label: "Không gian sảnh chờ chật chội, thiếu chỗ ngồi" },
      { id: "co_so_hu_hong", label: "Trang thiết bị tại rạp bị hư hỏng" },
      { id: "khac", label: "Điểm khác" },
    ],
  },
  am_thanh_hinh_anh: {
    question: "Bạn gặp vấn đề gì về chất lượng chiếu phim?",
    options: [
      { id: "am_thanh_nho", label: "Âm thanh quá nhỏ hoặc quá chói" },
      { id: "am_thanh_re", label: "Loa bị rè / mất tiếng một bên" },
      { id: "hinh_anh_mo", label: "Màn chiếu bị mờ / lệch góc" },
      { id: "anh_sang", label: "Ánh sáng đèn phòng chưa tắt đúng lúc" },
      { id: "su_co", label: "Sự cố gián đoạn trong khi xem phim" },
      { id: "khac", label: "Vấn đề khác" },
    ],
  },
  lich_chieu: {
    question: "Vấn đề về lịch chiếu bạn gặp phải là gì?",
    options: [
      { id: "khong_co_suat", label: "Không có suất chiếu phù hợp với thời gian" },
      { id: "thoi_gian_chua_thuan_tien", label: "Khoảng cách giữa các suất chiếu chưa hợp lý" },
      { id: "qua_it_suat", label: "Phim mong muốn có quá ít suất chiếu" },
      { id: "suat_thay_doi", label: "Suất chiếu bị đổi phòng hoặc dời giờ" },
      { id: "khac", label: "Lý do khác" },
    ],
  },
  dat_ve: {
    question: "Bạn gặp khó khăn ở khâu nào khi đặt vé trực tuyến?",
    options: [
      { id: "tim_phim", label: "Khó tìm phim / rạp / suất chiếu" },
      { id: "chon_ghe", label: "Sơ đồ ghế hiển thị chậm hoặc lỗi chọn ghế" },
      { id: "thanh_toan", label: "Cổng thanh toán bị lỗi hoặc trừ tiền chậm" },
      { id: "nhan_ve", label: "Không nhận được mã vé qua email / SMS" },
      { id: "khac", label: "Khó khăn khác" },
    ],
  },
  khuyen_mai: {
    question: "Bạn chưa hài lòng điều gì về chương trình ưu đãi?",
    options: [
      { id: "kho_tim", label: "Khó tìm và theo dõi thông tin ưu đãi" },
      { id: "dieu_kien_chua_ro", label: "Điều kiện áp dụng voucher / điểm chưa rõ ràng" },
      { id: "khong_ap_dung_duoc", label: "Mã giảm giá không áp dụng được tại quầy" },
      { id: "chua_phu_hop", label: "Ưu đãi chưa thực sự hấp dẫn" },
      { id: "khac", label: "Lý do khác" },
    ],
  },
};

export const OTHER_COMMENT_QUESTION =
  "Bạn có thể chia sẻ cụ thể hơn vấn đề mình gặp phải không?";

/** Human-readable label lookup */
export function labelForIssue(issueId?: string): string {
  if (!issueId) return "—";
  return UNHAPPY_ISSUES.find((o) => o.id === issueId)?.label ?? issueId;
}

export function labelForRootCause(issueId?: string, rootCauseId?: string): string {
  if (!issueId || !rootCauseId) return "—";
  const config = ROOT_CAUSE_MAP[issueId];
  return config?.options.find((o) => o.id === rootCauseId)?.label ?? rootCauseId;
}
