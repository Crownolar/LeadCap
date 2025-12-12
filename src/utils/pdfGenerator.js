import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate PDF from HTML element
 * @param {HTMLElement} element - The HTML element to convert to PDF
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Additional options
 */
export const generatePDFFromHTML = async (element, filename = 'report.pdf', options = {}) => {
  try {
    const {
      orientation = 'portrait',
      format = 'a4',
      quality = 'high',
    } = options;

    // Create canvas from HTML element
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - 2 * margin;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add image to PDF with pagination support
    pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
    heightLeft -= pageHeight - 2 * margin;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margin, position + margin, imgWidth, imgHeight);
      heightLeft -= pageHeight - 2 * margin;
    }

    // Download PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF with table data
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column definitions [{key: 'name', label: 'Name'}, ...]
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Additional options including title, subtitle
 */
export const generateTablePDF = async (data, columns, filename = 'report.pdf', options = {}) => {
  try {
    const {
      title = '',
      subtitle = '',
      orientation = 'landscape',
      format = 'a4',
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    let yPosition = margin;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, margin, yPosition);
      yPosition += 10;
    }

    // Add subtitle if provided
    if (subtitle) {
      pdf.setFontSize(11);
      pdf.text(subtitle, margin, yPosition);
      yPosition += 8;
    }

    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 8;

    // Calculate column widths
    const tableWidth = pageWidth - 2 * margin;
    const columnWidth = tableWidth / columns.length;

    // Draw table header
    pdf.setFontSize(10);
    pdf.setFillColor(41, 128, 185); // Blue header
    pdf.setTextColor(255, 255, 255); // White text

    columns.forEach((col, index) => {
      pdf.rect(margin + index * columnWidth, yPosition, columnWidth, 7, 'F');
      pdf.text(col.label, margin + index * columnWidth + 2, yPosition + 5);
    });

    yPosition += 8;
    pdf.setTextColor(0, 0, 0); // Black text for content

    // Draw table rows
    data.forEach((row) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      columns.forEach((col, index) => {
        const cellText = String(row[col.key] || '');
        pdf.text(cellText, margin + index * columnWidth + 2, yPosition + 5);
      });

      yPosition += 7;
    });

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating table PDF:', error);
    throw error;
  }
};

/**
 * Generate PDF with chart image
 * @param {string} chartImageUrl - URL or base64 of chart image
 * @param {string} filename - The filename for the PDF
 * @param {object} options - Additional options including title, data
 */
export const generateChartPDF = async (chartImageUrl, filename = 'report.pdf', options = {}) => {
  try {
    const {
      title = '',
      subtitle = '',
      orientation = 'portrait',
      format = 'a4',
    } = options;

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Add title if provided
    if (title) {
      pdf.setFontSize(16);
      pdf.text(title, margin, yPosition);
      yPosition += 10;
    }

    // Add subtitle if provided
    if (subtitle) {
      pdf.setFontSize(11);
      pdf.text(subtitle, margin, yPosition);
      yPosition += 8;
    }

    // Add date
    pdf.setFontSize(10);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
    yPosition += 10;

    // Add chart image
    const imgWidth = pageWidth - 2 * margin;
    pdf.addImage(chartImageUrl, 'PNG', margin, yPosition, imgWidth, imgWidth * 0.6);

    pdf.save(filename);
  } catch (error) {
    console.error('Error generating chart PDF:', error);
    throw error;
  }
};

/**
 * Export data to CSV
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column definitions
 * @param {string} filename - The filename for the CSV
 */
export const generateCSV = (data, columns, filename = 'report.csv') => {
  try {
    // Create CSV header
    const header = columns.map(col => `"${col.label}"`).join(',');

    // Create CSV rows
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key] || '';
        return `"${value}"`;
      }).join(',')
    );

    // Combine header and rows
    const csv = [header, ...rows].join('\n');

    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error generating CSV:', error);
    throw error;
  }
};
