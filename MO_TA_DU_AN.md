# 🎬 LOBBY LOOP — TỐI ƯU HÓA TOÀN DIỆN LUỒNG VẬN HÀNH TẠI LOBBY

> **Slogan:** *Ask Less. Ask Right. Act Fast.*  
> **Bộ 3 giá trị cốt lõi:** **SELL** (Bán nhiều hơn) – **AUTOMATE** (Vận hành tự động) – **LISTEN** (Lắng nghe thông minh)

---

## 1. TỔNG QUAN DỰ ÁN

Trong hệ sinh thái cụm rạp chiếu phim hiện đại, khu vực **Lobby** (tiền sảnh) không đơn thuần là không gian chờ, mà là một **"High-Conversion Revenue Hub"** — điểm chạm chiến lược quyết định phần lớn giá trị gia tăng và trải nghiệm sau cùng của khách hàng.

Tuy nhiên, hiệu suất và trải nghiệm tại Lobby đang bị kìm hãm bởi **3 điểm gãy vận hành lớn** (trước, trong/sau và cuối hành trình). 

**LOBBY LOOP** ra đời nhằm tái cấu trúc và khép kín chu trình vận hành:
$$\text{Bán hàng} \longrightarrow \text{Ghi nhận tự động} \longrightarrow \text{Lắng nghe thông minh} \longrightarrow \text{Cải thiện tức thì} \longrightarrow \text{Tăng trưởng doanh thu}$$

---

## 2. THỰC TRẠNG & 3 ĐIỂM GÃY VẬN HÀNH (PAIN POINTS)

| Vị trí điểm gãy | Thực trạng hiện tại | Hậu quả & Tổn thất |
| :--- | :--- | :--- |
| **1. Trước giao dịch** *(Khả năng bán hàng)* | Tablet tại Lobby chỉ hiển thị menu hạn chế (chủ yếu là 1-2 combo lớn đắt tiền), không đồng bộ đầy đủ các sản phẩm/combo phổ thông như POS quầy Concession (CO). | • **Mất khách (Lost Sales):** Khách đến sát giờ chiếu không kịp xếp hàng quầy CO, muốn mua combo vừa/nhỏ nhưng Tablet không có, đành bỏ vào phòng chiếu.<br>• **Xung đột KPI nội bộ:** Nhân viên Lobby bị giao target nhưng thiếu "vũ khí" bán hàng, tạo tâm lý bất công so với nhân viên quầy CO. |
| **2. Trong & sau giao dịch** *(Thao tác Redeem)* | Sau khi khách thanh toán thành công trên Tablet, nhân viên phải nhớ **bấm nút Redeem thủ công** trên hệ thống để trừ tồn kho. | • **Sai lệch kho hàng:** Giờ cao điểm (Peak hour), nhân viên quên hoặc bấm thiếu Redeem.<br>• **Phình to chi phí quản trị (Administrative Bloat):** Quản lý và nhân viên mất **30 – 60 phút cuối ca** để dò tìm hóa đơn lệch sổ sách, tăng chi phí OT và áp lực công việc. |
| **3. Sau trải nghiệm** *(Khảo sát QR)* | Bảng khảo sát QR hiện tại dài từ **10 – 13 câu hỏi** cứng nhắc, hỏi tràn lan cho mọi khách hàng. | • **Ô nhiễm dữ liệu (Data Pollution):** Khách khó chịu, đóng trình duyệt hoặc bấm ngẫu nhiên 5 sao / 1 sao cho xong để nhận quà.<br>• **Quyết định sai lệch:** Ban quản lý nhận về dữ liệu nhiễu, không xác định được đúng **nguyên nhân gốc rễ (Root Cause)** để khắc phục. |

---

## 3. BỘ BA GIẢI PHÁP ĐỘT PHÁ CỦA LOBBY LOOP

