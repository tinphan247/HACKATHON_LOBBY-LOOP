import { useMemo, useState } from "react";
import OptionGrid from "../components/OptionGrid";
import QuestionScreen from "../components/QuestionScreen";
import RatingRow from "../components/RatingRow";
import { addFeedback } from "../lib/storage";
import {
  CSAT_QUESTION,
  HAPPY_MAX_SELECT,
  HAPPY_QUESTION,
  HAPPY_REASONS,
  OTHER_COMMENT_QUESTION,
  ROOT_CAUSE_MAP,
  UNHAPPY_ISSUES,
  UNHAPPY_QUESTION,
} from "../lib/questions";
import { Feedback } from "../lib/types";

type Step =
  | "welcome"
  | "rating"
  | "happyReasons"
  | "unhappyIssue"
  | "unhappyRootCause"
  | "unhappyOther"
  | "thankyou";

export default function FeedbackPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [rating, setRating] = useState<number | null>(null);
  const [happyReasons, setHappyReasons] = useState<string[]>([]);
  const [issue, setIssue] = useState<string | null>(null);
  const [rootCause, setRootCause] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  const branch = rating !== null && rating >= 4 ? "happy" : "unhappy";
  const rootCauseConfig = issue ? ROOT_CAUSE_MAP[issue] : undefined;

  // Total on-screen steps for the progress bar
  const totalSteps = useMemo(() => {
    if (branch === "happy") return 2; // rating -> reasons
    if (issue === "khac") return 3; // rating -> issue -> free text
    return 3; // rating -> issue -> root cause
  }, [branch, issue]);

  function submit(finalFeedback: Partial<Feedback>) {
    const record: Feedback = {
      id: `FB${Date.now()}`,
      rating: rating ?? 0,
      branch,
      timestamp: new Date().toISOString(),
      location: "Lobby",
      ...finalFeedback,
    };
    addFeedback(record);
    setStep("thankyou");
  }

  function resetSurvey() {
    setStep("welcome");
    setRating(null);
    setHappyReasons([]);
    setIssue(null);
    setRootCause(null);
    setComment("");
  }

  function handleRatingSelect(value: number) {
    setRating(value);
  }

  function proceedAfterRating() {
    if (rating === null) return;
    setStep(rating >= 4 ? "happyReasons" : "unhappyIssue");
  }

  function toggleHappyReason(id: string) {
    setHappyReasons((prev) =>
      prev.includes(id)
        ? prev.filter((r) => r !== id)
        : prev.length < HAPPY_MAX_SELECT
        ? [...prev, id]
        : prev
    );
  }

  function handleIssueSelect(id: string) {
    setIssue(id);
  }

  function proceedAfterIssue() {
    if (!issue) return;
    setStep(issue === "khac" ? "unhappyOther" : "unhappyRootCause");
  }

  function handleRootCauseSelect(id: string) {
    setRootCause(id);
  }

  function proceedAfterRootCause() {
    if (!rootCause) return;
    if (rootCause === "khac") {
      setStep("unhappyOther");
      return;
    }
    submit({ issue: issue!, rootCause });
  }

  // ---------- 1. WELCOME SCREEN ----------
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

          <div className="mt-6 rounded-2xl bg-[#F4F7F9] p-4 text-xs text-gray-500 leading-relaxed">
            Khảo sát thông minh chỉ từ <strong>2 – 3 câu hỏi nhanh</strong> (~15 giây) giúp cải thiện dịch vụ ngay lập tức.
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

  // ---------- 2. THANK YOU SCREEN ----------
  if (step === "thankyou") {
    return (
      <div
        className="relative flex min-h-dvh w-full items-center justify-center bg-cover bg-center bg-no-repeat p-4 sm:p-6"
        style={{ backgroundImage: "url('/cinema-bg.png')" }}
      >
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px]" />

        <div className="relative z-10 my-auto w-full max-w-[420px] rounded-[28px] bg-white p-6 sm:p-8 text-center shadow-2xl">
          {/* Clean pure-CSS check badge */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 text-2xl font-bold">
            ✓
          </div>

          <h1 className="mt-5 text-2xl font-bold text-gray-900">
            Cảm ơn bạn!
          </h1>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Ý kiến đóng góp của bạn đã được chuyển thẳng tới Ban quản lý rạp.
          </p>

          {branch === "unhappy" ? (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-xl p-3 border border-amber-100 leading-relaxed">
              Galaxy Cinema chân thành xin lỗi vì trải nghiệm chưa trọn vẹn và sẽ tiến hành kiểm tra, khắc phục sự cố ngay trong ca trực.
            </p>
          ) : (
            <p className="mt-3 text-xs text-emerald-700 bg-emerald-50 rounded-xl p-3 border border-emerald-100 leading-relaxed">
              Chúc bạn có những phút giây thư giãn tuyệt vời tại rạp chiếu phim Galaxy!
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

  // ---------- 3. STEP 1: RATING (Matching Hình 1) ----------
  if (step === "rating") {
    return (
      <QuestionScreen
        step={1}
        totalSteps={totalSteps}
        onBack={() => setStep("welcome")}
        eyebrow="Vui lòng chọn câu trả lời bạn đồng tình nhất ở bên dưới"
        question={CSAT_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("welcome")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-sm font-medium text-gray-700 transition active:scale-95"
            >
              ← Câu trước
            </button>
            <button
              type="button"
              disabled={rating === null}
              onClick={proceedAfterRating}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Câu tiếp →
            </button>
          </div>
        }
      >
        <RatingRow value={rating} onSelect={handleRatingSelect} />
      </QuestionScreen>
    );
  }

  // ---------- 4. STEP 2: HAPPY REASONS ----------
  if (step === "happyReasons") {
    return (
      <QuestionScreen
        step={2}
        totalSteps={totalSteps}
        onBack={() => setStep("rating")}
        eyebrow={`Chọn tối đa ${HAPPY_MAX_SELECT} điều bạn hài lòng nhất`}
        question={HAPPY_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("rating")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-sm font-medium text-gray-700 transition active:scale-95"
            >
              ← Câu trước
            </button>
            <button
              type="button"
              disabled={happyReasons.length === 0}
              onClick={() => submit({ satisfactionReasons: happyReasons })}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Hoàn tất ✓
            </button>
          </div>
        }
      >
        <OptionGrid
          options={HAPPY_REASONS}
          selected={happyReasons}
          onToggle={toggleHappyReason}
          maxSelect={HAPPY_MAX_SELECT}
        />
      </QuestionScreen>
    );
  }

  // ---------- 5. STEP 2: UNHAPPY ISSUE (Matching Hình 2) ----------
  if (step === "unhappyIssue") {
    return (
      <QuestionScreen
        step={2}
        totalSteps={totalSteps}
        onBack={() => setStep("rating")}
        eyebrow="Vui lòng chọn câu trả lời bạn đồng tình nhất ở bên dưới"
        question={UNHAPPY_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("rating")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-sm font-medium text-gray-700 transition active:scale-95"
            >
              ← Câu trước
            </button>
            <button
              type="button"
              disabled={!issue}
              onClick={proceedAfterIssue}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Câu tiếp →
            </button>
          </div>
        }
      >
        <OptionGrid
          options={UNHAPPY_ISSUES}
          selected={issue ? [issue] : []}
          onToggle={handleIssueSelect}
        />
      </QuestionScreen>
    );
  }

  // ---------- 6. STEP 3: UNHAPPY ROOT CAUSE ----------
  if (step === "unhappyRootCause" && rootCauseConfig) {
    return (
      <QuestionScreen
        step={3}
        totalSteps={totalSteps}
        onBack={() => setStep("unhappyIssue")}
        eyebrow="Vui lòng chọn nguyên nhân cụ thể bên dưới"
        question={rootCauseConfig.question}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep("unhappyIssue")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-sm font-medium text-gray-700 transition active:scale-95"
            >
              ← Câu trước
            </button>
            <button
              type="button"
              disabled={!rootCause}
              onClick={proceedAfterRootCause}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Hoàn tất ✓
            </button>
          </div>
        }
      >
        <OptionGrid
          options={rootCauseConfig.options}
          selected={rootCause ? [rootCause] : []}
          onToggle={handleRootCauseSelect}
        />
      </QuestionScreen>
    );
  }

  // ---------- 7. STEP 3: FREE-TEXT COMMENT ----------
  if (step === "unhappyOther") {
    return (
      <QuestionScreen
        step={3}
        totalSteps={totalSteps}
        onBack={() => setStep(issue === "khac" ? "unhappyIssue" : "unhappyRootCause")}
        eyebrow="Chia sẻ ngắn gọn để chúng tôi hỗ trợ bạn tốt nhất"
        question={OTHER_COMMENT_QUESTION}
        footer={
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(issue === "khac" ? "unhappyIssue" : "unhappyRootCause")}
              className="rounded-xl bg-[#EAEAEA] hover:bg-[#E0E0E0] px-5 py-2.5 text-sm font-medium text-gray-700 transition active:scale-95"
            >
              ← Câu trước
            </button>
            <button
              type="button"
              onClick={() => submit({ issue: issue!, rootCause: rootCause ?? undefined, comment })}
              className="rounded-xl bg-[#64B5F6] hover:bg-[#42A5F5] px-6 py-2.5 text-sm font-medium text-white transition shadow-sm active:scale-95"
            >
              Gửi phản hồi ✓
            </button>
          </div>
        }
      >
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập phản hồi chi tiết của bạn tại đây..."
          rows={4}
          className="w-full resize-none rounded-2xl border border-gray-200 bg-[#F8FAFC] p-4 text-sm text-gray-800 outline-none focus:border-[#00BCD4] focus:bg-white transition"
        />
      </QuestionScreen>
    );
  }

  return null;
}
