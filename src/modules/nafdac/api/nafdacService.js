import api from "../../../utils/api";

const REGISTRY = "/nafdac/registry";
const VERIFICATION = "/nafdac/verification";
const RISK = "/nafdac/risk-intelligence";

// ─── Registry ─────────────────────────────────────────────────────────────
export async function getRegistrySummary() {
  return await api.get(`${REGISTRY}/summary`).then((r) => r.data);
}

export async function uploadRegistryFile(formData) {
  return await api.post(`${REGISTRY}/upload`, formData);
}

export async function getRegistryVersions() {
  return await api.get(`${REGISTRY}/versions`).then((r) => r.data);
}

export async function getRegistryVersion(id) {
  return await api.get(`${REGISTRY}/versions/${id}`).then((r) => r.data);
}
export async function exportRegistryVersion(id) {
  return await api
    .get(`${REGISTRY}/versions/${id}/export`, {
      responseType: "blob",
    })
    .then((r) => r.data);
}

export async function activateRegistryVersion(id) {
  return await api
    .post(`${REGISTRY}/versions/${id}/activate`)
    .then((r) => r.data);
}

// Search Products-------------------------------------
export async function searchRegistryProducts(params = {}) {
  return await api.get(`${REGISTRY}/search`, { params }).then((r) => r.data);
}

export async function getProductByNafdacNumber(nafdacNumber) {
  return await api
    .get(`${REGISTRY}/products/${encodeURIComponent(nafdacNumber)}`)
    .then((r) => r.data);
}

// ─── Verification ─────────────────────────────────────────────────────────
export async function getVerificationSummary(params = {}) {
  return await api
    .get(`${VERIFICATION}/summary`, { params })
    .then((r) => r.data);
}

export async function getVerificationLogs(params = {}) {
  return await api.get(`${VERIFICATION}/logs`, { params }).then((r) => r.data);
}

export async function verifySample(sampleId) {
  return await api
    .post(`${VERIFICATION}/samples/${sampleId}/verify`)
    .then((r) => r.data);
}

export async function bulkVerifySamplesForVersion(versionId) {
  return await api
    .post(`${VERIFICATION}/registry/${versionId}/verify-samples`)
    .then((r) => r.data);
}

// ─── Risk intelligence ───────────────────────────────────────────────────
export async function getHighRiskRegions(params = {}) {
  return await api
    .get(`${RISK}/high-risk-regions`, { params })
    .then((r) => r.data);
}

export async function getReusedNafdacNumbers(params = {}) {
  return await api
    .get(`${RISK}/reused-nafdac-numbers`, { params })
    .then((r) => r.data);
}

export async function getFakeProductsSummary(params = {}) {
  return await api
    .get(`${RISK}/fake-products-summary`, { params })
    .then((r) => r.data);
}
