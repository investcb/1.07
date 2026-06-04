import express from "express";
import path from "path";
import dotenv from "dotenv";
import mammoth from "mammoth";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Standard initialization for Google GenAI SDK as outlined in system guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const app = express();
const PORT = 3000;

// Configuration of larger payload limit (for base64 uploaded files)
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ----------------------------------------------------
// SCHEMA DEFINITIONS FOR GEMINI RESPONSE
// ----------------------------------------------------
const appraisalSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "Điểm đánh giá hợp lệ tổng thể của hồ sơ (0 - 100)"
    },
    status: {
      type: Type.STRING,
      description: "Trạng thái chung: 'pass' (Hợp lệ/Sẵn sàng), 'warning' (Nhỏ, cần lưu ý), 'fail' (Lỗi nghiêm trọng cần chỉnh sửa)"
    },
    summary: {
      type: Type.STRING,
      description: "Tóm tắt nhận định thẩm định bằng tiếng Việt một cách dễ hiểu, định vị các điểm nổi bật cần lưu ý."
    },
    extractedDetails: {
      type: Type.OBJECT,
      description: "Thông tin cơ bản về hồ sơ doanh nghiệp trích xuất từ văn bản.",
      properties: {
        companyName: { type: Type.STRING, description: "Tên doanh nghiệp đầy đủ tìm thấy trong hồ sơ" },
        companyType: { 
          type: Type.STRING, 
          description: "Loại hình doanh nghiệp: 'TNHH_1_TV', 'TNHH_2_TV_TRO_LEN', 'CO_PHAN', 'DOANH_NGHIEP_TU_NHAN' hoặc ''" 
        },
        charterCapital: { type: Type.STRING, description: "Vốn điều lệ bằng số (ví dụ: '2.000.000.000')" },
        charterCapitalWord: { type: Type.STRING, description: "Vốn điều lệ viết bằng chữ" },
        legalRepName: { type: Type.STRING, description: "Họ và tên người đại diện theo pháp luật (VIẾT HOA)" },
        legalRepGender: { type: Type.STRING, description: "Giới tính người đại diện (Nam/Nữ)" },
        legalRepDob: { type: Type.STRING, description: "Ngày sinh (DD/MM/YYYY)" },
        legalRepIdType: { type: Type.STRING, description: "Loại giấy tờ chứng thực (CCCD/Hộ chiếu)" },
        legalRepIdNumber: { type: Type.STRING, description: "Số CCCD/Hộ chiếu" },
        legalRepIdDate: { type: Type.STRING, description: "Ngày cấp CCCD/Hộ chiếu" },
        legalRepAddress: { type: Type.STRING, description: "Địa chỉ thường trú và cư trú của đại diện pháp luật" },
        headquarters: { type: Type.STRING, description: "Địa chỉ trụ sở chính đăng ký" },
        businessLines: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              code: { type: Type.STRING, description: "Mã ngành VSIC 4 chữ số, e.g. '6201'" },
              name: { type: Type.STRING, description: "Tên ngành nghề tương ứng mã VSIC" },
              isConditional: { type: Type.BOOLEAN, description: "True nếu đây là ngành kinh doanh có điều kiện cần giấy phép con" },
              notes: { type: Type.STRING, description: "Cụ thể điều kiện kinh doanh hoặc yêu cầu bổ sung nếu có" }
            },
            required: ["code", "name", "isConditional"]
          }
        },
        founders: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Tên thành viên/cổ đông sáng lập" },
              sharePercent: { type: Type.NUMBER, description: "Tỉ lệ phần trăm góp vốn (e.g., 40)" },
              capitalContribution: { type: Type.STRING, description: "Giá trị góp vốn (e.g. '800.000.000 VNĐ')" },
              idNumber: { type: Type.STRING, description: "Số giấy tờ định danh cá nhân" },
              role: { type: Type.STRING, description: "Chức danh đảm nhiệm, VD: Chủ sở hữu, Thành viên góp vốn" }
            },
            required: ["name", "sharePercent", "capitalContribution"]
          }
        }
      },
      required: ["companyName", "companyType", "charterCapital", "legalRepName", "businessLines", "founders", "headquarters"]
    },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tiêu chí thẩm định, VD: 'Tên Doanh Nghiệp', 'Vốn Điều Lệ', 'Trụ Sở Chính', 'Người Đại Diện Pháp Luật', 'Ngành Nghề Kinh Doanh', 'Danh Sách Thành Viên/Cổ Đông'" },
          status: { type: Type.STRING, description: "Trạng thái: 'valid' (Hợp lệ), 'warning' (Thiếu sót nhỏ), 'invalid' (Sai luật cần sửa gấp), 'missing' (Thiếu cả nội dung)" },
          explanation: { type: Type.STRING, description: "Phân tích cụ thể dựa trên Luật Doanh nghiệp 2020 và hướng dẫn chỉnh sửa." },
          currentText: { type: Type.STRING, description: "Đoạn văn tương ứng trong hồ sơ của người dùng (nếu có, nếu không ghi 'Không tìm thấy')" },
          proposedText: { type: Type.STRING, description: "Đoạn văn hoàn thiện đề xuất đúng quy chuẩn để thay thế/chỉnh sửa trực tiếp" }
        },
        required: ["name", "status", "explanation", "currentText", "proposedText"]
      }
    },
    missingDocuments: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Tên văn bản/hồ sơ còn thiếu trong bộ hồ sơ đăng ký doanh nghiệp hoàn chỉnh" },
          importance: { type: Type.STRING, description: "Mức độ cần thiết: 'Bắt buộc' or 'Khuyến khích'" },
          reason: { type: Type.STRING, description: "Lý do vì sao bắt buộc hoặc vì sao cần có theo Luật Doanh nghiệp" },
          type: { type: Type.STRING, description: "Mã loại tài liệu: 'charter' (Điều lệ), 'member_list' (Danh sách thành viên/cổ đông), 'application_form' (Giấy đề nghị đăng ký), 'authorization' (Giấy ủy quyền), 'other'" }
        },
        required: ["name", "importance", "reason", "type"]
      }
    }
  },
  required: ["score", "status", "summary", "extractedDetails", "sections", "missingDocuments"]
};