```
                 ┌────────────────────────────────────────────────────────┐
                 │                       LOBBY LOOP                       │
                 │                 Closed-Loop Operation                  │
                 └───────────────────────────┬────────────────────────────┘
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         ▼                                   ▼                                   ▼
┌──────────────────┐               ┌──────────────────┐                ┌──────────────────┐
│   1. SELL MORE   │               │   2. AUTOMATE    │                │    3. LISTEN     │
│  Controlled Sync │               │ Auto-Redeem Sys  │                │ Smart Feedback QR│
├──────────────────┤               ├──────────────────┤                ├──────────────────┤
│• Đồng bộ POS và  │               │• Tự động trừ kho │                │• Phân nhánh logic│
│  Tablet linh hoạt│               │  ngay khi đơn    │                │• Hài lòng: 1-2câu│
│• Phù hợp năng lực│               │  Success         │                │• Không hài lòng: │
│  phục vụ Lobby   │               │• Zero quên/sót   │                │  đào sâu Root    │
│• Giảm xung đột   │               │• Đối soát < 5p   │                │  Cause + Alert   │
└──────────────────┘               └──────────────────┘                └──────────────────┘
```

### 3.1. Sell: Đồng bộ danh mục POS & Tablet có kiểm soát (Controlled Sync)
* **Cơ chế:** Không mở ồ ạt 100% món trên POS (tránh việc Lobby nhận đơn các món chế biến nóng phức tạp), mà cho phép Quản lý bật/tắt linh hoạt các combo bánh nước bán chạy, phù hợp với năng lực phục vụ cơ động tại sảnh.
* **Lợi ích:** Nhân viên Lobby tự tin tư vấn, chốt đơn tại chỗ cho khách sát giờ chiếu, tăng tỷ lệ chuyển đổi và xóa bỏ xung đột KPI giữa các bộ phận.

### 3.2. Automate: Tự động hóa trừ kho khi thanh toán thành công (Automated Inventory Integrity)
* **Cơ chế:** Gắn trigger tự động trừ tồn kho ngay khi giao dịch nhận trạng thái `Payment Success`, loại bỏ 100% nút bấm Redeem thủ công.
* **Lợi ích:** 
  - Triệt tiêu sai lệch kho do trí nhớ nhân viên.
  - Rút ngắn thời gian đối soát cuối ca từ **30–60 phút xuống dưới 5–10 phút**.
  - Tiết kiệm chi phí vận hành và giải phóng năng lượng cho nhân viên.

### 3.3. Listen: Khảo sát QR phân nhánh thông minh (Ask Less – Ask Right)
* **Triết lý:** Không khảo sát hàng loạt câu hỏi vô bổ, tôn trọng thời gian của khách hàng.
* **Luồng xử lý rẽ nhánh thông minh:**
  1. **Câu hỏi mở đầu:** Đánh giá mức độ hài lòng chung (1⭐ đến 5⭐).
  2. **Nhánh Hài lòng (4⭐ – 5⭐):** 
     - Chỉ hỏi thêm 1 câu: *"Điều gì làm bạn hài lòng nhất?"* (Thái độ nhân viên, Bắp nước ngon, Rạp sạch sẽ, Thủ tục nhanh).
     - Kết thúc trong vòng **10 giây** kèm lời cảm ơn chân thành.
  3. **Nhánh Không hài lòng (1⭐ – 3⭐):**
     - Tự động kích hoạt câu hỏi khoanh vùng vấn đề: *"Vấn đề bạn gặp phải ở khâu nào?"*
     - Đào sâu **Root Cause** chuyên biệt (Ví dụ: Thái độ nhân viên ➔ Chưa thân thiện / Không giải quyết vấn đề / Chờ quá lâu).
     - Cho phép ghi chú ngắn nếu chọn "Khác".
  4. **Hành động tức thì (Act Fast):** Đẩy dữ liệu về **Dashboard Ban Quản Lý**, tự động kích hoạt **Lobby Alert** cảnh báo vấn đề lặp lại và đề xuất giải pháp xử lý ngay lập tức.

---

## 4. BẢNG SO SÁNH HIỆU QUẢ TRƯỚC VÀ SAU KHI TRIỂN KHAI

