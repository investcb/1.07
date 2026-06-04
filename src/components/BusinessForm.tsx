import React from "react";
import { 
  Building2, 
  MapPin, 
  BadgeDollarSign, 
  User, 
  Briefcase, 
  Users, 
  Plus, 
  Trash2, 
  Check, 
  Sparkles,
  RefreshCw,
  Search
} from "lucide-react";
import { BusinessRegistrationDetails } from "../types";

// Common VSIC codes for suggestion
const COMMON_VSIC = [
  { code: "6201", name: "Lập trình máy vi tính" },
  { code: "6202", name: "Tư vấn máy vi tính và quản trị hệ thống máy vi tính" },
  { code: "6810", name: "Kinh doanh bất động sản, quyền sử dụng đất" },
  { code: "4651", name: "Bán buôn máy vi tính, thiết bị ngoại vi và phần mềm" },
  { code: "5610", name: "Nhà hàng và các dịch vụ ăn uống phục vụ lưu động" },
  { code: "8560", name: "Dịch vụ hỗ trợ giáo dục" },
  { code: "7020", name: "Hoạt động tư vấn quản lý" },
  { code: "4741", name: "Bán lẻ máy vi tính, thiết bị ngoại vi, phần mềm và thiết bị viễn thông" }
];

interface BusinessFormProps {
  details: BusinessRegistrationDetails;
  onChange: (updated: BusinessRegistrationDetails) => void;
  onReAppraise: () => void;
  onGenerateDoc: (docType: "charter" | "member_list" | "application_form" | "authorization" | "other") => void;
  isProcessing: boolean;
}

