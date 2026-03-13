import api from "../../../utils/api";

const REGISTRY = "/api/nafdac/registry";
const VERIFICATION = "/api/nafdac/verification";
const RISK = "/api/nafdac/risk-intelligence";

// ─── Registry ─────────────────────────────────────────────────────────────
export function getRegistrySummary() {
  return api.get(`${REGISTRY}/summary`).then((r) => r.data);
}

export function uploadRegistryFile(formData) {
  return api.post(`${REGISTRY}/upload`, formData).then((r) => r.data);
}

export function getRegistryVersions() {
  return api.get(`${REGISTRY}/versions`).then((r) => r.data);
}

export function getRegistryVersion(id) {
  return api.get(`${REGISTRY}/versions/${id}`).then((r) => r.data);
}

export function exportRegistryVersion(id) {
  return api.get(`${REGISTRY}/versions/${id}/export`, { responseType: "blob" }).then((r) => r.data);
}

export function activateRegistryVersion(id) {
  return api.post(`${REGISTRY}/versions/${id}/activate`).then((r) => r.data);
}

export function searchRegistryProducts(params = {}) {
  return api.get(`${REGISTRY}/search`, { params }).then((r) => r.data);
}

export function getProductByNafdacNumber(nafdacNumber) {
  return api.get(`${REGISTRY}/products/${encodeURIComponent(nafdacNumber)}`).then((r) => r.data);
}

// ─── Verification ─────────────────────────────────────────────────────────
export function getVerificationSummary(params = {}) {
  return api.get(`${VERIFICATION}/summary`, { params }).then((r) => r.data);
}

export function getVerificationLogs(params = {}) {
  return api.get(`${VERIFICATION}/logs`, { params }).then((r) => r.data);
}

export function verifySample(sampleId) {
  return api.post(`${VERIFICATION}/samples/${sampleId}/verify`).then((r) => r.data);
}

export function bulkVerifySamplesForVersion(versionId) {
  return api.post(`${VERIFICATION}/registry/${versionId}/verify-samples`).then((r) => r.data);
}

// ─── Risk intelligence ───────────────────────────────────────────────────
export function getHighRiskRegions(params = {}) {
  return api.get(`${RISK}/high-risk-regions`, { params }).then((r) => r.data);
}

export function getReusedNafdacNumbers(params = {}) {
  return api.get(`${RISK}/reused-nafdac-numbers`, { params }).then((r) => r.data);
}

export function getFakeProductsSummary(params = {}) {
  return api.get(`${RISK}/fake-products-summary`, { params }).then((r) => r.data);
}
