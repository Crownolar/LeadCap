const safeValue = (value, fallback = "-") => {
  return value === undefined || value === null || value === ""
    ? fallback
    : value;
};

/**
 * XLSX is loaded only when an Excel export is requested.
 */
const loadXLSX = async () => {
  const module = await import("xlsx");
  return module;
};

/**
 * jsPDF and jspdf-autotable are loaded only when a PDF export
 * is actually requested.
 */
const loadPdfLibraries = async () => {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  return { jsPDF, autoTable };
};

const createWorkbook = (XLSX) => XLSX.utils.book_new();

const addSheet = (XLSX, workbook, name, data, cols = []) => {
  const sheet = XLSX.utils.aoa_to_sheet(data);

  if (cols.length > 0) {
    sheet["!cols"] = cols;
  }

  XLSX.utils.book_append_sheet(workbook, sheet, name);
};

const saveWorkbook = (XLSX, workbook, fileName) => {
  XLSX.writeFile(workbook, fileName);
};

const createPdf = (jsPDF, title, metaLines = []) => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(title, 14, 16);

  doc.setFontSize(10);

  let y = 24;

  metaLines.forEach((line) => {
    doc.text(line, 14, y);
    y += 6;
  });

  return {
    doc,
    startY: y + 2,
  };
};

const addPdfTable = (autoTable, doc, head, body, startY) => {
  autoTable(doc, {
    startY,
    head: [head],
    body,
  });

  return doc.lastAutoTable.finalY + 10;
};

/* ============================================================
   STATE SUMMARY
   ============================================================ */

export const exportStateSummaryExcel = async ({
  fileName,
  generatedAt,
  state,
  dateFrom,
  dateTo,
  summary,
  contaminationBreakdown,
  registrationStatus,
  vendorType,
  verificationBreakdown,
  topLgas,
  recommendations,
}) => {
  const XLSX = await loadXLSX();
  const workbook = createWorkbook(XLSX);

  addSheet(
    XLSX,
    workbook,
    "Summary",
    [
      ["State Summary Report"],
      [],
      ["Generated At", safeValue(generatedAt)],
      ["State", safeValue(state)],
      ["Date From", safeValue(dateFrom)],
      ["Date To", safeValue(dateTo)],
      [],
      ["Summary"],
      ["Total Samples", safeValue(summary?.totalSamples, 0)],
      ["Safe", safeValue(contaminationBreakdown?.SAFE, 0)],
      ["Moderate", safeValue(contaminationBreakdown?.MODERATE, 0)],
      ["Contaminated", safeValue(contaminationBreakdown?.CONTAMINATED, 0)],
      ["Pending", safeValue(contaminationBreakdown?.PENDING, 0)],
      [
        "Contamination Rate",
        `${safeValue(summary?.percentageContaminated, "0.00")}%`,
      ],
      ["Registered Products", safeValue(registrationStatus?.registered, 0)],
      [
        "Unregistered Products",
        safeValue(registrationStatus?.unregistered, 0),
      ],
      ["Formal Vendors", safeValue(vendorType?.formal, 0)],
      ["Informal Vendors", safeValue(vendorType?.informal, 0)],
    ],
    [{ wch: 28 }, { wch: 20 }]
  );

  addSheet(
    XLSX,
    workbook,
    "Verification",
    [
      ["Verification Breakdown"],
      [],
      [
        "Verified Original",
        safeValue(verificationBreakdown?.VERIFIED_ORIGINAL, 0),
      ],
      ["Verified Fake", safeValue(verificationBreakdown?.VERIFIED_FAKE, 0)],
      ["Unverified", safeValue(verificationBreakdown?.UNVERIFIED, 0)],
      [
        "Verification Pending",
        safeValue(verificationBreakdown?.VERIFICATION_PENDING, 0),
      ],
    ],
    [{ wch: 28 }, { wch: 20 }]
  );

  addSheet(
    XLSX,
    workbook,
    "LGA Breakdown",
    [
      [
        "LGA",
        "Samples",
        "Contaminated",
        "Rate",
        "Safe",
        "Moderate",
        "Pending",
      ],
      ...(topLgas?.length
        ? topLgas.map((item) => [
            safeValue(item.lgaName),
            safeValue(item.samples, 0),
            safeValue(item.contaminated, 0),
            safeValue(item.rate, "0%"),
            safeValue(item.safe, 0),
            safeValue(item.moderate, 0),
            safeValue(item.pending, 0),
          ])
        : [["No LGA data available", "", "", "", "", "", ""]]),
    ],
    [
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ]
  );

  addSheet(
    XLSX,
    workbook,
    "Recommendations",
    [
      ["Recommendations"],
      [],
      ...(recommendations?.length
        ? recommendations.map((item, index) => [`${index + 1}. ${item}`])
        : [["No recommendations available"]]),
    ],
    [{ wch: 80 }]
  );

  saveWorkbook(XLSX, workbook, fileName);
};

