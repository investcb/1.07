import React, { useState, useEffect, useRef } from "react";
import { 
  Building2, 
  ShieldAlert, 
  Sparkles, 
  FileCheck2, 
  BookOpen, 
  AlertCircle,
  Activity,
  FileCode2,
  ListRestart
} from "lucide-react";
import { AppraisalResult, BusinessRegistrationDetails, GenerateDocResponse } from "./types";
import UploadZone from "./components/UploadZone";
import AppraisalResults from "./components/AppraisalResults";
import BusinessForm from "./components/BusinessForm";
import DocumentGenerator from "./components/DocumentGenerator";

const BLANK_DETAILS: BusinessRegistrationDetails = {
  companyName: "CÔNG TY TNHH CÔNG NGHỆ VÀ TRUYỀN THÔNG MINH ĐỨC",
  companyType: "TNHH_2_TV_TRO_LEN",
  charterCapital: "1.500.000.000",
  charterCapitalWord: "Một tỷ năm trăm triệu đồng chẵn",
  legalRepName: "TRẦN MINH ĐỨC",
  legalRepGender: "Nam",
  legalRepDob: "18/08/1992",
  legalRepIdType: "CCCD",
  legalRepIdNumber: "001092005566",
  legalRepIdDate: "12/04/2021",
  legalRepAddress: "Số 45 Ngõ 102 Đường Lê Duẩn, Phường Khâm Thiên, Quận Đống Đa, Thành phố Hà Nội, Việt Nam",
  businessLines: [
    { code: "6201", name: "Lập trình máy vi tính", isConditional: false },
    { code: "6251", name: "Bán buôn máy tính, thiết bị ngoại vi và phần mềm", isConditional: false },
    { code: "6810", name: "Kinh doanh bất động sản", isConditional: true, notes: "Yêu cầu rà soát vốn pháp định và chứng chỉ" }
  ],
  founders: [
    { name: "TRẦN MINH ĐỨC", sharePercent: 70, capitalContribution: "1.050.000.000 VNĐ", idNumber: "001092005566", role: "Chủ tịch hội đồng thành viên" },
    { name: "NGUYỄN THỊ MAI", sharePercent: 30, capitalContribution: "450.000.000 VNĐ", idNumber: "001092001234", role: "Thành viên sáng lập" }
  ],
  headquarters: "Số 25 Lô C2 Khu đô thị mới Yên Hòa, Phường Yên Hòa, Quận Cầu Giấy, Thành phố Hà Nội, Việt Nam"
};

const LOADING_STATUSES = [
  "Đang tải tập tin lên hệ thống bảo mật...",
  "Đang giải cấu trúc dữ liệu và định dạng văn bản...",
  "Đối chiếu với Luật Doanh nghiệp 2020...",
  "Đang thẩm định kết cấu Tên doanh nghiệp của riêng bạn...",
  "Đang kiểm định tọa độ Trụ sở chính và cảnh báo chung cư...",
  "Đang đối soát Vốn điều lệ & tỷ lệ toán học giữa các thành viên...",
  "Đang rà soát Danh mục ngành nghề kinh doanh VSIC (Quyết định 27)...",
  "Đang tính toán mức độ hợp lệ và kiến tạo báo cáo thẩm định..."
];

