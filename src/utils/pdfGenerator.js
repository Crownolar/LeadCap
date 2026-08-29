/**
 * PDF Generator Utilities
 *
 * PDF libraries are loaded dynamically so they do not increase
 * the initial application bundle size.
 */

/**
 * Load jsPDF only when needed.
 */
const loadJsPDF = async () => {
  const { default: jsPDF } = await import("jspdf");
  return jsPDF;
};

/**
 * Load jsPDF + html2canvas only when HTML-to-PDF is needed.
 */
const loadPDFWithCanvas = async () => {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);

  return { jsPDF, html2canvas };
};

/**
 * Generate PDF from an HTML element.
 *
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Additional options
 */
export const generatePDFFromHTML = async (
  element,
  filename = "report.pdf",
  options = {},
) => {
  try {
    const { jsPDF, html2canvas } = await loadPDFWithCanvas();

    const {
      orientation = "portrait",
      format = "a4",
    } = options;

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 10;

    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(
      imgData,
      "PNG",
      margin,
      margin,
      imgWidth,
      imgHeight,
    );

    heightLeft -= pageHeight - 2 * margin;

    // Additional pages
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;

      pdf.addPage();

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        position + margin,
        imgWidth,
        imgHeight,
      );

      heightLeft -= pageHeight - 2 * margin;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

/**
 * Generate PDF with table data.
 *
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 *   [{ key: "name", label: "Name" }, ...]
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Additional options
 */
export const generateTablePDF = async (
  data,
  columns,
  filename = "report.pdf",
  options = {},
) => {
  try {
    const jsPDF = await loadJsPDF();

    const {
      title = "",
      subtitle = "",
      orientation = "landscape",
      format = "a4",
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const margin = 15;
    let yPosition = margin;

    // Title
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, margin, yPosition);
      yPosition += 10;
    }

    // Subtitle
    if (subtitle) {
      pdf.setFontSize(11);
      pdf.text(subtitle, margin, yPosition);
      yPosition += 8;
    }

    // Date
    pdf.setFontSize(10);
    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      margin,
      yPosition,
    );

    yPosition += 8;

    // Calculate column widths
    const tableWidth = pageWidth - 2 * margin;
    const columnWidth = tableWidth / columns.length;

    // Table header
    pdf.setFontSize(10);
    pdf.setFillColor(41, 128, 185);
    pdf.setTextColor(255, 255, 255);

    columns.forEach((col, index) => {
      pdf.rect(
        margin + index * columnWidth,
        yPosition,
        columnWidth,
        7,
        "F",
      );

      pdf.text(
        String(col.label ?? ""),
        margin + index * columnWidth + 2,
        yPosition + 5,
      );
    });

    yPosition += 8;

    // Table body
    pdf.setTextColor(0, 0, 0);

    data.forEach((row) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      columns.forEach((col, index) => {
        const value = row?.[col.key];
        const cellText = String(value ?? "");

        pdf.text(
          cellText,
          margin + index * columnWidth + 2,
          yPosition + 5,
        );
      });

      yPosition += 7;
    });

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating table PDF:", error);
    throw error;
  }
};

/**
 * Generate PDF with chart image.
 *
 * @param {string} chartImageUrl - URL or base64 chart image
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Additional options
 */
export const generateChartPDF = async (
  chartImageUrl,
  filename = "report.pdf",
  options = {},
) => {
  try {
    const jsPDF = await loadJsPDF();

    const {
      title = "",
      subtitle = "",
      orientation = "portrait",
      format = "a4",
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: "mm",
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;

    let yPosition = margin;

    // Title
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, margin, yPosition);
      yPosition += 10;
    }

    // Subtitle
    if (subtitle) {
      pdf.setFontSize(11);
      pdf.text(subtitle, margin, yPosition);
      yPosition += 8;
    }

    // Date
    pdf.setFontSize(10);

    pdf.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      margin,
      yPosition,
    );

    yPosition += 10;

    // Chart
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = imgWidth * 0.6;

    pdf.addImage(
      chartImageUrl,
      "PNG",
      margin,
      yPosition,
      imgWidth,
      imgHeight,
    );

    pdf.save(filename);
  } catch (error) {
    console.error("Error generating chart PDF:", error);
    throw error;
  }
};

/**
 * Export data to CSV.
 *
 * This function requires no external library.
 *
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Column definitions
 * @param {string} filename - The filename for the CSV
 */
export const generateCSV = (
  data,
  columns,
  filename = "report.csv",
) => {
  try {
    // Escape CSV values properly
    const escapeCSV = (value) => {
      const stringValue = String(value ?? "");

      return `"${stringValue.replace(/"/g, '""')}"`;
    };

    // Header
    const header = columns
      .map((col) => escapeCSV(col.label))
      .join(",");

    // Rows
    const rows = data.map((row) =>
      columns
        .map((col) => escapeCSV(row?.[col.key]))
        .join(","),
    );

    const csv = [header, ...rows].join("\n");

    // Create download
    const blob = new Blob(
      [csv],
      { type: "text/csv;charset=utf-8;" },
    );

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.href = url;
    link.download = filename;
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Release object URL
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating CSV:", error);
    throw error;
  }
};