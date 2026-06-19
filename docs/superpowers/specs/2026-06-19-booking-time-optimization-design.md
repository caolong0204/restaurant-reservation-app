# Thiết kế Tối ưu hóa Tải Dữ liệu Bước Chọn Giờ (Step 3)

## Mục đích
Tối ưu hóa trải nghiệm tải dữ liệu của bước chọn giờ (Step 3) trong luồng đặt bàn. Hiện tại, mỗi khi người dùng bấm Next/Back chuyển đến Step 3, hệ thống luôn bật trạng thái "loading" và khoá giao diện chọn giờ, ngay cả khi "ngày" và "số lượng khách" chưa hề thay đổi.

## Yêu cầu
- Tải trước (Eager load) danh sách giờ trống ngay khi người dùng chọn xong Ngày và Số lượng khách hợp lệ (ngay từ lúc người dùng vẫn đang ở Step 2).
- Lưu bộ đệm (Cache) dữ liệu đã tải và ghi lại mốc thời gian (timestamp) tải thành công.
- Khi người dùng chuyển sang Step 3, tái sử dụng dữ liệu trong bộ đệm để tránh block giao diện (không hiện loading vô ích).
- Nếu dữ liệu trong bộ đệm đã cũ hơn 2 phút kể từ lúc tải, hệ thống sẽ chủ động gọi lại API để làm mới dữ liệu.
- Đảm bảo rằng việc người dùng thay đổi "Ngày" hoặc "Số khách" sẽ ngay lập tức xoá bộ đệm cũ và kích hoạt tải dữ liệu mới.

## Kiến trúc & Luồng dữ liệu

1. **Quản lý Trạng thái (State Management)**:
   Sử dụng `useRef` để lưu trữ dữ liệu cache nhằm tránh gây ra các lần re-render không cần thiết.
   ```typescript
   type SlotCache = {
     date: string;
     partySize: number;
     data: SlotAvailability[];
     fetchedAt: number;
   }
   const slotCache = useRef<SlotCache | null>(null);
   ```

2. **Logic Tải Dữ Liệu**:
   `useEffect` chịu trách nhiệm gọi API lấy giờ trống sẽ được tách khỏi biến `step`. Nó sẽ chỉ tự động chạy mỗi khi `date` hoặc `partySize` thay đổi (và hợp lệ).
   
   ```typescript
   useEffect(() => {
     if (!date || !isStep1Valid) return;
     const dateStr = toISO(date);
     const size = Number(partySize);
     
     // Kiểm tra xem cache có hợp lệ và mới hơn 2 phút không
     const now = Date.now();
     const cache = slotCache.current;
     if (cache && cache.date === dateStr && cache.partySize === size) {
       if (now - cache.fetchedAt < 2 * 60 * 1000) {
         // Cache hợp lệ, không cần tải lại
         setSlotAvailability(cache.data);
         return;
       }
     }
     
     // Ngược lại, gọi API tải dữ liệu
     // ...
     getPublicSlotAvailability(dateStr, size).then(result => {
        if (result.ok) {
           slotCache.current = { date: dateStr, partySize: size, data: result.data, fetchedAt: Date.now() };
           setSlotAvailability(result.data);
        }
     });
   }, [date, isStep1Valid, partySize]); // Đã loại bỏ biến `step`
   ```

3. **Kiểm tra khi chuyển vào Step 3**:
   Để xử lý trường hợp người dùng treo máy ở Step 2 suốt 5 phút rồi mới bấm Next sang Step 3, ta sẽ thêm một kiểm tra nhỏ khi biến `step` chuyển thành 3.
   
   ```typescript
   useEffect(() => {
     if (step === 3 && date && isStep1Valid) {
       const cache = slotCache.current;
       if (cache && (Date.now() - cache.fetchedAt >= 2 * 60 * 1000)) {
         // Dữ liệu đã cũ (stale)! Load lại với trạng thái loading
         // Chúng ta cần hiện loading để người dùng không bấm nhầm vào các giờ đã hết chỗ
         fetchSlots(); 
       }
     }
   }, [step, date, isStep1Valid]);
   ```

## Đánh đổi (Trade-offs)
- Cơ chế tải trước (eager loading) sẽ gọi API mỗi khi người dùng bấm chọn một ngày mới trên lịch. Nếu user bấm liên tục 5 ngày khác nhau cực nhanh, hệ thống sẽ gọi API 5 lần. Ta có thể thêm `debounce`, tuy nhiên vì việc click chọn ngày bằng thư viện `react-day-picker` là các thao tác rời rạc (chọn xong mới click tiếp), cách tiếp cận hiện tại vẫn ổn trừ khi phát hiện vấn đề giật lag thực sự.

## Câu hỏi mở / Các điểm cần làm rõ
- Nếu bộ nhớ đệm hết hạn (qua 2 phút) *ngay trong lúc* người dùng đang đứng ở Step 3 và lựa giờ, ta có nên tự động tải lại (auto-refresh) không, hay chỉ tải khi họ có hành động chuyển bước?
  **Quyết định:** Ta chỉ kiểm tra khi người dùng chuyển từ bước khác sang Step 3, HOẶC khi họ đổi ngày/đổi số khách. Điều này giúp giao diện không tự nhiên nhảy loading/đổi giờ giữa chừng khi người dùng đang phân vân định bấm chọn một giờ nào đó.

## Kế hoạch Kiểm tra (Verification)
- Kiểm tra: Chọn Ngày A, đợi chưa tới 2 phút, bấm sang Step 3 -> **Không** hiện loader, giờ hiện ra luôn.
- Kiểm tra: Chọn Ngày A, lùi về Step 2, đợi hơn 2 phút, lùi về Step 3 -> **Có** hiện loader và tự tải dữ liệu mới.
- Kiểm tra: Chọn Ngày A, đổi ngay sang Ngày B -> Ngầm gọi API ngay lập tức cho Ngày B.
