/**
 * JurisAI — DOCX generator (stamp-paper edition)
 * A4 · 1.5" side margins · 1" top · 1.5" bottom · Times New Roman 12pt · 1.5× spacing
 */
import { NextRequest, NextResponse } from 'next/server';
import {
  Document, Packer, Paragraph, TextRun, Header, Footer,
  AlignmentType, HeadingLevel, BorderStyle, PageNumber,
  LevelFormat, TabStopType,
} from 'docx';

// ── Page geometry (DXA: 1440 = 1 inch) ────────────────────────────────────────
const A4_W     = 11906;
const A4_H     = 16838;
const M_SIDE   = 1440;   // 1" sides — standard legal margin
const M_TOP    = 1440;   // 1" top
const M_BOTTOM = 1800;   // 1.25" bottom
const CONTENT_W = A4_W - M_SIDE * 2;  // 9026 DXA ≈ 6.27"

// ── Helpers ───────────────────────────────────────────────────────────────────
function hr(): Paragraph {
  return new Paragraph({
    children: [],
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'AAAAAA', space: 1 } },
    spacing: { before: 280, after: 280 },
  });
}

function spacer(pts = 160): Paragraph {
  return new Paragraph({ children: [new TextRun('')], spacing: { before: pts, after: pts } });
}

function t(text: string, opts: Record<string, unknown> = {}): TextRun {
  return new TextRun({ font: 'Times New Roman', size: 24, text, ...opts } as any);
}

function centred(text: string, opts: Record<string, unknown> = {}): Paragraph {
  return new Paragraph({
    children: [t(text, opts)],
    alignment: AlignmentType.CENTER,
  });
}

// Inline bold parser
function buildRuns(line: string): TextRun[] {
  const runs: TextRun[] = [];
  for (const p of line.split(/(\*\*[^*]+\*\*)/g)) {
    if (!p) continue;
    if (p.startsWith('**') && p.endsWith('**')) {
      runs.push(t(p.slice(2, -2), { bold: true }));
    } else {
      runs.push(t(p));
    }
  }
  return runs.length ? runs : [t('')];
}

// ── Content parser ────────────────────────────────────────────────────────────
function parseLines(text: string): Paragraph[] {
  const paras: Paragraph[] = [];
  const SP = { line: 360, lineRule: 'auto' as const };

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd();

    if (!line.trim()) {
      paras.push(new Paragraph({ children: [new TextRun('')], spacing: { before: 80, after: 80 } }));
      continue;
    }

    if (line.startsWith('# ')) {
      paras.push(new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [t(line.slice(2).trim(), { bold: true, size: 30, allCaps: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 160, ...SP },
      }));
      continue;
    }

    if (line.startsWith('## ')) {
      paras.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [t(line.slice(3).trim(), { bold: true, size: 26 })],
        spacing: { before: 320, after: 120, ...SP },
      }));
      continue;
    }

    if (line.startsWith('### ')) {
      paras.push(new Paragraph({
        children: [t(line.slice(4).trim(), { bold: true, underline: {} })],
        spacing: { before: 240, after: 100, ...SP },
      }));
      continue;
    }

    if (/^[-─═]{4,}$/.test(line.trim())) {
      paras.push(hr());
      continue;
    }

    if (/^\d+[.)]\s/.test(line.trim())) {
      paras.push(new Paragraph({
        numbering: { reference: 'numbered', level: 0 },
        children: buildRuns(line.replace(/^\d+[.)]\s/, '')),
        spacing: { before: 80, after: 80, ...SP },
      }));
      continue;
    }

    if (/^[•\-\*]\s/.test(line.trim())) {
      paras.push(new Paragraph({
        numbering: { reference: 'bullets', level: 0 },
        children: buildRuns(line.replace(/^[•\-\*]\s/, '')),
        spacing: { before: 80, after: 80, ...SP },
      }));
      continue;
    }

    // ALL-CAPS section heading
    const stripped = line.replace(/[^a-zA-Z]/g, '');
    if (stripped.length > 2 && stripped === stripped.toUpperCase() && !/^\d/.test(line.trim())) {
      paras.push(new Paragraph({
        children: [t(line.trim(), { bold: true, allCaps: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 320, after: 160 },
      }));
      continue;
    }

    // Normal — justified, 1.5× spacing
    paras.push(new Paragraph({
      children: buildRuns(line),
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 100, after: 100, ...SP },
    }));
  }
  return paras;
}

