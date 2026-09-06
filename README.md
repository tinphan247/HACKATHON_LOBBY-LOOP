# LOBBY LOOP — Smart QR Feedback (Prototype)

**Ask less. Ask right. Act fast.**

Một web app cho phép khách quét QR thật → trả lời 2–4 câu hỏi (thay vì 12) →
hệ thống tự phân luồng theo mức độ hài lòng → dữ liệu đổ vào Dashboard theo
thời gian thực.

---

## A. Cách chạy project

Yêu cầu: Node.js 18+.

```bash
npm install
npm run dev
```

Vite sẽ in ra 2 địa chỉ, dạng:

```text
➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.23:5173/
```

Mở `http://localhost:5173/` trên laptop để xem landing page với 3 lối vào:
`/qr`, `/feedback`, `/dashboard`.

---

## B. Cách mở QR trên điện thoại (QUAN TRỌNG)

Điện thoại **không thể** mở `localhost` của laptop — đó là lý do QR không được
encode `localhost`.

1. Đảm bảo điện thoại và laptop **cùng một mạng Wi-Fi**.
2. Lấy "Network" URL mà Vite in ra (vd `http://192.168.1.23:5173`) — đây
   chính là local IP của laptop.
3. (Khuyến nghị) Copy phần IP đó vào file `.env`:

   ```bash
   cp .env.example .env
   ```

   Sửa dòng:

   ```
   VITE_PUBLIC_URL=http://192.168.1.23:5173/feedback
   ```

   Restart `npm run dev` sau khi sửa `.env`.

4. Mở `http://192.168.1.23:5173/qr` (dùng chính IP ở bước 2, không phải
   `localhost`) trên laptop — đây là màn hình QR để trình chiếu.
5. Dùng camera điện thoại quét QR → web app `/feedback` mở trực tiếp trên
   điện thoại, không cần cài app.

Nếu không set `VITE_PUBLIC_URL`, trang `/qr` sẽ tự dùng URL hiện tại của
chính nó — nghĩa là bạn **phải** mở `/qr` qua IP mạng LAN (không phải
`localhost`) để QR encode đúng địa chỉ mà điện thoại có thể truy cập được.

---

## C. Các URL demo

| URL          | Dùng cho                                              |
| ------------ | ------------------------------------------------------ |
| `/`          | Landing page — lối vào nhanh tới 3 màn hình dưới đây    |
| `/qr`        | Màn hình Lobby — QR thật, trình chiếu trên máy chủ demo |
| `/feedback`  | Web app khách hàng — mở sau khi quét QR                 |
| `/dashboard` | Dashboard cho quản lý — CSAT, top issues, root cause    |

---

## D. Demo script 60 giây

> "Đây là QR của LOBBY LOOP — thay vì bắt khách trả lời 12 câu hỏi như hệ
> thống cũ, chúng tôi chỉ hỏi đúng những gì cần thiết.
>
> Em sẽ dùng điện thoại thật để quét QR này ngay bây giờ."
>
> *(Quét QR bằng điện thoại thật → mở `/feedback`)*
>
> "Câu đầu tiên và cũng gần như là câu duy nhất bắt buộc: khách hài lòng ở
> mức nào. Nếu em chọn 5 sao..."
>
> *(Chọn 5⭐ → hệ thống tự chuyển sang câu 'hài lòng nhất điều gì' → chọn
> 'Nhân viên phục vụ' → Thank you)*
>
> "...hệ thống chỉ hỏi thêm đúng 1 câu, rồi kết thúc. Toàn bộ mất khoảng
> 10 giây.
>
> Bây giờ em thử lại với một khách chưa hài lòng."
>
> *(Trên laptop, mở thêm 1 tab `/feedback` — đóng vai khách hàng thứ 2 —
> chọn 2⭐ → 'Thái độ & phục vụ của nhân viên' → 'Thái độ chưa thân thiện'
> → Thank you)*
>
> "Ngay lập tức, Dashboard cập nhật: CSAT, top issues, và quan trọng nhất —
> root cause thật sự đằng sau con số. Nếu một vấn đề lặp lại nhiều lần
> trong thời gian ngắn, hệ thống tự cảnh báo và đề xuất hành động — không
> cần chờ báo cáo cuối ngày."
>
> *(Chuyển qua tab `/dashboard` đã mở sẵn, chỉ vào KPI cards → Lobby Alert
> → Top issues → Live feedback)*
>
> "Đó là LOBBY LOOP: ask less, ask right, act fast."