export default function BusinessForm({ 
  details, 
  onChange, 
  onReAppraise, 
  onGenerateDoc,
  isProcessing 
}: BusinessFormProps) {

  const handleChange = (field: keyof BusinessRegistrationDetails, value: any) => {
    onChange({
      ...details,
      [field]: value
    });
  };

  // Business Lines actions
  const handleBusinessLineChange = (index: number, key: string, value: any) => {
    const updated = [...details.businessLines];
    updated[index] = { ...updated[index], [key]: value };
    handleChange("businessLines", updated);
  };

  const addBusinessLine = (code = "", name = "", isConditional = false) => {
    const updated = [...details.businessLines, { code, name, isConditional, notes: "" }];
    handleChange("businessLines", updated);
  };

  const removeBusinessLine = (index: number) => {
    const updated = details.businessLines.filter((_, i) => i !== index);
    handleChange("businessLines", updated);
  };

  // Founders actions
  const handleFounderChange = (index: number, key: string, value: any) => {
    const updated = [...details.founders];
    updated[index] = { ...updated[index], [key]: value };
    // Automatically estimate capitalContribution based on percentage and charter capital if applicable
    if (key === "sharePercent") {
      const numericCap = parseFloat(details.charterCapital.replace(/[^\d]/g, ""));
      if (!isNaN(numericCap)) {
        const valueInVnd = (numericCap * parseFloat(value)) / 100;
        updated[index].capitalContribution = valueInVnd.toLocaleString("vi-VN") + " VNĐ";
      }
    }
    handleChange("founders", updated);
  };

  const addFounder = () => {
    const updated = [
      ...details.founders, 
      { name: "", sharePercent: 0, capitalContribution: "0 VNĐ", idNumber: "", role: "Thành viên góp vốn" }
    ];
    handleChange("founders", updated);
  };

  const removeFounder = (index: number) => {
    const updated = details.founders.filter((_, i) => i !== index);
    handleChange("founders", updated);
  };

  // Auto calculate sum of founding share percents
  const totalShares = details.founders.reduce((sum, f) => sum + (Number(f.sharePercent) || 0), 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 md:p-8 space-y-8 animate-fade-in" id="soan-thao-tu-tay">
      
      {/* Form Title & Meta */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Cơ sở dữ liệu Đăng ký Doanh nghiệp</h2>
            <p className="text-xs text-slate-500">Chỉnh sửa trực tiếp hoặc bổ sung số liệu vào hồ sơ hiện hành</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Company Name & Type */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Thông tin Pháp nhân doanh nghiệp</span>
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tên Tiếng Việt Đầy Đủ:</label>
            <input
              type="text"
              value={details.companyName}
              onChange={(e) => handleChange("companyName", e.target.value)}
              placeholder="CÔNG TY TNHH ABC..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-semibold uppercase text-slate-800 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Loại hình Doanh nghiệp:</label>
              <select
                value={details.companyType}
                onChange={(e) => handleChange("companyType", e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="">-- Chưa xác định --</option>
                <option value="TNHH_1_TV">TNHH Một Thành Viên (1-TV)</option>
                <option value="TNHH_2_TV_TRO_LEN">TNHH Hai Thành Viên Trở Lên (2-TV)</option>
                <option value="CO_PHAN">Sáng lập Công ty Cổ phần (CP)</option>
                <option value="DOANH_NGHIEP_TU_NHAN">Doanh nghiệp Tư nhân</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Tổng Vốn Điều Lệ (VNĐ):</label>
              <input
                type="text"
                value={details.charterCapital}
                onChange={(e) => handleChange("charterCapital", e.target.value)}
                placeholder="Ví dụ: 2.000.000.000"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Vốn Điều Lệ (Viết Bằng Chữ):</label>
            <input
              type="text"
              value={details.charterCapitalWord}
              onChange={(e) => handleChange("charterCapitalWord", e.target.value)}
              placeholder="Ví dụ: Hai tỷ đồng chẵn"
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Địa chỉ trụ sở chính đăng ký:</label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <textarea
                value={details.headquarters}
                onChange={(e) => handleChange("headquarters", e.target.value)}
                rows={2}
                placeholder="Nhập địa chỉ cụ thể không nằm trong chung cư không được cấp phép..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-700 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Legal Representative Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>Đại Diện Theo Pháp Luật duy nhất</span>
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Họ Tên Đầy Đủ:</label>
              <input
                type="text"
                value={details.legalRepName}
                onChange={(e) => handleChange("legalRepName", e.target.value.toUpperCase())}
                placeholder="NGUYỄN VĂN A"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-bold text-slate-800 uppercase"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Giới tính:</label>
              <select
                value={details.legalRepGender}
                onChange={(e) => handleChange("legalRepGender", e.target.value)}
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 text-xs font-medium text-slate-800 bg-white"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ngày Sinh:</label>
              <input
                type="text"
                value={details.legalRepDob}
                onChange={(e) => handleChange("legalRepDob", e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Loại giấy tờ định danh:</label>
              <input
                type="text"
                value={details.legalRepIdType}
                onChange={(e) => handleChange("legalRepIdType", e.target.value)}
                placeholder="Thẻ CCCD"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Số Giấy Tờ (Số CCCD):</label>
              <input
                type="text"
                value={details.legalRepIdNumber}
                onChange={(e) => handleChange("legalRepIdNumber", e.target.value)}
                placeholder="001090012345"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-semibold text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Ngày Cấp Giấy Tờ:</label>
              <input
                type="text"
                value={details.legalRepIdDate}
                onChange={(e) => handleChange("legalRepIdDate", e.target.value)}
                placeholder="DD/MM/YYYY"
                className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Hộ khẩu thường trú / Trụ sở cư ngụ:</label>
            <input
              type="text"
              value={details.legalRepAddress}
              onChange={(e) => handleChange("legalRepAddress", e.target.value)}
              placeholder="Nơi đăng ký hộ khẩu thường trú của đại diện pháp luật..."
              className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-xs font-medium text-slate-700"
            />
          </div>
        </div>

      </div>

      {/* Business Lines (Ngành nghề kinh doanh) Sub-form */}
      <div className="border-t border-slate-100 pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-slate-400" />
            <span>Danh mục Ngành nghề Đăng ký ({details.businessLines.length})</span>
          </h3>
          <div className="flex gap-2">
            {/* Quick Suggestions buttons */}
            <span className="text-[10px] font-bold text-slate-400 self-center hidden sm:inline">Gợi ý nhanh:</span>
            <div className="flex gap-1 overflow-x-auto max-w-[200px] sm:max-w-none pb-1 sm:pb-0">
              {COMMON_VSIC.slice(0, 3).map((v) => (
                <button
                  key={v.code}
                  type="button"
                  onClick={() => addBusinessLine(v.code, v.name)}
                  className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 transition-colors text-[10px] text-slate-600 font-bold px-2 py-1 rounded"
                >
                  +{v.code}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {details.businessLines.map((line, idx) => (
            <div key={idx} className="bg-slate-50/50 p-4 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="w-24 shrink-0">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 sm:hidden">Mã ngành VSIC:</label>
                <input
                  type="text"
                  value={line.code}
                  maxLength={4}
                  onChange={(e) => handleBusinessLineChange(idx, "code", e.target.value)}
                  placeholder="Mã 4 số"
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-center text-slate-800"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-slate-400 mb-1 sm:hidden">Tên ngành nghề:</label>
                <input
                  type="text"
                  value={line.name}
                  onChange={(e) => handleBusinessLineChange(idx, "name", e.target.value)}
                  placeholder="Tiếng Việt chuẩn kinh tế..."
                  className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-800"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer py-1">
                  <input
                    type="checkbox"
                    checked={line.isConditional}
                    onChange={(e) => handleBusinessLineChange(idx, "isConditional", e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 h-4.5 w-4.5"
                  />
                  <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">Có điều kiện</span>
                </label>
                <button
                  type="button"
                  onClick={() => removeBusinessLine(idx)}
                  className="p-2.5 text-rose-500 hover:bg-rose-50 rounded-xl transition-all self-center shrink-0 border border-transparent hover:border-rose-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {details.businessLines.length === 0 && (
            <div className="p-5 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200/80 text-center">
              <p className="text-xs text-slate-400">Danh mục ngành nghề trống. Vui lòng bấm thêm ngành để soạn mẫu chuẩn!</p>
            </div>
          )}

          <button
            type="button"
            onClick={() => addBusinessLine("", "")}
            className="w-full py-2.5 border border-dashed border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 active:bg-indigo-50/50 hover:bg-indigo-50/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Bổ sung ngành nghề mới
          </button>
        </div>
      </div>

      {/* Founders (Thành viên sáng lập) Sub-form */}
      <div className="border-t border-slate-100 pt-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            <span>Sáng lập viên &amp; Cơ cấu Góp Vốn</span>
          </h3>
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${totalShares === 100 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
              Tổng tỷ lệ: {totalShares}% {totalShares === 100 ? "✔️ Khớp 100%" : "❌ Phải bằng 100%"}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {details.founders.map((founder, idx) => (
            <div key={idx} className="bg-slate-50/30 border border-slate-100 rounded-2xl p-4 space-y-3 relative">
              <div className="absolute right-4 top-4">
                <button
                  type="button"
                  onClick={() => removeFounder(idx)}
                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50/80 rounded transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                
                {/* Name */}
                <div className="sm:col-span-5">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Tên Thành Viên / Cổ Đông:</label>
                  <input
                    type="text"
                    value={founder.name}
                    onChange={(e) => handleFounderChange(idx, "name", e.target.value.toUpperCase())}
                    placeholder="CAO MINH KHÁNH"
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-bold uppercase text-slate-800"
                  />
                </div>

                {/* Ratio */}
                <div className="sm:col-span-3">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Tỉ Lệ Sở Hữu (%):</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={founder.sharePercent}
                      onChange={(e) => handleFounderChange(idx, "sharePercent", Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-bold text-slate-800"
                    />
                    <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-slate-400">%</span>
                  </div>
                </div>

                {/* Capital Contribution Value */}
                <div className="sm:col-span-4 pr-6">
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Số Vốn Góp (Tính toán):</label>
                  <input
                    type="text"
                    value={founder.capitalContribution}
                    onChange={(e) => handleFounderChange(idx, "capitalContribution", e.target.value)}
                    placeholder="Ví dụ: 800.000.000 VNĐ"
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-700"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Chức Vụ / Vai Trò:</label>
                  <input
                    type="text"
                    value={founder.role}
                    onChange={(e) => handleFounderChange(idx, "role", e.target.value)}
                    placeholder="Ví dụ: Chủ tịch, thành viên sáng lập..."
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-semibold text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Mã CCCD / Passport của thành viên:</label>
                  <input
                    type="text"
                    value={founder.idNumber}
                    onChange={(e) => handleFounderChange(idx, "idNumber", e.target.value)}
                    placeholder="Mã số giấy tờ"
                    className="w-full p-2 border border-slate-200 rounded-lg bg-white text-xs font-medium text-slate-700"
                  />
                </div>
              </div>

            </div>
          ))}

          {details.founders.length === 0 && (
            <div className="p-5 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200/80 text-center">
              <p className="text-xs text-slate-400">Chưa ghi nhận thành viên nào. Bấm nút bên dưới để thêm thành viên thành lập!</p>
            </div>
          )}

          <button
            type="button"
            onClick={addFounder}
            className="w-full py-2.5 border border-dashed border-indigo-200 rounded-xl text-xs font-bold text-indigo-600 active:bg-indigo-50/50 hover:bg-indigo-50/30 flex items-center justify-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" /> Bổ sung cổ đông / thành viên góp vốn mới
          </button>
        </div>
      </div>

      {/* Action panel triggers */}
      <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-4 justify-between">
        <button
          type="button"
          onClick={onReAppraise}
          disabled={isProcessing}
          className="bg-indigo-600 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-indigo-700 shadow-md shadow-indigo-100 active:scale-[0.99] disabled:opacity-50"
        >
          {isProcessing ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          Tái thẩm định thông tin hồ sơ sửa đổi
        </button>

        <div className="flex flex-wrap gap-2">
          {details.companyType === "TNHH_2_TV_TRO_LEN" && (
            <button
              onClick={() => onGenerateDoc("member_list")}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl transition-all"
            >
              Soạn nhanh Danh sách thành viên
            </button>
          )}
          {details.companyType === "CO_PHAN" && (
            <button
              onClick={() => onGenerateDoc("member_list")}
              className="text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-4 py-3 rounded-xl transition-all"
            >
              Soạn nhanh Danh sách cổ đông
            </button>
          )}
          <button
            onClick={() => onGenerateDoc("charter")}
            className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-3 rounded-xl flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            AI Soạn Điều lệ Công ty hoàn hảo
          </button>
        </div>
      </div>

    </div>
  );
}
