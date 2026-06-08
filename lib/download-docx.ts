/**
 * Downloads content as a formatted Legal24 .docx file.
 * Calls /api/generate-docx on the server which uses the docx library.
 */
export async function downloadAsDocx(
  content: string,
  title: string,
  docType?: string,
): Promise<void> {
  const res = await fetch('/api/generate-docx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, title, docType }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate document');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9_\- ]/g, '').replace(/\s+/g, '_')}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
