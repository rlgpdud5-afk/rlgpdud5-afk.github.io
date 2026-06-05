/** Export an HTML element to PDF via browser print dialog (Save as PDF). */
export function exportElementToPdf(element: HTMLElement, title: string) {
  const win = window.open('', '_blank');
  if (!win) {
    alert('팝업이 차단되었습니다. 팝업 허용 후 다시 시도하세요.');
    return;
  }
  const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map((node) => node.outerHTML)
    .join('');
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${title}</title>${styles}
<style>
@page { margin: 12mm; }
body { margin: 0; padding: 16px; background: #fff; }
.port-doc { max-height: none !important; overflow: visible !important; box-shadow: none !important; }
</style></head><body>${element.outerHTML}</body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => {
    win.print();
  }, 400);
}

export async function copyShareText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
