
import { GradeLevel, WorksheetData, DiscoveryQuestion, WordImageMatchExercise, ComprehensionQuestion } from '../types';

export interface PrintOptions {
  useNikud: boolean;
  gradeLevel: GradeLevel;
  isDocExport?: boolean;
  audioBase64?: string; // הוספת אפשרות לאודיו מוטמע
}

const getGradeLabel = (level: GradeLevel) => {
  switch (level) {
    case GradeLevel.ELEM_1_2: return 'א-ב';
    case GradeLevel.ELEM_3_4: return 'ג-ד';
    case GradeLevel.ELEM_5_6: return 'ה-ו';
    case GradeLevel.MIDDLE: return 'חט"ב';
    default: return '';
  }
};

const getSenseLabel = (sense: string) => {
  switch (sense) {
    case 'sight': return 'ראייה';
    case 'hearing': return 'שמיעה';
    case 'smell': return 'ריח';
    case 'touch': return 'מגע';
    case 'taste': return 'טעם';
    case 'feeling': return 'רגש';
    default: return 'כללי';
  }
};

const getDimensionLabel = (dimension: string) => {
  switch (dimension) {
    case 'literal': return 'איתור מידע (גלוי)';
    case 'inferential': return 'פרשנות והסקה (סמוי)';
    case 'global': return 'הבנה גלובלית';
    case 'evaluative': return 'הערכה וביקורת';
    default: return 'הבנה';
  }
};

/**
 * Helper to wrap raw PCM data into a WAV container for browser compatibility
 */
