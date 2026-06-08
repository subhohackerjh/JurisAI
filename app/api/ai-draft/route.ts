/**
 * Legal24 — AI Legal Document Drafting API
 * Powered by Groq (llama-3.3-70b-versatile) — FREE tier
 *
 * Generates professional Indian legal documents with full knowledge of:
 * - Indian Penal Code, CrPC, CPC, Evidence Act
 * - Contract Act, Transfer of Property Act, Registration Act
 * - Specific Relief Act, Limitation Act
 * - All major Indian legal document formats & conventions
 */
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_your_key_here') {
  console.error('[AI Draft] GROQ_API_KEY is not set. Add it to .env');
}
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' });

const MODEL = 'llama-3.3-70b-versatile';

// ── Comprehensive Indian Legal Drafting System Prompt ─────────────────────────
const DRAFTING_SYSTEM_PROMPT = `You are an expert Indian legal document drafter with 20+ years of experience. You draft professional, legally sound documents following all Indian laws, conventions, and court formats.

## YOUR KNOWLEDGE BASE — Indian Laws & Acts

### Criminal Law
- Indian Penal Code 1860 (IPC) / Bharatiya Nyaya Sanhita 2023 (BNS)
- Code of Criminal Procedure 1973 (CrPC) / Bharatiya Nagarik Suraksha Sanhita 2023 (BNSS)
- Indian Evidence Act 1872 / Bharatiya Sakshya Adhiniyam 2023
- Prevention of Corruption Act 1988, NDPS Act 1985, POCSO Act 2012

### Civil & Contract Law
- Indian Contract Act 1872 (Sections 1-238: offer, acceptance, consideration, void/voidable contracts)
- Specific Relief Act 1963
- Transfer of Property Act 1882 (sale, mortgage, lease, gift, exchange)
- Indian Registration Act 1908
- Benami Transactions (Prohibition) Act 1988
- Limitation Act 1963 (all schedule entries)

### Property & Land
- Transfer of Property Act 1882
- Land Acquisition Act / RFCTLARR Act 2013
- Rent Control Acts (state-specific)
- Urban Land Ceiling Acts

### Family & Personal Law
- Hindu Marriage Act 1955, Hindu Succession Act 1956
- Hindu Minority and Guardianship Act 1956
- Special Marriage Act 1954
- Muslim Personal Law (Shariat) Application Act 1937
- Indian Divorce Act 1869 (Christians)
- Domestic Violence Act 2005
- Maintenance and Welfare of Parents and Senior Citizens Act 2007

### Commercial & Corporate
- Companies Act 2013
- Limited Liability Partnership Act 2008
- Indian Partnership Act 1932
- Negotiable Instruments Act 1881 (cheques, promissory notes)
- Insolvency and Bankruptcy Code 2016
- FEMA 1999, SEBI Act 1992

### Labour & Employment
- Industrial Disputes Act 1947
- Payment of Wages Act 1936, Minimum Wages Act 1948
- Employees Provident Funds Act 1952
- Payment of Gratuity Act 1972
- Sexual Harassment of Women at Workplace Act 2013 (POSH)
- Code on Wages 2019, Code on Social Security 2020

### Consumer & Other
- Consumer Protection Act 2019
- RTI Act 2005
- Arbitration and Conciliation Act 1996
- Legal Services Authorities Act 1987
- Stamp Act 1899 (and state stamp acts)
- Notaries Act 1952

## DOCUMENT FORMATS YOU KNOW

1. **Legal Notice** — cause of action, demand, deadline (Section 80 CPC for govt, Section 138 NI Act for cheque bounce)
2. **Contract/Agreement** — recitals, definitions, operative clauses, representations, termination, dispute resolution, governing law
3. **Affidavit** — jurat, deponent details, sworn statement format per CrPC/CPC
4. **Power of Attorney** — general/specific, Schedule of Powers, revocation clause
5. **Will & Testament** — testamentary capacity, residuary clause, executor, attestation per Indian Succession Act
6. **Rental/Lease Agreement** — parties, property description, term, rent, security deposit, maintenance, termination per Rent Control Act
7. **Partnership Deed** — capital contribution, profit sharing, management, dissolution per Indian Partnership Act 1932
8. **Employment Contract** — offer terms, CTC, confidentiality, IP assignment, POSH compliance, exit clause
9. **NDA** — unilateral/mutual, definition of confidential information, exclusions, remedies
10. **MOU** — non-binding intent, scope, timeline, termination
11. **Sale Deed** — property description, consideration, warranties, indemnity per Transfer of Property Act
12. **Vakalatnama** — advocate appointment, stamp paper requirement
13. **Complaint / FIR Draft** — Section number, facts, relief sought
14. **Plaint (Civil Suit)** — cause of action, jurisdiction, relief per Order VII CPC
15. **Written Statement** — per Order VIII CPC, preliminary objections, denial/admission
16. **Bail Application** — grounds, sureties, conditions per Section 437/439 CrPC / BNSS

## DRAFTING RULES

1. **Start with the document immediately** — no preamble, no "Sure, here's the draft"
2. **Use proper Indian legal formatting**:
   - Capital letters for defined terms
   - "THIS AGREEMENT" / "WHEREAS" for contracts
   - "IN WITNESS WHEREOF" closing
   - Proper party definitions (hereinafter referred to as...)
3. **Include blank placeholders** with [SQUARE BRACKETS] for values to be filled (names, dates, amounts, addresses)
4. **Cite relevant sections** in brackets where applicable (e.g., "pursuant to Section 17 of the Indian Contract Act, 1872")
5. **Include stamp duty note** where registration is required
6. **Add execution block** with signature lines, witness lines, date/place
7. **Professional formatting**: numbered clauses, sub-clauses (1.1, 1.2), defined terms
8. **Use Indian English** (Rupees, not dollars; Indian date format; Indian addresses)
9. **Always add** a drafting note at the end with important customization points

Output the complete, ready-to-use document in markdown format with proper headings.`;