export const exportStateSummaryPdf = async ({
  fileName,
  generatedAt,
  state,
  dateFrom,
  dateTo,
  summary,
  contaminationBreakdown,
  registrationStatus,
  vendorType,
  verificationBreakdown,
  topLgas,
  recommendations,
}) => {
  const { jsPDF, autoTable } = await loadPdfLibraries();

  const { doc, startY } = createPdf(jsPDF, "State Summary Report", [
    `Generated: ${safeValue(generatedAt)}`,
    `State: ${safeValue(state)}`,
    `Date Range: ${safeValue(dateFrom)} to ${safeValue(dateTo)}`,
  ]);

  let y = startY;

  y = addPdfTable(
    autoTable,
    doc,
    ["Summary Metric", "Value"],
    [
      ["Total Samples", safeValue(summary?.totalSamples, 0)],
      ["Safe", safeValue(contaminationBreakdown?.SAFE, 0)],
      ["Moderate", safeValue(contaminationBreakdown?.MODERATE, 0)],
      ["Contaminated", safeValue(contaminationBreakdown?.CONTAMINATED, 0)],
      ["Pending", safeValue(contaminationBreakdown?.PENDING, 0)],
      [
        "Contamination Rate",
        `${safeValue(summary?.percentageContaminated, "0.00")}%`,
      ],
      ["Registered Products", safeValue(registrationStatus?.registered, 0)],
      [
        "Unregistered Products",
        safeValue(registrationStatus?.unregistered, 0),
      ],
      ["Formal Vendors", safeValue(vendorType?.formal, 0)],
      ["Informal Vendors", safeValue(vendorType?.informal, 0)],
    ],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Verification Metric", "Value"],
    [
      [
        "Verified Original",
        safeValue(verificationBreakdown?.VERIFIED_ORIGINAL, 0),
      ],
      ["Verified Fake", safeValue(verificationBreakdown?.VERIFIED_FAKE, 0)],
      ["Unverified", safeValue(verificationBreakdown?.UNVERIFIED, 0)],
      [
        "Verification Pending",
        safeValue(verificationBreakdown?.VERIFICATION_PENDING, 0),
      ],
    ],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["LGA", "Samples", "Contaminated", "Rate"],
    topLgas?.length
      ? topLgas.map((item) => [
          safeValue(item.lgaName),
          safeValue(item.samples, 0),
          safeValue(item.contaminated, 0),
          safeValue(item.rate, "0%"),
        ])
      : [["No LGA data available", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Recommendations"],
    recommendations?.length
      ? recommendations.map((item, index) => [`${index + 1}. ${item}`])
      : [["No recommendations available"]],
    y
  );

  doc.save(fileName);
};

/* ============================================================
   CONTAMINATION ANALYSIS
   ============================================================ */

export const exportContaminationAnalysisExcel = async ({
  fileName,
  generatedAt,
  dateFrom,
  dateTo,
  states,
  productVariantIds,
  summary,
  distribution,
  stateRows,
  productTypeRows,
  trendRows,
  topContaminated,
}) => {
  const XLSX = await loadXLSX();
  const workbook = createWorkbook(XLSX);

  addSheet(
    XLSX,
    workbook,
    "Summary",
    [
      ["Contamination Analysis Report"],
      [],
      ["Generated At", safeValue(generatedAt)],
      ["Date From", safeValue(dateFrom)],
      ["Date To", safeValue(dateTo)],
      ["States Filter", safeValue(states, "All")],
      ["Product Variant IDs", safeValue(productVariantIds, "All")],
      [],
      ["Total Samples", safeValue(summary?.totalSamples, 0)],
      ["Total Readings", safeValue(summary?.totalReadings, 0)],
      [
        "Overall Contamination Rate",
        safeValue(summary?.overallContaminationRate, "0%"),
      ],
      [],
      ["Safe", safeValue(distribution?.safe, 0)],
      ["Moderate", safeValue(distribution?.moderate, 0)],
      ["Contaminated", safeValue(distribution?.contaminated, 0)],
      ["Pending", safeValue(distribution?.pending, 0)],
    ],
    [{ wch: 30 }, { wch: 24 }]
  );

  addSheet(XLSX, workbook, "By State", [
    ["State", "Samples", "Safe", "Moderate", "Contaminated", "Pending", "Rate"],
    ...(stateRows?.length
      ? stateRows.map((item) => [
          safeValue(item.stateName),
          safeValue(item.count, 0),
          safeValue(item.safe, 0),
          safeValue(item.moderate, 0),
          safeValue(item.contaminated, 0),
          safeValue(item.pending, 0),
          safeValue(item.contaminationRate, "0%"),
        ])
      : [["No state breakdown available", "", "", "", "", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "By Product Type", [
    [
      "Product Type",
      "Samples",
      "Safe",
      "Moderate",
      "Contaminated",
      "Pending",
      "Unverified",
      "Rate",
    ],
    ...(productTypeRows?.length
      ? productTypeRows.map((item) => [
          safeValue(item.productType),
          safeValue(item.count, 0),
          safeValue(item.safe, 0),
          safeValue(item.moderate, 0),
          safeValue(item.contaminated, 0),
          safeValue(item.pending, 0),
          safeValue(item.unverified, 0),
          safeValue(item.contaminationRate, "0%"),
        ])
      : [["No product type breakdown available", "", "", "", "", "", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "Trend", [
    ["Period", "Samples", "Rate"],
    ...(trendRows?.length
      ? trendRows.map((item) => [
          safeValue(item.period),
          safeValue(item.count, 0),
          safeValue(item.contaminationRate, "0%"),
        ])
      : [["No trend analysis available", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "Top Contaminated", [
    ["Sample", "State", "Heavy Metal", "Reading", "Status"],
    ...(topContaminated?.length
      ? topContaminated.map((item) => [
          safeValue(item.sampleId || item.sampleCode || item.sampleName),
          safeValue(item.state),
          safeValue(item.heavyMetal),
          safeValue(item.reading),
          safeValue(item.status),
        ])
      : [["No top contaminated samples available", "", "", "", ""]]),
  ]);

  saveWorkbook(XLSX, workbook, fileName);
};

export const exportContaminationAnalysisPdf = async ({
  fileName,
  generatedAt,
  dateFrom,
  dateTo,
  states,
  productVariantIds,
  summary,
  distribution,
  stateRows,
  productTypeRows,
  trendRows,
  topContaminated,
}) => {
  const { jsPDF, autoTable } = await loadPdfLibraries();

  const { doc, startY } = createPdf(jsPDF, "Contamination Analysis Report", [
    `Generated: ${safeValue(generatedAt)}`,
    `Date Range: ${safeValue(dateFrom)} to ${safeValue(dateTo)}`,
    `States Filter: ${safeValue(states, "All")}`,
    `Variant IDs Filter: ${safeValue(productVariantIds, "All")}`,
  ]);

  let y = startY;

  y = addPdfTable(
    autoTable,
    doc,
    ["Summary Metric", "Value"],
    [
      ["Total Samples", safeValue(summary?.totalSamples, 0)],
      ["Total Readings", safeValue(summary?.totalReadings, 0)],
      [
        "Overall Contamination Rate",
        safeValue(summary?.overallContaminationRate, "0%"),
      ],
      ["Safe", safeValue(distribution?.safe, 0)],
      ["Moderate", safeValue(distribution?.moderate, 0)],
      ["Contaminated", safeValue(distribution?.contaminated, 0)],
      ["Pending", safeValue(distribution?.pending, 0)],
    ],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["State", "Samples", "Safe", "Moderate", "Contaminated", "Pending", "Rate"],
    stateRows?.length
      ? stateRows.map((item) => [
          safeValue(item.stateName),
          safeValue(item.count, 0),
          safeValue(item.safe, 0),
          safeValue(item.moderate, 0),
          safeValue(item.contaminated, 0),
          safeValue(item.pending, 0),
          safeValue(item.contaminationRate, "0%"),
        ])
      : [["No state breakdown available", "", "", "", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    [
      "Product Type",
      "Samples",
      "Safe",
      "Moderate",
      "Contaminated",
      "Pending",
      "Unverified",
      "Rate",
    ],
    productTypeRows?.length
      ? productTypeRows.map((item) => [
          safeValue(item.productType),
          safeValue(item.count, 0),
          safeValue(item.safe, 0),
          safeValue(item.moderate, 0),
          safeValue(item.contaminated, 0),
          safeValue(item.pending, 0),
          safeValue(item.unverified, 0),
          safeValue(item.contaminationRate, "0%"),
        ])
      : [["No product type breakdown available", "", "", "", "", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Period", "Samples", "Rate"],
    trendRows?.length
      ? trendRows.map((item) => [
          safeValue(item.period),
          safeValue(item.count, 0),
          safeValue(item.contaminationRate, "0%"),
        ])
      : [["No trend analysis available", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Sample", "State", "Heavy Metal", "Reading", "Status"],
    topContaminated?.length
      ? topContaminated.map((item) => [
          safeValue(item.sampleId || item.sampleCode || item.sampleName),
          safeValue(item.state),
          safeValue(item.heavyMetal),
          safeValue(item.reading),
          safeValue(item.status),
        ])
      : [["No top contaminated samples available", "", "", "", ""]],
    y
  );

  doc.save(fileName);
};

/* ============================================================
   PRODUCT TYPE
   ============================================================ */

export const exportProductTypeExcel = async ({
  fileName,
  generatedAt,
  state,
  dateFrom,
  dateTo,
  summary,
  rows,
  recommendations,
}) => {
  const XLSX = await loadXLSX();
  const workbook = createWorkbook(XLSX);

  addSheet(
    XLSX,
    workbook,
    "Summary",
    [
      ["Product Type Report"],
      [],
      ["Generated At", safeValue(generatedAt)],
      ["State Filter", safeValue(state, "All States")],
      ["Date From", safeValue(dateFrom)],
      ["Date To", safeValue(dateTo)],
      [],
      ["Total Product Types", safeValue(summary?.totalProductTypes, 0)],
      ["Total Samples", safeValue(summary?.totalSamples, 0)],
    ],
    [{ wch: 24 }, { wch: 20 }]
  );

  addSheet(XLSX, workbook, "By Product Type", [
    [
      "Product Type",
      "Samples",
      "Registered",
      "Unregistered",
      "Verified Original",
      "Verified Fake",
      "Unverified",
      "Local",
      "Imported",
    ],
    ...(rows?.length
      ? rows.map((item) => [
          safeValue(item.productType),
          safeValue(item.totalSamples, 0),
          safeValue(item.registered, 0),
          safeValue(item.unregistered, 0),
          safeValue(item.verifiedOriginal, 0),
          safeValue(item.verifiedFake, 0),
          safeValue(item.unverified, 0),
          safeValue(item.local, 0),
          safeValue(item.imported, 0),
        ])
      : [["No product type data available", "", "", "", "", "", "", "", ""]]),
  ]);

  addSheet(
    XLSX,
    workbook,
    "Recommendations",
    [
      ["Recommendations"],
      [],
      ...(recommendations?.length
        ? recommendations.map((item, index) => [`${index + 1}. ${item}`])
        : [["No recommendations available"]]),
    ],
    [{ wch: 80 }]
  );

  saveWorkbook(XLSX, workbook, fileName);
};

export const exportProductTypePdf = async ({
  fileName,
  generatedAt,
  state,
  dateFrom,
  dateTo,
  summary,
  rows,
  recommendations,
}) => {
  const { jsPDF, autoTable } = await loadPdfLibraries();

  const { doc, startY } = createPdf(jsPDF, "Product Type Report", [
    `Generated: ${safeValue(generatedAt)}`,
    `State: ${safeValue(state, "All States")}`,
    `Date Range: ${safeValue(dateFrom)} to ${safeValue(dateTo)}`,
  ]);

  let y = startY;

  y = addPdfTable(
    autoTable,
    doc,
    ["Summary Metric", "Value"],
    [
      ["Total Product Types", safeValue(summary?.totalProductTypes, 0)],
      ["Total Samples", safeValue(summary?.totalSamples, 0)],
    ],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    [
      "Product Type",
      "Samples",
      "Registered",
      "Unregistered",
      "Verified Original",
      "Verified Fake",
      "Unverified",
      "Local",
      "Imported",
    ],
    rows?.length
      ? rows.map((item) => [
          safeValue(item.productType),
          safeValue(item.totalSamples, 0),
          safeValue(item.registered, 0),
          safeValue(item.unregistered, 0),
          safeValue(item.verifiedOriginal, 0),
          safeValue(item.verifiedFake, 0),
          safeValue(item.unverified, 0),
          safeValue(item.local, 0),
          safeValue(item.imported, 0),
        ])
      : [["No product type data available", "", "", "", "", "", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Recommendations"],
    recommendations?.length
      ? recommendations.map((item, index) => [`${index + 1}. ${item}`])
      : [["No recommendations available"]],
    y
  );

  doc.save(fileName);
};

/* ============================================================
   RISK ASSESSMENT
   ============================================================ */

export const exportRiskAssessmentExcel = async ({
  fileName,
  generatedAt,
  minLeadLevel,
  dateFrom,
  dateTo,
  summary,
  topRiskAreas,
  criticalSamples,
  unregisteredHighRisk,
  counterfeitsHighRisk,
  riskByProductType,
  actionItems,
}) => {
  const XLSX = await loadXLSX();
  const workbook = createWorkbook(XLSX);

  addSheet(
    XLSX,
    workbook,
    "Summary",
    [
      ["Risk Assessment Report"],
      [],
      ["Generated At", safeValue(generatedAt)],
      ["Min Lead Level", safeValue(minLeadLevel, "Not specified")],
      ["Date From", safeValue(dateFrom)],
      ["Date To", safeValue(dateTo)],
      [],
      ["Total High-Risk Samples", safeValue(summary?.totalHighRiskSamples, 0)],
      ["Critical Samples", safeValue(summary?.criticalSamplesCount, 0)],
      ["High-Risk Areas", safeValue(summary?.highRiskAreasCount, 0)],
      [
        "Unregistered High-Risk",
        safeValue(summary?.unregisteredHighRiskCount, 0),
      ],
      [
        "Counterfeits High-Risk",
        safeValue(summary?.counterfeitsHighRiskCount, 0),
      ],
    ],
    [{ wch: 28 }, { wch: 20 }]
  );

  addSheet(XLSX, workbook, "Top Risk Areas", [
    ["Area", "State", "Count", "Risk Level"],
    ...(topRiskAreas?.length
      ? topRiskAreas.map((item) => [
          safeValue(item.area || item.location || item.market || item.name),
          safeValue(item.state || item.stateName),
          safeValue(item.count ?? item.total, 0),
          safeValue(item.riskLevel || item.risk),
        ])
      : [["No top risk areas available", "", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "Critical Samples", [
    ["Sample", "State", "Lead Level", "Status"],
    ...(criticalSamples?.length
      ? criticalSamples.map((item) => [
          safeValue(item.sampleId || item.sampleCode || item.sampleName),
          safeValue(item.state || item.stateName),
          safeValue(item.leadLevel ?? item.reading),
          safeValue(item.status || item.riskLevel),
        ])
      : [["No critical samples available", "", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "Unregistered High Risk", [
    ["Product", "Sample", "State", "Lead Level"],
    ...(unregisteredHighRisk?.length
      ? unregisteredHighRisk.map((item) => [
          safeValue(item.productName || item.product || item.name),
          safeValue(item.sampleId || item.sampleCode),
          safeValue(item.state || item.stateName),
          safeValue(item.leadLevel ?? item.reading),
        ])
      : [["No unregistered high-risk products available", "", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "Counterfeits High Risk", [
    ["Product", "Sample", "State", "Lead Level"],
    ...(counterfeitsHighRisk?.length
      ? counterfeitsHighRisk.map((item) => [
          safeValue(item.productName || item.product || item.name),
          safeValue(item.sampleId || item.sampleCode),
          safeValue(item.state || item.stateName),
          safeValue(item.leadLevel ?? item.reading),
        ])
      : [["No counterfeit high-risk products available", "", "", ""]]),
  ]);

  addSheet(XLSX, workbook, "Risk By Product Type", [
    ["Product Type", "Count", "Risk Level"],
    ...(riskByProductType?.length
      ? riskByProductType.map((item) => [
          safeValue(item.productType || item.type || item.name),
          safeValue(item.count ?? item.total, 0),
          safeValue(item.riskLevel || item.risk),
        ])
      : [["No risk-by-product-type data available", "", ""]]),
  ]);

  addSheet(
    XLSX,
    workbook,
    "Action Items",
    [
      ["Action Items"],
      [],
      ...(actionItems?.length
        ? actionItems.map((item, index) => [
            `${index + 1}. ${
              typeof item === "string"
                ? item
                : item.action || item.title || "Action item"
            }`,
          ])
        : [["No action items available"]]),
    ],
    [{ wch: 90 }]
  );

  saveWorkbook(XLSX, workbook, fileName);
};

export const exportRiskAssessmentPdf = async ({
  fileName,
  generatedAt,
  minLeadLevel,
  dateFrom,
  dateTo,
  summary,
  topRiskAreas,
  criticalSamples,
  unregisteredHighRisk,
  counterfeitsHighRisk,
  riskByProductType,
  actionItems,
}) => {
  const { jsPDF, autoTable } = await loadPdfLibraries();

  const { doc, startY } = createPdf(jsPDF, "Risk Assessment Report", [
    `Generated: ${safeValue(generatedAt)}`,
    `Lead threshold: ${safeValue(minLeadLevel, "Not specified")} ppm`,
    `Date Range: ${safeValue(dateFrom)} to ${safeValue(dateTo)}`,
  ]);

  let y = startY;

  y = addPdfTable(
    autoTable,
    doc,
    ["Summary Metric", "Value"],
    [
      [
        "Total High-Risk Samples",
        safeValue(summary?.totalHighRiskSamples, 0),
      ],
      ["Critical Samples", safeValue(summary?.criticalSamplesCount, 0)],
      ["High-Risk Areas", safeValue(summary?.highRiskAreasCount, 0)],
      [
        "Unregistered High-Risk",
        safeValue(summary?.unregisteredHighRiskCount, 0),
      ],
      [
        "Counterfeits High-Risk",
        safeValue(summary?.counterfeitsHighRiskCount, 0),
      ],
    ],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Area", "State", "Count", "Risk Level"],
    topRiskAreas?.length
      ? topRiskAreas.map((item) => [
          safeValue(item.area || item.location || item.market || item.name),
          safeValue(item.state || item.stateName),
          safeValue(item.count ?? item.total, 0),
          safeValue(item.riskLevel || item.risk),
        ])
      : [["No top risk areas available", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Sample", "State", "Lead Level", "Status"],
    criticalSamples?.length
      ? criticalSamples.map((item) => [
          safeValue(item.sampleId || item.sampleCode || item.sampleName),
          safeValue(item.state || item.stateName),
          safeValue(item.leadLevel ?? item.reading),
          safeValue(item.status || item.riskLevel),
        ])
      : [["No critical samples available", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Product", "Sample", "State", "Lead Level"],
    unregisteredHighRisk?.length
      ? unregisteredHighRisk.map((item) => [
          safeValue(item.productName || item.product || item.name),
          safeValue(item.sampleId || item.sampleCode),
          safeValue(item.state || item.stateName),
          safeValue(item.leadLevel ?? item.reading),
        ])
      : [["No unregistered high-risk products available", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Product", "Sample", "State", "Lead Level"],
    counterfeitsHighRisk?.length
      ? counterfeitsHighRisk.map((item) => [
          safeValue(item.productName || item.product || item.name),
          safeValue(item.sampleId || item.sampleCode),
          safeValue(item.state || item.stateName),
          safeValue(item.leadLevel ?? item.reading),
        ])
      : [["No counterfeit high-risk products available", "", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Product Type", "Count", "Risk Level"],
    riskByProductType?.length
      ? riskByProductType.map((item) => [
          safeValue(item.productType || item.type || item.name),
          safeValue(item.count ?? item.total, 0),
          safeValue(item.riskLevel || item.risk),
        ])
      : [["No risk-by-product-type data available", "", ""]],
    y
  );

  y = addPdfTable(
    autoTable,
    doc,
    ["Action Items"],
    actionItems?.length
      ? actionItems.map((item, index) => [
          `${index + 1}. ${
            typeof item === "string"
              ? item
              : item.action || item.title || "Action item"
          }`,
        ])
      : [["No action items available"]],
    y
  );

  doc.save(fileName);
};