const documentGenSchema = {
  type: Type.OBJECT,
  properties: {
    documentTitle: { type: Type.STRING, description: "Tiêu đề chuẩn của mẫu văn bản này" },
    contentMarkdown: { type: Type.STRING, description: "Toàn bộ nội dung văn bản chi tiết định dạng Markdown chuyên nghiệp. Có đầy đủ quốc hiệu tiêu ngữ, các căn cứ Luật Doanh nghiệp 2020, điều khoản chi tiết, và phần ký tên của các sáng lập viên." }
  },
  required: ["documentTitle", "contentMarkdown"]
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

/**
 * Endpoint for Appraising Document (Accepts PDF or Word docx Base64)
 */
app.post("/api/appraise", async (req, res) => {
  const { fileBase64, fileName, mimeType } = req.body;

  if (!fileBase64) {
    return res.status(400).json({ error: "Yêu cầu cung cấp tệp tin base64." });
  }

  try {
    let documentContent: string = "";
    let isPdf = false;
    let base64Clean = fileBase64.replace(/^data:.*?;base64,/, "");

    // Process Word documents (.docx) or PDFs
    if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || fileName.endsWith(".docx")) {
      const buffer = Buffer.from(base64Clean, "base64");
      const result = await mammoth.extractRawText({ buffer });
      documentContent = result.value;
    } else if (mimeType === "application/pdf" || fileName.endsWith(".pdf")) {
      isPdf = true;
    } else {
      // Treat as plain text as backup
      const buffer = Buffer.from(base64Clean, "base64");
      documentContent = buffer.toString("utf-8");
    }

    const systemInstruction = `Bạn là một Trợ lý Thẩm định viên Pháp lý cấp cao tại Phòng Đăng ký Kinh doanh (Sở Kế hoạch và Đầu tư Việt Nam). Sau đây là Luật Doanh nghiệp 2020 và các quy định hiện hành. Nhiệm vụ của bạn là thẩm định tài liệu do người dùng đăng tải (có thể là dự thảo Điều lệ công ty, Giấy đề nghị đăng ký doanh nghiệp hoặc một văn bản tổng hợp của họ) và đưa ra báo cáo thẩm định đúng chuẩn pháp lý.

YÊU CẦU KIỂM TRA PHÁP LÝ CHI TIẾT:
1. TÊN DOANH NGHIỆP: Kiểm tra loại hình công ty có ghép đúng tên riêng không. Kiểm tra các từ ngữ cấm kị, gây nhầm lẫn hoặc trùng lặp (ví dụ dùng tên cơ quan nhà nước, đơn vị lực lượng vũ trang).
2. TRỤ SỞ CHÍNH: Kiểm tra kết cấu địa chỉ có rõ ràng (Tổ, Thôn/Xóm/Số nhà, Đường/Phố, Phường/Xã/Thị trấn, Quận/Huyện/Thị xã/Thành phố thuộc tỉnh, Tỉnh/Thành phố trực thuộc trung ương). Lưu ý: Chung cư căn hộ KHÔNG được phép làm trụ sở doanh nghiệp trừ khi tòa nhà có phần diện tích thương mại được cấp phép rõ ràng. Nếu nghi ngờ chung cư, đưa ra cảnh báo.
3. VỐN ĐIỀU LỆ: Kiểm tra vốn góp bằng chữ và số có trùng nhau không. Đồng tiền vốn điều lệ phải là VNĐ (Việt Nam Đồng). Tiến độ góp vốn bắt buộc là 90 ngày kể từ ngày cấp Giấy chứng nhận đăng ký doanh nghiệp.
4. NGÀNH NGHỀ KINH DOANH: Kiểm tra mã ngành VSIC 4 chữ số. Nếu là ngành nghề kinh doanh có điều kiện (ví dụ: Bất động sản, Giảng dạy, Du lịch, Xây dựng, Tài chính ngân hàng, Vận tải), bạn phải đánh dấu 'isConditional: true' và ghi chú rõ điều kiện pháp lý cần chuẩn bị (VD vốn pháp định, chứng chỉ hành nghề, giấy phép con).
5. NGƯỜI ĐẠI DIỆN VÀ THÀNH VIÊN SÁNG LẬP: Kiểm tra tỉ lệ phần góp vốn (Tổng cộng phải đúng bằng 100%), đối sánh số tiền góp vốn tương ứng có khớp với tổng vốn điều lệ hay không. Đảm bảo có ít nhất một người đại diện pháp luật cư trú tại Việt Nam.

Trình bày kết quả thẩm định dưới cấu trúc JSON chính xác theo schema quy định. Ngữ điệu thẩm định khách quan, chuyên nghiệp, chính xác, lịch sự bằng tiếng Việt.`;

    const modelToUse = "gemini-3.5-flash";

    let response;

    if (isPdf) {
      // Send PDF directory using inlineData to leverage Gemini PDF understanding
      response = await ai.models.generateContent({
        model: modelToUse,
        contents: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Clean
            }
          },
          {
            text: "Hãy thẩm định tài liệu PDF đính kèm này theo Luật Doanh nghiệp 2020 và trích xuất thông tin chi tiết của hồ sơ thành định dạng JSON đúng cấu trúc."
          }
        ],
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: appraisalSchema,
          temperature: 0.1, // low temperature for precise extraction
        }
      });
    } else {
      // Send extracted text
      response = await ai.models.generateContent({
        model: modelToUse,
        contents: `Sau đây là nội dung văn bản trích xuất từ tài liệu người dùng gửi:\n\n${documentContent}\n\nHãy thẩm định tài liệu trên theo Luật Doanh nghiệp 2020 và trích xuất thông tin doanh nghiệp chi tiết.` ,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: appraisalSchema,
          temperature: 0.1,
        }
      });
    }

    const aiText = response.text || "{}";
    const parsedResult = JSON.parse(aiText);
    res.json(parsedResult);

  } catch (error: any) {
    console.error("Lỗi khi xử lý tài liệu thẩm định:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi phân tích tài liệu của bạn bằng AI: " + error.message });
  }
});