**Lưu ý khi demo:** mở `/dashboard` và `/feedback` (tab thứ 2, đóng vai
"khách hàng trên laptop") **trong cùng một trình duyệt trên laptop** — xem
mục Kiến trúc bên dưới để hiểu vì sao. Điện thoại thật dùng để chứng minh QR
là QR thật và mở đúng web app; tab thứ 2 trên laptop dùng để đảm bảo dữ liệu
đổ vào Dashboard *ngay trước mắt BGK*, không phụ thuộc kết nối mạng của điện
thoại lúc trình chiếu.

---

## E. Kiến trúc

```text
QR (/qr)
   ↓
Web App khách hàng (/feedback)
   ↓
Conditional Logic (src/lib/questions.ts — data-driven, chỉ 2 nhánh)
   ↓
Storage layer (src/lib/storage.ts) → hiện tại: localStorage
   ↓
Dashboard (/dashboard) — đọc + subscribe qua storage layer
   ↓
Action (Lobby Alert + Recommended Action)
```

Toàn bộ phần đọc/ghi dữ liệu đi qua **một layer duy nhất**:
`src/lib/storage.ts` (`getAllFeedback`, `addFeedback`, `resetToSampleData`,
`subscribeToFeedback`). Muốn thay localStorage bằng Firebase/Supabase/API
thật, chỉ cần viết lại 4 hàm này với cùng chữ ký (signature) — không phải
sửa `Feedback.tsx` hay `Dashboard.tsx`.

### ⚠️ Giới hạn quan trọng của localStorage (đọc trước khi demo)

`localStorage` lưu theo **từng trình duyệt trên từng thiết bị**, không phải
theo server. Nghĩa là:

- Nếu khách quét QR bằng **điện thoại thật** và submit feedback, dữ liệu đó
  nằm trong localStorage **của điện thoại**, không tự động xuất hiện trên
  Dashboard mở trên **laptop** (hai thiết bị khác nhau).
- Nếu bạn mở `/feedback` và `/dashboard` trong **hai tab của cùng một
  trình duyệt** (vd 2 tab Chrome trên cùng laptop), chúng **chia sẻ chung**
  localStorage → Dashboard sẽ cập nhật ngay lập tức khi tab kia submit.

Đây là lý do demo script ở mục D dùng điện thoại thật để chứng minh QR/UX
thật, nhưng dùng thêm một tab trên laptop để đảm bảo Dashboard cập nhật live
trước mặt BGK. Đây là giới hạn cố ý được đánh đổi để giữ prototype **không
cần backend**, đúng như yêu cầu ban đầu. Khi lên production, thay
`storage.ts` bằng một API thật (Firebase/Supabase/Express) là đủ để đồng bộ
thật sự giữa nhiều thiết bị — kiến trúc đã được chuẩn bị sẵn cho việc đó.

### Cấu trúc thư mục

```text
src/
  components/     UI dùng chung (rating row, option grid, KPI card, ...)
  lib/
    types.ts      Data model (Feedback, DashboardAlert)
    questions.ts  Toàn bộ logic phân nhánh + câu hỏi (data-driven)
    storage.ts    Layer duy nhất chạm vào localStorage
    sampleData.ts Sinh demo data khi Dashboard mở lần đầu
    analytics.ts  KPI, top issues, root cause, rule-based alert
  pages/
    Landing.tsx   Trang chủ demo (lối vào 3 khu vực)
    Feedback.tsx  State machine của survey (welcome → rating → nhánh → thank you)
    QR.tsx        Màn hình QR thật cho Lobby
    Dashboard.tsx Trang Admin Dashboard
```

---

## Data model

```ts
interface Feedback {
  id: string;
  rating: number; // 1-5
  branch: "happy" | "unhappy";
  satisfactionReasons?: string[]; // nhánh happy, tối đa 2
  issue?: string;                  // nhánh unhappy
  rootCause?: string;              // nhánh unhappy
  comment?: string;                // chỉ dùng cho "Khác"
  timestamp: string;               // ISO
  location?: string;
  isDemo?: boolean;
}
```

## Reset demo data

Vào `/dashboard` → nút **Reset demo data** ở góc phải trên: xoá toàn bộ
feedback hiện tại và nạp lại bộ sample data mới (random mỗi lần).
