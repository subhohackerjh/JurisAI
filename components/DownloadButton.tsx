'use client';

import { useState } from 'react';
import { Download, FileText, File, Loader2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DownloadButtonProps {
  getContent: () => { content: string; title: string; docType?: string } | null;
  size?: 'sm' | 'default';
  variant?: 'outline' | 'default' | 'ghost';
  label?: string;
  className?: string;
}

async function download(endpoint: string, content: string, title: string, docType?: string) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title, docType }),
  });
  if (!res.ok) throw new Error(await res.text());
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const ext = endpoint.includes('pdf') ? 'pdf' : 'docx';
  a.download = `${title.replace(/[^a-zA-Z0-9 _-]/g, '').replace(/\s+/g, '_')}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DownloadButton({ getContent, size = 'sm', variant = 'outline', label, className }: DownloadButtonProps) {
  const [loading, setLoading] = useState<'pdf' | 'docx' | null>(null);

  const handle = async (type: 'pdf' | 'docx') => {
    const data = getContent();
    if (!data) return;
    setLoading(type);
    try {
      await download(
        type === 'pdf' ? '/api/generate-pdf' : '/api/generate-docx',
        data.content, data.title, data.docType,
      );
    } catch (e: any) {
      alert(`Download failed: ${e.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={size} variant={variant} disabled={loading !== null} className={className}>
          {loading
            ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            : <Download className="w-3.5 h-3.5 mr-1.5" />}
          {label ?? 'Download'}
          <ChevronDown className="w-3 h-3 ml-1 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44 rounded-xl">
        <DropdownMenuItem onClick={() => handle('pdf')} className="gap-2 cursor-pointer font-medium">
          <File className="w-4 h-4 text-red-500" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handle('docx')} className="gap-2 cursor-pointer font-medium">
          <FileText className="w-4 h-4 text-blue-600" />
          Download Word (.docx)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