| Tiêu chí | Trước khi có LOBBY LOOP | Sau khi có LOBBY LOOP | Hiệu quả cải tiến |
| :--- | :--- | :--- | :--- |
| **Khả năng chốt đơn Lobby** | Bị giới hạn danh mục, dễ mất khách sát giờ. | Linh hoạt, đa dạng combo bán chạy. | **Tăng tỷ lệ chuyển đổi F&B tại sảnh.** |
| **Ghi nhận hàng hóa** | Thủ công (nhân viên nhớ bấm Redeem). | Tự động 100% khi thanh toán thành công. | **Triệt tiêu lỗi quên Redeem (về 0%).** |
| **Thời gian đối soát kho** | 30 – 60 phút/ca (truy soát lỗi thủ công). | < 5 – 10 phút/ca (chỉ duyệt tổng hợp). | **Tiết kiệm ~85% thời gian đối soát.** |
| **Trải nghiệm khảo sát** | 10 – 13 câu hỏi, mất 2–3 phút, dễ bỏ cuộc. | 2 – 3 câu hỏi mục tiêu, chỉ mất 10–20 giây. | **Tăng tỷ lệ hoàn thành khảo sát.** |
| **Chất lượng dữ liệu** | Dữ liệu nhiễu (Data Pollution). | Dữ liệu sạch, phản ánh đúng thực tế. | **Bóc tách chính xác Root Cause.** |
| **Phản ứng vận hành** | Báo cáo thụ động cuối ngày/cuối tuần. | Real-time Dashboard + Lobby Alert tức thời. | **Xử lý sự cố ngay trong ca trực.** |

---

## 5. KIẾN TRÚC KỸ THUẬT & THIẾT KẾ CHUẨN GALAXY CINEMA

Dự án được tái thiết kế hoàn toàn theo phong cách thực tế của **Galaxy Cinema (galaxycine.vn)**, loại bỏ toàn bộ các icon thừa/phong cách AI để mang lại trải nghiệm thương hiệu chân thực:

* **Backdrop & Branding:** Sử dụng trực tiếp hình ảnh phòng chiếu phim cao cấp của Galaxy Cinema làm background và logo chính thức của Galaxy Cinema.
* **Kích thước Mobile-first:** Khung card khảo sát được cố định tỷ lệ chuẩn màn hình điện thoại cá nhân (`max-w-[420px]`), tối ưu hóa 100% cho thao tác chạm một tay khi khách quét mã QR tại rạp.
* **Giao diện phân bước chuẩn Galaxy (Hình 1 & Hình 2):**
  - **Màn hình Đánh giá (Bước 1):** 5 tùy chọn dạng chữ trực quan với radio button chuẩn Galaxy Cinema (Rất không hài lòng [1★] ➔ Không hài lòng [2★] ➔ Bình thường [3★] ➔ Hài lòng [4★] ➔ Rất hài lòng [5★]).
  - **Màn hình Câu hỏi (Bước 2 & 3):** Huy hiệu số thứ tự cyan tròn, các tùy chọn với radio button CSS thuần thanh lịch, nút điều hướng rõ ràng `← Câu trước` và `Câu tiếp →`.
  - **Loại bỏ hoàn toàn icon thừa:** Không dùng các icon minh họa rườm rà hay icon AI, tập trung vào sự tinh gọn, rõ ràng và tốc độ tải trang tức thì.
* **Công nghệ cốt lõi:** React 18, TypeScript, Vite, Tailwind CSS (Galaxy Blue `#034EA2`, Galaxy Orange `#F58220`, Cyan `#00BCD4`).
* **Cơ chế QR Không chạm:** Tự động encode IP mạng nội bộ (LAN) giúp điện thoại kết nối cùng Wi-Fi quét và trải nghiệm ngay lập tức.

