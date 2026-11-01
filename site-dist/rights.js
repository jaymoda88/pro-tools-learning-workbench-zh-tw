/* First-party attribution and visible watermarks. These are notices, not DRM. */
(() => {
  'use strict';

  const REPOSITORY = 'https://github.com/jaymoda88/pro-tools-learning-workbench-zh-tw';
  const AUTHOR = '許惟傑 Xue_hwcxx';
  const HANDLE = '@jaymoda88';
  const NOTICE = '非商用學習 · 未經授權請勿轉售';
  const LAYER_ID = 'pt-rights-watermark';
  const CREDIT_ATTRIBUTE = 'data-pt-rights-credit';
  let stopped = false;
  let queued = false;
  let layer = null;
  let observer = null;
  let creditedDocument = null;

  function canonicalDocumentUrl(document) {
    if (!document || typeof document.id !== 'string' || !document.id) return REPOSITORY;
    return REPOSITORY + '/blob/main/content/' + encodeURIComponent(document.id) + '.md';
  }

  function readerRoute(document, reference) {
    return '#/' + (reference ? 'reference/' : 'note/') + encodeURIComponent(document.id);
  }

  function makeWatermark() {
    const root = document.createElement('div');
    root.id = LAYER_ID;
    root.className = 'pt-rights-watermark';
    root.setAttribute('aria-hidden', 'true');
    const grid = document.createElement('div');
    grid.className = 'pt-rights-watermark-grid';
    for (let index = 0; index < 12; index++) {
      const stamp = document.createElement('span');
      stamp.className = 'pt-rights-watermark-stamp';
      const author = document.createElement('strong');
      author.textContent = AUTHOR;
      const handle = document.createElement('span');
      handle.textContent = 'GitHub ' + HANDLE + ' · 個人學習';
      const notice = document.createElement('span');
      notice.textContent = '非商用 · 請勿轉售';
      stamp.append(author, handle, notice);
      grid.append(stamp);
    }
    root.append(grid);
    return root;
  }

  function refresh() {
    if (stopped || !document.body) return null;
    if (!layer) layer = makeWatermark();
    if (!layer.isConnected) document.body.append(layer);
    if (!observer && typeof MutationObserver === 'function') {
      // Only watch direct body children. Restoring this layer is a convenience;
      // users still control their browser and can remove client-side notices.
      observer = new MutationObserver(() => {
        if (stopped || queued || layer.isConnected) return;
        queued = true;
        Promise.resolve().then(() => {
          queued = false;
          if (!stopped) refresh();
        });
      });
      observer.observe(document.body, { childList: true });
    }
    return layer;
  }

  function stampArticle(sourceDocument, reference = false) {
    if (stopped || !sourceDocument || typeof sourceDocument.id !== 'string') return null;
    const paper = document.querySelector('.reader-paper');
    const header = paper?.querySelector('.reader-header');
    if (!paper || !header) return null;
    const canonical = canonicalDocumentUrl(sourceDocument);
    let credit = header.querySelector('[' + CREDIT_ATTRIBUTE + ']');
    if (!credit) {
      credit = document.createElement('aside');
      credit.className = 'reader-rights-credit';
      credit.setAttribute(CREDIT_ATTRIBUTE, '');
      credit.setAttribute('aria-label', '教學整理署名與使用範圍');
      header.append(credit);
    }
    credit.replaceChildren();
    const author = document.createElement('p');
    author.className = 'reader-rights-author';
    author.textContent = '整理與製作：' + AUTHOR + ' · ' + HANDLE;
    const notice = document.createElement('p');
    notice.className = 'reader-rights-notice';
    notice.textContent = NOTICE;
    const link = document.createElement('a');
    link.href = canonical;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = '原筆記與版本來源';
    const sourceRights = document.createElement('p');
    sourceRights.className = 'reader-rights-source';
    sourceRights.textContent = '此署名適用於教學整理；Avid 原文、產品與各引用來源的權利仍屬原權利人。';
    credit.dataset.readerRoute = readerRoute(sourceDocument, reference);
    credit.append(author, notice, link, sourceRights);
    creditedDocument = { id: sourceDocument.id, paper, canonical };
    refresh();
    return credit;
  }

  function isEditable(node) {
    const element = node?.nodeType === 1 ? node : node?.parentElement;
    return Boolean(element && (
      element.isContentEditable ||
      element.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"], [data-action="copy-key"]')
    ));
  }

  function appendCopyAttribution(event) {
    if (stopped || event.defaultPrevented || !event.clipboardData || !creditedDocument) return;
    if (isEditable(event.target) || isEditable(document.activeElement)) return;
    const selection = window.getSelection?.();
    if (!selection || selection.rangeCount !== 1 || selection.isCollapsed) return;
    const selected = selection.toString();
    if (selected.trim().length <= 120) return;
    const range = selection.getRangeAt(0);
    const paper = creditedDocument.paper;
    if (!paper.isConnected || !paper.contains(range.startContainer) || !paper.contains(range.endContainer)) return;
    if (isEditable(range.startContainer) || isEditable(range.endContainer)) return;
    // Keep copied commands and code valid, including a mixed selection with code.
    if ([...paper.querySelectorAll("pre, code")].some(node => range.intersectsNode(node))) return;

    const suffix = '\n\n——\n內容整理與製作：' + AUTHOR + ' · ' + HANDLE
      + '\n' + NOTICE + '\n來源：' + creditedDocument.canonical
      + '\nAvid 原文及各引用來源的權利仍屬原權利人。';
    const plain = selected.includes(creditedDocument.canonical) ? selected : selected + suffix;
    try {
      // Deliberately use plain text: do not clone event handlers, embedded images,
      // arbitrary HTML attributes, file URLs or localhost URLs into the clipboard.
      event.clipboardData.setData('text/plain', plain);
      event.preventDefault();
    } catch (_) {
      // Browser clipboard restrictions must never prevent the ordinary copy.
    }
  }

  function stop() {
    stopped = true;
    observer?.disconnect();
    observer = null;
    document.removeEventListener('copy', appendCopyAttribution);
    document.removeEventListener('DOMContentLoaded', refresh);
    layer?.remove();
    layer = null;
    creditedDocument = null;
    document.querySelectorAll('[' + CREDIT_ATTRIBUTE + ']').forEach(credit => credit.remove());
  }

  window.PTRights = { refresh, stampArticle, stop, canonicalDocumentUrl };
  document.addEventListener('copy', appendCopyAttribution);
  if (document.body) refresh();
  else document.addEventListener('DOMContentLoaded', refresh, { once: true });
})();