export default function App() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [appraisalResult, setAppraisalResult] = useState<AppraisalResult | null>(null);
  const [activeBusinessDetails, setActiveBusinessDetails] = useState<BusinessRegistrationDetails>(BLANK_DETAILS);
  const [generatedDoc, setGeneratedDoc] = useState<GenerateDocResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Custom cycling loading message while isProcessing is true
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const resultsRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const genRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isProcessing) {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 3500);
    } else {
      setLoadingMsgIdx(0);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  // Unified File Submission
  const handleUpload = async (base64: string, fileName: string, mimeType: string) => {
    setIsProcessing(true);
    setServerError(null);
    setGeneratedDoc(null);

    try {
      const response = await fetch("/api/appraise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileBase64: base64, fileName, mimeType })
      });

      if (!response.ok) {
        throw new Error("Có lỗi xảy ra trong quá trình nạp hoặc phản hồi từ máy chủ thẩm định.");
      }

      const result: AppraisalResult = await response.json();
      setAppraisalResult(result);
      
      // Auto prefill the interactive form with whatever the AI was able to extract
      if (result.extractedDetails) {
        setActiveBusinessDetails(result.extractedDetails);
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setServerError(err.message || "Không thể kết nối đến máy chủ AI. Vui lòng thử lại sau.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Quick Apply Proposal to fields
  const handleApplyProposal = (sectionName: string, proposedValue: string) => {
    if (!activeBusinessDetails) return;
    const updated = { ...activeBusinessDetails };

    const normName = sectionName.toLowerCase();
    if (normName.includes("tên")) {
      updated.companyName = proposedValue.toUpperCase();
    } else if (normName.includes("vốn")) {
      // Strip brackets or non-digits for numeric representation
      const numMatch = proposedValue.match(/\d+[\d.,]*/);
      if (numMatch) {
         updated.charterCapital = numMatch[0];
      }
      // Look for written letters
      const wordMatch = proposedValue.match(/chữ:\s*(.*)/i) || proposedValue.match(/bằng chữ:\s*(.*)/i) || [null, proposedValue];
      if (wordMatch[1]) {
         updated.charterCapitalWord = wordMatch[1];
      }
    } else if (normName.includes("trụ sở") || normName.includes("địa chỉ")) {
      updated.headquarters = proposedValue;
    } else if (normName.includes("đại diện")) {
      // Try to extract name
      const nameMatch = proposedValue.match(/đại diện:\s*([A-Za-zÀ-ỹ\s]+)/i);
      if (nameMatch) {
        updated.legalRepName = nameMatch[1].toUpperCase();
      } else {
        updated.legalRepAddress = proposedValue;
      }
    }

    setActiveBusinessDetails(updated);
    
    // Toast alert
    const toast = document.createElement("div");
    toast.className = "fixed bottom-5 right-5 bg-slate-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg border border-slate-700 z-50 animate-bounce";
    toast.innerHTML = ` đã áp dụng đề xuất quy chuẩn cho &quot;${sectionName}&quot; !`;
    document.body.appendChild(toast);
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  // Re-appraise by compiling details form into a plaintext block and uploading!
  const handleReAppraise = async () => {
    setIsProcessing(true);
    setServerError(null);
    setGeneratedDoc(null);

    try {
      // Format current details into standard Vietnam Dossier string
      const serializedText = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
---------------
HỒ SƠ ĐĂNG KÝ DOANH NGHIỆP (ĐÃ CHỈNH LÝ VÀ HOÀN THIỆN TRỰC TIẾP)

1. TÊN TIẾNG VIỆT DOANH NGHIỆP:
- Tên công ty: ${activeBusinessDetails.companyName}
- Thể loại hình: ${activeBusinessDetails.companyType}

2. ĐỊA CHỈ TRỤ SỞ CHÍNH ĐĂNG KÍ:
- Trụ sở: ${activeBusinessDetails.headquarters}

3. VỐN ĐIỀU LỆ ĐĂNG KÝ:
- Vốn điều lệ số: ${activeBusinessDetails.charterCapital} VNĐ
- Viết bằng chữ: ${activeBusinessDetails.charterCapitalWord}

4. DANH SÁCH THÀNH VIÊN / CỔ ĐÔNG SÁNG LẬP:
${activeBusinessDetails.founders.map((f, i) => `${i+1}. Tên: ${f.name} | Vai trò: ${f.role} | Tỷ lệ sở hữu: ${f.sharePercent}% | Vốn góp thực tế: ${f.capitalContribution} | Định danh: ${f.idNumber}`).join("\n")}

5. DANH MỤC NGÀNH NGHỀ ĐĂNG KÝ:
${activeBusinessDetails.businessLines.map((l, i) => `${i+1}. Mã VSIC: ${l.code} - Tên ngành: ${l.name} - Có điều kiện cấp phép: ${l.isConditional ? "Có" : "Không"}`).join("\n")}

6. NGƯỜI ĐẠI DIỆN PHÁP LUẬT:
- Họ tên đại diện: ${activeBusinessDetails.legalRepName}
- Giới tính: ${activeBusinessDetails.legalRepGender} | Ngày sinh: ${activeBusinessDetails.legalRepDob}
- Giấy chứng thực: ${activeBusinessDetails.legalRepIdType} số ${activeBusinessDetails.legalRepIdNumber} | Ngày cấp: ${activeBusinessDetails.legalRepIdDate}
- Hộ khẩu thường trú: ${activeBusinessDetails.legalRepAddress}
`;

      const base64 = btoa(unescape(encodeURIComponent(serializedText)));
      
      const response = await fetch("/api/appraise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64,
          fileName: "ho_so_tai_tham_dinh.txt",
          mimeType: "text/plain"
        })
      });

      if (!response.ok) {
        throw new Error("Lỗi khi gửi văn bản tái thẩm định tới AI.");
      }

      const result: AppraisalResult = await response.json();
      setAppraisalResult(result);
      
      // Update form context as well
      if (result.extractedDetails) {
        setActiveBusinessDetails(result.extractedDetails);
      }

      // Scroll smoothly to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

    } catch (err: any) {
      console.error(err);
      setServerError(err.message || "Tái thẩm định AI thất bại.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Request AI Document Drafting based on current details state
  const handleGenerateDocument = async (docType: "charter" | "member_list" | "application_form" | "authorization" | "other") => {
    setIsGeneratingDoc(true);
    setServerError(null);
    setGeneratedDoc(null);

    // Stagger smooth scroll to generator view
    setTimeout(() => {
      genRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const response = await fetch("/api/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: docType,
          businessDetails: activeBusinessDetails
        })
      });

      if (!response.ok) {
        throw new Error("Mạch xử lý kiến tạo hồ sơ bị lỗi kỹ thuật. Vui lòng thử lại.");
      }

      const resdoc: GenerateDocResponse = await response.json();
      setGeneratedDoc(resdoc);

    } catch (err: any) {
      console.error(err);
      setServerError(err.message || "Không thể khởi tạo biểu mẫu văn bản.");
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const resetAll = () => {
    setAppraisalResult(null);
    setGeneratedDoc(null);
    setServerError(null);
    setActiveBusinessDetails(BLANK_DETAILS);
    
    // Scroll gracefully
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans selection:bg-blue-600 selection:text-white pb-20">
      
      {/* Top Navigation Bar in dark slate */}
      <header className="h-14 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold italic text-white text-sm">AI</div>
          <h1 className="text-sm md:text-base font-bold tracking-tight uppercase">Hệ thống Thẩm định &amp; Kiến tạo Hồ sơ Đăng ký Kinh doanh AI</h1>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-2 items-center text-xs">
            <span className="opacity-60 uppercase tracking-widest text-[10px]">Trạng thái hệ thống:</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Sẵn sàng
            </span>
          </div>
          <div className="hidden md:block h-8 w-[1px] bg-white/20"></div>
          <div className="flex items-center gap-2 text-right">
            <div>
              <p className="text-xs font-semibold leading-tight">Chuyên viên Thẩm duyệt AI</p>
              <p className="text-[10px] opacity-60 leading-none">Cổng thông tin ĐKKD</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-bold text-slate-200">
              AD
            </div>
          </div>
        </div>
      </header>

      {/* Sub-header / Toolbar */}
      <div className="h-11 bg-white border-b border-slate-300 flex items-center justify-between px-6 sticky top-14 z-30 shrink-0">
        <div className="flex gap-4">
          <a
            href="#vung-tai-ho-so"
            className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded hover:bg-blue-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            TẢI HỒ SƠ LÊN (.DOCX, .PDF)
          </a>
          <button
            onClick={() => {
              setAppraisalResult(null);
              setGeneratedDoc(null);
              setActiveBusinessDetails(BLANK_DETAILS);
              setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth" });
              }, 100);
            }}
            className="px-3 py-1 border border-slate-300 text-slate-600 text-xs font-semibold rounded hover:bg-slate-50 flex items-center gap-2 bg-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            SOẠN MẪU MỚI
          </button>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="text-slate-500 uppercase text-[10px] tracking-wider hidden sm:inline">Pháp lý áp dụng:</span>
          <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 hidden sm:inline">Luật Doanh nghiệp 2020</span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-500">Nghị định 01/2021/NĐ-CP</span>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 mt-6 space-y-8">
        
        {/* Intro Banner */}
        <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-lg p-6 md:p-8 shadow-md border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
          <div className="space-y-3 max-w-2xl relative z-10 text-left">
            <span className="text-[10px] font-bold text-blue-400 bg-blue-950/50 border border-blue-900 px-2 py-0.5 rounded uppercase tracking-widest inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Công nghệ AI thẩm định quy chuẩn
            </span>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">
              Thẩm định tức thì hồ sơ Đăng ký Kinh doanh của bạn
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Giải pháp AI thông minh giúp rà soát Điều lệ công ty, Giấy đề nghị đăng ký doanh nghiệp. Đối chiếu kỹ lưỡng Tên, Trụ sở nhà chung cư vi phạm, tiến độ Vốn góp trùng số/chữ, phân bổ % sáng lập &amp; cảnh báo điều kiện kinh doanh Việt Nam theo <strong>Luật Doanh nghiệp 2020</strong>.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 shrink-0 relative z-10 w-full sm:w-auto">
            <button
              onClick={() => {
                setAppraisalResult(null);
                setGeneratedDoc(null);
                setActiveBusinessDetails(BLANK_DETAILS);
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-50 active:scale-95 transition-all font-bold text-xs rounded border border-slate-200 text-center shadow-sm"
            >
              Soạn biểu mẫu mới từ đầu
            </button>
            <a
              href="#vung-tai-ho-so"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-all font-bold text-xs rounded text-center flex items-center justify-center gap-1 shadow-sm"
            >
              Tải hồ sơ lên thẩm định
            </a>
          </div>
        </section>

        {/* Global Error Banner */}
        {serverError && (
          <div className="bg-rose-50 border border-rose-200 rounded p-4 flex items-start gap-3 animate-shake">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-rose-800 text-xs uppercase tracking-wide">Lỗi xảy ra trong hệ thống</h4>
              <p className="text-xs text-rose-700 mt-1">{serverError}</p>
            </div>
          </div>
        )}

        {/* Loading cycling block */}
        {isProcessing && (
          <div className="bg-white rounded border border-slate-300 shadow-sm p-8 flex flex-col items-center justify-center py-12 text-center space-y-4 animate-pulse">
            <div className="relative">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-600 border-t-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-blue-600">
                <FileCheck2 className="w-4 h-4 animate-bounce" />
              </div>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Hành động Thẩm định AI đang chạy...</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">Vui lòng giữ kết nối. Trợ lý Thẩm định viên đang kiểm duyệt chi tiết hồ sơ.</p>
            </div>
            {/* Dynamic cycling message and progress */}
            <div className="bg-slate-50 border border-slate-200 rounded py-1.5 px-4 text-blue-700 text-xs font-semibold">
              ⏱️ {LOADING_STATUSES[loadingMsgIdx]}
            </div>
          </div>
        )}

        {/* Step 1: Upload and Preset section */}
        {!isProcessing && !appraisalResult && !generatedDoc && (
          <UploadZone onUpload={handleUpload} isLoading={isProcessing} />
        )}

        {/* Step 2: Appraisal Results Dashboard view */}
        {appraisalResult && !isProcessing && (
          <div ref={resultsRef}>
            <AppraisalResults 
              result={appraisalResult} 
              onApplyProposal={handleApplyProposal}
              onLoadDetailsToForm={(det) => {
                setActiveBusinessDetails(det);
              }}
              onSelectMissingDocForGen={handleGenerateDocument}
              onReset={resetAll}
              scrollToForm={() => {
                setTimeout(() => {
                  formRef.current?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            />
          </div>
        )}

        {/* Step 3: Document preview container */}
        {(isGeneratingDoc || generatedDoc) && (
          <div ref={genRef} className="pt-4">
            <DocumentGenerator 
              document={generatedDoc} 
              isLoading={isGeneratingDoc} 
              onBack={() => setGeneratedDoc(null)} 
            />
          </div>
        )}

        {/* Step 4: Core Interactive Fine-Tuned Form (Always visible after first evaluation, or if explicitly requested to build a new one) */}
        {((appraisalResult && !isProcessing) || activeBusinessDetails !== BLANK_DETAILS) && (
          <div ref={formRef} className="pt-4">
            <div className="mb-4 flex gap-3 text-left">
              <div className="p-2 bg-blue-50 rounded text-blue-700 self-center border border-blue-100">
                <FileCode2 className="w-5 h-5" />
              </div>
              <div className="self-center">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Hoàn thiện thông tin &amp; Khắc phục trực tiếp</h3>
                <p className="text-xs text-slate-500">Chỉnh sửa biểu mẫu dưới dây, rồi bấm &quot;Tái thẩm định&quot; để đối soát luật tức thì!</p>
              </div>
            </div>
            
            <BusinessForm 
              details={activeBusinessDetails} 
              onChange={setActiveBusinessDetails} 
              onReAppraise={handleReAppraise}
              onGenerateDoc={handleGenerateDocument}
              isProcessing={isProcessing}
            />
          </div>
        )}

      </main>

      {/* Footer copyright */}
      <footer className="mt-20 border-t border-slate-200/50 py-8 bg-slate-50 text-center text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="font-medium">© 2026 App Thẩm Định ĐK KDoanh AI - Trí Tuệ Nhân Tạo hỗ trợ Luật sư Thành lập Doanh nghiệp</p>
          <div className="flex gap-4 text-[11px] font-semibold text-slate-500">
            <span className="cursor-default">Luật Doanh nghiệp 2020</span>
            <span className="cursor-default">Quyết định 27/2018/QĐ-TTg</span>
            <span className="cursor-default">Bảo mật Tệp gốc AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
