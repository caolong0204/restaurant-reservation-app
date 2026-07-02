/** All user-facing strings for the public booking page, keyed identically in VI and EN. */
export const translations = {
  vi: {
    // Site header
    header: {
      bookTable: 'Đặt bàn',
      staffLabel: 'Nhân viên',
    },
    // Hero section
    hero: {
      imageAlt: 'Phòng ăn ấm áp dưới ánh nến tại Flambé',
      heading: 'Bàn tiệc đã sẵn sàng cho một buổi tối đáng nhớ',
      description: ' là nhà hàng ẩm thực theo mùa tọa lạc tại trung tâm thành phố. Đặt bàn chỉ trong vài phút.',
      cta: 'Đặt bàn ngay',
      tagline: 'Flammkuchen và những người bạn',
    },
    // Restaurant info panel
    info: {
      sectionLabel: 'Thông tin nhà hàng',
      address: 'Địa chỉ',
      hours: 'Giờ hoạt động',
      contact: 'Liên hệ',
      hoursValue: ['Thứ Ba - Thứ Sáu: 10:30 - 22:00', 'Thứ Bảy - Chủ Nhật: 10:30 - 23:00'],
    },
    // Booking form
    form: {
      title: 'Đặt bàn tại Flambé',
      disclaimer: '*Nhà hàng không nhận đặt vị trí bàn cụ thể, bàn sẽ được xếp theo tình hình thực tế tại thời điểm khách hàng tới dùng bữa.',
      back: 'Quay lại',
      next: 'Tiếp tục',
      submitting: 'Đang gửi...',
      confirm: 'Xác nhận đặt bàn',
      toastSuccessTitle: 'Đã gửi yêu cầu đặt bàn',
      toastSuccessDesc: 'Nhà hàng sẽ kiểm tra và liên hệ để xác nhận bàn của bạn.',
      toastErrorTitle: 'Chưa gửi được yêu cầu đặt bàn',
      slotError: 'Không kiểm tra được tình trạng bàn trống.',
    },
    // Step tab labels
    steps: {
      partySize: 'Số khách',
      date: 'Chọn ngày',
      time: 'Giờ đặt',
      info: 'Thông tin',
    },
    // Step 1: Party size
    partySize: {
      heading: 'CHỌN SỐ LƯỢNG KHÁCH',
      other: 'Khác...',
      customLabel: 'Nhập số lượng khách (từ 9 trở lên)',
      guestSuffix: 'khách',
      largeGroupNote: 'Với nhóm trên 24 khách, vui lòng liên hệ trực tiếp để được sắp xếp riêng.',
    },
    // Step 2: Date picker
    date: {
      selectedLabel: 'Đã chọn:',
      notSelected: 'Chưa chọn',
      months: ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
      weekdays: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    },
    // Step 3: Time picker
    time: {
      groupLunch: '☀️ Trưa',
      groupAfternoon: '🌤️ Chiều',
      groupEvening: '🌙 Tối',
      checking: 'Đang kiểm tra bàn trống',
      noSlots: 'Không thể đặt bàn cho hôm nay nữa, vui lòng chọn ngày khác để dùng bữa!',
      full: 'Hết bàn',
    },
    // Step 4: Guest info form
    guestInfo: {
      fullyBookedTitle: 'Đã hết bàn!',
      fullyBookedBody: 'Khung giờ này vừa mới kín chỗ. Vui lòng quay lại bước trước để chọn một khung giờ khác.',
      scarcityTitle: 'Sắp hết bàn!',
      scarcityBody: 'Chỉ còn lại rất ít bàn trống trong khung giờ này. Vui lòng hoàn tất nhanh để hệ thống ghi nhận.',
      sectionTitle: 'Thông tin đặt bàn & Yêu cầu',
      sectionSubtitle: 'Cung cấp thông tin liên lạc và các nhu cầu bổ sung của bạn',
      nameLabel: 'Họ và tên',
      namePlaceholder: 'Tên người đặt bàn',
      phoneLabel: 'Số điện thoại',
      phonePlaceholder: 'ví dụ: 090 123 4567',
      phoneError: 'Số điện thoại không hợp lệ (ví dụ: 0901234567)',
      emailLabel: 'Email',
      emailPlaceholder: 'ví dụ: khach@email.com',
      emailError: 'Email không hợp lệ (ví dụ: khach@email.com)',
      occasionLabel: 'Dịp đặc biệt',
      notesLabel: 'Yêu cầu đặc biệt',
      notesPlaceholder: 'Dị ứng thực phẩm, chuẩn bị bánh kem chúc mừng...',
    },
    // Occasions list
    occasions: [
      'Không có dịp đặc biệt',
      'Sinh nhật',
      'Kỷ niệm',
      'Hẹn hò',
      'Tiệc xã giao/công việc',
      'Tiệc chúc mừng',
    ],
    // Step 5: Success
    success: {
      heading: 'Cảm ơn bạn, {name}!',
      body: 'Yêu cầu đặt bàn của bạn đã được ghi nhận thành công. Nhà hàng sẽ liên hệ {phone} để xác nhận.',
      ticketTitle: 'Chi tiết đặt bàn',
      partySize: 'Số lượng khách',
      guestSuffix: 'khách',
      date: 'Ngày dùng bữa',
      time: 'Giờ đón khách',
      contactTitle: 'Thông tin liên hệ',
      name: 'Họ và tên',
      phone: 'Số điện thoại',
      email: 'Email',
      occasion: 'Dịp đặc biệt',
      tableLocation: 'Vị trí bàn',
      notes: 'Yêu cầu đặc biệt',
      newBooking: 'Đặt bàn khác',
    },
    // Summary bar
    summaryBar: {
      guests: 'SỐ KHÁCH:',
      date: 'NGÀY:',
      time: 'GIỜ:',
    },
    // Booking summary panel (desktop)
    bookingSummary: {
      eyebrow: 'Vé đặt bàn',
      title: 'Thông tin đặt bàn',
      subtitle: 'Thông tin bên dưới tự động cập nhật theo các tùy chọn bạn nhập ở bảng đăng ký bên cạnh.',
      ticketTitle: 'Tóm tắt lượt đặt bàn',
      partySize: 'Số lượng khách',
      guestSuffix: 'khách',
      noParty: 'Chưa chọn',
      date: 'Ngày dùng bữa',
      noDate: 'Chưa chọn ngày',
      time: 'Giờ đón khách',
      noTime: 'Chưa chọn giờ',
      contactTitle: 'Thông tin liên hệ',
      name: 'Họ và tên',
      phone: 'Số điện thoại',
      occasion: 'Dịp đặc biệt',
      tableLocation: 'Vị trí bàn',
      notes: 'Yêu cầu đặc biệt',
    },
    // Footer
    footer: {
      address: 'Địa chỉ',
      hours: 'Giờ hoạt động',
      contact: 'Liên hệ',
    },
  },

  en: {
    // Site header
    header: {
      bookTable: 'Reserve',
      staffLabel: 'Staff',
    },
    // Hero section
    hero: {
      imageAlt: 'Warm candlelit dining room at Flambé',
      heading: 'The table is set for an unforgettable evening',
      description: ' is a seasonal cuisine restaurant located in the heart of the city. Reserve in just a few minutes.',
      cta: 'Book a Table',
      tagline: 'Flammkuchen & Friends',
    },
    // Restaurant info panel
    info: {
      sectionLabel: 'Restaurant Info',
      address: 'Address',
      hours: 'Opening Hours',
      contact: 'Contact',
      hoursValue: ['Tue – Fri: 10:30 – 22:00', 'Sat – Sun: 10:30 – 23:00'],
    },
    // Booking form
    form: {
      title: 'Reserve at Flambé',
      disclaimer: '*Specific table positions cannot be guaranteed. Tables are assigned based on availability at the time of your arrival.',
      back: 'Back',
      next: 'Continue',
      submitting: 'Sending...',
      confirm: 'Confirm Reservation',
      toastSuccessTitle: 'Reservation request sent',
      toastSuccessDesc: 'The restaurant will review and contact you to confirm your table.',
      toastErrorTitle: 'Could not send reservation',
      slotError: 'Unable to check table availability.',
    },
    // Step tab labels
    steps: {
      partySize: 'Guests',
      date: 'Date',
      time: 'Time',
      info: 'Details',
    },
    // Step 1: Party size
    partySize: {
      heading: 'HOW MANY GUESTS?',
      other: 'Other...',
      customLabel: 'Enter number of guests (9 or more)',
      guestSuffix: 'guests',
      largeGroupNote: 'For groups of more than 24, please contact us directly for a tailored arrangement.',
    },
    // Step 2: Date picker
    date: {
      selectedLabel: 'Selected:',
      notSelected: 'None',
      months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      weekdays: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
    },
    // Step 3: Time picker
    time: {
      groupLunch: '☀️ Lunch',
      groupAfternoon: '🌤️ Afternoon',
      groupEvening: '🌙 Evening',
      checking: 'Checking availability',
      noSlots: 'No more slots available for today. Please choose another date.',
      full: 'Full',
    },
    // Step 4: Guest info form
    guestInfo: {
      fullyBookedTitle: 'Fully Booked!',
      fullyBookedBody: 'This time slot just filled up. Please go back and choose a different time.',
      scarcityTitle: 'Almost Full!',
      scarcityBody: 'Only a few tables remain for this time slot. Complete your booking quickly to secure your spot.',
      sectionTitle: 'Booking Details & Requests',
      sectionSubtitle: 'Provide your contact information and any special requirements',
      nameLabel: 'Full Name',
      namePlaceholder: 'Name of the booking holder',
      phoneLabel: 'Phone Number',
      phonePlaceholder: 'e.g. 090 123 4567',
      phoneError: 'Invalid phone number (e.g. 0901234567)',
      emailLabel: 'Email',
      emailPlaceholder: 'e.g. guest@email.com',
      emailError: 'Invalid email address (e.g. guest@email.com)',
      occasionLabel: 'Special Occasion',
      notesLabel: 'Special Requests',
      notesPlaceholder: 'Food allergies, birthday cake preparation...',
    },
    // Occasions list
    occasions: [
      'No special occasion',
      'Birthday',
      'Anniversary',
      'Date night',
      'Business / networking',
      'Celebration',
    ],
    // Step 5: Success
    success: {
      heading: 'Thank you, {name}!',
      body: 'Your reservation request has been received. The restaurant will contact {phone} to confirm.',
      ticketTitle: 'Booking Details',
      partySize: 'Party Size',
      guestSuffix: 'guests',
      date: 'Dining Date',
      time: 'Arrival Time',
      contactTitle: 'Contact Information',
      name: 'Full Name',
      phone: 'Phone',
      email: 'Email',
      occasion: 'Special Occasion',
      tableLocation: 'Table Location',
      notes: 'Special Requests',
      newBooking: 'Make Another Booking',
    },
    // Summary bar
    summaryBar: {
      guests: 'GUESTS:',
      date: 'DATE:',
      time: 'TIME:',
    },
    // Booking summary panel (desktop)
    bookingSummary: {
      eyebrow: 'Reservation Ticket',
      title: 'Booking Summary',
      subtitle: 'The information below updates automatically as you fill in the form.',
      ticketTitle: 'Booking Overview',
      partySize: 'Party Size',
      guestSuffix: 'guests',
      noParty: 'Not selected',
      date: 'Dining Date',
      noDate: 'No date selected',
      time: 'Arrival Time',
      noTime: 'No time selected',
      contactTitle: 'Contact Information',
      name: 'Full Name',
      phone: 'Phone',
      occasion: 'Special Occasion',
      tableLocation: 'Table Location',
      notes: 'Special Requests',
    },
    // Footer
    footer: {
      address: 'Address',
      hours: 'Opening Hours',
      contact: 'Contact',
    },
  },
}
