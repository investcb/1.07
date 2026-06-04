import React, { useState } from "react";
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  HelpCircle, 
  Info, 
  ArrowRight, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { AppraisalResult, AppraisalSection, BusinessRegistrationDetails } from "../types";

interface AppraisalResultsProps {
  result: AppraisalResult;
  onApplyProposal: (sectionName: string, proposedValue: string) => void;
  onLoadDetailsToForm: (details: BusinessRegistrationDetails) => void;
  onSelectMissingDocForGen: (docType: "charter" | "member_list" | "application_form" | "authorization" | "other") => void;
  onReset: () => void;
  scrollToForm: () => void;
}

export default function AppraisalResults({ 
  result, 
  onApplyProposal, 
  onLoadDetailsToForm,
  onSelectMissingDocForGen,
  onReset,
  scrollToForm
}: AppraisalResultsProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>("Tên Doanh Nghiệp");

  const getStatusColor = (status: "pass" | "fail" | "warning") => {
    switch (status) {
      case "pass": return "text-emerald-700 bg-emerald-50 border-emerald-350";
      case "warning": return "text-amber-700 bg-amber-50 border-amber-350";
      case "fail": return "text-rose-700 bg-rose-50 border-rose-350";
    }
  };

  const getSectionIcon = (status: "valid" | "invalid" | "warning" | "missing") => {
    switch (status) {
      case "valid": return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case "invalid": return <XCircle className="w-4 h-4 text-rose-500" />;
      case "warning": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "missing": return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getSectionBg = (status: "valid" | "invalid" | "warning" | "missing") => {
    switch (status) {
      case "valid": return "bg-emerald-50/45 border-emerald-200 hover:border-emerald-300 shadow-sm";
      case "invalid": return "bg-rose-50/45 border-rose-200 hover:border-rose-300 shadow-sm";
      case "warning": return "bg-amber-50/45 border-amber-200 hover:border-amber-300 shadow-sm";
      case "missing": return "bg-slate-50 border-slate-200 hover:border-slate-350 shadow-sm";
    }
  };

  const toggleSection = (name: string) => {
    setExpandedSection(expandedSection === name ? null : name);
  };

  // Convert localized section name back to parameter fields for applying proposed changes
  const applyQuickFix = (sectionName: string, proposedText: string) => {
    onApplyProposal(sectionName, proposedText);
  };

  return (
    <div className="space-y-6 animate-fade-in" id="báo-cáo-thẩm-định">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-300 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">Kết quả thẩm định của Trí tuệ Nhân tạo</h2>
          <p className="text-xs text-slate-500">Đối chiếu và báo cáo dựa trên Luật Doanh nghiệp 59/2020/QH14</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              onLoadDetailsToForm(result.extractedDetails);
              scrollToForm();
            }}
            className="text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors px-3 py-2 rounded flex items-center gap-1 shadow-sm"
          >
            <ChevronDown className="w-4 h-4 animate-bounce" />
            XEM &amp; SỬA TRỰC TIẾP FORM
          </button>
          <button 
            onClick={onReset}
            className="text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-55 transition-colors px-3 py-2 rounded flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            TẢI TỆP KHÁC
          </button>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Score Card */}
        <div className="md:col-span-4 bg-white rounded border border-slate-300 p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Mức độ hợp lệ pháp lý</p>
          
          {/* Circular progress simulated */}
          <div className="relative w-32 h-32 flex items-center justify-center mb-3">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                className={`transition-all duration-1000 ${
                  result.score >= 80 ? "stroke-emerald-500" : result.score >= 55 ? "stroke-amber-500" : "stroke-rose-500"
                }`}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (351.8 * result.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-extrabold text-slate-800">{result.score}</span>
              <span className="text-xs font-semibold text-slate-400">/100</span>
            </div>
          </div>

          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase ${getStatusColor(result.status)}`}>
            {result.status === "pass" ? "HỢP LỆ TIÊU CHUẨN" : result.status === "warning" ? "CÓ THIẾU SÓT NHẸ" : "PHẢI SỬA ĐỔI GẤP"}
          </span>
        </div>

        {/* Executive Summary Narrative */}
        <div className="md:col-span-8 bg-slate-50 rounded border border-slate-300 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Nhận định Tổng quát của Thẩm định viên AI</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed italic border-l-2 border-blue-500 pl-3 py-1">
              &quot;{result.summary}&quot;
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
            <div className="p-2 bg-white rounded border border-slate-200">
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Tổng danh mục</p>
              <p className="text-sm font-bold text-slate-700">{result.sections.length} Tiêu chí</p>
            </div>
            <div className="p-2 bg-white rounded border border-slate-200">
              <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Hợp lệ</p>
              <p className="text-sm font-bold text-emerald-600">{result.sections.filter(b => b.status === "valid").length} Tiêu chí</p>
            </div>
            <div className="p-2 bg-white rounded border border-slate-200 col-span-2 sm:col-span-1">
              <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider">Cần chỉnh lý</p>
              <p className="text-sm font-bold text-rose-605">{result.sections.filter(b => b.status === "invalid" || b.status === "warning").length} Điểm</p>
            </div>
          </div>
        </div>

      </div>

      {/* Grid: Sections Evaluation detail list & Missing documents builder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Accordion detailed compliance checklist */}
        <div className="lg:col-span-8 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2 mb-1">
            <span>Chi tiết đánh giá từng tiêu chí</span>
            <span className="text-[10px] font-normal text-slate-500 lowercase">((Bấm để xem chi tiết căn cứ và đề xuất của AI))</span>
          </h3>

          <div className="space-y-2">
            {result.sections.map((sec) => {
              const isOpen = expandedSection === sec.name;
              return (
                <div 
                  key={sec.name}
                  className={`border rounded transition-all overflow-hidden bg-white ${getSectionBg(sec.status)}`}
                >
                  {/* Accordion header clicker */}
                  <div 
                    onClick={() => toggleSection(sec.name)}
                    className="p-3.5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-2.5">
                      {getSectionIcon(sec.status)}
                      <span className="font-bold text-slate-800 text-xs uppercase tracking-tight">{sec.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        sec.status === "valid" ? "bg-emerald-100 text-emerald-800" :
                        sec.status === "invalid" ? "bg-rose-100 text-rose-800" :
                        sec.status === "warning" ? "bg-amber-100 text-amber-800" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {sec.status === "valid" ? "Hợp quy" : 
                         sec.status === "invalid" ? "Trái Luật" : 
                         sec.status === "warning" ? "Chú ý" : 
                         "Chờ đối soát"}
                      </span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </div>
                  </div>

                  {/* Accordion content detail */}
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 border-t border-slate-200 bg-white pt-3 text-slate-700 space-y-3 text-[11px]">
                      
                      {/* Technical Analysis / Explanation */}
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-250">
                        <p className="font-bold text-[9px] text-slate-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <Info className="w-3 h-3 text-blue-500" /> Cơ sở lập luận &amp; Chỉ dẫn pháp lý:
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                          {sec.explanation}
                        </p>
                      </div>

                      {/* Side by side comparison (only if not completely valid without any suggestion) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-2.5 bg-rose-50/20 rounded border border-rose-100">
                          <p className="font-bold text-[9px] text-rose-600 uppercase mb-1">Nội dung ghi nhận trong hồ sơ:</p>
                          <p className="text-slate-600 italic leading-snug">
                            {sec.currentText || "(Không có thông tin tương ứng hoặc ghi nhận chưa đầy đủ)"}
                          </p>
                        </div>
                        <div className="p-2.5 bg-emerald-50/20 rounded border border-emerald-100">
                          <p className="font-bold text-[9px] text-emerald-600 uppercase mb-1">Đề xuất hoàn quy chuẩn của AI:</p>
                          <p className="text-slate-700 font-semibold leading-snug">
                            {sec.proposedText || "(Bản gốc đã đạt chất lượng và đáp ứng các tiêu chuẩn quy định)"}
                          </p>
                        </div>
                      </div>

                      {/* Direct Apply / Sửa Nhanh trigger button */}
                      {sec.status !== "valid" && sec.proposedText && (
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => applyQuickFix(sec.name, sec.proposedText)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 text-[10px] font-bold py-1.5 px-3 rounded flex items-center gap-1 transition-colors border border-blue-200 uppercase tracking-wider"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            ÁP DỤNG ĐỀ XUẤT CHO BIỂU MẪU DƯỚI
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Propose generating missing elements immediately */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>AI soạn mẫu đính kèm</span>
          </h3>

          <div className="bg-slate-900 text-white rounded shadow-md p-4 border border-slate-700 flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-blue-400">Tự động hóa thủ tục</p>
              <h4 className="font-bold text-xs uppercase mt-0.5 leading-tight text-white">
                Kiến tạo hồ sơ đính kèm tức thì
              </h4>
              <p className="text-[10px] text-slate-300 mt-2 leading-relaxed">
                Sau khi thẩm định, AI phát hiện bộ hồ sơ còn thiếu mẫu quan trọng sau. Bấm vào tệp để AI soạn thảo điều khoản bản hợp đồng/tài liệu chuẩn mẫu theo <strong>Luật Doanh nghiệp 2020</strong>:
              </p>

              <div className="mt-4 space-y-2">
                {result.missingDocuments && result.missingDocuments.length > 0 ? (
                  result.missingDocuments.map((doc) => (
                    <button
                      key={doc.name}
                      onClick={() => onSelectMissingDocForGen(doc.type)}
                      className="w-full text-left p-2.5 rounded bg-white/10 hover:bg-white/15 border border-white/10 flex flex-col justify-between transition-all"
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] font-bold text-white leading-tight truncate max-w-[150px] uppercase">
                          {doc.name}
                        </span>
                        <span className="text-[9px] font-bold bg-blue-600 border border-blue-400 text-blue-100 px-1.5 py-0.5 rounded shrink-0">
                          {doc.importance}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-300 mt-1 line-clamp-2 leading-relaxed font-normal">
                        {doc.reason}
                      </p>
                    </button>
                  ))
                ) : (
                  <div className="p-3 bg-white/5 border border-white/10 rounded text-center">
                    <p className="text-[10px] text-slate-300">Không tìm thấy giấy tờ thiếu sót bổ sung nào khác!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
