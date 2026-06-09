/**
 * Legal24 — PDF generator (stamp-paper edition)
 * pdfkit server-side · A4 · proper stamp paper layout
 */
import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';

// ── Page geometry (points: 72pt = 1 inch) ─────────────────────────────────────
const PAGE_W   = 595.28;
const PAGE_H   = 841.89;
const ML       = 85;          // left margin  (~1.2")
const MR       = 85;          // right margin
const MT       = 65;          // top margin
const MB       = 80;          // bottom margin
const TW       = PAGE_W - ML - MR;  // text width

// Colours
const BLACK  = '#111111';
const INDIGO = '#4338CA';
const GREY   = '#666666';
const LGREY  = '#AAAAAA';

// Fonts (built-in pdfkit — no file I/O needed)
const SERIF      = 'Times-Roman';
const SERIF_BOLD = 'Times-Bold';
const SANS       = 'Helvetica';
const SANS_BOLD  = 'Helvetica-Bold';
const SANS_OBL   = 'Helvetica-Oblique';

const BODY_SIZE = 11;
const LGAP      = 4;   // extra line gap between lines

// ── Helpers ───────────────────────────────────────────────────────────────────

function drawBorder(doc: InstanceType<typeof PDFDocument>) {
  doc.save()
     .rect(14, 14, PAGE_W - 28, PAGE_H - 28)
     .lineWidth(0.8).strokeColor('#333333').stroke()
     .restore();
}

function drawHeader(doc: InstanceType<typeof PDFDocument>, today: string) {
  const y = 28;
  doc.save();
  doc.font(SANS_BOLD).fontSize(8).fillColor(INDIGO).text('LEGAL24', ML, y, { continued: true });
  doc.font(SANS).fillColor(GREY).text('  ·  India\'s Legal Services Platform', { continued: true });
  doc.fillColor(LGREY).text('  ' + today, { align: 'right', width: TW });
  doc.moveTo(ML, 42).lineTo(ML + TW, 42).lineWidth(0.3).strokeColor('#DDDDDD').stroke();
  doc.restore();
}

function drawFooter(doc: InstanceType<typeof PDFDocument>, pg: number, total: number) {
  const y = PAGE_H - MB + 14;
  doc.save();
  doc.moveTo(ML, y - 4).lineTo(ML + TW, y - 4).lineWidth(0.3).strokeColor('#DDDDDD').stroke();
  doc.font(SANS_OBL).fontSize(7).fillColor(LGREY)
     .text(
       `legal24.in  |  AI-assisted draft — verify with a qualified advocate before use.    Page ${pg} / ${total}`,
       ML, y, { width: TW, align: 'right' }
     );
  doc.restore();
}

function rule(doc: InstanceType<typeof PDFDocument>) {
  doc.moveDown(0.5);
  doc.moveTo(ML, doc.y).lineTo(ML + TW, doc.y).lineWidth(0.4).strokeColor('#AAAAAA').stroke();
  doc.moveDown(0.6);
}

// Strip **bold** markers → plain text
function plain(s: string): string {
  return s.replace(/\*\*(.*?)\*\*/g, '$1');
}

