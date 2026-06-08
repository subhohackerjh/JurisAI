/**
 * Legal24 AI Chat — powered by Groq (free tier)
 * Model: llama-3.3-70b-versatile  →  fast, accurate, free
 * Streams Server-Sent Events so the UI feels instant.
 */
import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIP } from '@/lib/rate-limit';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Best free Groq model for legal reasoning
const MODEL = 'llama-3.3-70b-versatile';

// ── System prompt: full Indian law context ────────────────────────────────────
const LEGAL_SYSTEM_PROMPT = `You are LEGAL 24's AI Legal Assistant — an expert in Indian law. You help citizens, advocates, and law students understand their legal rights and options in India.

Your expertise covers:
- Constitution of India — Fundamental Rights (Articles 12-35), DPSPs, Fundamental Duties
- Indian Penal Code (IPC) 1860 / Bharatiya Nyaya Sanhita (BNS) 2023
- Code of Criminal Procedure (CrPC) / Bharatiya Nagarik Suraksha Sanhita (BNSS) 2023
- Civil Procedure Code (CPC) 1908
- Indian Evidence Act / Bharatiya Sakshya Adhiniyam 2023
- Family law: Hindu Marriage Act, Special Marriage Act, Muslim Personal Law, Christian Marriage Act
- Property law: Transfer of Property Act, Registration Act, Benami Transactions Act
- Labour law: Industrial Disputes Act, Payment of Wages Act, Minimum Wages Act, POSH Act 2013
- Consumer Protection Act 2019 and consumer courts (District/State/National)
- RTI Act 2005
- IT Act 2000 and DPDP Act 2023
- Company law: Companies Act 2013, IBC 2016
- eCourts system: online case filing, CNR lookup, virtual hearings, e-filing at ecourts.gov.in
- Lok Adalat, Mediation, Arbitration under Arbitration & Conciliation Act 1996
- Legal Aid under NALSA (free for eligible citizens)

Important IPC / BNS sections you know well:
IPC 302/BNS 101 (Murder), 304 (Culpable Homicide), 307 (Attempt to Murder), 323 (Hurt), 354 (Outraging modesty), 376/BNS 63 (Rape), 379 (Theft), 392 (Robbery), 406 (Criminal breach of trust), 420/BNS 318 (Cheating), 498A/BNS 85 (Cruelty by husband/relatives), 503 (Criminal intimidation), 504 (Intentional insult), 506 (Criminal intimidation punishment).

How you respond:
1. Give clear, structured answers with **markdown** headings and bullet points
2. Always cite the exact law/section (e.g., "Section 420 IPC / Section 318 BNS 2023")
3. Explain procedures step-by-step with numbered lists
4. Mention eCourts portal (ecourts.gov.in) for online filing/tracking where relevant
5. For criminal matters, mention right to free legal aid under NALSA
6. Be empathetic — many users are in stressful situations
7. Keep answers concise but complete — no unnecessary padding

End every substantive legal answer with:
> ⚠️ *This is general legal information, not advice for your specific situation. Consult a qualified advocate for your case.*`;

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 20 AI chat messages per hour per IP
    const ip = getClientIP(request);
    const rl = checkRateLimit(ip, 20, 60 * 60 * 1000);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many requests. You can send 20 AI messages per hour.' },
        {
          status: 429,
          headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) },
        }
      );
    }

    const { messages, context } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured. Add GROQ_API_KEY to your environment.' },
        { status: 503 }
      );
    }

    // Build system prompt with optional context
    let systemPrompt = LEGAL_SYSTEM_PROMPT;
    if (context?.userRole) {
      systemPrompt += `\n\nThe current user's role on the Legal24 platform is: ${context.userRole}`;
    }
    if (context?.ecourtsCaseData) {
      systemPrompt += `\n\nContext — user has loaded this eCourts case:\n${JSON.stringify(context.ecourtsCaseData, null, 2)}`;
    }

    // Filter to user/assistant only, keep last 20 turns to stay within context limits
    const groqMessages = messages
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .slice(-20)
      .map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content),
      }));

    // Stream from Groq
    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...groqMessages,
      ],
      stream: true,
      temperature: 0.4,   // lower = more factual / consistent for legal topics
      max_tokens: 1024,
      top_p: 0.9,
    });

    // Return as Server-Sent Events
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
                encoder.encode(
                  `data: ${JSON.stringify({
                    done: true,
                    finish_reason: chunk.choices[0].finish_reason,
                    model: chunk.model,
                  })}\n\n`
                )
              );
            }
          }
        } catch {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: 'Stream interrupted' })}\n\n`)
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
        'X-Accel-Buffering': 'no', // prevent nginx buffering SSE
      },
    });

  } catch (error: any) {
    console.error('Groq AI error:', error);

    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'Invalid GROQ_API_KEY. Check your environment variables.' },
        { status: 503 }
      );
    }
    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'AI rate limit reached. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: 'AI service temporarily unavailable. Please try again.' },
      { status: 500 }
    );
  }
}