/**
 * Endpoint for Generating Missing Documents
 */
app.post("/api/generate-document", async (req, res) => {
  const { documentType, businessDetails } = req.body;

  if (!documentType || !businessDetails) {
    return res.status(400).json({ error: "Thiếu loại tài liệu hoặc thông tin doanh nghiệp." });
  }

  try {
    const detailsPrompt = JSON.stringify(businessDetails, null, 2);
    
    let docDescription = "";
    if (documentType === "charter") {
      docDescription = "Điều lệ Công ty phù hợp với Luật Doanh nghiệp 2020. Văn bản này cần chứa đầy đủ các chương mục bắt buộc (Tên, địa chỉ, ngành nghề, vốn điều lệ, cách thức góp vốn, cơ cấu quản lý nội bộ, người đại diện theo pháp luật, giải thể...).";
    } else if (documentType === "member_list") {
      docDescription = "Danh sách thành viên góp vốn (đối với Công ty TNHH Hai Thành Viên trở lên) hoặc Danh sách cổ đông sáng lập (đối với Công ty Cổ phần) chuẩn hóa theo quy định của Bộ Kế hoạch và Đầu tư.";
    } else if (documentType === "application_form") {
      docDescription = "Giấy đề nghị đăng ký doanh nghiệp hoàn chỉnh điền đầy đủ các thông tin: tên, địa chỉ, vốn, thông tin người đại diện pháp luật, phương thức nộp lệ phí.";
    } else if (documentType === "authorization") {
      docDescription = "Văn bản ủy quyền cho người đại diện thực hiện thủ tục đăng ký thành lập doanh nghiệp tại Phòng Đăng ký kinh doanh.";
    } else {
      docDescription = `Mẫu văn bản pháp lý hỗ trợ thành lập doanh nghiệp liên quan đến loại tài liệu: ${documentType}`;
    }

    const systemInstruction = `Bạn là một Luật sư chuyên nghiệp chuyên về Luật Doanh nghiệp Việt Nam. Nhiệm vụ của bạn là soạn thảo mẫu dự thảo văn bản đăng ký kinh doanh đúng chuẩn pháp lý dựa trên các thông tin doanh nghiệp được cung cấp.

Yêu cầu văn bản:
1. Đầy đủ Quốc hiệu, Tiêu ngữ, bố cục rõ ràng, chuyên nghiệp.
2. Căn cứ đúng Luật Doanh nghiệp số 59/2020/QH14 ngày 17 tháng 06 năm 2020.
3. Thay thế toàn bộ các biến số bằng giá trị thật từ thông tin doanh nghiệp người dùng cung cấp. Không để trống các mục cơ bản (Tên công ty, Vốn điều lệ, Đại diện pháp luật, Sáng lập viên...).
4. Định dạng văn bản sử dụng Markdown hoàn toàn, với tiêu đề, bôi đậm rõ ràng để người dùng có thể dễ dàng sao chép hoặc in ấn ra bản cứng.

Hãy trả về phản hồi dưới dạng JSON có cấu trúc chính xác theo schema được cung cấp.`;

    const promptText = `HÃY SOẠN THẢO VĂN BẢN TRÊN CƠ SỞ THÔNG TIN DOANH NGHIỆP SAU ĐÂY:
Mẫu tài liệu cần soạn: ${docDescription}

Thông tin doanh nghiệp:
${detailsPrompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: documentGenSchema,
        temperature: 0.3,
      }
    });

    const aiText = response.text || "{}";
    const docResult = JSON.parse(aiText);
    res.json(docResult);

  } catch (error: any) {
    console.error("Lỗi khi khởi tạo tài liệu:", error);
    res.status(500).json({ error: "Không thể soạn thảo tài liệu: " + error.message });
  }
});


// ----------------------------------------------------
// VITE AND STATIC ASSETS SERVING CONFIG
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Configure Vite in middleware mode for rich HMR-like dev server routing
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production from dist
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Fallback all front-end route hits to index.html for React SPA
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Full-stack Server] Thẩm định hồ sơ đăng ký kinh doanh running on port ${PORT}`);
  });
}

startServer();