### Cấu trúc thư mục mã nguồn:
```text
lobby-loop/
├── src/
│   ├── components/      # UI components: RatingRow, OptionGrid, KPICard, AlertBadge...
│   ├── lib/
│   │   ├── types.ts     # Data model (Feedback, Alert, IssueCategory, RootCause)
│   │   ├── questions.ts # Data-driven survey logic (luồng câu hỏi thông minh)
│   │   ├── storage.ts   # Data access layer (CRUD & Live event emitter)
│   │   ├── analytics.ts # Thuật toán tính CSAT, Top Issues, Root Cause, Alert rules
│   │   └── sampleData.ts# Bộ dữ liệu mẫu chân thực phục vụ demo
│   ├── pages/
│   │   ├── Landing.tsx  # Trang chủ dẫn hướng demo 3 màn hình
│   │   ├── QR.tsx       # Màn hình trình chiếu mã QR tại Lobby
│   │   ├── Feedback.tsx # Ứng dụng khảo sát thông minh cho khách hàng (Mobile)
│   │   └── Dashboard.tsx# Trung tâm điều hành & phân tích dữ liệu cho Quản lý
│   ├── App.tsx          # Router cấu hình hệ thống
│   └── main.tsx
├── package.json
└── vite.config.ts       # Cấu hình host: true (mở cổng LAN Wi-Fi cho điện thoại)
```

---

## 6. HƯỚNG DẪN TRẢI NGHIỆM & KỊCH BẢN DEMO (60 GIÂY)

### 6.1. Khởi chạy hệ thống
1. Chạy lệnh: `npm run dev`
2. Mở trình duyệt trên máy tính:
   - **Trang chủ:** `http://localhost:5173/`
   - **Màn hình QR Lobby:** `http://localhost:5173/qr`
   - **Dashboard Quản lý:** `http://localhost:5173/dashboard`

### 6.2. Kịch bản Demo 60 giây ấn tượng trước Ban Giám Khảo

> **Bước 1: Trình chiếu mã QR thật**  
> *"Đây là mã QR đặt tại quầy Lobby. Thay vì khảo sát 13 câu hỏi dài dòng, LOBBY LOOP chỉ hỏi đúng thứ cần biết."*  
> 👉 Dùng camera điện thoại quét trực tiếp mã QR trên màn hình laptop để mở `/feedback`.

> **Bước 2: Trải nghiệm nhánh Hài Lòng (Khách chấm 5⭐)**  
> *"Khách chỉ mất 10 giây: Chọn 5 sao ➔ Chọn lý do hài lòng (ví dụ: Nhân viên thân thiện) ➔ Hoàn tất."*

> **Bước 3: Trải nghiệm nhánh Không Hài Lòng (Khách chấm 2⭐)**  
> *(Mở tab `/feedback` thứ 2 trên laptop để diễn tập khách gặp vấn đề)*  
> *"Nếu khách chấm 2 sao, hệ thống lập tức mở câu hỏi chuyên sâu: Chọn 'Thái độ nhân viên' ➔ Chọn nguyên nhân 'Thái độ chưa thân thiện' ➔ Gửi phản hồi."*

> **Bước 4: Real-time Dashboard & Kích hoạt hành động (Act Fast)**  
> *(Chuyển sang tab `/dashboard` đã mở sẵn)*  
> *"Ngay lập tức, Dashboard ghi nhận: Tỷ lệ CSAT thay đổi, hệ thống bóc tách chính xác 'Root Cause' và hiển thị cảnh báo đỏ **Lobby Alert** cùng gợi ý hành động cụ thể cho Quản lý ca trực, không cần chờ đến báo cáo cuối ngày."*

---

## 7. ĐỊNH HƯỚNG MỞ RỘNG (ROADMAP)

1. **Giai đoạn 1 (Hiện tại - Prototype):** Hoàn thiện trải nghiệm QR thông minh, chuẩn hóa Data Flow, xây dựng Dashboard điều hành thời gian thực.
2. **Giai đoạn 2 (Pilot tại cụm rạp):**
   - Kết nối API hệ thống POS/ERP rạp chiếu để đồng bộ kho tự động và cấu hình danh mục Tablet.
   - Thử nghiệm QR tại 1–2 cụm rạp trọng điểm.
3. **Giai đoạn 3 (Scale & AI Analytics):**
   - Ứng dụng AI phân tích cảm xúc từ phản hồi tự do (Sentiment Analysis).
   - Tự động gửi voucher xoa dịu qua Zalo ZNS / SMS cho khách hàng có trải nghiệm chưa tốt ngay khi vừa rời rạp.
