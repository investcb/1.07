import React from "react";
import { Copy, Download, Check, ArrowLeft, ShieldCheck, Sparkles, FileText, Share2 } from "lucide-react";
import { GenerateDocResponse } from "../types";

interface DocumentGeneratorProps {
  document: GenerateDocResponse | null;
  isLoading: boolean;
  onBack: () => void;
}

export default function DocumentGenerator({ document, isLoading, onBack }: DocumentGeneratorProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (!document) return;
    navigator.clipboard.writeText(document.contentMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!document) return;
    const element = window.document.createElement("a") as HTMLAnchorElement;
    const file = new Blob([document.contentMarkdown], { type: "text/plain;charset=utf-8" });
    element.href = URL.createObjectURL(file);
    element.download = `${document.documentTitle.toLowerCase().replace(/\s+/g, "_")}.txt`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded border border-slate-700 shadow-xl overflow-hidden animate-fade-in" id="khung-soan-thao-ai">
      
      {/* Banner / Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 rounded transition-colors text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              Động cơ soạn thảo tự động AI
            </span>
            <h3 className="text-sm font-bold text-white truncate max-w-sm sm:max-w-xl">
              {isLoading ? "Đang lập dự thảo hồ sơ đăng ký..." : document?.documentTitle || "Kết quả dự thảo"}
            </h3>
          </div>
        </div>

        {!isLoading && document && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white py-1.5 px-3 rounded flex items-center gap-1 transition-all border border-slate-700"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Đã sao chép!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Sao chép văn bản
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded flex items-center gap-1 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Tải tệp .txt
            </button>
          </div>
        )}
      </div>

      {/* Main Drafting Section */}
      <div className="p-5 md:p-6 min-h-[420px] flex flex-col justify-between">
        
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-3">
            <div className="relative flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-500 border-t-transparent" />
              <FileText className="absolute w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white animate-pulse">Trí Tuệ Nhân Tạo đang soạn thảo chi tiết...</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm leading-normal">
                Sử dụng thông số chuẩn hóa Luật Doanh nghiệp 2020 để bổ khuyết trực tiếp cho dự thảo Điều lệ hay danh sách biểu mẫu đầy đủ pháp quy của bạn.
              </p>
            </div>
            
            <div className="w-full max-w-xs bg-slate-800 h-1.5 rounded-full overflow-hidden mt-4">
              <div className="bg-blue-500 h-full animate-infinite-loading w-1/3 rounded-full" />
            </div>
          </div>
        ) : document ? (
          <div className="space-y-4">
            
            {/* Legal stamp box */}
            <div className="bg-blue-950/40 border border-blue-900/60 rounded p-3 flex gap-2.5 items-start mb-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Tính năng thẩm duyệt thông tin nội bộ</h4>
                <p className="text-[10px] text-slate-300 leading-normal mt-0.5">
                  Văn bản này đã được điền tự động hóa các thông số doanh nghiệp và sắp xếp kết cấu chuẩn quy điều hành số 59/2020 của Quốc hội. Bạn có thể sao chép văn bản này đưa vào các mẫu nộp Cổng thông tin Quốc gia về Đăng ký doanh nghiệp.
                </p>
              </div>
            </div>

            {/* Structured scrollable draft pane */}
            <div 
              className="p-5 bg-slate-950 rounded border border-slate-800 h-[450px] overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-200 select-text whitespace-pre-wrap selection:bg-blue-700 selection:text-white"
            >
              {document.contentMarkdown}
            </div>

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-slate-400 text-center">
            <p className="text-xs">Không thể nạp tệp văn bản. Vui lòng bấm hành động và thử lại.</p>
          </div>
        )}

        <div className="border-t border-slate-800 mt-4 pt-3.5 flex justify-between items-center text-slate-400 text-[10px]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            Phù hợp Luật Doanh nghiệp 2020
          </span>
          <span>Dự thảo bằng Trí tuệ Nhân tạo Gemini 3.5</span>
        </div>

      </div>

    </div>
  );
}