// Render a line that may have **bold** segments using continued text
function writeMixed(
  doc: InstanceType<typeof PDFDocument>,
  line: string,
  opts: { align?: string; lineGap?: number; indent?: number } = {},
) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  const x = ML + (opts.indent ?? 0);
  const w = TW - (opts.indent ?? 0);
  const align = (opts.align ?? 'justify') as string;
  const lineGap = opts.lineGap ?? LGAP;

  if (parts.length === 1) {
    // No bold — simple single call
    const p = parts[0];
    const isBold = p.startsWith('**');
    doc.font(isBold ? SERIF_BOLD : SERIF)
       .fontSize(BODY_SIZE).fillColor(BLACK)
       .text(isBold ? p.slice(2, -2) : p, x, doc.y, { width: w, align, lineGap });
    return;
  }

  // Multiple segments — use continued but DON'T pass x,y after first
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    const isBold = p.startsWith('**') && p.endsWith('**');
    const text   = isBold ? p.slice(2, -2) : p;
    const isLast = i === parts.length - 1;

    doc.font(isBold ? SERIF_BOLD : SERIF).fontSize(BODY_SIZE).fillColor(BLACK);

    if (i === 0) {
      doc.text(text, x, doc.y, { continued: !isLast, width: w, align, lineGap });
    } else {
      doc.text(text, { continued: !isLast, lineGap });
    }
  }
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { content, title, docType } = await request.json();
    if (!content || typeof content !== 'string')
      return NextResponse.json({ error: 'content is required' }, { status: 400 });

    const docTitle = title || 'Legal Document';
    const today    = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: MT + 24, bottom: MB + 20, left: ML, right: MR },
        bufferPages: true,
        info: { Title: docTitle, Author: 'Legal24', Creator: 'legal24.in' },
      });

      doc.on('data',  (c: Buffer) => chunks.push(c));
      doc.on('end',   resolve);
      doc.on('error', reject);

      // ── Stamp paper header ────────────────────────────────────────────────
      doc.font(SANS).fontSize(8).fillColor(LGREY)
         .text('NON-JUDICIAL STAMP PAPER', ML, doc.y, { width: TW, align: 'center' });
      doc.moveDown(0.2);
      doc.font(SANS_OBL).fontSize(7.5).fillColor(LGREY)
         .text('(For Execution of Legal Documents — Not for Court Filing)', ML, doc.y, { width: TW, align: 'center' });
      doc.moveDown(0.5);
      rule(doc);

      // ── Document title ────────────────────────────────────────────────────
      doc.font(SERIF_BOLD).fontSize(15).fillColor(BLACK)
         .text(docTitle.toUpperCase(), ML, doc.y, { width: TW, align: 'center' });
      if (docType) {
        doc.moveDown(0.3);
        doc.font(SANS).fontSize(9).fillColor(INDIGO)
           .text(docType, ML, doc.y, { width: TW, align: 'center' });
      }
      doc.moveDown(0.5);
      rule(doc);
      doc.moveDown(0.3);

      // ── Body ──────────────────────────────────────────────────────────────
      let listCounter = 0;

      for (const raw of content.split('\n')) {
        const line = raw.trimEnd();

        if (!line.trim()) { doc.moveDown(0.35); continue; }

        // # H1
        if (line.startsWith('# ')) {
          doc.moveDown(0.6);
          doc.font(SERIF_BOLD).fontSize(14).fillColor(BLACK)
             .text(plain(line.slice(2)).toUpperCase(), ML, doc.y, { width: TW, align: 'center', lineGap: LGAP });
          doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK);
          doc.moveDown(0.4);
          continue;
        }

        // ## H2
        if (line.startsWith('## ')) {
          doc.moveDown(0.5);
          doc.font(SERIF_BOLD).fontSize(12).fillColor(BLACK)
             .text(plain(line.slice(3)), ML, doc.y, { width: TW, lineGap: LGAP });
          doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK);
          doc.moveDown(0.2);
          continue;
        }

        // ### H3
        if (line.startsWith('### ')) {
          doc.moveDown(0.3);
          doc.font(SERIF_BOLD).fontSize(BODY_SIZE).fillColor(BLACK)
             .text(plain(line.slice(4)), ML, doc.y, { width: TW, lineGap: LGAP, underline: true });
          doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK);
          doc.moveDown(0.2);
          continue;
        }

        // Horizontal rule
        if (/^[-─═]{4,}$/.test(line.trim())) {
          rule(doc);
          continue;
        }

        // Numbered list — render as one text block with number prefix
        if (/^\d+[.)]\s/.test(line.trim())) {
          listCounter++;
          const text = plain(line.replace(/^\d+[.)]\s/, '').trim());
          // Write number flush left, then text with 20pt indent
          const numStr = `${listCounter}.`;
          doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK);
          // Save y, write number, move back to same y + indent for text
          const startY = doc.y;
          doc.text(numStr, ML, startY, { width: 20, lineGap: LGAP });
          const afterY = doc.y;
          doc.text(text, ML + 22, startY, { width: TW - 22, align: 'justify', lineGap: LGAP });
          // Advance to whichever is lower
          if (doc.y < afterY) doc.y = afterY;
          doc.moveDown(0.2);
          listCounter = listCounter; // keep
          continue;
        } else {
          listCounter = 0;
        }

        // Bullet list
        if (/^[•\-\*]\s/.test(line.trim())) {
          const text = plain(line.replace(/^[•\-\*]\s/, '').trim());
          doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK);
          const startY = doc.y;
          doc.text('•', ML, startY, { width: 16, lineGap: LGAP });
          const afterY = doc.y;
          doc.text(text, ML + 18, startY, { width: TW - 18, align: 'justify', lineGap: LGAP });
          if (doc.y < afterY) doc.y = afterY;
          doc.moveDown(0.2);
          continue;
        }

        // ALL-CAPS section heading
        const stripped = line.replace(/[^a-zA-Z]/g, '');
        if (stripped.length > 2 && stripped === stripped.toUpperCase() && !/^\d/.test(line.trim())) {
          doc.moveDown(0.5);
          doc.font(SERIF_BOLD).fontSize(BODY_SIZE).fillColor(BLACK)
             .text(line.trim(), ML, doc.y, { width: TW, align: 'center', lineGap: LGAP });
          doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK);
          doc.moveDown(0.3);
          continue;
        }

        // Normal paragraph
        writeMixed(doc, line, { align: 'justify', lineGap: LGAP });
        doc.moveDown(0.35);
      }

      // ── Signature block ───────────────────────────────────────────────────
      doc.moveDown(1.2);
      rule(doc);

      doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK)
         .text('SIGNED AND VERIFIED by the parties on the date mentioned herein.',
               ML, doc.y, { width: TW, align: 'justify', lineGap: LGAP });
      doc.moveDown(1.8);

      const sigY  = doc.y;
      const col2X = ML + TW * 0.58;

      doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK)
         .text('_______________________________', ML, sigY, { width: TW * 0.5 });
      doc.font(SERIF).fontSize(BODY_SIZE).fillColor(BLACK)
         .text('_______________________________', col2X, sigY, { width: TW * 0.42 });

      doc.moveDown(0.4);
      const labY = doc.y;
      doc.font(SANS).fontSize(8.5).fillColor(GREY)
         .text('Signature of Party / Client', ML, labY, { width: TW * 0.5 });
      doc.font(SANS).fontSize(8.5).fillColor(GREY)
         .text('Signature of Advocate', col2X, labY, { width: TW * 0.42 });

      doc.moveDown(0.4);
      const dateY = doc.y;
      doc.font(SANS).fontSize(8.5).fillColor(GREY)
         .text('Date: ___________________', ML, dateY, { width: TW * 0.5 });
      doc.font(SANS).fontSize(8.5).fillColor(GREY)
         .text('Enrollment No.: ___________________', col2X, dateY, { width: TW * 0.42 });

      // ── Disclaimer ────────────────────────────────────────────────────────
      doc.moveDown(1.5);
      rule(doc);
      doc.font(SANS_OBL).fontSize(7.5).fillColor(LGREY)
         .text(
           'DISCLAIMER: This document was generated with AI assistance using knowledge of Indian laws. It is a draft only — review and customise with a qualified advocate before use in any legal proceedings. It does not constitute legal advice.',
           ML, doc.y, { width: TW, align: 'justify', lineGap: 2 }
         );

      // ── Draw border + header/footer on every buffered page ────────────────
      const range = (doc as any).bufferedPageRange();
      for (let i = 0; i < range.count; i++) {
        doc.switchToPage(i);
        drawBorder(doc);
        drawHeader(doc, today);
        drawFooter(doc, i + 1, range.count);
      }

      doc.end();
    });

    const buffer   = Buffer.concat(chunks);
    const filename = `${docTitle.replace(/[^a-zA-Z0-9 _\-]/g, '').replace(/\s+/g, '_')}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });

  } catch (err: any) {
    console.error('[generate-pdf]', err);
    return NextResponse.json({ error: 'Failed to generate PDF: ' + err.message }, { status: 500 });
  }
}