// Document-type specific instructions to inject
const DOC_TYPE_HINTS: Record<string, string> = {
  notice: 'Draft a formal Legal Notice. Include: sender details, addressee, facts, legal provisions violated, demand/relief sought, deadline (usually 15-30 days), consequence of non-compliance. Cite Section 80 CPC if against govt/public body.',
  contract: 'Draft a comprehensive Contract Agreement. Include: recitals, definitions, scope of work, payment terms, intellectual property, confidentiality, termination, dispute resolution (arbitration clause under Arbitration and Conciliation Act 1996), governing law (India), entire agreement clause.',
  power_of_attorney: 'Draft a Power of Attorney. Specify if General or Specific. Include Schedule of Powers, revocation clause, stamp duty note (as per state), registration requirements under Registration Act 1908.',
  will: 'Draft a Last Will and Testament. Include: testamentary capacity declaration, revocation of prior wills, specific bequests, residuary estate, executor appointment, guardianship clause if minor children, attestation per Section 63 Indian Succession Act 1925.',
  partnership: 'Draft a Partnership Deed under Indian Partnership Act 1932. Include: firm name, business nature, capital contribution, profit/loss sharing ratio, bank account operation, decision-making, retirement/death of partner, dissolution procedure.',
  rental: 'Draft a Rental/Lease Agreement. Include: parties, property schedule, term, monthly rent, security deposit, maintenance responsibilities, permitted use, subletting restriction, termination notice period, lock-in clause. Note applicable Rent Control Act.',
  employment: 'Draft an Employment Contract. Include: designation, CTC breakup, probation, working hours, leave policy, confidentiality, IP assignment clause, non-compete (reasonable scope), POSH policy reference, termination/notice period, dispute resolution.',
  nda: 'Draft a Non-Disclosure Agreement (NDA). Specify unilateral or mutual. Include: definition of Confidential Information, exclusions, obligations, permitted disclosures, return/destruction of materials, remedies (injunctive relief), term, governing law.',
  mou: 'Draft a Memorandum of Understanding (MOU). Include: purpose/background, scope of collaboration, responsibilities of each party, financial arrangement (if any), intellectual property, confidentiality, duration, termination, non-binding nature clause.',
  complaint: 'Draft a Legal Complaint/FIR draft. Include: complainant details, accused details, date/time/place of incident, facts in chronological order, IPC/BNS sections attracted, list of witnesses, list of documents, relief/prayer sought.',
  other: 'Draft a professional legal document based on the requirements provided. Follow standard Indian legal drafting conventions.',
};

export async function POST(request: NextRequest) {
  if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'gsk_your_key_here') {
    return NextResponse.json({ error: 'AI service not configured. Set GROQ_API_KEY in .env' }, { status: 503 });
  }
  try {
    // Rate limit: 5 document drafts per hour per IP (drafts use 4× more tokens)
    const ip = getClientIP(request);
    const rl = checkRateLimit(ip, 5, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Rate limit reached. You can generate 5 documents per hour.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const body = await request.json();
    const {
      documentType,
      requirements,
      additionalContext,
      caseDetails,
      partiesInfo,
      advocateName,
    } = body;

    if (!documentType || !requirements) {
      return NextResponse.json(
        { error: 'documentType and requirements are required' },
        { status: 400 }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Add GROQ_API_KEY.' },
        { status: 503 }
      );
    }

    const docHint = DOC_TYPE_HINTS[documentType] || DOC_TYPE_HINTS.other;

    // Build a detailed user prompt
    const userPrompt = `${docHint}

**Document Type:** ${documentType.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())}

**Client Requirements:**
${requirements}

${partiesInfo ? `**Parties Information:**\n${partiesInfo}\n` : ''}
${caseDetails ? `**Related Case Details:**\n${JSON.stringify(caseDetails, null, 2)}\n` : ''}
${additionalContext ? `**Additional Context:**\n${additionalContext}\n` : ''}
${advocateName ? `**Drafted by Advocate:** ${advocateName}\n` : ''}

Please draft the complete, professional legal document now. Use [PLACEHOLDER] for any information not provided. Include all standard clauses for this document type under Indian law.`;

    // Stream from Groq
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: DRAFTING_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      stream: true,
      temperature: 0.2,    // very low — legal drafts must be precise
      max_tokens: 4096,    // legal docs can be long
      top_p: 0.85,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? '';
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
            if (chunk.choices[0]?.finish_reason) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`)
              );
            }
          }
        } catch {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Draft generation interrupted' })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error: any) {
    console.error('AI Draft error:', error);
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'AI rate limit reached. Please wait a moment.' },
        { status: 429 }
      );
    }
    return NextResponse.json(
      { error: 'Draft generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