export const createWavBlob = (base64Pcm: string, sampleRate = 24000): string => {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + len, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, len, true);

  const combined = new Uint8Array(wavHeader.byteLength + bytes.byteLength);
  combined.set(new Uint8Array(wavHeader), 0);
  combined.set(bytes, wavHeader.byteLength);
  
  let binary = '';
  for (let i = 0; i < combined.byteLength; i++) binary += String.fromCharCode(combined[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
};

export const generateWorksheetHTML = (data: Partial<WorksheetData> & { originalText: string }, options: PrintOptions): string => {
  const { useNikud, gradeLevel, isDocExport, audioBase64 } = options;
  const isElementary = gradeLevel === GradeLevel.ELEM_1_2 || gradeLevel === GradeLevel.ELEM_3_4;
  
  const audioTag = audioBase64 ? `
    <div class="audio-player no-print">
      <div style="font-weight: bold; margin-bottom: 8px; color: #1e3a8a; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 1.2em;">🔊</span> נרטיב קולי של הטקסט (הקשיבו ודמיינו)
      </div>
      <audio controls style="width: 100%; border-radius: 8px;">
        <source src="${audioBase64}" type="audio/wav">
        הדפדפן שלך לא תומך בנגן האודיו.
      </audio>
    </div>
  ` : '';

  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@400;700;900&display=swap');
    
    @page { margin: 1cm; size: A4; }
    body { font-family: 'Heebo', sans-serif; direction: rtl; color: #000; padding: ${isDocExport ? '0' : '15px'}; max-width: 800px; margin: 0 auto; background: white; line-height: 1.3; font-size: 10pt; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px; }
    h1 { font-size: 20pt; margin: 0 0 5px 0; color: #1e3a8a; }
    .student-info { font-weight: bold; font-size: 9pt; color: #444; display: flex; justify-content: space-between; margin-top: 5px; }
    .section { margin-bottom: 15px; page-break-inside: avoid; }
    .section-title { font-size: 13pt; font-weight: 900; background: #f1f5f9; padding: 4px 12px; border-right: 5px solid #3b82f6; margin-bottom: 8px; }
    .text-box { border: 1px solid #cbd5e1; padding: 12px; border-radius: 10px; font-size: ${isElementary ? '14pt' : '12pt'}; line-height: 1.5; font-style: italic; background: #fdfdfd; margin-bottom: 12px; }
    .audio-player { background: #eff6ff; border: 2px solid #bfdbfe; padding: 15px; border-radius: 15px; margin-bottom: 20px; }
    .print-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-bottom: 10px; }
    .print-table td { border: 1px solid #e2e8f0; padding: 8px; vertical-align: top; background: #fff; }
    .question-header { font-weight: bold; font-size: 10pt; margin-bottom: 5px; color: #1e293b; display: block; }
    .dimension-badge { font-size: 7.5pt; background: #e0e7ff; color: #3730a3; padding: 1px 6px; border-radius: 4px; margin-bottom: 3px; display: inline-block; font-weight: 900; }
    .option { margin: 3px 0; display: flex; align-items: center; font-size: 9pt; }
    .checkbox { width: 12px; height: 12px; border: 1.2px solid #000; margin-left: 6px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .open-answer-box { border-bottom: 1px solid #000; height: 40px; margin-top: 5px; width: 95%; }
    .drawing-area { border: 2px dashed #94a3b8; height: 180px; border-radius: 12px; margin-top: 8px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-weight: bold; font-size: 12pt; background: #f8fafc; }
    .illustration-box { width: 110px; height: 110px; margin: 0 auto 5px auto; border: 1px solid #f1f5f9; border-radius: 6px; overflow: hidden; background: #f8fafc; display: flex; align-items: center; justify-content: center; }
    .illustration-box img { width: 100%; height: 100%; object-fit: cover; }
    .answer-line { border-bottom: 1px solid #000; height: 20px; margin: 3px auto 0 auto; width: 85%; }
    .footer-note { text-align: center; font-size: 7.5pt; color: #94a3b8; margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 5px; }
    @media print { .no-print { display: none !important; } }
  `;

  const buildQuestionTable = (questions: any[], isComprehension = false) => {
    let rowsHtml = '';
    let pendingCell: string | null = null;
    questions.forEach((q) => {
      const isFullWidth = q.type === 'open' || (q.options && q.options.length > 4);
      const dimensionTag = isComprehension ? `<div class="dimension-badge">${getDimensionLabel(q.dimension)}</div>` : '';
      const sensePrefix = !isComprehension ? `<strong>[חוש ה${getSenseLabel(q.sense)}]</strong> ` : '';
      const cellContent = `${dimensionTag}<span class="question-header">${sensePrefix}${q.question}</span>${renderOptions(q)}`;
      if (isFullWidth) {
        if (pendingCell) { rowsHtml += `<tr><td>${pendingCell}</td><td></td></tr>`; pendingCell = null; }
        rowsHtml += `<tr><td colspan="2">${cellContent}</td></tr>`;
      } else {
        if (pendingCell) { rowsHtml += `<tr><td>${pendingCell}</td><td>${cellContent}</td></tr>`; pendingCell = null; }
        else { pendingCell = cellContent; }
      }
    });
    if (pendingCell) rowsHtml += `<tr><td>${pendingCell}</td><td></td></tr>`;
    return `<table class="print-table">${rowsHtml}</table>`;
  };

  const renderOptions = (q: any) => {
    if (q.type === 'blank' || q.type === 'open') return '<div class="open-answer-box"></div>';
    if (q.type === 'boolean') return `<div class="option"><span class="checkbox"></span> נכון</div><div class="option"><span class="checkbox"></span> לא נכון</div>`;
    return (q.options || []).slice(0, 4).map((opt: string) => `<div class="option"><span class="checkbox"></span> ${opt}</div>`).join('');
  };

  let wordImageTable = '';
  if (data.wordImageMatches?.length) {
    const matches = data.wordImageMatches.slice(0, 9);
    for (let i = 0; i < matches.length; i += 3) {
      wordImageTable += '<tr>';
      for (let j = 0; j < 3; j++) {
        const item = matches[i + j];
        wordImageTable += `<td>${item ? `<div class="illustration-box"><img src="${item.url}" /></div><div class="answer-line"></div>` : ''}</td>`;
      }
      wordImageTable += '</tr>';
    }
  }

  return `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head><meta charset="UTF-8"><title>${data.title || 'הסרט שבראש'}</title><style>${styles}</style></head>
    <body>
      <div class="header"><h1>${data.title || 'הסרט שבראש'}</h1><div class="student-info"><span>שם: _________</span><span>תאריך: _________</span><span>כיתה: ${getGradeLabel(gradeLevel)}</span></div></div>
      ${audioTag}
      <div class="section"><div class="section-title">1. קראו ודמיינו</div><div class="text-box">${data.originalText}</div></div>
      ${data.sensoryQuestions?.length ? `<div class="section"><div class="section-title">2. בלשי החושים</div>${buildQuestionTable(data.sensoryQuestions)}</div>` : ''}
      ${wordImageTable ? `<div class="section"><div class="section-title">3. חברו מילים לאיור</div><table class="print-table" style="text-align: center;">${wordImageTable}</table></div>` : ''}
      ${data.comprehensionQuestions?.length ? `<div class="section"><div class="section-title">4. ממדי הבנה</div>${buildQuestionTable(data.comprehensionQuestions, true)}</div>` : ''}
      <div class="section"><div class="section-title">5. המפיקים של הסרט</div><p class="task-desc">${data.drawPrompt || 'ציירו את הסרט שראיתם בראשכם.'}</p><div class="drawing-area">מקום לציור שלכם</div></div>
      <div class="footer-note">נוצר באמצעות "הסרט שבראש" - אסטרטגיות הדמיה מנטלית</div>
    </body></html>`;
};

export const exportCombinedHTML = (data: WorksheetData, options: PrintOptions) => {
  const html = generateWorksheetHTML(data, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `דף_עבודה_${data.title.replace(/\s+/g, '_')}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

export const downloadWorksheetAsDoc = (data: any, options: PrintOptions) => {
  const htmlContent = generateWorksheetHTML(data, { ...options, isDocExport: true });
  const docContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif;">${htmlContent}</body></html>`;
  const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `דף_עבודה_${(data.title || 'הסרט_שבראש').replace(/\s+/g, '_')}.doc`;
  link.click();
  URL.revokeObjectURL(url);
};

export const printWorksheet = (data: any, options: PrintOptions) => {
  const htmlContent = generateWorksheetHTML(data, options);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 1000);
  }
};
