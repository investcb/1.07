export interface PresetDocument {
  id: string;
  title: string;
  fileName: string;
  companyType: "TNHH_2_TV_TRO_LEN" | "CO_PHAN" | "TNHH_1_TV";
  description: string;
  fileBase64: string; // Plain text Base64 that can be processed
}

// Helper to convert plain string to base64
const toB64 = (str: string) => {
  return btoa(unescape(encodeURIComponent(str)));
};

export const PRESET_DOCUMENTS: PresetDocument[] = [
  {
    id: "tnhh-cuong-thinh",
    title: "Mẫu Dự thảo ĐKKD Công ty TNHH Cường Thịnh (Gặp lỗi nghiệp vụ)",
    fileName: "du_thao_tnhh_cuong_thinh.txt",
    companyType: "TNHH_2_TV_TRO_LEN",
    description: "Có lỗi: Vốn điều lệ lệch số/chữ; Trụ sở tại căn hộ chung cư; Tổng vốn góp của các thành viên cộng lại bằng 90% (thiếu 10%).",
    fileBase64: toB64(`CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---------------

DỰ THẢO ĐIỀU LỆ VÀ GIẤY ĐỀ NGHỊ ĐĂNG KÝ DOANH NGHIỆP

Kính gửi: Phòng Đăng ký kinh doanh tỉnh Bình Dương

Tôi là Nguyễn Văn Cường, đại diện sáng lập xin đăng ký doanh nghiệp với các thông tin sau:

1. TÊN CÔNG TY:
- Tên tiếng Việt: CÔNG TY TNHH THƯƠNG MẠI VÀ DỊCH VỤ CƯỜNG THỊNH
- Tên tiếng Anh: CUONG THINH TRADING AND SERVICE COMPANY LIMITED
- Tên viết tắt: CUONG THINH CO., LTD

2. ĐỊA CHỈ TRỤ SỞ CHÍNH:
Căn hộ 15A03, Tòa nhà chung cư cao cấp EcoGreen Sài Gòn, Đại lộ Nguyễn Văn Linh, Phường Tân Thuận Tây, Quận 7, Thành phố Hồ Chí Minh, Việt Nam.
Số điện thoại: 0903888222.

3. NGÀNH NGHỀ KINH DOANH:
- Lập trình máy vi tính, hoạt động dịch vụ công nghệ thông tin.
- Kinh doanh bất động sản, quyền sử dụng đất thuộc chủ sở hữu, chủ sử dụng hoặc đi thuê.
- Tư vấn môi giới đấu giá bất động sản.

4. VỐN ĐIỀU LỆ:
- Vốn điều lệ đăng ký: 1.500.000.000 VNĐ (Bằng số: Một tỷ năm trăm triệu đồng).
- Tuy nhiên, phần viết bằng chữ ở điều lệ lại ghi: "Vốn điều lệ của công ty là Hai tỷ đồng chẵn (2.000.000.000 VNĐ)".

5. DANH SÁCH THÀNH VIÊN SÁNG LẬP:
- Thành viên 1: Nguyễn Văn Cường
  + Địa chỉ: Quận 7, TP.HCM
  + Số CCCD: 079085001234 cấp ngày 15/03/2021 tại Cục Cảnh sát ĐKQL cư trú và DLQG về dân cư.
  + Số vốn góp: 900.000.000 VNĐ, chiếm tỷ lệ 60% vốn điều lệ.
- Thành viên 2: Lê Thị Thịnh
  + Địa chỉ: Quận Bình Thạnh, TP.HCM
  + Số CCCD: 079192005678 cấp ngày 10/10/2022.
  + Số vốn góp: 450.000.000 VNĐ, chiếm tỷ lệ 30% vốn điều lệ.

Total tỷ lệ góp vốn của toàn bộ thành viên là 90%.

6. NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT:
Chức danh: Giám đốc
Họ và tên: Nguyễn Văn Cường
Sinh ngày: 20/05/1985. Giới tính: Nam.
Dân tộc: Kinh. Quốc tịch: Việt Nam.
Loại giấy tờ chứng thực cá nhân: Thẻ căn cước công dân số 079085001234 do Cục Cảnh sát cấp ngày 15/03/2021.
Nơi đăng ký hộ khẩu thường trú: Chung cư EcoGreen, Quận 7, TP.HCM.`)
  },
  {
    id: "cp-viettech",
    title: "Dự thảo thành lập Công ty Cổ phần Công nghệ VietTech (Thiếu ngành nghề & Đại diện)",
    fileName: "du_thao_viettech_corp.txt",
    companyType: "CO_PHAN",
    description: "Có lỗi: Thiếu mã ngành kinh tế VSIC trong danh mục; Thông tin địa chỉ thường trú đại diện pháp luật bị bỏ trống; Vốn góp cổ đông ghi nhận không khớp cơ cấu.",
    fileBase64: toB64(`CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---------------

GIẤY ĐỀ NGHỊ ĐĂNG KÝ DOANH NGHIỆP CÔNG TY CỔ PHẦN
Kính gửi: Phòng Đăng ký kinh doanh Thành phố Hà Nội

Chúng tôi là nhóm cổ đông sáng lập đề nghị đăng ký thành lập công ty cổ phần với thông tin sau:

1. TÊN CÔNG TY:
- Tên viết bằng tiếng Việt: CÔNG TY CỔ PHẦN CÔNG NGHỆ VÀ TRUYỀN THÔNG VIETTECH
- Tên viết bằng tiếng nước ngoài: VIETTECH TECHNOLOGY AND MEDIA JOINT STOCK COMPANY
- Tên viết tắt: VIETTECH CORP

2. TRỤ SỞ CHÍNH:
Số 12A, Ngõ 45, Đường Trần Thái Tông, Phường Dịch Vọng Hậu, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam.

3. VỐN ĐIỀU LỆ VÀ CỔ PHẦN:
- Vốn điều lệ: 5.000.000.000 VNĐ (Năm tỷ đồng chẵn).
- Mệnh giá mỗi cổ phần: 10.000 VNĐ.
- Tổng số cổ phần đăng ký: 500.000 cổ phần.
- Cổ đông sáng lập đăng ký mua cổ phần:
  1. Phạm Minh Tuấn: Đăng ký mua 200.000 cổ phần (tương đương 2.000.0000.000 VNĐ), chiếm 40%
  2. Hoàng Anh Đức: Đăng ký mua 150.000 cổ phần (tương đương 1.500.000.000 VNĐ), chiếm 30%
  3. Trần Bảo Lâm: Đăng ký mua 100.000 cổ phần (tương đương 1.000.000.000 VNĐ), chiếm 20%
- Số cổ phần còn lại chưa có ai mua (10% cổ phần).

4. NGÀNH NGHỀ KINH DOANH:
- Chúng tôi đăng ký kinh doanh ngành nghề: Kinh doanh dịch vụ giáo dục, mở trung tâm đào tạo lập trình tin học, dịch vụ quảng cáo thương mại, bán buôn thiết bị điện tử. (Doanh nghiệp tự viết tay, không cung cấp mã ngành kinh tế cấp 4).

5. NGƯỜI ĐẠI DIỆN THEO PHÁP LUẬT:
- Chức danh: Chủ tịch Hội đồng quản trị kiêm Tổng giám đốc.
- Họ tên: Phạm Minh Tuấn.
- Ngày sinh: 12/09/1990. Giới tính: Nam.
- Số CCCD: 001090012345 do Cục Cảnh sát cấp ngày 14/02/2021.
- Địa chỉ thường trú: [BỊ KHUYẾT THÔNG TIN, CHƯA ĐIỀN ĐỊA CHỈ THƯỜNG TRÚ].
- Nơi ở hiện tại: Quận Cầu Giấy, Hà Nội.`)
  }
];
