// ─── Mock Data ────────────────────────────────────────────────────────────────
export const mockProducts = [
  { id: 1, nafdacNumber: "A7-0327", productName: "Paracetamol 500mg Tablet", brandName: "Panadol", manufacturer: "GSK Nigeria", status: "APPROVED", category: "Pharmaceutical" },
  { id: 2, nafdacNumber: "B3-1194", productName: "Amoxicillin 250mg Capsule", brandName: "Amoxil", manufacturer: "Pfizer Nigeria", status: "APPROVED", category: "Pharmaceutical" },
  { id: 3, nafdacNumber: "C1-0882", productName: "Oral Rehydration Salts", brandName: "Dioralyte", manufacturer: "Sanofi", status: "SUSPENDED", category: "OTC" },
  { id: 4, nafdacNumber: "D5-2201", productName: "Chloroquine 150mg Tablet", brandName: "Malareich", manufacturer: "May & Baker", status: "APPROVED", category: "Pharmaceutical" },
  { id: 5, nafdacNumber: "E9-0043", productName: "Vitamin C 1000mg Effervescent", brandName: "Redoxon", manufacturer: "Bayer", status: "APPROVED", category: "Supplement" },
];

export const mockVersions = [
  { id: "v2024-12", date: "2024-12-01", uploadedBy: "Dr. Adaeze Okafor", records: 48293, active: true },
  { id: "v2024-09", date: "2024-09-15", uploadedBy: "Engr. Musa Bello", records: 47104, active: false },
  { id: "v2024-06", date: "2024-06-30", uploadedBy: "Dr. Adaeze Okafor", records: 45880, active: false },
  { id: "v2024-03", date: "2024-03-12", uploadedBy: "Mr. Chidi Eze", records: 44221, active: false },
];

export const mockVerifications = [
  { id: "SMP-001", product: "Paracetamol 500mg", nafdacNumber: "A7-0327", status: "VERIFIED", state: "Lagos", date: "2025-03-08", outcome: "MATCH" },
  { id: "SMP-002", product: "Unknown Capsule", nafdacNumber: "XX-9999", status: "FAILED", state: "Kano", date: "2025-03-07", outcome: "NO_MATCH" },
  { id: "SMP-003", product: "Chloroquine 150mg", nafdacNumber: "D5-2201", status: "VERIFIED", state: "Abuja", date: "2025-03-07", outcome: "MATCH" },
  { id: "SMP-004", product: "Amoxicillin 250mg", nafdacNumber: "B3-1194", status: "PENDING", state: "Port Harcourt", date: "2025-03-06", outcome: "PENDING" },
  { id: "SMP-005", product: "Vitamin Supplement", nafdacNumber: "E9-0043", status: "VERIFIED", state: "Ibadan", date: "2025-03-05", outcome: "MATCH" },
];

export const mockRiskData = [
  { region: "Lagos", riskScore: 87, fakeProducts: 34, reusedNumbers: 12, trend: "up" },
  { region: "Kano", riskScore: 72, fakeProducts: 21, reusedNumbers: 8, trend: "up" },
  { region: "Onitsha", riskScore: 65, fakeProducts: 18, reusedNumbers: 5, trend: "down" },
  { region: "Abuja", riskScore: 41, fakeProducts: 9, reusedNumbers: 2, trend: "stable" },
  { region: "Port Harcourt", riskScore: 58, fakeProducts: 15, reusedNumbers: 4, trend: "up" },
];

export const mockUsers = [
  { id: 1, name: "Dr. Adaeze Okafor", email: "a.okafor@nafdac.gov.ng", role: "POLICY_MAKER_NAFDAC", lastActive: "2 hours ago", status: "ACTIVE" },
  { id: 2, name: "Engr. Musa Bello", email: "m.bello@nafdac.gov.ng", role: "POLICY_MAKER_NAFDAC", lastActive: "1 day ago", status: "ACTIVE" },
  { id: 3, name: "Dr. Fatima Aliyu", email: "f.aliyu@fmohsw.gov.ng", role: "POLICY_MAKER_FMOHSW", lastActive: "3 days ago", status: "ACTIVE" },
  { id: 4, name: "Mr. Chidi Eze", email: "c.eze@nafdac.gov.ng", role: "LAB_ANALYST", lastActive: "5 hours ago", status: "ACTIVE" },
  { id: 5, name: "Ms. Ngozi Obi", email: "n.obi@nafdac.gov.ng", role: "SUPERVISOR", lastActive: "12 hours ago", status: "INACTIVE" },
];