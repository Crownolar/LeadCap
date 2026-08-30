import SummaryCards from "../reports/SummaryCards";
import ReportTableSection from "../reports/ReportTableSection";
import ReportListSection from "../reports/ReportListSection";
import { TD } from "../../../../utils/MohUI";
import { RateBadge } from "../../../../components/RateBadge";

const SavedReportPreview = ({ report }) => {
  if (!report) return null;

  if (report.reportType === "STATE_SUMMARY") {
    const summary = report.summary || {};
    const contaminationBreakdown = summary.contaminationBreakdown || {};
    const verificationBreakdown = summary.verificationBreakdown || {};
    const registrationStatus = report.registrationStatus || {};
    const vendorType = report.vendorType || {};
    const recommendations = report.recommendations || [];

    const summaryCards = [
      {
        label: "Total samples",
        value: summary.totalSamples ?? 0,
        color: "text-gray-900",
      },
      {
        label: "Contaminated",
        value: contaminationBreakdown.CONTAMINATED ?? 0,
        color: "text-red-600",
        subtext: `${summary.percentageContaminated ?? "0.00"}%`,
      },
      {
        label: "Pending",
        value: contaminationBreakdown.PENDING ?? 0,
        color: "text-amber-600",
      },
      {
        label: "Registered",
        value: registrationStatus.registered ?? 0,
        color: "text-green-700",
      },
      {
        label: "Unregistered",
        value: registrationStatus.unregistered ?? 0,
        color: "text-gray-900",
      },
      {
        label: "Informal vendors",
        value: vendorType.informal ?? 0,
        color: "text-gray-900",
      },
    ];

    const topLgas = Object.entries(report.byLGA || {})
      .map(([lgaName, stats]) => {
        const total = stats?.total ?? 0;
        const contaminated = stats?.contaminated ?? 0;
        const rate =
          total > 0 ? `${((contaminated / total) * 100).toFixed(1)}%` : "0%";

        return {
          lgaName,
          total,
          contaminated,
          rate,
        };
      })
      .sort((a, b) => b.total - a.total);

    const verificationRows = [
      {
        label: "Verified original",
        value: verificationBreakdown.VERIFIED_ORIGINAL ?? 0,
        color: "text-green-700",
      },
      {
        label: "Verified fake",
        value: verificationBreakdown.VERIFIED_FAKE ?? 0,
        color: "text-red-600",
      },
      {
        label: "Unverified",
        value: verificationBreakdown.UNVERIFIED ?? 0,
        color: "text-amber-600",
      },
      {
        label: "Verification pending",
        value: verificationBreakdown.VERIFICATION_PENDING ?? 0,
        color: "text-gray-900",
      },
    ];

    return (
      <div className="space-y-4">
        <SummaryCards items={summaryCards} />

        <ReportListSection
          title="Verification breakdown"
          items={verificationRows}
          renderItem={(item) => (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{item.label}</span>
              <span className={`font-medium ${item.color}`}>{item.value}</span>
            </div>
          )}
        />

        <ReportTableSection
          title="LGA breakdown"
          headers={["LGA", "Samples", "Contaminated", "Rate"]}
          rows={topLgas}
          emptyMessage="No LGA data available."
          renderRow={(row) => (
            <tr key={row.lgaName} className="hover:bg-gray-50">
              <td className={TD}>{row.lgaName}</td>
              <td className={TD}>{row.total}</td>
              <td className={TD}>{row.contaminated}</td>
              <td className={TD}>
                <RateBadge rate={row.rate} />
              </td>
            </tr>
          )}
        />

        <ReportListSection
          title="Recommendations"
          items={recommendations}
          emptyMessage="No recommendations available."
          renderItem={(item, index) => (
            <div className="text-sm text-gray-600">
              {index + 1}. {item}
            </div>
          )}
        />
      </div>
    );
  }

  if (report.reportType === "CONTAMINATION_ANALYSIS") {
    const summary = report.summary || {};
    const distribution = report.distribution || {};
    const byState = report.byState || {};
    const byProductType = report.byProductType || {};
    const topContaminated = report.topContaminated || [];

    const summaryCards = [
      {
        label: "Total samples",
        value: summary.totalSamples ?? 0,
        color: "text-gray-900",
      },
      {
        label: "Total readings",
        value: summary.totalReadings ?? 0,
        color: "text-gray-900",
      },
      {
        label: "Overall contamination rate",
        value: summary.overallContaminationRate ?? "0%",
        color: "text-red-600",
      },
      {
        label: "Safe",
        value: distribution.safe ?? 0,
        color: "text-green-700",
      },
      {
        label: "Moderate",
        value: distribution.moderate ?? 0,
        color: "text-amber-600",
      },
      {
        label: "Contaminated",
        value: distribution.contaminated ?? 0,
        color: "text-red-600",
      },
    ];

    const stateRows = Object.entries(byState)
      .map(([stateName, stats]) => ({
        stateName,
        count: stats?.count || 0,
        safe: stats?.statuses?.SAFE || 0,
        moderate: stats?.statuses?.MODERATE || 0,
        contaminated: stats?.statuses?.CONTAMINATED || 0,
        pending: stats?.statuses?.PENDING || 0,
        contaminationRate: stats?.contaminationRate || "0%",
      }))
      .sort((a, b) => b.count - a.count);

    const productRows = Object.entries(byProductType)
      .map(([productType, stats]) => ({
        productType,
        count: stats?.count || 0,
        safe: stats?.statuses?.SAFE || 0,
        moderate: stats?.statuses?.MODERATE || 0,
        contaminated: stats?.statuses?.CONTAMINATED || 0,
        pending: stats?.statuses?.PENDING || 0,
        contaminationRate: stats?.contaminationRate || "0%",
      }))
      .sort((a, b) => b.count - a.count);

    return (
      <div className="space-y-4">
        <SummaryCards items={summaryCards} />

        <ReportTableSection
          title="Breakdown by state"
          headers={["State", "Samples", "Safe", "Moderate", "Contaminated", "Pending", "Rate"]}
          rows={stateRows}
          emptyMessage="No state breakdown available."
          renderRow={(row) => (
            <tr key={row.stateName} className="hover:bg-gray-50">
              <td className={TD}>{row.stateName}</td>
              <td className={TD}>{row.count}</td>
              <td className={TD}>{row.safe}</td>
              <td className={TD}>{row.moderate}</td>
              <td className={TD}>{row.contaminated}</td>
              <td className={TD}>{row.pending}</td>
              <td className={TD}>
                <RateBadge rate={row.contaminationRate} />
              </td>
            </tr>
          )}
        />

        <ReportTableSection
          title="Breakdown by product type"
          headers={["Product Type", "Samples", "Safe", "Moderate", "Contaminated", "Pending", "Rate"]}
          rows={productRows}
          emptyMessage="No product type breakdown available."
          renderRow={(row) => (
            <tr key={row.productType} className="hover:bg-gray-50">
              <td className={TD}>{row.productType}</td>
              <td className={TD}>{row.count}</td>
              <td className={TD}>{row.safe}</td>
              <td className={TD}>{row.moderate}</td>
              <td className={TD}>{row.contaminated}</td>
              <td className={TD}>{row.pending}</td>
              <td className={TD}>
                <RateBadge rate={row.contaminationRate} />
              </td>
            </tr>
          )}
        />

        <ReportTableSection
          title="Top contaminated samples"
          headers={["Sample", "State", "Heavy Metal", "Reading", "Status"]}
          rows={topContaminated}
          emptyMessage="No top contaminated samples available."
          renderRow={(item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={TD}>
                {item.sampleId || item.sampleCode || item.sampleName || "-"}
              </td>
              <td className={TD}>{item.state || "-"}</td>
              <td className={TD}>{item.heavyMetal || "-"}</td>
              <td className={TD}>{item.reading ?? "-"}</td>
              <td className={TD}>{item.status || "-"}</td>
            </tr>
          )}
        />
      </div>
    );
  }

  if (report.reportType === "PRODUCT_TYPE_ANALYSIS") {
    const summary = report.summary || {};
    const recommendations = report.recommendations || [];
    const byProductType = report.byProductType || {};

    const summaryCards = [
      {
        label: "Total product types",
        value: summary.totalProductTypes ?? 0,
        color: "text-gray-900",
      },
      {
        label: "Total samples",
        value: summary.totalSamples ?? 0,
        color: "text-gray-900",
      },
    ];

    const rows = Object.entries(byProductType)
      .map(([productType, stats]) => ({
        productType,
        totalSamples: stats?.totalSamples || 0,
        registered: stats?.registered || 0,
        unregistered: stats?.unregistered || 0,
        verifiedOriginal: stats?.verifications?.VERIFIED_ORIGINAL || 0,
        verifiedFake: stats?.verifications?.VERIFIED_FAKE || 0,
        unverified: stats?.verifications?.UNVERIFIED || 0,
        local: stats?.origins?.LOCAL || 0,
        imported: stats?.origins?.IMPORTED || 0,
      }))
      .sort((a, b) => b.totalSamples - a.totalSamples);

    return (
      <div className="space-y-4">
        <SummaryCards items={summaryCards} columns="grid-cols-2" />

        <ReportTableSection
          title="Breakdown by product type"
          headers={[
            "Product Type",
            "Samples",
            "Registered",
            "Unregistered",
            "Verified Original",
            "Verified Fake",
            "Unverified",
            "Local",
            "Imported",
          ]}
          rows={rows}
          emptyMessage="No product type data available."
          renderRow={(row) => (
            <tr key={row.productType} className="hover:bg-gray-50">
              <td className={TD}>{row.productType}</td>
              <td className={TD}>{row.totalSamples}</td>
              <td className={TD}>{row.registered}</td>
              <td className={TD}>{row.unregistered}</td>
              <td className={TD}>{row.verifiedOriginal}</td>
              <td className={TD}>{row.verifiedFake}</td>
              <td className={TD}>{row.unverified}</td>
              <td className={TD}>{row.local}</td>
              <td className={TD}>{row.imported}</td>
            </tr>
          )}
        />

        <ReportListSection
          title="Recommendations"
          items={recommendations}
          emptyMessage="No recommendations available."
          renderItem={(item, index) => (
            <div className="text-sm text-gray-600">
              {index + 1}. {item}
            </div>
          )}
        />
      </div>
    );
  }

  if (report.reportType === "RISK_ASSESSMENT") {
    const summary = report.summary || {};
    const topRiskAreas = report.topRiskAreas || [];
    const criticalSamples = report.criticalSamples || [];
    const unregisteredHighRisk = report.unregisteredHighRisk || [];
    const counterfeitsHighRisk = report.counterfeitsHighRisk || [];
    const riskByProductType = report.riskByProductType || [];
    const actionItems = report.actionItems || [];

    const summaryCards = [
      {
        label: "High-risk samples",
        value: summary.totalHighRiskSamples ?? 0,
        color: "text-red-600",
      },
      {
        label: "Critical samples",
        value: summary.criticalSamplesCount ?? 0,
        color: "text-red-600",
      },
      {
        label: "High-risk areas",
        value: summary.highRiskAreasCount ?? 0,
        color: "text-amber-600",
      },
      {
        label: "Unregistered high-risk",
        value: summary.unregisteredHighRiskCount ?? 0,
        color: "text-gray-900",
      },
      {
        label: "Counterfeits high-risk",
        value: summary.counterfeitsHighRiskCount ?? 0,
        color: "text-gray-900",
      },
    ];

    return (
      <div className="space-y-4">
        <SummaryCards items={summaryCards} columns="grid-cols-2 xl:grid-cols-5" />

        <ReportTableSection
          title="Top risk areas"
          headers={["Area", "State", "Count", "Risk Level"]}
          rows={topRiskAreas}
          emptyMessage="No top risk areas available."
          renderRow={(item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={TD}>
                {item.area || item.location || item.market || item.name || "-"}
              </td>
              <td className={TD}>{item.state || item.stateName || "-"}</td>
              <td className={TD}>{item.count ?? item.total ?? 0}</td>
              <td className={TD}>{item.riskLevel || item.risk || "-"}</td>
            </tr>
          )}
        />

        <ReportTableSection
          title="Critical samples"
          headers={["Sample", "State", "Lead Level", "Status"]}
          rows={criticalSamples}
          emptyMessage="No critical samples available."
          renderRow={(item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={TD}>
                {item.sampleId || item.sampleCode || item.sampleName || "-"}
              </td>
              <td className={TD}>{item.state || item.stateName || "-"}</td>
              <td className={TD}>{item.leadLevel ?? item.reading ?? "-"}</td>
              <td className={TD}>{item.status || item.riskLevel || "-"}</td>
            </tr>
          )}
        />

        <ReportTableSection
          title="Risk by product type"
          headers={["Product Type", "Count", "Risk Level"]}
          rows={riskByProductType}
          emptyMessage="No risk-by-product-type data available."
          renderRow={(item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={TD}>
                {item.productType || item.type || item.name || "-"}
              </td>
              <td className={TD}>{item.count ?? item.total ?? 0}</td>
              <td className={TD}>{item.riskLevel || item.risk || "-"}</td>
            </tr>
          )}
        />

        <ReportListSection
          title="Action items"
          items={actionItems}
          emptyMessage="No action items available."
          renderItem={(item, index) => (
            <div className="text-sm text-gray-600">
              {index + 1}.{" "}
              {typeof item === "string"
                ? item
                : item.action || item.title || "Action item"}
            </div>
          )}
        />

        <ReportTableSection
          title="Unregistered high-risk products"
          headers={["Product", "Sample", "State", "Lead Level"]}
          rows={unregisteredHighRisk}
          emptyMessage="No unregistered high-risk products available."
          renderRow={(item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={TD}>
                {item.productName || item.product || item.name || "-"}
              </td>
              <td className={TD}>{item.sampleId || item.sampleCode || "-"}</td>
              <td className={TD}>{item.state || item.stateName || "-"}</td>
              <td className={TD}>{item.leadLevel ?? item.reading ?? "-"}</td>
            </tr>
          )}
        />

        <ReportTableSection
          title="Counterfeit high-risk products"
          headers={["Product", "Sample", "State", "Lead Level"]}
          rows={counterfeitsHighRisk}
          emptyMessage="No counterfeit high-risk products available."
          renderRow={(item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className={TD}>
                {item.productName || item.product || item.name || "-"}
              </td>
              <td className={TD}>{item.sampleId || item.sampleCode || "-"}</td>
              <td className={TD}>{item.state || item.stateName || "-"}</td>
              <td className={TD}>{item.leadLevel ?? item.reading ?? "-"}</td>
            </tr>
          )}
        />
      </div>
    );
  }

  return (
    <pre className="overflow-auto rounded-xl bg-gray-50 p-4 text-xs text-gray-700">
      {JSON.stringify(report, null, 2)}
    </pre>
  );
};

export default SavedReportPreview;