// ── Route ─────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { content, title, docType } = await request.json();
    if (!content || typeof content !== 'string')
      return NextResponse.json({ error: 'content is required' }, { status: 400 });

    const docTitle = title || 'Legal Document';
    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    const doc = new Document({
      title: docTitle,
      creator: 'JurisAI',
      numbering: {
        config: [
          {
            reference: 'bullets',
            levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
          },
          {
            reference: 'numbered',
            levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } } }],
          },
        ],
      },
      styles: {
        default: { document: { run: { font: 'Times New Roman', size: 24 } } },
        paragraphStyles: [
          { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal',
            run: { font: 'Times New Roman', size: 30, bold: true, color: '000000' },
            paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0 } },
          { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal',
            run: { font: 'Times New Roman', size: 26, bold: true, color: '000000' },
            paragraph: { spacing: { before: 320, after: 120 }, outlineLevel: 1 } },
        ],
      },

      sections: [{
        properties: {
          page: {
            size: { width: A4_W, height: A4_H },
            margin: { top: M_TOP, right: M_SIDE, bottom: M_BOTTOM, left: M_SIDE },
            // Page border: single thin box on all sides
            borders: {
              pageBorderTop:    { style: BorderStyle.SINGLE, size: 12, color: '444444', space: 24 },
              pageBorderBottom: { style: BorderStyle.SINGLE, size: 12, color: '444444', space: 24 },
              pageBorderLeft:   { style: BorderStyle.SINGLE, size: 12, color: '444444', space: 24 },
              pageBorderRight:  { style: BorderStyle.SINGLE, size: 12, color: '444444', space: 24 },
            } as any,
          },
        },

        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'JurisAI', bold: true, font: 'Arial', size: 16, color: '4338CA' }),
                new TextRun({ text: '  ·  India\'s Legal Services Platform', font: 'Arial', size: 15, color: '888888' }),
                new TextRun({ text: '\t' + today, font: 'Arial', size: 15, color: '888888' }),
              ],
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 1 } },
              tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
              spacing: { after: 80 },
            })],
          }),
        },

        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'JurisAI  |  AI-assisted draft — verify with a qualified advocate before use.', font: 'Arial', size: 15, color: '999999', italics: true }),
                new TextRun({ text: '\tPage ', font: 'Arial', size: 15, color: '999999' }),
                new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 15, color: '999999' }),
                new TextRun({ text: ' / ', font: 'Arial', size: 15, color: '999999' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Arial', size: 15, color: '999999' }),
              ],
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'DDDDDD', space: 1 } },
              tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W }],
              spacing: { before: 80 },
            })],
          }),
        },

        children: [
          // Stamp paper identifier
          spacer(80),
          centred('NON-JUDICIAL STAMP PAPER', { size: 17, color: '888888', italics: true }),
          centred('(For Execution of Legal Documents — Not for Court Filing)', { size: 16, color: 'AAAAAA', italics: true }),
          spacer(80),
          hr(),
          spacer(120),

          // Title
          centred(docTitle.toUpperCase(), { bold: true, size: 30 }),
          ...(docType ? [centred(docType, { size: 20, color: '4338CA' })] : []),
          spacer(80),
          hr(),
          spacer(160),

          // Body
          ...parseLines(content),

          // Signature block
          spacer(240),
          hr(),
          spacer(80),
          new Paragraph({
            children: [t('SIGNED AND VERIFIED by the parties on the date mentioned herein.')],
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 80, after: 240 },
          }),
          new Paragraph({
            children: [
              t('_______________________________'),
              t('\t_______________________________'),
            ],
            tabStops: [{ type: TabStopType.LEFT, position: Math.round(CONTENT_W * 0.55) }],
            spacing: { before: 80, after: 60 },
          }),
          new Paragraph({
            children: [
              t('Signature of Party / Client', { color: '555555' }),
              t('\tSignature of Advocate', { color: '555555' }),
            ],
            tabStops: [{ type: TabStopType.LEFT, position: Math.round(CONTENT_W * 0.55) }],
            spacing: { before: 0, after: 60 },
          }),
          new Paragraph({
            children: [
              t('Date: ___________________', { color: '555555' }),
              t('\tEnrollment No.: ___________________', { color: '555555' }),
            ],
            tabStops: [{ type: TabStopType.LEFT, position: Math.round(CONTENT_W * 0.55) }],
            spacing: { before: 60, after: 200 },
          }),

          // Disclaimer
          new Paragraph({
            children: [new TextRun({
              text: 'DISCLAIMER: This document was generated with AI assistance using knowledge of Indian laws. It is a draft only — review and customise with a qualified advocate before use in any legal proceedings. It does not constitute legal advice.',
              font: 'Arial', size: 17, italics: true, color: '888888',
            })],
            alignment: AlignmentType.JUSTIFIED,
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'EEEEEE', space: 1 } },
            spacing: { before: 160, after: 80 },
          }),
        ],
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    const filename = `${docTitle.replace(/[^a-zA-Z0-9 _\-]/g, '').replace(/\s+/g, '_')}.docx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
      },
    });

  } catch (err: any) {
    console.error('[generate-docx]', err);
    return NextResponse.json({ error: 'Failed to generate document: ' + err.message }, { status: 500 });
  }
}
