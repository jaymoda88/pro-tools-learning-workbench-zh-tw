/* Pro Tools 工作台 — buildless, browser-local application. */
(() => {
'use strict';
const D = window.PT_DATA || {notes:[],shortcuts:[],workflows:[],categories:[]};
const notes = (D.notes || []).slice().sort((a,b)=>Number(a.chapter)-Number(b.chapter)||String(a.id).localeCompare(String(b.id)));
const shortcuts = D.shortcuts || [];
const pages = D.pages || [];
const pageMap = new Map(pages.map(page => [page.id, page]));
const documents = [...notes, ...pages];
const noteMap = new Map(notes.map(n=>[n.id,n]));
const defaults = [{id:'setup',name:'系統與設定',english:'Setup',symbol:'⚙'},{id:'session',name:'工程與素材',english:'Session',symbol:'▤'},{id:'record',name:'錄音與播放',english:'Recording',symbol:'◉'},{id:'edit',name:'Audio 剪輯',english:'Editing',symbol:'✂'},{id:'midi',name:'MIDI 與編排',english:'MIDI',symbol:'♩'},{id:'process',name:'聲音處理',english:'Processing',symbol:'∿'},{id:'mix',name:'混音與交付',english:'Mixing',symbol:'☷'},{id:'spatial',name:'空間音訊與影像',english:'Spatial',symbol:'◇'}];
const cats = defaults.map(c=>({...c,...(D.categories||[]).find(x=>x.id===c.id)}));
const main = document.getElementById('main');
const searchInput = document.getElementById('globalSearch');
const storageKey = 'pro-tools-workbench-v1';
let savedState = {};
try { savedState = JSON.parse(localStorage.getItem(storageKey)||'{}') || {}; } catch(_) {}
const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
const explicitTheme = savedState.theme === 'dark' || savedState.theme === 'light';
const themePreference = ['system', 'light', 'dark'].includes(savedState.themePreference)
  ? savedState.themePreference
  : (explicitTheme ? savedState.theme : 'system');
const state = {
  saved: new Set(Array.isArray(savedState.saved) ? savedState.saved.filter(id => noteMap.has(id)) : []),
  read: new Set(Array.isArray(savedState.read) ? savedState.read.filter(id => noteMap.has(id)) : []),
  recent: Array.isArray(savedState.recent) ? savedState.recent.filter(id => noteMap.has(id)).slice(0, 12) : [],
  font: Math.min(24, Math.max(16, Number(savedState.font) || 18)),
  themePreference,
  theme: themePreference === 'system' ? (systemTheme.matches ? 'dark' : 'light') : themePreference
};
let appliedTheme;
let currentDocument = null;
let composingSearch = false;
let composingShortcut = false;
let enhancementTicket = 0;
let diagramQueue = Promise.resolve();
const assetLoads = new Map();
let searchCategory='all';
let shortcutState={q:'',group:'all',mods:new Set(),key:''};
let compared=new Set(['commit','freeze','bounce']);
let selectedSignal='source';
let toastTimer,searchTimer;
const icons={home:'<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-7h6v7"/>',topics:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',shortcuts:'<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M5 9h2m2 0h2m2 0h2m2 0h2M5 13h2m2 0h2m2 0h2m2 0h2M7 16h10"/>',workflows:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h9v9M6 9v9h9"/>',saved:'<path d="M6 3h12v18l-6-4-6 4z"/>',tools:'<path d="M3 7h18M3 17h18"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>'};
function icon(name){return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(icons[name]||icons.topics)+'</svg>';}
function e(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function decodeId(value){try{return decodeURIComponent(value);}catch(_){return value;}}
function routeReference(id) { return '#/reference/' + encodeURIComponent(id); }
function routeNote(id){return '#/note/'+encodeURIComponent(id);}
function catName(id){return cats.find(c=>c.id===id)?.name||'其他主題';}
function cleanTitle(n){return String(n.title||n.id).replace(/^Ch\d+[a-z]?\s*[—–-]\s*/i,'');}
function catForChapter(n){return n<=10?'setup':n<=22?'session':n<=27?'record':n<=34?'edit':n<=40?'midi':n<=49?'process':n<=54?'mix':'spatial';}
notes.forEach(n=>{n.chapter=Number(n.chapter);n.category=cats.some(c=>c.id===n.category)?n.category:catForChapter(n.chapter);n.title=n.title||n.id;n.plain=n.plain||n.markdown||n.summary||'';});
function persist(){try {localStorage.setItem(storageKey,JSON.stringify({version:1,saved:[...state.saved],read:[...state.read],recent:state.recent,font:state.font,theme:state.theme,themePreference:state.themePreference}));}catch(_){toast('瀏覽器儲存空間不可用；本次紀錄暫存於此頁。');}updateProgress();}
function toast(text){const el=document.getElementById('toast');el.textContent=text;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2800);}
function applyTheme() {
  const changed = appliedTheme !== undefined && appliedTheme !== state.theme;
  document.documentElement.classList.toggle('dark', state.theme === 'dark');
  document.documentElement.style.setProperty('--reader-size', state.font + 'px');
  document.documentElement.style.setProperty('color-scheme', state.theme);
  document.getElementById('themeButton').setAttribute('aria-label', state.theme === 'dark' ? '切換淺色模式' : '切換深色模式');
  appliedTheme = state.theme;
  if (changed && currentDocument) hydrateReader();
}
function updateProgress(){document.getElementById('sideProgress').innerHTML='<div class="progress-label"><span>閱讀進度</span><span>'+state.read.size+' / '+notes.length+' 篇</span></div><div class="progress-track"><div class="progress-fill" style="width:'+(notes.length?state.read.size/notes.length*100:0)+'%"></div></div>';const c=document.querySelector('[data-saved-count]');if(c)c.textContent=state.saved.size;}
const navItems=[['home','總覽','#/'],['topics','主題探索','#/topics'],['shortcuts','Mac 快捷鍵','#/shortcuts'],['workflows','工作流程','#/workflows'],['tools','互動工具','#/tools'],['saved','我的收藏','#/saved'],['references','功能與術語索引','#/references']];
function renderNav(active){document.getElementById('nav').innerHTML=navItems.map(([id,label,url])=>'<a class="nav-link '+(active===id?'active':'')+'" href="'+url+'" '+(active===id?'aria-current="page"':'')+'>'+icon(id)+'<span>'+label+'</span>'+(id==='saved'?'<span class="nav-count" data-saved-count>'+state.saved.size+'</span>':'')+'</a>').join('');const mobile=document.getElementById('mobileNav');if(mobile){const shortLabels={home:'首頁',topics:'主題',shortcuts:'按鍵',workflows:'流程',tools:'工具',saved:'收藏'};mobile.innerHTML=navItems.filter(([id])=>id!=='references').map(([id,label,url])=>'<a href="'+url+'" aria-label="'+e(label)+'" '+(active===id?'aria-current="page"':'')+'>'+icon(id)+'<span>'+e(shortLabels[id])+'</span></a>').join('');}updateProgress();}
function pageHead(title,desc='',extra=''){return '<div class="page-head"><div><h1>'+e(title)+'</h1>'+(desc?'<p>'+e(desc)+'</p>':'')+'</div>'+extra+'</div>';}
function starButton(n){return '<button class="saved-star '+(state.saved.has(n.id)?'active':'')+'" data-action="bookmark" data-id="'+e(n.id)+'" aria-label="'+(state.saved.has(n.id)?'取消收藏':'收藏')+'：'+e(cleanTitle(n))+'" aria-pressed="'+state.saved.has(n.id)+'">'+(state.saved.has(n.id)?'★':'☆')+'</button>';}
function highlight(s,q){const safe=e(s);const terms=[...new Set(expandSearch(q).flat())].filter(x=>x.length>0).sort((a,b)=>b.length-a.length);if(!terms.length)return safe;const re=new RegExp('('+terms.map(x=>e(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');return safe.replace(re,'<mark>$1</mark>');}
function noteCard(n,q=''){return '<article class="note-card"><span class="chapter-pill">Ch '+String(n.chapter).padStart(2,'0')+'</span><div class="note-main"><h3><a href="'+routeNote(n.id)+'">'+highlight(cleanTitle(n),q)+'</a></h3><p>'+highlight(q?searchExcerpt(n,q):String(n.summary||'').replace(/\*\*/g,'').slice(0,150),q)+'</p>'+(q&&searchTags(n).length?'<p class="search-tags small muted">用途標籤：'+e(searchTags(n).join('／'))+'</p>':'')+'<div class="note-meta"><span>'+e(catName(n.category))+'</span><span>'+Math.max(2,Math.round(String(n.plain).length/700))+' 分鐘閱讀</span>'+(state.read.has(n.id)?'<span class="read-dot">✓ 已讀</span>':'')+'</div></div>'+starButton(n)+'</article>';}
function empty(title,desc,href='#/topics',label='探索全部主題'){return '<div class="empty-state"><span class="empty-icon">⌕</span><h2>'+e(title)+'</h2><p>'+e(desc)+'</p><a class="primary" href="'+href+'">'+e(label)+'</a></div>';}
function categoryCards(){return cats.map(c=>'<a class="category-card" href="#/topics?category='+e(c.id)+'"><span class="category-symbol" aria-hidden="true">'+e(c.symbol)+'</span><span><strong>'+e(c.name)+'</strong><small>'+notes.filter(n=>n.category===c.id).length+' 篇 · '+e(c.english||'')+'</small></span></a>').join('');}
const tasks=[{icon:'◉',name:'開始錄人聲',desc:'接好 Input、安排監聽，留下第一個 Take。',chapters:[6,24,25,27]},{icon:'✂',name:'把鼓剪得更穩',desc:'挑 Take、抓瞬態，處理節奏與接縫。',chapters:[29,33,34,32]},{icon:'☷',name:'進入混音',desc:'理解路由、Insert、Send 與 Automation。',chapters:[50,51,44,53]},{icon:'↗',name:'完成輸出與交付',desc:'選好 Bounce、工程交換與檔案規格。',chapters:[47,54,21,22]},{icon:'⌕',name:'排查操作問題',desc:'沒聲音、按鍵失效，先找到問題層級。',chapters:[3,6,7,24]},{icon:'▤',name:'從零建立工作環境',desc:'認識 Session、視窗、Track 與設定。',chapters:[2,11,12,13]}];
function renderHome(){renderNav('home');main.innerHTML=pageHead('現在想完成什麼？','從工作切入，直接找到觀念、步驟和按鍵。')+'<section class="task-grid" aria-label="按工作任務查找">'+tasks.map((t,i)=>'<button class="task-card" data-action="task" data-task="'+i+'"><span class="task-icon" aria-hidden="true">'+t.icon+'</span><h3>'+t.name+'</h3><p>'+t.desc+'</p><span class="arrow" aria-hidden="true">↗</span></button>').join('')+'</section><div class="dashboard-strip"><span><strong>'+new Set(notes.map(note=>note.chapter)).size+'</strong>章官方文件</span><span><strong>'+notes.length+'</strong>篇中文教學</span><span><strong>'+shortcuts.length+'</strong>筆 Mac 操作</span></div><section class="section"><div class="section-heading"><h2>按主題探索</h2><a href="#/topics">查看全部筆記</a></div><div class="category-grid">'+categoryCards()+'</div></section><div class="section two-col"><section class="panel"><div class="section-heading"><h2>接著讀</h2><a href="#/saved">我的收藏</a></div>'+((state.recent.length?state.recent.map(id=>noteMap.get(id)).filter(Boolean).slice(0,3):['PT-Ch02a-Session與訊號流的基本積木',featureNoteIds.output,featureNoteIds.source].map(id=>noteMap.get(id)).filter(Boolean)).map(n=>'<a class="recent-row" href="'+routeNote(n.id)+'"><span class="chapter-pill">Ch '+n.chapter+'</span><span><strong>'+e(cleanTitle(n))+'</strong><small>'+e(catName(n.category))+(state.read.has(n.id)?' · 已讀':'')+'</small></span></a>').join('')||'<p class="muted">開啟一篇筆記後，這裡會記住你的閱讀位置。</p>')+'</section><section class="panel"><h2>讓觀念動起來</h2><p>Send、Bus、Aux 和 Master Fader 差在哪？點選訊號路由看分工，或比較 Commit、Freeze、Bounce 的用途。</p><div style="margin-top:23px;display:flex;gap:12px;flex-wrap:wrap"><a class="secondary" href="#/tools">打開互動工具</a><a class="secondary" href="#/shortcuts">查 Mac 按鍵</a></div></section></div>';}
function categoryFilter(active,action){return '<div class="filter-bar" aria-label="主題篩選"><button class="chip '+(active==='all'?'active':'')+'" data-action="'+action+'" data-category="all">全部主題</button>'+cats.map(c=>'<button class="chip '+(active===c.id?'active':'')+'" data-action="'+action+'" data-category="'+e(c.id)+'">'+e(c.name)+'</button>').join('')+'</div>';}
function renderReferences() {
  renderNav('references');
  main.innerHTML = pageHead('功能與術語索引', '從功能名稱、中文問題和原文勘誤快速定位。這些索引與教學文章共用搜尋。')
    + '<div class="note-list">' + pages.map(page => referenceCard(page)).join('') + '</div>';
}
function referenceCard(page, query = '') {
  return '<article class="note-card reference-card"><span class="chapter-pill">索引</span><div class="note-main"><h3><a href="'
    + routeReference(page.id) + '">' + highlight(page.title, query) + '</a></h3><p>'
    + highlight(query ? searchExcerpt(page, query) : page.summary, query) + '</p></div></article>';
}
function renderTopics(params){renderNav('topics');const cat=params.get('category')||'all';const chosen=cat==='all'?notes:notes.filter(n=>n.category===cat);main.innerHTML=pageHead(cat==='all'?'主題探索':catName(cat),'按工作領域縮小範圍，再選一篇開始。長章已拆成可一次消化的主題。')+'<p class="reference-entry"><a class="secondary" href="#/references">功能目錄、快速檢索、術語與原文勘誤</a></p>'+categoryFilter(cat,'topic-category')+'<p class="result-count">'+chosen.length+' 篇筆記 · 依原書章節排序</p><div class="note-list">'+chosen.map(n=>noteCard(n)).join('')+'</div>';}
function normalizeSearch(value) {
  return String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, ' ').trim();
}
const searchAliases = [
  { pattern: /^(補錄|punch)$/, terms: ['補錄', 'punch'] },
  { pattern: /^(凍結|freeze)$/, terms: ['凍結', 'freeze'] },
  { pattern: /^(修音|音準|pitch correction)$/, terms: ['修音', '音準', 'melodyne', 'pitch correction', 'elastic pitch'] },
  { pattern: /^(人聲|vocal|vocals)$/, terms: ['人聲', 'vocal', 'vocals'] },
  { pattern: /^(對拍|剪鼓)$/, terms: ['對拍', 'beat detective', '節奏修正'] },
  { pattern: /^(輸出|匯出|bounce)$/, terms: ['輸出', '匯出', 'bounce'] },
  { pattern: /^(卡音|掛音|stuck notes?)$/, terms: ['卡音', '掛音', 'stuck note', 'notes off'] }
];
function expandSearch(query) {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  if (/^(沒有聲音|沒聲音|無聲|no sound)$/.test(normalized)) {
    return [['沒有聲音', '沒聲音', '無聲', 'playback engine', 'i/o setup', 'input monitoring', '監聽']];
  }
  return normalized.split(/\s+/).map(token => {
    const alias = searchAliases.find(item => item.pattern.test(token));
    return alias ? [...new Set([token, ...alias.terms])] : [token];
  });
}
function searchTags(doc) {
  if (doc.id.startsWith('PT-Ch46-')) return ['修音', '人聲', 'vocal', '音準', 'pitch correction'];
  if (doc.id.startsWith('PT-Ch33a-')) return ['人聲', 'vocal', 'comping'];
  return [];
}
function noSoundPriority(doc) {
  const prefixes = ['PT-Ch07a-', 'PT-Ch06a-', 'PT-Ch24b-', 'PT-Ch07b-', 'PT-Ch06b-', 'PT-Ch50a-', 'PT-Ch50d-'];
  return prefixes.findIndex(prefix => doc.id.startsWith(prefix));
}
function rankedDocuments(query, candidates) {
  const groups = expandSearch(query);
  const normalized = normalizeSearch(query);
  if (!groups.length) return [];
  const noSound = /^(沒有聲音|沒聲音|無聲|no sound)$/.test(normalized);
  return candidates.map(doc => {
    const title = normalizeSearch(doc.title);
    const summary = normalizeSearch(doc.summary);
    const plain = normalizeSearch(doc.plain);
    const tags = searchTags(doc).join(' ');
    const priority = noSoundPriority(doc);
    if (noSound && priority < 0 && ![title, summary, plain].some(text => text.includes(normalized))) {
      return { doc, score: 0 };
    }
    let score = 0;
    for (const alternatives of groups) {
      let best = 0;
      for (const token of alternatives) {
        if (title.includes(token)) best = Math.max(best, 90);
        if (tags.includes(token)) best = Math.max(best, 45);
        if (summary.includes(token)) best = Math.max(best, 35);
        if (plain.includes(token)) best = Math.max(best, 8);
      }
      // Every user term must match one of its own alternatives.
      if (!best && !(noSound && priority >= 0)) return { doc, score: 0 };
      score += best;
    }
    if (title.includes(normalized)) score += 40;
    if (noSound && priority >= 0) score += 220 - priority * 18;
    if (pageMap.has(doc.id)) score *= 0.8;
    return { doc, score };
  }).filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || (a.doc.chapter || 999) - (b.doc.chapter || 999) || a.doc.id.localeCompare(b.doc.id))
    .map(item => item.doc);
}
function rankNotes(query) { return rankedDocuments(query, notes); }
function rankDocuments(query) { return rankedDocuments(query, documents); }
function searchExcerpt(doc, query) {
  const plain = String(doc.plain || doc.summary || '').replace(/\s+/g, ' ').trim();
  const normalized = normalizeSearch(plain);
  const terms = expandSearch(query).flat().sort((a, b) => b.length - a.length);
  const positions = terms.map(term => normalized.indexOf(term)).filter(index => index >= 0);
  if (!positions.length) return String(doc.summary || plain).slice(0, 170);
  const start = Math.max(0, Math.min(...positions) - 48);
  return (start ? '…' : '') + plain.slice(start, start + 190) + (start + 190 < plain.length ? '…' : '');
}
function setSearchRoute(q){const dest='#/search?q='+encodeURIComponent(q);if(currentRoute().path==='/search')history.replaceState(null,'',dest);else history.pushState(null,'',dest);renderSearch(q);}
function renderSearch(query) {
  renderNav('');
  const found = rankDocuments(query);
  const filtered = searchCategory === 'all' ? found : found.filter(doc => doc.category === searchCategory);
  main.innerHTML = pageHead(query ? '搜尋「' + query + '」' : '搜尋全部內容', '輸入中文需求或英文功能名稱，例如「修音 人聲」、「Clip Gain」或「沒有聲音」。')
    + categoryFilter(searchCategory, 'search-category')
    + (query ? '<p class="result-count">找到 ' + filtered.length + ' 篇相關內容' + (searchCategory !== 'all' ? ' · ' + e(catName(searchCategory)) : '') + '</p>' : '')
    + (query && filtered.length ? '<div class="note-list">' + filtered.map(doc => pageMap.has(doc.id) ? referenceCard(doc, query) : noteCard(doc, query)).join('') + '</div>'
      : empty(query ? '還沒有找到符合的內容' : '你正在找什麼？', query ? '試試更短的功能名稱，或切回全部主題。' : '可搜尋全文、功能索引、術語與勘誤。'));
}
function renderSaved(){renderNav('saved');const saved=notes.filter(n=>state.saved.has(n.id));main.innerHTML=pageHead('我的收藏','把常回查的操作放在一起。收藏與閱讀進度只留在目前瀏覽器。','<button class="secondary" data-action="settings">備份學習紀錄</button>')+(saved.length?'<p class="result-count">'+saved.length+' 篇收藏 · 已讀 '+saved.filter(n=>state.read.has(n.id)).length+' 篇</p><div class="note-list">'+saved.map(n=>noteCard(n)).join('')+'</div>':empty('把第一篇常用筆記收進來','在筆記卡片或閱讀頁按下星號，下次就能直接回到這裡。'));}
function fallbackHtml(markdown){return '<p>'+e(markdown||'').replace(/\n/g,'<br>')+'</p>';}
function readerContents(doc) {
  return (doc.headings || []).filter(heading => heading.level === 2).map(heading =>
    '<a href="#' + e(heading.id) + '" data-action="scroll-heading" data-heading="' + e(heading.id) + '">' + e(heading.text) + '</a>'
  ).join('') || '<span class="small muted">閱讀正文中的各個主題。</span>';
}
function renderReference(id) {
  const page = pageMap.get(id);
  renderNav('references');
  if (!page) {
    main.innerHTML = empty('找不到這份索引', '請回到功能與術語索引重新開啟。', '#/references', '查看全部索引');
    return;
  }
  renderDocument(page, true);
}
function renderReader(id) {
  const note = noteMap.get(id);
  renderNav('topics');
  if (!note) {
    main.innerHTML = empty('找不到這篇文章', '請從主題探索或搜尋重新開啟。');
    return;
  }
  state.recent = [id, ...state.recent.filter(value => value !== id)].slice(0, 12);
  persist();
  renderDocument(note, false);
}
function renderDocument(doc, reference) {
  currentDocument = doc;
  const title = reference ? doc.title : cleanTitle(doc);
  const i = notes.indexOf(doc), previous = notes[i - 1], next = notes[i + 1];
  const contents = readerContents(doc);
  const actions = '<button class="font-button" data-action="font-smaller" aria-label="縮小閱讀字級">A−</button>'
    + '<button class="font-button" data-action="font-larger" aria-label="放大閱讀字級">A＋</button>'
    + (reference ? '' : '<button class="secondary" data-action="bookmark" data-id="' + e(doc.id) + '" aria-pressed="' + state.saved.has(doc.id) + '">' + (state.saved.has(doc.id) ? '★ 已收藏' : '☆ 收藏') + '</button>'
      + '<button class="' + (state.read.has(doc.id) ? 'secondary' : 'primary') + '" data-action="read" data-id="' + e(doc.id) + '" aria-pressed="' + state.read.has(doc.id) + '">' + (state.read.has(doc.id) ? '✓ 已讀' : '標記已讀') + '</button>');
  main.innerHTML = '<div class="reader-toolbar"><a href="' + (reference ? '#/references' : '#/topics?category=' + e(doc.category)) + '">‹ ' + e(reference ? '功能與術語索引' : catName(doc.category)) + '</a><div class="reader-actions">' + actions + '</div></div>'
    + '<div class="reader-layout"><div><article class="reader-paper"><header class="reader-header"><span class="chapter-flag">' + (reference ? '功能參考' : 'Chapter ' + String(doc.chapter).padStart(2, '0') + ' · ' + e(catName(doc.category))) + '</span><h1>' + e(title) + '</h1><div class="note-meta"><span>依 Pro Tools 2023.3 文件</span><span>' + Math.max(2, Math.round(String(doc.plain).length / 700)) + ' 分鐘閱讀</span></div></header>'
    + '<details class="mobile-reader-toc"><summary>本篇段落</summary>' + contents + '</details><div class="reader-content" id="readerContent">' + (doc.html || fallbackHtml(doc.summary)) + '</div>'
    + (reference ? '' : '<div class="reader-finish"><span>把這篇放進自己的工作流程。</span><button class="' + (state.read.has(doc.id) ? 'secondary' : 'primary') + '" data-action="read" data-id="' + e(doc.id) + '">' + (state.read.has(doc.id) ? '✓ 已讀完這篇' : '讀完了，標記已讀') + '</button></div>')
    + '</article>' + (reference ? '' : '<nav class="reader-pagination" aria-label="前後篇">' + (previous ? '<a href="' + routeNote(previous.id) + '"><span>上一篇 · Ch ' + previous.chapter + '</span>' + e(cleanTitle(previous)) + '</a>' : '<span></span>') + (next ? '<a href="' + routeNote(next.id) + '"><span>下一篇 · Ch ' + next.chapter + '</span>' + e(cleanTitle(next)) + '</a>' : '') + '</nav>')
    + '</div><aside class="reader-toc" aria-label="本篇段落"><strong>本篇段落</strong>' + contents + '</aside></div>';
  hydrateReader();
}
function loadScript(src, ready) {
  if (ready()) return Promise.resolve();
  if (assetLoads.has(src)) return assetLoads.get(src);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => ready() ? resolve() : reject(new Error('套件載入後未提供預期功能。'));
    script.onerror = () => reject(new Error('無法載入 ' + src));
    document.head.append(script);
  });
  assetLoads.set(src, promise);
  promise.catch(() => assetLoads.delete(src));
  return promise;
}
function loadStyle(href) {
  if (assetLoads.has(href)) return assetLoads.get(href);
  const promise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = resolve;
    link.onerror = () => reject(new Error('無法載入公式樣式。'));
    document.head.append(link);
  });
  assetLoads.set(href, promise);
  promise.catch(() => assetLoads.delete(href));
  return promise;
}
function diagramStatus(block, text) {
  const status = block.querySelector('.diagram-status');
  if (status) status.textContent = text;
}
function prepareDiagrams(root) {
  root.querySelectorAll('pre code.language-mermaid').forEach(code => {
    const figure = document.createElement('figure');
    figure.className = 'diagram-block';
    figure._diagramSource = code.textContent;
    const canvas = document.createElement('div');
    canvas.className = 'mermaid';
    const status = document.createElement('p');
    status.className = 'diagram-status small muted';
    status.setAttribute('role', 'status');
    status.textContent = '正在載入流程圖…';
    const source = document.createElement('details');
    source.className = 'diagram-source';
    const summary = document.createElement('summary');
    summary.textContent = '查看流程圖原始碼';
    const pre = document.createElement('pre');
    pre.textContent = code.textContent;
    source.append(summary, pre);
    figure.append(canvas, status, source);
    code.parentElement.replaceWith(figure);
  });
}
function hydrateReader() {
  const root = document.getElementById('readerContent');
  if (!root || !currentDocument) return;
  const ticket = ++enhancementTicket;
  prepareDiagrams(root);
  const blocks = [...root.querySelectorAll('.diagram-block')];
  if (blocks.length) {
    diagramQueue = diagramQueue.then(async () => {
      if (ticket !== enhancementTicket || root.isConnected === false) return;
      try {
        await loadScript('vendor/mermaid.min.js', () => Boolean(window.mermaid));
        if (ticket !== enhancementTicket || root.isConnected === false) return;
        window.mermaid.initialize({ startOnLoad: false, theme: state.theme === 'dark' ? 'dark' : 'default', securityLevel: 'strict' });
        for (const block of blocks) {
          if (ticket !== enhancementTicket || root.isConnected === false) return;
          const canvas = block.querySelector('.mermaid');
          canvas.removeAttribute('data-processed');
          canvas.textContent = block._diagramSource;
          try {
            await window.mermaid.run({ nodes: [canvas] });
            diagramStatus(block, '');
          } catch (error) {
            canvas.textContent = '';
            diagramStatus(block, '流程圖無法顯示，請展開原始碼；可重新載入文章重試。');
            block.querySelector('.diagram-source').open = true;
          }
        }
      } catch (error) {
        for (const block of blocks) {
          diagramStatus(block, '流程圖套件未能載入，原始碼仍可閱讀。請確認網站檔案完整後重試。');
          block.querySelector('.diagram-source').open = true;
        }
      }
    });
  }
  const needsMath = Number(currentDocument.mathCount || 0) > 0 || /\$\$|\$[^$\n]+\$/.test(root.textContent || '');
  if (needsMath && !root.querySelector('.katex')) {
    Promise.all([
      loadStyle('vendor/katex/katex.min.css'),
      loadScript('vendor/katex/katex.min.js', () => Boolean(window.katex))
        .then(() => loadScript('vendor/katex/contrib/auto-render.min.js', () => Boolean(window.renderMathInElement)))
    ]).then(() => {
      if (root.isConnected === false) return;
      window.renderMathInElement(root, {
        delimiters: [{ left: '$$', right: '$$', display: true }, { left: '$', right: '$', display: false }],
        throwOnError: false
      });
    }).catch(() => {
      if (root.isConnected === false) return;
      const notice = document.createElement('p');
      notice.className = 'enhancement-notice';
      notice.setAttribute('role', 'status');
      notice.textContent = '公式套件未能載入，以下保留原始公式文字。';
      root.prepend(notice);
    });
  }
  root.querySelectorAll('img').forEach(image => {
    image.loading = 'lazy';
    image.addEventListener('error', () => { image.alt = '圖解無法載入：' + image.alt; });
  });
  root.querySelectorAll('a[href^="#/"]').forEach(link => link.removeAttribute('target'));
}
function shortcutGroups(){return [...new Set(shortcuts.map(x=>x.group).filter(Boolean))];}
function renderShortcuts(){renderNav('shortcuts');main.innerHTML=pageHead('Mac 快捷鍵','用情境找功能，也可以直接點按鍵縮小結果。主鍵盤與 Numeric Keypad 的條件各自列明。')+'<details class="keyboard-panel keyboard-disclosure" open><summary>按鍵篩選器 <span>展開／收合虛擬 Mac 鍵盤</span></summary><div class="keyboard-top"><div><h2>試著選一組按鍵</h2><p>修飾鍵可複選；再選一個字母。這是篩選器，不會操作你的 Pro Tools。</p></div><button class="text-link" data-action="clear-keys">清除按鍵</button></div><div id="virtualKeyboard">'+[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M'],['Tab','Space','Return','F12']].map(row=>'<div class="key-row">'+row.map(k=>'<button class="key '+(shortcutState.key===k?'active':'')+'" data-action="filter-key" data-key="'+k+'" aria-pressed="'+(shortcutState.key===k)+'">'+k+'</button>').join('')+'</div>').join('')+'<div class="key-row">'+[['⌃','Control'],['⌥','Option'],['⇧','Shift'],['⌘','Command']].map(([k,label])=>'<button class="key modifier '+(shortcutState.mods.has(k)?'active':'')+'" data-action="filter-mod" data-key="'+k+'" aria-pressed="'+shortcutState.mods.has(k)+'">'+k+' '+label+'</button>').join('')+'</div></div></details><div class="shortcut-controls"><input class="input-control" id="shortcutQuery" type="search" placeholder="搜尋功能、中文用途、按鍵或 K 編號…" aria-label="搜尋快捷鍵" value="'+e(shortcutState.q)+'"><select class="input-control" id="shortcutGroup" aria-label="快捷鍵情境"><option value="all">全部工作情境</option>'+shortcutGroups().map(g=>'<option value="'+e(g)+'" '+(shortcutState.group===g?'selected':'')+'>'+e(g)+'</option>').join('')+'</select></div><div id="shortcutResults"></div><p class="small muted" style="margin-top:18px">⌘ Command · ⌥ Option · ⌃ Control · ⇧ Shift。Num 代表獨立數字鍵盤。自訂鍵位與 OS 衝突可能改變實際行為；此表依官方文件核對，未宣稱逐鍵實機測試。</p>';renderShortcutResults();}
function hasKey(value,key){let k=String(value);if(['Tab','Space','Return','F12'].includes(key))return k.toLowerCase().includes(key.toLowerCase());k=k.replace(/Space|Return|Enter|Arrow|Tab|Num|Option|Command|Control|Shift|F\d+/gi,'');return new RegExp('(^|[^A-Z])'+key+'([^A-Z]|$)').test(k.toUpperCase());}
function renderShortcutResults(){const el=document.getElementById('shortcutResults');if(!el)return;const q=shortcutState.q.trim().toLowerCase();const found=shortcuts.filter(k=>(shortcutState.group==='all'||k.group===shortcutState.group)&&(!q||[k.id,k.action,k.key,k.context,k.group].join(' ').toLowerCase().includes(q))&&[...shortcutState.mods].every(m=>String(k.key).includes(m))&&(!shortcutState.key||hasKey(k.key,shortcutState.key)));el.innerHTML='<p class="result-count">'+found.length+' / '+shortcuts.length+' 筆操作'+(shortcutState.mods.size||shortcutState.key?' · 已套用按鍵篩選':'')+'</p>'+(found.length?'<div class="shortcut-table-wrap"><table class="shortcut-table"><thead><tr><th scope="col">功能／用途</th><th scope="col">Mac 按鍵</th><th scope="col">必要條件</th><th scope="col">來源</th></tr></thead><tbody>'+found.map(k=>'<tr><td data-label="功能／用途"><strong>'+e(k.action)+'</strong><span class="shortcut-id">'+e(k.id)+' · '+e(k.group)+'</span></td><td data-label="Mac 按鍵"><span class="key-display">'+e(k.key)+'</span><button class="copy-button" data-action="copy-key" data-id="'+e(k.id)+'" aria-label="複製 '+e(k.action)+' 的按鍵">複製</button></td><td data-label="必要條件">'+e(k.context)+'</td><td data-label="來源"><a class="source-link" href="https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2023.3.pdf#page='+Number(k.pdfPage||Number(k.sourcePage)+5)+'" target="_blank" rel="noopener">S'+e(k.sourcePage||'')+' · PDF '+e(k.pdfPage||Number(k.sourcePage)+5)+' ↗</a></td></tr>').join('')+'</tbody></table></div>':'<div class="empty-state"><span class="empty-icon">⌕</span><h2>這組條件沒有符合的操作</h2><p>清除部分修飾鍵、切換工作情境，或用英文功能名稱搜尋。</p><button class="primary" data-action="reset-shortcuts">清除全部篩選</button></div>');document.querySelectorAll('[data-action="filter-key"]').forEach(b=>{const on=b.dataset.key===shortcutState.key;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});document.querySelectorAll('[data-action="filter-mod"]').forEach(b=>{const on=shortcutState.mods.has(b.dataset.key);b.classList.toggle('active',on);b.setAttribute('aria-pressed',on);});}
const featureNoteIds = {
  source: 'PT-Ch50a-混音Track與訊號流', send: 'PT-Ch50b-Sends與混音視窗操作',
  bus: 'PT-Ch06b-Bus監聽與特殊路徑', aux: 'PT-Ch50c-Submix效果回傳與耳機混音',
  master: 'PT-Ch50a-混音Track與訊號流', output: 'PT-Ch06a-I-O與Path地圖',
  commit: 'PT-Ch47a-Commit固定處理與交接', freeze: 'PT-Ch47b-Freeze與TrackBounce的使用時機',
  bounce: 'PT-Ch47b-Freeze與TrackBounce的使用時機', monitoring: 'PT-Ch24b-Input-Monitoring與Latency',
  playbackEngine: 'PT-Ch07a-PlaybackEngine與低延遲', troubleshooting: 'PT-Ch07b-HardwareClock與效能診斷',
  ...(D.featureNoteIds || {})
};
const taskNoteIds = [
  [featureNoteIds.output, featureNoteIds.monitoring, 'PT-Ch25a-Audio錄音與補錄範圍', 'PT-Ch25b-Loop-Takes與數位錄音', 'PT-Ch27a-QuickPunch與TrackPunch'],
  ['PT-Ch29a-Edit Mode與Grid的選擇', 'PT-Ch33a-用Playlist保留版本與合成Take', 'PT-Ch34a-BeatDetective偵測與TempoMap', 'PT-Ch34b-多軌鼓對拍與接縫平滑', 'PT-Ch32a-Fade形狀與Crossfade判斷'],
  [featureNoteIds.source, featureNoteIds.send, featureNoteIds.aux, 'PT-Ch51a-PlugInInsert與SideChain', 'PT-Ch44a-ClipGain與音量整理', 'PT-Ch53a-Automation模式與資料層'],
  [featureNoteIds.commit, featureNoteIds.freeze, 'PT-Ch54-Mixdown與交付檔案', 'PT-Ch21c-AAF-OMF與交付文件', 'PT-Ch22-媒體管理與跨版本相容性'],
  [featureNoteIds.playbackEngine, featureNoteIds.output, featureNoteIds.monitoring, featureNoteIds.troubleshooting, featureNoteIds.bus],
  ['PT-Ch02a-Session與訊號流的基本積木', 'PT-Ch11a-建立Session與媒體格式', 'PT-Ch11b-儲存備份與工程交接', 'PT-Ch12a-主要視窗與Transport', 'PT-Ch13a-Track類型與Metering', 'PT-Ch13b-建立編輯與管理Track']
];
function defaultWorkflows() {
  return tasks.map((task, index) => ({ title: task.name, description: task.desc, noteIds: taskNoteIds[index] }));
}
function renderWorkflows(taskIndex) {
  renderNav('workflows');
  const list = taskIndex !== null ? [defaultWorkflows()[taskIndex]].filter(Boolean) : D.workflows?.length ? D.workflows : defaultWorkflows();
  main.innerHTML = pageHead(taskIndex !== null ? list[0]?.title || '工作流程' : '從任務到完成', '每一步連到對應分篇，依工作順序建立完整觀念。', taskIndex !== null ? '<a class="secondary" href="#/workflows">全部工作流程</a>' : '')
    + '<div class="workflow-grid">' + list.map(workflow => '<section class="workflow-card"><h2>' + e(workflow.title) + '</h2><p>' + e(workflow.description) + '</p><ol class="workflow-steps">'
      + (workflow.noteIds || []).map(id => {
        const note = noteMap.get(id);
        return note ? '<li><a href="' + routeNote(note.id) + '"><strong>Ch ' + note.chapter + '</strong> ' + e(cleanTitle(note)) + '</a></li>' : '';
      }).join('') + '</ol></section>').join('') + '</div>';
}
const signalData={source:{title:'Audio Source：訊號從哪裡開始',text:'Audio Track 可以播放磁碟裡的素材，或在對應監聽狀態下處理 Input。主 Output 路徑與 Send 支線可以各自安排；不是加了 Send 就取消主輸出。',chapter:50},send:{title:'Send：另外送出一份訊號',text:'Send 把 Track 的 Audio 額外送到 Bus 或硬體 Output。它有自己的電平與 pre／post-fader 條件，常用來建立平行效果或監聽混音。',chapter:50},bus:{title:'Bus：軟體裡的訊號路徑',text:'Bus 讓 Track 之間交換或匯總訊號。Bus 本身不是一條會自動長出 Plug-In 的 Audio Track；要接收與處理它，通常還需要 Auxiliary Input 等目的地。',chapter:6},aux:{title:'Auxiliary Input：接收、處理、回送',text:'Aux 的 Input 可來自內部 Bus 或硬體。它常用作 Reverb Return 或 Submix，再把處理後的聲音送到 Output。Routing Folder 也提供相同的訊號路由選項。',chapter:50},master:{title:'Master Fader：控制指定路徑',text:'Master Fader 控制所指派 Output／Bus Path 的電平。圖中的虛線表示控制關係；不要把它理解成另一條有獨立 Input 的 Aux。Master Fader 的 Inserts 為 post-fader。',chapter:50},output:{title:'Output：送到實際目的地',text:'軟體 Output Path 還要在 I/O Setup 正確映射到硬體。Meter 在動但沒有聲音時，主輸出、Bus 對應與真正的監聽設備都需要分層檢查。',chapter:6}};
function signalDetail() {
  const item = signalData[selectedSignal];
  const note = noteMap.get(featureNoteIds[selectedSignal]);
  return '<h3>' + item.title + '</h3><p>' + item.text + '</p>'
    + (note ? '<a href="' + routeNote(note.id) + '">' + e(cleanTitle(note)) + '：完整解說</a>' : '');
}
const comparison={commit:{name:'Commit',purpose:'把處理結果建立為新的 Track',result:'Render 到新 Track，依 dialog 決定其他資料及來源 Track 的處置。',edit:'新 Audio 可後續編輯；保留來源與否由所選設定決定。',use:'需要可交接、可繼續編輯的處理後 Track。'},freeze:{name:'Freeze',purpose:'暫時減少即時處理負擔',result:'以 Render Audio 代替部分或全部即時處理；同一 Track 可 Unfreeze。',edit:'受凍結限制的素材要先 Unfreeze；Volume、Pan 等不全部寫死。',use:'先省 CPU，之後還要回頭修改樂器或 Plug-In。'},bounce:{name:'Bounce Track',purpose:'把選定 Track 輸出成音訊檔',result:'輸出磁碟 Audio file，適合個別 Track 或 Stem 交付。',edit:'是輸出工作，不是與 Freeze 相同的暫時處理狀態。',use:'需要將 Track 的結果交給別人或帶到其他環境。'}};
function renderCompare(){const el=document.getElementById('compareTable');if(!el)return;const selected=[...compared].map(k=>comparison[k]);const rows=[['目的','purpose'],['產生什麼','result'],['修改方式','edit'],['適合情境','use']];el.innerHTML='<div class="compare-overflow"><table class="compare-table"><thead><tr><th scope="col">比較項目</th>'+selected.map(x=>'<th scope="col">'+x.name+'</th>').join('')+'</tr></thead><tbody>'+rows.map(([title,key])=>'<tr><td>'+title+'</td>'+selected.map(x=>'<td>'+x[key]+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';document.querySelectorAll('[data-action="compare"]').forEach(b=>{b.classList.toggle('active',compared.has(b.dataset.kind));b.setAttribute('aria-pressed',compared.has(b.dataset.kind));});}
function renderTools(){renderNav('tools');main.innerHTML=pageHead('讓功能差異看得見','先動手分辨訊號與控制，再回到章節看完整操作。')+'<div class="tools-grid"><section class="panel"><h2>訊號路由探索器</h2><p>點一個節點，看它負責什麼。實線為 Audio 路徑，虛線為 Master Fader 的控制關係。</p><p class="signal-hint small muted">左右滑動路由圖，再點選節點查看說明。</p><div class="signal-scroll" role="region" aria-label="訊號路由圖，可左右捲動" tabindex="0"><div class="signal-board"><svg viewBox="0 0 720 330" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 7 3.5 0 7z" style="fill:var(--blue);stroke:none"/></marker></defs><path d="M135 155H170V51H210" marker-end="url(#arrow)"/><path d="M330 51H390" marker-end="url(#arrow)"/><path d="M510 51H570" marker-end="url(#arrow)"/><path d="M630 82V220" marker-end="url(#arrow)"/><path d="M135 168H170V300H630V282" marker-end="url(#arrow)"/><path class="control-path" d="M510 251H570" marker-end="url(#arrow)"/><text x="235" y="292">Main Output path</text><text x="512" y="240">控制</text></svg>'+[['source',2,38,'Audio Source'],['send',29,6,'Send'],['bus',54,6,'Bus'],['aux',79,6,'Auxiliary Input'],['master',54,67,'Master Fader'],['output',79,67,'Output Path']].map(([id,l,t,label])=>'<button class="signal-node '+(selectedSignal===id?'active':'')+'" data-action="signal" data-node="'+id+'" style="left:'+l+'%;top:'+t+'%" aria-pressed="'+(selectedSignal===id)+'">'+label+'</button>').join('')+'</div></div><div class="signal-detail" id="signalDetail">'+signalDetail()+'</div><p class="small muted" style="margin-top:18px">這是功能角色示意，不是所有 Session 都必須採用的接線配置；Send、Aux 與主輸出可以有其他安排。</p></section><section class="panel"><h2>Commit、Freeze 還是 Bounce？</h2><p>選擇要並排比較的功能。它們都能產生 Audio，但目的與可回頭修改的方式不同。</p><div class="compare-options">'+Object.entries(comparison).map(([id,x])=>'<button class="chip '+(compared.has(id)?'active':'')+'" data-action="compare" data-kind="'+id+'" aria-pressed="'+compared.has(id)+'">'+x.name+'</button>').join('')+'</div><div id="compareTable"></div><p class="small muted" style="margin-top:18px">依原書 Ch47 整理。完整 Mix 輸出另見 Ch54 的 Bounce Mix。</p><div style="margin-top:15px">'+[featureNoteIds.commit,featureNoteIds.freeze,'PT-Ch54-Mixdown與交付檔案'].map(id=>{const n=noteMap.get(id);return n?'<a class="secondary" style="margin-right:8px" href="'+routeNote(n.id)+'">'+e(cleanTitle(n))+'</a>':'';}).join('')+'</div></section></div>';renderCompare();}
function currentRoute(){const hash=location.hash.slice(1)||'/';const [base,anchor='']=hash.split('#');const [path,query='']=base.split('?');return {path,params:new URLSearchParams(query),anchor:decodeId(anchor)};}
function closeMenu(){const sidebar=document.getElementById('sidebar');const wasOpen=sidebar.classList.contains('open');sidebar.classList.remove('open');sidebar.inert=window.matchMedia('(max-width:760px)').matches;document.getElementById('backdrop').classList.remove('open');document.querySelector('[data-action="menu"]').setAttribute('aria-expanded','false');document.querySelector('.workspace').inert=false;document.getElementById('mobileNav').inert=false;document.body.classList.remove('menu-open');if(wasOpen&&window.matchMedia('(max-width:760px)').matches)document.querySelector('[data-action="menu"]').focus();}
function render() {
  const { path, params, anchor } = currentRoute();
  closeMenu();
  currentDocument = null;
  enhancementTicket++;
  if (path !== '/search') searchInput.value = '';
  if (path.startsWith('/note/')) renderReader(decodeId(path.slice(6)));
  else if (path.startsWith('/reference/')) renderReference(decodeId(path.slice(11)));
  else if (path === '/references') renderReferences();
  else if (path === '/topics') renderTopics(params);
  else if (path === '/search') { searchInput.value = params.get('q') || ''; renderSearch(params.get('q') || ''); }
  else if (path === '/shortcuts') renderShortcuts();
  else if (path === '/workflows') renderWorkflows(params.has('task') ? Number(params.get('task')) : null);
  else if (path === '/saved') renderSaved();
  else if (path === '/tools') renderTools();
  else renderHome();
  window.scrollTo({ top: 0, behavior: 'instant' });
  main.focus({ preventScroll: true });
  const doc = path.startsWith('/reference/') ? pageMap.get(decodeId(path.slice(11))) : noteMap.get(decodeId(path.slice(6)));
  if (anchor) {
    let target = document.getElementById(anchor);
    if (!target) {
      const heading = (doc?.headings || []).find(item => item.text === anchor);
      if (heading) target = document.getElementById(heading.id);
    }
    if (target) target.scrollIntoView({ block: 'start' });
  }
  document.title = (doc ? (pageMap.has(doc.id) ? doc.title : cleanTitle(doc)) : navItems.find(item => item[2].slice(1) === path)?.[1] || '總覽') + ' · Pro Tools 工作台';
}
function openSettings(){document.getElementById('settingsStats').innerHTML='<span><strong>'+state.saved.size+'</strong>篇收藏</span><span><strong>'+state.read.size+'</strong>篇已讀</span><span><strong>'+Math.round((notes.length?state.read.size/notes.length:0)*100)+'%</strong>閱讀進度</span>';document.getElementById('settingsDialog').showModal();}
async function copyText(text){try{if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(text);else{const el=document.createElement('textarea');el.value=text;el.style.position='fixed';el.style.opacity='0';document.body.append(el);el.select();if(!document.execCommand('copy'))throw new Error('copy');el.remove();}toast('已複製按鍵：'+text);}catch(_){toast('複製未成功，請直接選取表格中的按鍵文字。');}}
function rerenderPreservingScroll() {
  const y = window.scrollY;
  render();
  window.scrollTo({ top: y, behavior: 'instant' });
}
function handleClick(event) {
  const headingLink = event.target.closest('#readerContent a[href^="#"]');
  if (headingLink && !headingLink.getAttribute('href').startsWith('#/')) {
    event.preventDefault();
    const raw = decodeId(headingLink.getAttribute('href').slice(1));
    let target = document.getElementById(raw);
    if (!target) target = [...document.querySelectorAll('#readerContent h1,#readerContent h2,#readerContent h3')].find(heading => heading.textContent.trim() === raw);
    if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    return;
  }
  const control = event.target.closest('[data-action]');
  if (!control) return;
  const { action, id } = control.dataset;
  switch (action) {
    case 'menu': {
      const on = document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('backdrop').classList.toggle('open', on);
      control.setAttribute('aria-expanded', on);
      document.getElementById('sidebar').inert = !on;
      document.querySelector('.workspace').inert = on;
      document.getElementById('mobileNav').inert = on;
      document.body.classList.toggle('menu-open', on);
      if (on) document.querySelector('.drawer-close').focus();
      break;
    }
    case 'close-menu':
      closeMenu();
      document.querySelector('[data-action="menu"]').focus();
      break;
    case 'theme':
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      state.themePreference = state.theme;
      applyTheme();
      persist();
      break;
    case 'help': document.getElementById('helpDialog').showModal(); break;
    case 'settings': openSettings(); break;
    case 'close-dialog': document.getElementById('settingsDialog').close(); break;
    case 'close-help': document.getElementById('helpDialog').close(); break;
    case 'task': location.hash = '/workflows?task=' + control.dataset.task; break;
    case 'topic-category': location.hash = '/topics' + (control.dataset.category === 'all' ? '' : '?category=' + control.dataset.category); break;
    case 'search-category':
      searchCategory = control.dataset.category;
      renderSearch(currentRoute().params.get('q') || '');
      break;
    case 'bookmark': {
      if (!noteMap.has(id)) break;
      const adding = !state.saved.has(id);
      if (adding) state.saved.add(id); else state.saved.delete(id);
      persist();
      toast(adding ? '已加入收藏' : '已取消收藏');
      rerenderPreservingScroll();
      break;
    }
    case 'read': {
      if (!noteMap.has(id)) break;
      if (state.read.has(id)) state.read.delete(id); else state.read.add(id);
      persist();
      rerenderPreservingScroll();
      toast(state.read.has(id) ? '已標記為讀完' : '已取消已讀標記');
      break;
    }
    case 'font-smaller':
      state.font = Math.max(16, state.font - 1);
      applyTheme(); persist(); break;
    case 'font-larger':
      state.font = Math.min(24, state.font + 1);
      applyTheme(); persist(); break;
    case 'scroll-heading': {
      event.preventDefault();
      const target = document.getElementById(control.dataset.heading);
      if (target) target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
      break;
    }
    case 'filter-key':
      shortcutState.key = shortcutState.key === control.dataset.key ? '' : control.dataset.key;
      renderShortcutResults(); break;
    case 'filter-mod':
      if (shortcutState.mods.has(control.dataset.key)) shortcutState.mods.delete(control.dataset.key);
      else shortcutState.mods.add(control.dataset.key);
      renderShortcutResults(); break;
    case 'clear-keys':
      shortcutState.mods.clear(); shortcutState.key = '';
      renderShortcutResults(); break;
    case 'reset-shortcuts':
      shortcutState = { q: '', group: 'all', mods: new Set(), key: '' };
      renderShortcuts(); break;
    case 'copy-key': {
      const shortcut = shortcuts.find(item => item.id === id);
      if (shortcut) copyText(shortcut.key);
      break;
    }
    case 'signal':
      if (!signalData[control.dataset.node]) break;
      selectedSignal = control.dataset.node;
      document.getElementById('signalDetail').innerHTML = signalDetail();
      document.querySelectorAll('[data-action="signal"]').forEach(button => {
        button.classList.toggle('active', button.dataset.node === selectedSignal);
        button.setAttribute('aria-pressed', button.dataset.node === selectedSignal);
      });
      break;
    case 'compare':
      if (!comparison[control.dataset.kind]) break;
      if (compared.has(control.dataset.kind)) {
        if (compared.size === 1) { toast('至少保留一個比較項目。'); break; }
        compared.delete(control.dataset.kind);
      } else compared.add(control.dataset.kind);
      renderCompare(); break;
    case 'export': {
      const payload = { version: 1, exportedAt: new Date().toISOString(), saved: [...state.saved], read: [...state.read], recent: state.recent, font: state.font, theme: state.theme, themePreference: state.themePreference };
      const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pro-tools-learning-progress.json';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 500);
      toast('已匯出學習紀錄。');
      break;
    }
  }
}
document.addEventListener('click', handleClick);

function scheduleSearch() {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    if (!composingSearch) setSearchRoute(searchInput.value.trim());
  }, 180);
}
searchInput.addEventListener('compositionstart', () => {
  composingSearch = true;
  clearTimeout(searchTimer);
});
searchInput.addEventListener('compositionend', () => {
  composingSearch = false;
  scheduleSearch();
});
searchInput.addEventListener('input', event => {
  if (event.isComposing || composingSearch) return;
  scheduleSearch();
});
searchInput.addEventListener('keydown', event => {
  if (event.isComposing || composingSearch || event.keyCode === 229) return;
  if (event.key === 'Enter') {
    clearTimeout(searchTimer);
    setSearchRoute(searchInput.value.trim());
    main.focus({ preventScroll: true });
  }
});
document.addEventListener('compositionstart', event => {
  if (event.target.id === 'shortcutQuery') composingShortcut = true;
});
document.addEventListener('compositionend', event => {
  if (event.target.id !== 'shortcutQuery') return;
  composingShortcut = false;
  shortcutState.q = event.target.value;
  renderShortcutResults();
});
document.addEventListener('input', event => {
  if (event.target.id === 'shortcutQuery' && !event.isComposing && !composingShortcut) {
    shortcutState.q = event.target.value;
    renderShortcutResults();
  }
});
document.addEventListener('change', event => {
  if (event.target.id === 'shortcutGroup') {
    shortcutState.group = event.target.value;
    renderShortcutResults();
  }
});
document.getElementById('importProgress').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('檔案超過 2 MB，請選擇此工作台匯出的 JSON。');const p=JSON.parse(await file.text());if(p.version!==1||!Array.isArray(p.saved)||!Array.isArray(p.read))throw new Error('不是工作台支援的學習紀錄格式。');for(const id of p.saved)if(noteMap.has(id))state.saved.add(id);for(const id of p.read)if(noteMap.has(id))state.read.add(id);if(Array.isArray(p.recent))state.recent=[...new Set([...state.recent,...p.recent.filter(id=>noteMap.has(id))])].slice(0,12);if(Number.isFinite(Number(p.font)))state.font=Math.min(24,Math.max(16,Number(p.font)));if(p.themePreference==='system'){state.themePreference='system';state.theme=systemTheme.matches?'dark':'light';}else if(p.theme==='light'||p.theme==='dark'){state.theme=p.theme;state.themePreference=p.theme;}applyTheme();persist();document.getElementById('settingsDialog').close();render();toast('已合併收藏與閱讀進度。');}catch(err){toast(err.message||'無法讀取這份檔案。');}event.target.value='';});
document.getElementById('backdrop').addEventListener('click',closeMenu);
document.addEventListener('keydown',event=>{if(event.isComposing||composingSearch||event.keyCode===229)return;const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable;if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();closeMenu();searchInput.focus();searchInput.select();}else if(event.key==='/'&&!typing&&!event.metaKey&&!event.ctrlKey){event.preventDefault();closeMenu();searchInput.focus();}else if(event.key==='?'&&!typing){event.preventDefault();document.getElementById('helpDialog').showModal();}else if(event.key==='Escape'&&document.getElementById('sidebar').classList.contains('open')){closeMenu();document.querySelector('[data-action="menu"]').focus();}});
document.addEventListener('keydown',event=>{if(event.key!=='Tab'||!document.getElementById('sidebar').classList.contains('open'))return;const items=[...document.getElementById('sidebar').querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length);const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
window.addEventListener('resize',()=>{if(!window.matchMedia('(max-width:760px)').matches)closeMenu();else document.getElementById('sidebar').inert=!document.getElementById('sidebar').classList.contains('open');});
window.addEventListener('hashchange',render);applyTheme();render();
systemTheme.addEventListener?.('change', event => {
  if (state.themePreference !== 'system') return;
  state.theme = event.matches ? 'dark' : 'light';
  applyTheme();
});
window.PTWorkbench = { data: D, state, rankNotes, rankDocuments, expandSearch, searchExcerpt, hasKey, render, featureNoteIds };
if(!notes.length){main.innerHTML=empty('內容資料尚未準備好','請先執行資料建置腳本，確認 data.js 與網站檔案位於同一個資料夾。');}
})();
