export const HEAVY_METALS = [
  {
    key: "LEAD",
    label: "Lead",
    unit: "ppm",
    requiresScreeningChoice: true,
  },
  {
    key: "CADMIUM",
    label: "Cadmium",
    unit: "ppm",
  },
  {
    key: "CHROMIUM",
    label: "Chromium",
    unit: "ppm",
  },
  {
    key: "NICKEL",
    label: "Nickel",
    unit: "ppm",
  },
  {
    key: "ARSENIC",
    label: "Arsenic",
    unit: "ppm",
  },
  {
    key: "MERCURY",
    label: "Mercury",
    unit: "ppm",
  },
];

export const LEAD_XRF_OPTIONS = [
  {
    value: "PASS",
    label: "Pass",
    description: "Lead screening passed",
  },
  {
    value: "FAIL",
    label: "Fail",
    description: "Lead detected — requires lab confirmation",
  },
];

export const XRF_ALLOWED_STATUSES = [
  "APPROVED_FOR_XRF",
  "XRF_IN_PROGRESS",
];