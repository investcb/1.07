export interface DocumentPart {
  name: string;
  importance: "Bắt buộc" | "Khuyến khích";
  reason: string;
  type: "charter" | "member_list" | "application_form" | "authorization" | "other";
}

export interface AppraisalSection {
  name: string;
  status: "valid" | "invalid" | "warning" | "missing";
  explanation: string;
  currentText: string;
  proposedText: string;
}

export interface BusinessRegistrationDetails {
  companyName: string;
  companyType: "TNHH_1_TV" | "TNHH_2_TV_TRO_LEN" | "CO_PHAN" | "DOANH_NGHIEP_TU_NHAN" | "";
  charterCapital: string; // in VND
  charterCapitalWord: string;
  legalRepName: string;
  legalRepGender: string;
  legalRepDob: string;
  legalRepIdType: string;
  legalRepIdNumber: string;
  legalRepIdDate: string;
  legalRepAddress: string;
  businessLines: Array<{ code: string; name: string; isConditional: boolean; notes?: string }>;
  founders: Array<{ name: string; sharePercent: number; capitalContribution: string; idNumber: string; role: string }>;
  headquarters: string;
}

export interface AppraisalResult {
  score: number; // 0 to 100
  status: "pass" | "fail" | "warning";
  summary: string;
  extractedDetails: BusinessRegistrationDetails;
  sections: AppraisalSection[];
  missingDocuments: DocumentPart[];
}

export interface GenerateDocResponse {
  documentTitle: string;
  contentMarkdown: string;
}
