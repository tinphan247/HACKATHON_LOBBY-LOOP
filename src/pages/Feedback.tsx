import { useMemo, useState, useRef, useEffect } from "react";
import OptionGrid from "../components/OptionGrid";
import QuestionScreen from "../components/QuestionScreen";
import RatingRow from "../components/RatingRow";
import { addFeedback } from "../lib/storage";
import { getAccurateDeviceModel, getDeviceModel } from "../lib/device";
import { fetchClientIp, getCachedIp } from "../lib/ip";
import {
  CSAT_QUESTION,
  HAPPY_MAX_SELECT,
  HAPPY_QUESTION,
  HAPPY_REASONS,
  ROOT_CAUSE_MAP,
  UNHAPPY_ISSUES,
  UNHAPPY_QUESTION,
} from "../lib/questions";
import { Feedback } from "../lib/types";

type Step =
  | "welcome"
  | "rating"
  | "happyReasons"
  | "happyFeedback"
  | "unhappyIssue"
  | "unhappyRootCause"
  | "unhappyAction"
  | "thankyou";

export default function FeedbackPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [rating, setRating] = useState<number | null>(null);
  const [happyReasons, setHappyReasons] = useState<string[]>([]);
  const [happyOtherText, setHappyOtherText] = useState("");
  const [happyComment, setHappyComment] = useState("");
  const [issue, setIssue] = useState<string | null>(null);
  const [issueOtherText, setIssueOtherText] = useState("");
  const [rootCause, setRootCause] = useState<string | null>(null);
  const [rootCauseOtherText, setRootCauseOtherText] = useState("");
  const [actionWanted, setActionWanted] = useState("");
  const [actionError, setActionError] = useState(false);

  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const branch = rating !== null && rating >= 4 ? "happy" : "unhappy";
  const rootCauseConfig = issue && issue !== "khac" ? ROOT_CAUSE_MAP[issue] : undefined;

  // Tính tổng số bước hiển thị trên thanh tiến độ
  const totalSteps = useMemo(() => {
    if (branch === "happy") return 3; // rating (1) -> reasons (2) -> happyFeedback (3)
    if (issue === "khac") return 3; // rating (1) -> issue (2) -> actionWanted (3)
    return 4; // rating (1) -> issue (2) -> rootCause (3) -> actionWanted (4)
  }, [branch, issue]);

  // Tự động kích hoạt lấy IP và phân giải chính xác model thiết bị ngay khi vào trang
  useEffect(() => {
    fetchClientIp();
    getAccurateDeviceModel();
  }, []);

  function clearTimer() {
    if (autoAdvanceTimer.current) {
      clearTimeout(autoAdvanceTimer.current);
      autoAdvanceTimer.current = null;
    }
  }

  async function submit(finalFeedback: Partial<Feedback>) {
    clearTimer();
    const detectedDevice = await getAccurateDeviceModel().catch(() => getDeviceModel());
    const clientIp = await fetchClientIp().catch(() => getCachedIp());

    // Gộp lý do khác nếu có
    let combinedComment = finalFeedback.comment || "";
    if (issue === "khac" && issueOtherText.trim()) {
      combinedComment = `[Vấn đề khác: ${issueOtherText.trim()}] ${combinedComment}`.trim();
    }
    if (rootCause === "khac" && rootCauseOtherText.trim()) {
      combinedComment = `[Nguyên nhân khác: ${rootCauseOtherText.trim()}] ${combinedComment}`.trim();
    }

    const record: Feedback = {
      id: `FB${Date.now()}`,
      rating: rating ?? 0,
      branch,
      timestamp: new Date().toISOString(),
      location: "Lobby",
      device: detectedDevice,
      ip: clientIp,
      comment: combinedComment || undefined,
      actionWanted: actionWanted.trim() || undefined,
      ...finalFeedback,
    };

    addFeedback(record);
    setStep("thankyou");
  }

  function resetSurvey() {
    clearTimer();
    setStep("welcome");
    setRating(null);
    setHappyReasons([]);
    setHappyOtherText("");
    setHappyComment("");
    setIssue(null);
    setIssueOtherText("");
    setRootCause(null);
    setRootCauseOtherText("");
    setActionWanted("");
    setActionError(false);
  }

  // ---------- CHỌN SAO (AUTO-ADVANCE) ----------
  function handleRatingSelect(value: number) {
    clearTimer();
    setRating(value);
    // Tự động chuyển bước sau 220ms
    autoAdvanceTimer.current = setTimeout(() => {
      setStep(value >= 4 ? "happyReasons" : "unhappyIssue");
    }, 220);
  }

  // ---------- NHÁNH HÀI LÒNG: CHỌN 1 LÝ DO DUY NHẤT (AUTO-ADVANCE) ----------
  function toggleHappyReason(id: string) {
    clearTimer();
    setHappyReasons([id]);
    // Nếu chọn option thông thường: tự động chuyển bước sau 220ms
    if (id !== "khac") {
      autoAdvanceTimer.current = setTimeout(() => {
        setStep("happyFeedback");
      }, 220);
    }
  }

  function proceedAfterHappyReasons() {
    clearTimer();
    if (happyReasons.length === 0) return;
    setStep("happyFeedback");
  }

  // ---------- NHÁNH KHIẾU NẠI: CHỌN VẤN ĐỀ ----------
  function handleIssueSelect(id: string) {
    clearTimer();
    setIssue(id);
    // Nếu chọn option thông thường: tự động chuyển bước sau 220ms
    if (id !== "khac") {
      autoAdvanceTimer.current = setTimeout(() => {
        setStep("unhappyRootCause");
      }, 220);
    }
  }

  function proceedAfterIssue() {
    clearTimer();
    if (!issue) return;
    if (issue === "khac") {
      setStep("unhappyAction");
    } else {
      setStep("unhappyRootCause");
    }
  }

  // ---------- NHÁNH KHIẾU NẠI: CHỌN NGUYÊN NHÂN GỐC ----------
  function handleRootCauseSelect(id: string) {
    clearTimer();
    setRootCause(id);
    // Nếu chọn option thông thường: tự động chuyển bước sang câu hỏi bắt buộc sau 220ms
    if (id !== "khac") {
      autoAdvanceTimer.current = setTimeout(() => {
        setStep("unhappyAction");
      }, 220);
    }
  }

  function proceedAfterRootCause() {
    clearTimer();
    if (!rootCause) return;
    setStep("unhappyAction");
  }

  // ---------- NHÁNH KHIẾU NẠI: SUBMIT CÂU HỎI BẮT BUỘC ----------
  function handleUnhappySubmit() {
    clearTimer();
    if (!actionWanted.trim() || actionWanted.trim().length < 3) {
      setActionError(true);
      return;
    }
    setActionError(false);
    submit({
      issue: issue || undefined,
      rootCause: rootCause || undefined,
      actionWanted: actionWanted.trim(),
    });
  }

  // ---------- NHÁNH HÀI LÒNG: SUBMIT CÂU HỎI TÙY CHỌN ----------
  function handleHappySubmit() {
    clearTimer();
    let reasons = [...happyReasons];
    if (happyOtherText.trim()) {
      reasons.push(`Khác: ${happyOtherText.trim()}`);
    }
    submit({
      satisfactionReasons: reasons,
      comment: happyComment.trim() || undefined,
    });
  }

  // ==================== 1. MÀN HÌNH CHÀO (WELCOME) ====================
  if (step === "welcome") {
    return (
      <div
        className="relative flex min-h-dvh w-full items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6"
        style={{ backgroundImage: "url('/cinema-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

        <div className="relative z-10 my-auto w-full max-w-[420px] rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-2xl">
          <img
            src="/galaxy-logo.png"
            alt="Galaxy Cinema"
            className="mx-auto h-12 w-auto object-contain"
          />

          <h1 className="mt-6 text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
            Khảo sát chất lượng dịch vụ
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Galaxy Cinema mong muốn lắng nghe trải nghiệm thực tế của bạn tại rạp hôm nay.
          </p>

          <div className="mt-6 rounded-2xl bg-[#F4F7F9] p-4 text-xs text-gray-600 leading-relaxed text-left">
            <p className="font-semibold text-gray-800">Quy trình đánh giá thông minh:</p>
            <p className="mt-1 text-gray-500">
              Chỉ từ 2 đến 3 câu hỏi nhanh gọn (~15 giây). Hệ thống tự động chuyển câu hỏi ngay khi bạn chạm lựa chọn.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStep("rating")}
            className="mt-6 w-full rounded-xl bg-[#034EA2] hover:bg-[#023b7a] py-3.5 text-base font-semibold text-white shadow-md transition-all active:scale-[0.98]"
          >
            Bắt đầu đánh giá
          </button>

          <p className="mt-4 text-xs text-gray-400">Không yêu cầu đăng nhập tài khoản</p>
        </div>
      </div>
    );
  }

  // ==================== 2. MÀN HÌNH CẢM ƠN (THANK YOU) ====================
  if (step === "thankyou") {
    return (
      <div
        className="relative flex min-h-dvh w-full items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6"
        style={{ backgroundImage: "url('/cinema-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

        <div className="relative z-10 my-auto w-full max-w-[420px] rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-2xl">
          {/* Badge trạng thái thuần typography & viền CSS không dùng bất kỳ icon nào */}
          <div className="mx-auto inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold uppercase tracking-wider">
            Ghi nhận thành công
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Cảm ơn quý khách!
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Ý kiến đóng góp của bạn đã được chuyển thẳng tới Ban quản lý rạp theo thời gian thực.
          </p>

          {branch === "unhappy" ? (
            <p className="mt-4 text-xs text-amber-800 bg-amber-50 rounded-xl p-3.5 border border-amber-200 leading-relaxed text-left">
              Galaxy Cinema chân thành xin lỗi vì trải nghiệm chưa trọn vẹn. Quản lý ca trực đã nhận thông tin và sẽ kiểm tra, khắc phục vấn đề ngay lập tức.
            </p>
          ) : (
            <p className="mt-4 text-xs text-emerald-800 bg-emerald-50 rounded-xl p-3.5 border border-emerald-200 leading-relaxed text-left">
              Galaxy Cinema xin cảm ơn sự tin tưởng của bạn. Chúc bạn có những phút giây xem phim thật tuyệt vời!
            </p>
          )}

          <button
            type="button"
            onClick={resetSurvey}
            className="mt-6 w-full rounded-xl bg-[#034EA2] hover:bg-[#023b7a] py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    );
  }

  // ==================== 3. CÂU 1: ĐÁNH GIÁ SAO (RATING) ====================
  if (step === "rating") {
    return (
      <QuestionScreen
        step={1}
        totalSteps={totalSteps}
        onBack={() => setStep("welcome")}
        eyebrow="Chạm vào lựa chọn của bạn (hệ thống sẽ tự chuyển bước)"
        question={CSAT_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("welcome")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition active:scale-95"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={rating === null}
              onClick={() => {
                clearTimer();
                if (rating !== null) {
                  setStep(rating >= 4 ? "happyReasons" : "unhappyIssue");
                }
              }}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Tiếp tục
            </button>
          </div>
        }
      >
        <RatingRow value={rating} onSelect={handleRatingSelect} />
      </QuestionScreen>
    );
  }

  // ==================== 4. NHÁNH HÀI LÒNG - BƯỚC 2: CHỌN LÝ DO ====================
  if (step === "happyReasons") {
    return (
      <QuestionScreen
        step={2}
        totalSteps={totalSteps}
        onBack={() => setStep("rating")}
        eyebrow="Chạm vào điều bạn hài lòng nhất (hệ thống sẽ tự chuyển tiếp)"
        question={HAPPY_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("rating")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition active:scale-95"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={happyReasons.length === 0}
              onClick={proceedAfterHappyReasons}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Tiếp tục
            </button>
          </div>
        }
      >
        <OptionGrid
          options={HAPPY_REASONS}
          selected={happyReasons}
          onToggle={toggleHappyReason}
          maxSelect={1}
          otherText={happyOtherText}
          onOtherTextChange={setHappyOtherText}
          otherPlaceholder="Ghi rõ lý do khác khiến bạn hài lòng..."
        />
      </QuestionScreen>
    );
  }

  // ==================== 5. NHÁNH HÀI LÒNG - BƯỚC 3: GÓP Ý THÊM (TÙY CHỌN) ====================
  if (step === "happyFeedback") {
    return (
      <QuestionScreen
        step={3}
        totalSteps={totalSteps}
        onBack={() => setStep("happyReasons")}
        eyebrow="Không bắt buộc - Bạn có thể bỏ qua và gửi ngay"
        question="Bạn có lời khen hoặc góp ý thêm nào muốn gửi đến đội ngũ nhân viên Galaxy hôm nay không?"
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("happyReasons")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition active:scale-95"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={handleHappySubmit}
              className="rounded-xl bg-[#034EA2] hover:bg-[#023b7a] px-6 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-sm active:scale-95"
            >
              Hoàn tất
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <textarea
            value={happyComment}
            onChange={(e) => setHappyComment(e.target.value)}
            placeholder="Chia sẻ thêm cảm nhận hoặc lời khen dành cho nhân viên phục vụ (nếu có)..."
            rows={4}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-xs sm:text-sm text-gray-800 outline-none focus:border-[#00BCD4] focus:bg-white transition"
          />
          <p className="text-[11px] text-gray-400 text-right">
            Có thể để trống và bấm Hoàn tất
          </p>
        </div>
      </QuestionScreen>
    );
  }

  // ==================== 6. NHÁNH KHIẾU NẠI - BƯỚC 2: CHỌN VẤN ĐỀ ====================
  if (step === "unhappyIssue") {
    return (
      <QuestionScreen
        step={2}
        totalSteps={totalSteps}
        onBack={() => setStep("rating")}
        eyebrow="Chạm vào vấn đề bạn gặp phải (tự động chuyển tiếp)"
        question={UNHAPPY_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("rating")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition active:scale-95"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={!issue}
              onClick={proceedAfterIssue}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Tiếp tục
            </button>
          </div>
        }
      >
        <OptionGrid
          options={UNHAPPY_ISSUES}
          selected={issue ? [issue] : []}
          onToggle={handleIssueSelect}
          otherText={issueOtherText}
          onOtherTextChange={setIssueOtherText}
          otherPlaceholder="Vui lòng nêu rõ vấn đề bạn gặp phải..."
        />
      </QuestionScreen>
    );
  }

  // ==================== 7. NHÁNH KHIẾU NẠI - BƯỚC 3: NGUYÊN NHÂN CỤ THỂ ====================
  if (step === "unhappyRootCause" && rootCauseConfig) {
    return (
      <QuestionScreen
        step={3}
        totalSteps={totalSteps}
        onBack={() => setStep("unhappyIssue")}
        eyebrow="Chạm vào nguyên nhân cụ thể bên dưới"
        question={rootCauseConfig.question}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("unhappyIssue")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition active:scale-95"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={!rootCause}
              onClick={proceedAfterRootCause}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs sm:text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Tiếp tục
            </button>
          </div>
        }
      >
        <OptionGrid
          options={rootCauseConfig.options}
          selected={rootCause ? [rootCause] : []}
          onToggle={handleRootCauseSelect}
          otherText={rootCauseOtherText}
          onOtherTextChange={setRootCauseOtherText}
          otherPlaceholder="Nhập cụ thể nguyên nhân chưa hài lòng..."
        />
      </QuestionScreen>
    );
  }

  // ==================== 8. NHÁNH KHIẾU NẠI - BƯỚC CUỐI: YÊU CẦU HỖ TRỢ (BẮT BUỘC) ====================
  if (step === "unhappyAction") {
    const prevStepName = issue === "khac" ? "unhappyIssue" : "unhappyRootCause";
    const isValid = actionWanted.trim().length >= 3;

    return (
      <QuestionScreen
        step={totalSteps}
        totalSteps={totalSteps}
        onBack={() => setStep(prevStepName)}
        eyebrow="Bắt buộc nhập để Quản lý rạp nắm thông tin và hỗ trợ kịp thời"
        question="Galaxy có thể làm gì ngay lúc này để hỗ trợ hoặc khắc phục sự cố cho bạn tốt hơn?"
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(prevStepName)}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-xs sm:text-sm font-medium text-gray-700 transition active:scale-95"
            >
              Quay lại
            </button>
            <button
              type="button"
              disabled={!isValid}
              onClick={handleUnhappySubmit}
              className="rounded-xl bg-[#034EA2] hover:bg-[#023b7a] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-xs sm:text-sm font-semibold text-white transition shadow-sm active:scale-95"
            >
              Gửi phản hồi
            </button>
          </div>
        }
      >
        <div className="flex flex-col gap-2">
          <textarea
            value={actionWanted}
            onChange={(e) => {
              setActionWanted(e.target.value);
              if (actionError && e.target.value.trim().length >= 3) {
                setActionError(false);
              }
            }}
            placeholder="Ví dụ: Cần đổi ghế ngồi, nhờ nhân viên kiểm tra lại điều hòa, kiểm tra lại bắp nước..."
            rows={4}
            className={`w-full resize-none rounded-2xl border p-4 text-xs sm:text-sm text-gray-900 outline-none transition ${
              actionError
                ? "border-rose-500 bg-rose-50/40"
                : "border-gray-200 bg-[#F8FAFC] focus:border-[#00BCD4] focus:bg-white"
            }`}
          />
          {actionError && (
            <p className="text-xs text-rose-600 font-medium">
              Vui lòng nhập mong muốn hỗ trợ để Quản lý rạp xử lý (tối thiểu 3 ký tự).
            </p>
          )}
          {!actionError && (
            <p className="text-[11px] text-gray-500 text-right">
              {actionWanted.trim().length}/3 ký tự tối thiểu
            </p>
          )}
        </div>
      </QuestionScreen>
    );
  }

  return null;
}
