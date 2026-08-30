import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MeetingMinutes } from '../types';

export function exportMeetingMinutesToPdf(minutes: MeetingMinutes): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 40;

  // Header Banner
  doc.setFillColor(79, 70, 229); // Indigo 600
  doc.rect(margin, currentY, contentWidth, 54, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(minutes.title || 'Meeting Minutes', margin + 16, currentY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(224, 231, 255); // Indigo 100
  doc.text(`Date: ${minutes.date || new Date().toLocaleDateString()}`, margin + 16, currentY + 42);

  if (minutes.attendees) {
    const attendeesText = `Attendees: ${minutes.attendees}`;
    const truncatedAttendees = attendeesText.length > 55 ? attendeesText.substring(0, 52) + '...' : attendeesText;
    doc.text(truncatedAttendees, pageWidth - margin - 16, currentY + 42, { align: 'right' });
  }

  currentY += 70;

  // Section 1: Executive Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59); // Slate 800
  doc.text('1. Executive Summary', margin, currentY);
  currentY += 6;

  // Underline divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.line(margin, currentY, margin + contentWidth, currentY);
  currentY += 14;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // Slate 700
  const summaryLines = doc.splitTextToSize(minutes.executiveSummary || 'No summary available.', contentWidth - 10);
  doc.text(summaryLines, margin + 4, currentY);
  currentY += summaryLines.length * 13 + 14;

  // Section 2: Key Decisions
  if (minutes.keyDecisions && minutes.keyDecisions.length > 0) {
    if (currentY > 700) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('2. Key Decisions & Agreements', margin, currentY);
    currentY += 6;
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    minutes.keyDecisions.forEach((decision) => {
      const decisionLines = doc.splitTextToSize(`•  ${decision}`, contentWidth - 16);
      if (currentY + decisionLines.length * 13 > 770) {
        doc.addPage();
        currentY = 40;
      }
      doc.text(decisionLines, margin + 4, currentY);
      currentY += decisionLines.length * 13 + 4;
    });
    currentY += 10;
  }

  // Section 3: Action Items Table
  if (minutes.actionItems && minutes.actionItems.length > 0) {
    if (currentY > 650) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('3. Action Items & Deliverables', margin, currentY);
    currentY += 6;
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 10;

    const tableRows = minutes.actionItems.map((item) => [
      item.task,
      item.owner,
      item.dueDate,
      item.priority,
      item.status,
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Task Description', 'Owner', 'Due Date', 'Priority', 'Status']],
      body: tableRows,
      theme: 'grid',
      headStyles: {
        fillColor: [79, 70, 229],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8,
        textColor: [51, 65, 85],
        cellPadding: 5,
        valign: 'middle',
      },
      columnStyles: {
        0: { cellWidth: 200 },
        1: { cellWidth: 80 },
        2: { cellWidth: 70 },
        3: { cellWidth: 65 },
        4: { cellWidth: 80 },
      },
      margin: { left: margin, right: margin },
    });

    currentY = (doc as any).lastAutoTable.finalY + 18;
  }

  // Section 4: Discussion Topics
  if (minutes.discussionTopics && minutes.discussionTopics.length > 0) {
    if (currentY > 680) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('4. Detailed Discussion Topics', margin, currentY);
    currentY += 6;
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 14;

    minutes.discussionTopics.forEach((topic) => {
      if (currentY > 720) {
        doc.addPage();
        currentY = 40;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(67, 56, 202); // Indigo 700
      doc.text(topic.topic, margin + 4, currentY);
      currentY += 12;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const topicLines = doc.splitTextToSize(topic.summary, contentWidth - 10);
      doc.text(topicLines, margin + 4, currentY);
      currentY += topicLines.length * 12 + 10;
    });
  }

  // Section 5: Next Steps
  if (minutes.nextSteps && minutes.nextSteps.length > 0) {
    if (currentY > 700) {
      doc.addPage();
      currentY = 40;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('5. Next Steps', margin, currentY);
    currentY += 6;
    doc.line(margin, currentY, margin + contentWidth, currentY);
    currentY += 14;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(51, 65, 85);

    minutes.nextSteps.forEach((step) => {
      const stepLines = doc.splitTextToSize(`•  ${step}`, contentWidth - 16);
      if (currentY + stepLines.length * 13 > 770) {
        doc.addPage();
        currentY = 40;
      }
      doc.text(stepLines, margin + 4, currentY);
      currentY += stepLines.length * 13 + 4;
    });
  }

  // Footer on all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(
      `Generated by AI Minutes Pro  |  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );
  }

  const safeFilename = `${(minutes.title || 'Meeting').replace(/[^a-zA-Z0-9_-]/g, '_')}_Minutes.pdf`;
  doc.save(safeFilename);
}
