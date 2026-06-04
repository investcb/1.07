import React, { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Sparkles, Check, FileCode2 } from "lucide-react";
import { PRESET_DOCUMENTS, PresetDocument } from "../data/presets";

interface UploadZoneProps {
  onUpload: (base64: string, fileName: string, mimeType: string, prefilledDetails?: any) => void;
  isLoading: boolean;
}

export default function UploadZone({ onUpload, isLoading }: UploadZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: string } | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PresetDocument | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; name: string; mime: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];

    if (!validTypes.includes(file.type) && !file.name.endsWith(".docx") && !file.name.endsWith(".pdf")) {
      alert("Hệ thống chỉ hỗ trợ định dạng tệp PDF (.pdf) hoặc Word (.docx)");
      return;
    }

    const sizeInMB = file.size / (1024 * 1024);
    if (sizeInMB > 20) {
      alert("Tệp tin vượt quá giới hạn 20MB. Vui lòng chọn tệp nhỏ hơn.");
      return;
    }

    setSelectedPreset(null);
    setSelectedFile({
      name: file.name,
      size: `${sizeInMB.toFixed(2)} MB`
    });

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setFileData({
        base64,
        name: file.name,
        mime: file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerInputClick = () => {
    fileInputRef.current?.click();
  };

  const selectPresetDoc = (preset: PresetDocument) => {
    setSelectedFile(null);
    setSelectedPreset(preset);
    setFileData({
      base64: preset.fileBase64,
      name: preset.fileName,
      mime: "text/plain"
    });
  };

  const submitToAppraise = () => {
    if (!fileData) return;
    onUpload(fileData.base64, fileData.name, fileData.mime);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="vung-tai-ho-so">
      {/* Upload Column */}
      <div className="lg:col-span-7 bg-white rounded border border-slate-300 p-5 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-700 rounded border border-blue-100">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Đăng tải hồ sơ đăng ký kinh doanh</h3>
              <p className="text-xs text-slate-500">Tải lên văn bản dự thảo (Điều lệ thành lập, giấy đề nghị, v.v.)</p>
            </div>
          </div>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerInputClick}
            className={`cursor-pointer mt-4 border-2 border-dashed rounded p-6 flex flex-col items-center justify-center transition-all ${
              dragActive 
                ? "border-blue-500 bg-blue-50/50" 
                : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className="p-3 bg-slate-100 rounded text-slate-400 mb-2 group-hover:scale-105 transition-transform">
              <FileText className="w-7 h-7" />
            </div>
            
            <p className="text-xs font-semibold text-slate-700 text-center">
              Kéo thả tệp hoặc <span className="text-blue-600 underline">chọn tệp từ máy tính</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-1 text-center">
              Hỗ trợ tệp Word (.docx) hoặc PDF (.pdf) tối đa 20MB
            </p>
          </div>

          {/* Current Selection Indicators */}
          {(selectedFile || selectedPreset) && (
            <div className="mt-4 p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-100 text-blue-800 rounded">
                  <FileCode2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800 truncate max-w-xs md:max-w-md">
                    {selectedFile ? selectedFile.name : selectedPreset?.title}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {selectedFile ? selectedFile.size : "Văn bản mẫu thử nghiệm pháp lý"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-3 h-3" /> Đã nạp xong
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 border-t border-slate-200 pt-4">
          <button
            onClick={submitToAppraise}
            disabled={!fileData || isLoading}
            className={`w-full py-2 px-4 rounded text-xs font-bold flex items-center justify-center gap-2 transition-all uppercase tracking-wider ${
              fileData && !isLoading
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                : "bg-slate-100 text-slate-450 cursor-not-allowed border border-slate-200"
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-3 h-3 border-2 border-blue-600 border-t-transparent" />
                Đang xử lý thẩm định với AI...
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Thẩm định hồ sơ bằng Trí tuệ Nhân tạo
              </>
            )}
          </button>
        </div>
      </div>

      {/* Presets Column */}
      <div className="lg:col-span-5 bg-slate-50 border border-slate-300 rounded p-5 flex flex-col justify-between" id="tai-tai-lieu-mau">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Chưa có sẵn tệp đăng ký?</h3>
          </div>
          <p className="text-[11px] text-slate-500 mb-4 leading-normal">
            Chọn nhanh một tài liệu mô phỏng doanh nghiệp có sẵn lỗi hành chính bên dưới để chứng kiến căn kẽ khả năng đối soát pháp luật của động cơ AI:
          </p>

          <div className="space-y-3">
            {PRESET_DOCUMENTS.map((preset) => {
              const isSelected = selectedPreset?.id === preset.id;
              return (
                <div
                  key={preset.id}
                  onClick={() => selectPresetDoc(preset)}
                  className={`p-3 rounded border text-left cursor-pointer transition-all ${
                    isSelected
                      ? "bg-blue-50/60 border-blue-300 ring-2 ring-blue-50/55"
                      : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100 px-1.5 py-0.5 rounded uppercase">
                      {preset.companyType === "CO_PHAN" ? "Công ty Cổ phần" : "Công ty TNHH"}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded uppercase">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <h4 className="text-[11px] font-bold text-slate-800 mb-0.5 leading-snug">
                    {preset.title}
                  </h4>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    {preset.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 bg-amber-50 border border-amber-200 rounded p-3 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-800 leading-normal">
            <strong>Gợi ý:</strong> Các hồ sơ mẫu trên được thiết kế chứa các điểm vi phạm nghiêm trọng (lỗi Vốn, Trụ sở thuộc căn hộ chung cư...) để kiểm nghiệm tính nhạy bén của hệ thống phân tích pháp quy.
          </p>
        </div>
      </div>
    </div>
  );
}
