/* Pro Tools 工作台 — buildless, browser-local application. */
(() => {
'use strict';
const D = window.PT_DATA || {notes:[],shortcuts:[],workflows:[],categories:[]};
const notes = (D.notes || []).slice().sort((a,b)=>Number(a.chapter)-Number(b.chapter)||String(a.id).localeCompare(String(b.id)));
const shortcuts = D.shortcuts || [];
const pages = D.pages || [];
const resources = D.resources || [];
const learningPaths = D.learningPaths || [];
const updates = (Array.isArray(D.updates) ? D.updates : D.updates?.releases || D.updates?.entries || []).slice().sort((a,b)=>String(b.version).localeCompare(String(a.version),undefined,{numeric:true}));
const shortcutEvidence = D.shortcutEvidence || [];
const shortcutMap = new Map(shortcuts.map(item=>[item.id,item]));
const resourceMap = new Map(resources.map(item=>[item.id,item]));
const pageMap = new Map(pages.map(page => [page.id, page]));
const resourceDocuments=resources.map(resource=>({id:'resource:'+resource.id,title:resource.title,summary:resource.summary,plain:[resource.title,resource.provider,resource.summary,resource.version,resource.formatLabel||resource.format].join(' '),category:'resources',topics:resource.topics||[],kind:'resource',resourceId:resource.id}));
const updateDocuments=updates.flatMap(release=>(release.features||[]).map((feature,index)=>({id:'update:'+release.id+':'+(feature.id||index),title:feature.name+' · '+release.version,summary:feature.summary,plain:[feature.name,feature.summary,feature.whoNeedsIt,feature.editionConstraints,...(feature.steps||[]),feature.checkpoint].filter(Boolean).join(' '),category:'updates',topics:feature.topics||release.topics||[],kind:'update',releaseVersion:release.version,featureAnchor:featureAnchor(release,feature,index)})));
const documents = [...notes, ...pages, ...resourceDocuments, ...updateDocuments];
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
  pathChecks: new Set(),
  practice: {known:new Set(),missed:new Set(),attempts:0,correct:0},
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
function persist(){try {localStorage.setItem(storageKey,JSON.stringify({version:1,saved:[...state.saved],read:[...state.read],recent:state.recent,font:state.font,theme:state.theme,themePreference:state.themePreference,pathChecks:[...state.pathChecks],practice:practiceRecord()}));}catch(_){toast('瀏覽器儲存空間不可用；本次紀錄暫存於此頁。');}updateProgress();}
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
const navItems=[['home','總覽','#/'],['topics','主題探索','#/topics'],['shortcuts','Mac 快捷鍵','#/shortcuts'],['workflows','工作流程','#/workflows'],['tools','互動工具','#/tools'],['saved','我的收藏','#/saved'],['references','功能與術語索引','#/references'],['resources','學習資源','#/resources'],['updates','版本差異','#/updates'],['practice','快捷鍵練習','#/practice']];
function renderNav(active){document.getElementById('nav').innerHTML=navItems.map(([id,label,url])=>'<a class="nav-link '+(active===id?'active':'')+'" href="'+url+'" '+(active===id?'aria-current="page"':'')+'>'+icon(id)+'<span>'+label+'</span>'+(id==='saved'?'<span class="nav-count" data-saved-count>'+state.saved.size+'</span>':'')+'</a>').join('');const mobile=document.getElementById('mobileNav');if(mobile){const shortLabels={home:'首頁',topics:'主題',shortcuts:'按鍵',workflows:'流程',tools:'工具',saved:'收藏'};mobile.innerHTML=navItems.filter(([id])=>Object.hasOwn(shortLabels,id)).map(([id,label,url])=>'<a href="'+url+'" aria-label="'+e(label)+'" '+(active===id?'aria-current="page"':'')+'>'+icon(id)+'<span>'+e(shortLabels[id])+'</span></a>').join('');}updateProgress();}
function pageHead(title,desc='',extra=''){return '<div class="page-head"><div><h1>'+e(title)+'</h1>'+(desc?'<p>'+e(desc)+'</p>':'')+'</div>'+extra+'</div>';}
function starButton(n){return '<button class="saved-star '+(state.saved.has(n.id)?'active':'')+'" data-action="bookmark" data-id="'+e(n.id)+'" aria-label="'+(state.saved.has(n.id)?'取消收藏':'收藏')+'：'+e(cleanTitle(n))+'" aria-pressed="'+state.saved.has(n.id)+'">'+(state.saved.has(n.id)?'★':'☆')+'</button>';}
function highlight(s,q){const safe=e(s);const terms=[...new Set(expandSearch(q).flat())].filter(x=>x.length>0).sort((a,b)=>b.length-a.length);if(!terms.length)return safe;const re=new RegExp('('+terms.map(x=>e(x).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')','gi');return safe.replace(re,'<mark>$1</mark>');}
function noteCard(n,q=''){return '<article class="note-card"><span class="chapter-pill">Ch '+String(n.chapter).padStart(2,'0')+'</span><div class="note-main"><h3><a href="'+routeNote(n.id)+'">'+highlight(cleanTitle(n),q)+'</a></h3><p>'+highlight(q?searchExcerpt(n,q):String(n.summary||'').replace(/\*\*/g,'').slice(0,150),q)+'</p>'+(q&&searchTags(n).length?'<p class="search-tags small muted">用途標籤：'+e(searchTags(n).join('／'))+'</p>':'')+'<div class="note-meta"><span>'+e(catName(n.category))+'</span><span>'+Math.max(2,Math.round(String(n.plain).length/700))+' 分鐘閱讀</span>'+(state.read.has(n.id)?'<span class="read-dot">✓ 已讀</span>':'')+'</div></div>'+starButton(n)+'</article>';}
function empty(title,desc,href='#/topics',label='探索全部主題'){return '<div class="empty-state"><span class="empty-icon">⌕</span><h2>'+e(title)+'</h2><p>'+e(desc)+'</p><a class="primary" href="'+href+'">'+e(label)+'</a></div>';}
function categoryCards(){return cats.map(c=>'<a class="category-card" href="#/topics?category='+e(c.id)+'"><span class="category-symbol" aria-hidden="true">'+e(c.symbol)+'</span><span><strong>'+e(c.name)+'</strong><small>'+notes.filter(n=>n.category===c.id).length+' 篇 · '+e(c.english||'')+'</small></span></a>').join('');}
const tasks=[{icon:'◉',name:'開始錄人聲',desc:'接好 Input、安排監聽，留下第一個 Take。',chapters:[6,24,25,27]},{icon:'✂',name:'把鼓剪得更穩',desc:'挑 Take、抓瞬態，處理節奏與接縫。',chapters:[29,33,34,32]},{icon:'☷',name:'進入混音',desc:'理解路由、Insert、Send 與 Automation。',chapters:[50,51,44,53]},{icon:'↗',name:'完成輸出與交付',desc:'選好 Bounce、工程交換與檔案規格。',chapters:[47,54,21,22]},{icon:'⌕',name:'排查操作問題',desc:'沒聲音、按鍵失效，先找到問題層級。',chapters:[3,6,7,24]},{icon:'▤',name:'從零建立工作環境',desc:'認識 Session、視窗、Track 與設定。',chapters:[2,11,12,13]}];
function renderHomeBase(){renderNav('home');main.innerHTML=pageHead('現在想完成什麼？','從工作切入，直接找到觀念、步驟和按鍵。')+'<section class="task-grid" aria-label="按工作任務查找">'+tasks.map((t,i)=>'<button class="task-card" data-action="task" data-task="'+i+'"><span class="task-icon" aria-hidden="true">'+t.icon+'</span><h3>'+t.name+'</h3><p>'+t.desc+'</p><span class="arrow" aria-hidden="true">↗</span></button>').join('')+'</section><div class="dashboard-strip"><span><strong>'+new Set(notes.map(note=>note.chapter)).size+'</strong>章官方文件</span><span><strong>'+notes.length+'</strong>篇中文教學</span><span><strong>'+shortcuts.length+'</strong>筆 Mac 操作</span></div><section class="section"><div class="section-heading"><h2>按主題探索</h2><a href="#/topics">查看全部筆記</a></div><div class="category-grid">'+categoryCards()+'</div></section><div class="section two-col"><section class="panel"><div class="section-heading"><h2>接著讀</h2><a href="#/saved">我的收藏</a></div>'+((state.recent.length?state.recent.map(id=>noteMap.get(id)).filter(Boolean).slice(0,3):['PT-Ch02a-Session與訊號流的基本積木',featureNoteIds.output,featureNoteIds.source].map(id=>noteMap.get(id)).filter(Boolean)).map(n=>'<a class="recent-row" href="'+routeNote(n.id)+'"><span class="chapter-pill">Ch '+n.chapter+'</span><span><strong>'+e(cleanTitle(n))+'</strong><small>'+e(catName(n.category))+(state.read.has(n.id)?' · 已讀':'')+'</small></span></a>').join('')||'<p class="muted">開啟一篇筆記後，這裡會記住你的閱讀位置。</p>')+'</section><section class="panel"><h2>讓觀念動起來</h2><p>Send、Bus、Aux 和 Master Fader 差在哪？點選訊號路由看分工，或比較 Commit、Freeze、Bounce 的用途。</p><div style="margin-top:23px;display:flex;gap:12px;flex-wrap:wrap"><a class="secondary" href="#/tools">打開互動工具</a><a class="secondary" href="#/shortcuts">查 Mac 按鍵</a></div></section></div>';}
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
  const filtered = searchCategory === 'all' ? found : found.filter(doc => doc.category === searchCategory || doc.topics?.includes(searchCategory));
  main.innerHTML = pageHead(query ? '搜尋「' + query + '」' : '搜尋全部內容', '找教學、課程或新版功能，例如「修音 人聲」、「Atmos」或「Track Pinning」。')
    + categoryFilter(searchCategory, 'search-category')
    + (query ? '<p class="result-count">找到 ' + filtered.length + ' 篇相關內容' + (searchCategory !== 'all' ? ' · ' + e(catName(searchCategory)) : '') + '</p>' : '')
    + (query && filtered.length ? '<div class="note-list">' + filtered.map(doc => doc.kind ? supplementSearchCard(doc,query) : pageMap.has(doc.id) ? referenceCard(doc, query) : noteCard(doc, query)).join('') + '</div>'
      : empty(query ? '還沒有找到符合的內容' : '你正在找什麼？', query ? '試試更短的功能名稱，或切回全部主題。' : '可搜尋教學、術語、課程資源與新版功能。'));
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
function readerVersionLinks(doc) {
  const relevant = updates.flatMap(release => (release.features || []).filter(feature => (feature.noteIds || []).includes(doc.id)).map(feature => ({ release, feature })));
  const guides = pages.filter(page => page.sourceVersion === '2026.4' && String(page.html).includes(routeNote(doc.id)));
  if (!relevant.length && !guides.length) return '';
  return '<section class="reader-version-links" aria-label="延伸實作與版本差異"><h2>把這個觀念接到新版操作</h2><p>上方正文保留自己的來源版本；以下另附新版條件與實作，不把新舊操作混為一談。</p>'
    + guides.map(page => '<a class="reader-version-link" href="'+routeReference(page.id)+'"><strong>'+e(page.title)+'</strong><span>'+e(page.summary)+'</span></a>').join('')
    + relevant.map(({release,feature}) => '<a class="reader-version-link" href="#/updates?version='+encodeURIComponent(release.version)+'#'+encodeURIComponent(featureAnchor(release,feature,0))+'"><strong>'+e(feature.name)+' · '+e(release.version)+'</strong><span>'+e(feature.summary)+'</span></a>').join('')+'</section>';
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
    + '<div class="reader-layout"><div><article class="reader-paper"><header class="reader-header"><span class="chapter-flag">' + (reference ? '功能參考' : 'Chapter ' + String(doc.chapter).padStart(2, '0') + ' · ' + e(catName(doc.category))) + '</span><h1>' + e(title) + '</h1><div class="note-meta"><span>依 Pro Tools ' + e(doc.sourceVersion || '2023.3') + ' 文件</span><span>' + Math.max(2, Math.round(String(doc.plain).length / 700)) + ' 分鐘閱讀</span></div></header>'
    + '<details class="mobile-reader-toc"><summary>本篇段落</summary>' + contents + '</details><div class="reader-content" id="readerContent">' + (doc.html || fallbackHtml(doc.summary)) + '</div>'
    + (reference ? '' : readerVersionLinks(doc))
    + (reference ? '' : '<div class="reader-finish"><span>把這篇放進自己的工作流程。</span><button class="' + (state.read.has(doc.id) ? 'secondary' : 'primary') + '" data-action="read" data-id="' + e(doc.id) + '">' + (state.read.has(doc.id) ? '✓ 已讀完這篇' : '讀完了，標記已讀') + '</button></div>')
    + '</article>' + (reference ? '' : '<nav class="reader-pagination" aria-label="前後篇">' + (previous ? '<a href="' + routeNote(previous.id) + '"><span>上一篇 · Ch ' + previous.chapter + '</span>' + e(cleanTitle(previous)) + '</a>' : '<span></span>') + (next ? '<a href="' + routeNote(next.id) + '"><span>下一篇 · Ch ' + next.chapter + '</span>' + e(cleanTitle(next)) + '</a>' : '') + '</nav>')
    + '</div><aside class="reader-toc" aria-label="本篇段落"><strong>本篇段落</strong>' + contents + '</aside></div>';
  hydrateReader();
  window.PTRights?.stampArticle(doc, reference);
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
function renderShortcuts(){renderNav('shortcuts');main.innerHTML=pageHead('Mac 快捷鍵','用情境找功能，也可以直接點按鍵縮小結果。主鍵盤與 Numeric Keypad 的條件各自列明。','<a class="secondary" href="#/practice">練習這些按鍵</a>')+'<details class="keyboard-panel keyboard-disclosure" open><summary>按鍵篩選器 <span>展開／收合虛擬 Mac 鍵盤</span></summary><div class="keyboard-top"><div><h2>試著選一組按鍵</h2><p>修飾鍵可複選；再選一個字母。這是篩選器，不會操作你的 Pro Tools。</p></div><button class="text-link" data-action="clear-keys">清除按鍵</button></div><div id="virtualKeyboard">'+[['Q','W','E','R','T','Y','U','I','O','P'],['A','S','D','F','G','H','J','K','L'],['Z','X','C','V','B','N','M'],['Tab','Space','Return','F12']].map(row=>'<div class="key-row">'+row.map(k=>'<button class="key '+(shortcutState.key===k?'active':'')+'" data-action="filter-key" data-key="'+k+'" aria-pressed="'+(shortcutState.key===k)+'">'+k+'</button>').join('')+'</div>').join('')+'<div class="key-row">'+[['⌃','Control'],['⌥','Option'],['⇧','Shift'],['⌘','Command']].map(([k,label])=>'<button class="key modifier '+(shortcutState.mods.has(k)?'active':'')+'" data-action="filter-mod" data-key="'+k+'" aria-pressed="'+shortcutState.mods.has(k)+'">'+k+' '+label+'</button>').join('')+'</div></div></details><div class="shortcut-controls"><input class="input-control" id="shortcutQuery" type="search" placeholder="搜尋功能、中文用途、按鍵或 K 編號…" aria-label="搜尋快捷鍵" value="'+e(shortcutState.q)+'"><select class="input-control" id="shortcutGroup" aria-label="快捷鍵情境"><option value="all">全部工作情境</option>'+shortcutGroups().map(g=>'<option value="'+e(g)+'" '+(shortcutState.group===g?'selected':'')+'>'+e(g)+'</option>').join('')+'</select></div><div id="shortcutResults"></div><p class="small muted" style="margin-top:18px">⌘ Command · ⌥ Option · ⌃ Control · ⇧ Shift。Num 代表獨立數字鍵盤。自訂鍵位與 OS 衝突可能改變實際行為；此表依官方文件核對，未宣稱逐鍵實機測試。</p>';renderShortcutResults();}
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
/* Resource discovery and source-backed learning paths. */
const resourceLabels = {
  formats: {article:'文章',book:'書籍',community:'社群',course:'課程',document:'文件',index:'索引',practice:'練習素材',standard:'標準',tool:'工具',video:'影片',website:'網站'},
  languages: {'zh-Hant':'繁體中文','zh-Hans':'簡體中文',en:'英文',multi:'多語'},
  costs: {free:'免費',paid:'付費',mixed:'部分免費',unknown:'費用待確認'},
  levels: {beginner:'入門',intermediate:'中階',advanced:'進階'},
  topics: {setup:'系統設定',session:'Session 與素材',record:'錄音',edit:'Audio 剪輯',midi:'MIDI',process:'聲音處理',mix:'混音與交付',spatial:'空間音訊與影像',post:'聲音後製',atmos:'Dolby Atmos',automation:'自動化',foundations:'音訊基礎'}
};
let resourceFilters = {q:'',language:'all',format:'all',cost:'all',level:'all',topic:'all'};
let updateFilters = {version:'all',topic:'all'};
function externalUrl(value) {
  try { const url = new URL(value); return ['https:','http:'].includes(url.protocol) ? url.href : ''; } catch (_) { return ''; }
}
function externalLink(url, label, className = '') {
  const safe = externalUrl(url);
  return safe ? '<a class="'+e(className)+'" href="'+e(safe)+'" target="_blank" rel="noopener noreferrer">'+e(label)+'<span class="external-mark" aria-hidden="true"> ↗</span></a>' : '<span>'+e(label)+'</span>';
}
function filterResources(filters = resourceFilters) {
  const terms = normalizeSearch(filters.q).split(' ').filter(Boolean);
  return resources.filter(resource => {
    const haystack = normalizeSearch([resource.title,resource.provider,resource.summary,resource.version,resource.format,(resource.topics||[]).map(topic=>resourceLabels.topics[topic]||topic).join(' ')].join(' '));
    return terms.every(term=>haystack.includes(term))
      && (!filters.language||filters.language==='all'||resource.language===filters.language)
      && (!filters.format||filters.format==='all'||resource.format===filters.format)
      && (!filters.cost||filters.cost==='all'||resource.cost===filters.cost)
      && (!filters.level||filters.level==='all'||(resource.levels||[]).includes(filters.level))
      && (!filters.topic||filters.topic==='all'||(resource.topics||[]).includes(filters.topic));
  });
}
function optionList(values, labels, selected, first) {
  return '<option value="all">'+e(first)+'</option>'+values.map(value=>'<option value="'+e(value)+'" '+(value===selected?'selected':'')+'>'+e(labels[value]||value)+'</option>').join('');
}
function noteLinks(ids, className = 'related-links') {
  const selected = [...new Set(ids||[])].map(id=>noteMap.get(id)).filter(Boolean);
  return selected.length ? '<div class="'+e(className)+'">'+selected.map(note=>'<a href="'+routeNote(note.id)+'">'+e(cleanTitle(note))+'</a>').join('')+'</div>' : '';
}
function resourceCard(resource) {
  const verification = resource.verification||{};
  const checkedAt = verification.checkedAt||D.resourceMeta?.researchDate||'';
  const more = (resource.links||[]).filter(link=>externalUrl(link.url)&&externalUrl(link.url)!==externalUrl(resource.url));
  const subjects = (resource.topics||[]).map(topic=>resourceLabels.topics[topic]||topic);
  return '<article class="resource-card" data-resource-id="'+e(resource.id)+'">'
    +'<div class="resource-card-top"><span class="resource-format">'+e(resource.formatLabel||resourceLabels.formats[resource.format]||resource.format||'學習資源')+'</span><span class="resource-language">'+e(resourceLabels.languages[resource.language]||resource.language)+'</span></div>'
    +'<h2>'+externalLink(resource.url,resource.title)+'</h2><p class="resource-provider">'+e(resource.provider||'原發布者')+'</p>'
    +'<p>'+e(resource.summary)+'</p><div class="resource-badges"><span>'+e(resourceLabels.costs[resource.cost]||'費用待確認')+'</span>'
    +(resource.levels||[]).map(level=>'<span>'+e(resourceLabels.levels[level]||level)+'</span>').join('')+'</div>'
    +(resource.version?'<p class="resource-version"><strong>版本／年代</strong> '+e(resource.version)+'</p>':'')
    +'<p class="resource-verification"><strong>'+e(verification.label||'來源待核對')+'</strong>'+(checkedAt?' · '+e(checkedAt):'')+'<span>資源整理紀錄；影片／課程未逐一試看。</span></p>'
    +(subjects.length?'<p class="small muted">'+e(subjects.join('／'))+'</p>':'')
    +(resource.rights?'<details class="resource-rights"><summary>使用與授權摘要</summary><p>'+e(resource.rights)+'</p><p class="small muted">取得素材或公開作品前，請以來源網站的原始條款為準。</p></details>':'')
    +(more.length?'<details class="resource-more"><summary>延伸連結（'+more.length+'）</summary><ul>'+more.map(link=>'<li>'+externalLink(link.url,link.label||'開啟來源')+'</li>').join('')+'</ul></details>':'')
    +((resource.relatedNoteIds||[]).length?'<div class="resource-related"><h3>先補這些觀念 <span>2023.3 基礎筆記</span></h3>'+noteLinks(resource.relatedNoteIds)+'</div>':'')+'</article>';
}
function pathStepKey(path, step) { return path.id+'::'+(step.id||step.title); }
function normalizePathCheck(key) {
  for (const path of learningPaths) for (const step of path.steps||[]) {
    if (key===pathStepKey(path,step)||key===path.id+'::'+step.title) return pathStepKey(path,step);
  }
  return null;
}
function pathProgress(path) { return (path.steps||[]).filter(step=>state.pathChecks.has(pathStepKey(path,step))).length; }
function pathCard(path) {
  const total=(path.steps||[]).length, done=pathProgress(path);
  return '<a class="learning-path-card" href="#/path/'+encodeURIComponent(path.id)+'"><span class="path-level">'+e(resourceLabels.levels[path.level]||path.level||'循序練習')+'</span><h3>'+e(path.title)+'</h3><p>'+e(path.description)+'</p><span class="path-progress">'+done+' / '+total+' 個實作檢核</span><meter min="0" max="'+Math.max(1,total)+'" value="'+done+'" aria-label="'+e(path.title)+' 完成進度"></meter></a>';
}
function renderResources(params = new URLSearchParams()) {
  renderNav('resources');
  for (const name of Object.keys(resourceFilters)) resourceFilters[name]=params.get(name)|| (name==='q'?'':'all');
  const formatValues=[...new Set(resources.map(resource=>resource.format).filter(Boolean))].sort();
  const formatLabels=Object.fromEntries(resources.map(resource=>[resource.format,resource.formatLabel||resourceLabels.formats[resource.format]||resource.format]));
  const topics=[...new Set(resources.flatMap(resource=>resource.topics||[]))];
  main.innerHTML=pageHead('找到下一個學習資源','把官方文件、影片、課程和練習素材放在同一個入口，依語言、程度與工作目標縮小範圍。')
    +'<div class="resource-intro"><p>原研究日期：'+e(D.resourceMeta?.researchDate||'2026-11-01')+'。查核狀態沿用資源整理紀錄；影片／課程未逐一試看。價格與開班資訊請回來源確認。</p><a href="#/updates">先看版本差異</a></div>'
    +(learningPaths.length?'<details class="learning-path-overview" '+(window.matchMedia('(max-width:760px)').matches?'':'open')+'><summary>選一條學習路線 <span>'+learningPaths.length+' 個工作目標</span></summary><div class="learning-path-grid">'+learningPaths.map(pathCard).join('')+'</div></details>':'')
    +'<section class="resource-filter-panel" aria-label="學習資源篩選"><label class="resource-query-label">搜尋資源<input class="input-control" type="search" id="resourceQuery" value="'+e(resourceFilters.q)+'" placeholder="例如 人聲、Atmos、混音素材…" autocomplete="off"></label>'
    +'<div class="resource-filter-grid">'
    +[['language','語言',Object.keys(resourceLabels.languages),resourceLabels.languages,'全部語言'],['format','類型',formatValues,formatLabels,'全部類型'],['cost','費用',Object.keys(resourceLabels.costs),resourceLabels.costs,'全部費用'],['level','程度',Object.keys(resourceLabels.levels),resourceLabels.levels,'全部程度'],['topic','主題',topics,resourceLabels.topics,'全部主題']].map(([key,label,values,labels,first])=>'<label>'+label+'<select class="input-control" data-resource-filter="'+key+'">'+optionList(values,labels,resourceFilters[key],first)+'</select></label>').join('')
    +'</div><button class="text-link" data-action="reset-resources">清除全部條件</button></section><p id="resourceResultCount" class="result-count" role="status" aria-live="polite"></p><div id="resourceResults"></div>';
  renderResourceResults();
}
function renderResourceResults() {
  const root=document.getElementById('resourceResults'); if(!root)return;
  const filtered=filterResources();
  document.getElementById('resourceResultCount').textContent=filtered.length+' / '+resources.length+' 筆資源';
  root.innerHTML=(filtered.length?'<div class="resource-grid">'+filtered.map(resourceCard).join('')+'</div>':'<div class="empty-state"><h2>這組條件沒有找到資源</h2><p>試著保留語言或主題條件，清除其他篩選。</p><button class="primary" data-action="reset-resources">清除全部條件</button></div>');
  const query=new URLSearchParams();for(const [key,value] of Object.entries(resourceFilters))if(value&&value!=='all')query.set(key,value);
  history.replaceState(null,'','#/resources'+(query.size?'?'+query.toString():''));
}
function renderLearningPath(id) {
  renderNav('resources');
  const path=learningPaths.find(item=>item.id===id);
  if(!path){main.innerHTML=empty('找不到這條路線','從資源庫選擇一個工作目標。','#/resources','返回學習資源');return;}
  const steps=path.steps||[], done=pathProgress(path);
  main.innerHTML=pageHead(path.title,path.description,'<a class="secondary" href="#/resources">返回資源庫</a>')
    +'<div class="path-overview"><span>'+e(resourceLabels.levels[path.level]||'循序練習')+'</span><strong>'+done+' / '+steps.length+' 個檢核完成</strong><p>先看觀念，再看操作，最後用自己的 Session 完成一個可確認的成果。基礎筆記以 2023.3 為準；新版介面差異請對照來源。</p></div>'
    +'<ol class="learning-steps">'+steps.map((step,index)=>{
      const key=pathStepKey(path,step), completed=state.pathChecks.has(key);
      const selected=(step.resourceIds||[]).map(resourceId=>resourceMap.get(resourceId)).filter(Boolean);
      return '<li class="learning-step '+(completed?'completed':'')+'"><span class="step-number" aria-hidden="true">'+(index+1)+'</span><div class="learning-step-body"><h2>'+e(step.title)+'</h2>'
        +noteLinks(step.noteIds)+(selected.length?'<ul class="step-resources">'+selected.map(resource=>'<li>'+externalLink(resource.url,resource.title)+'</li>').join('')+'</ul>':'')
        +'<div class="practice-checkpoint"><strong>動手確認</strong><p>'+e(step.checkpoint||'完成本步操作，並確認可重複做出相同結果。')+'</p></div>'
        +'<button class="'+(completed?'secondary':'primary')+'" data-action="path-check" data-path="'+e(path.id)+'" data-step="'+index+'" aria-pressed="'+completed+'">'+(completed?'已完成這步':'標記這步完成')+'</button></div></li>';
    }).join('')+'</ol>';
}
function filteredUpdates(filters=updateFilters) {
  return updates.filter(release=>(!filters.version||filters.version==='all'||release.version===filters.version)
    &&(!filters.topic||filters.topic==='all'||(release.topics||[]).includes(filters.topic)));
}
function sourceLinks(sources) {
  return (sources||[]).map(source=>{
    let url=source.url||source.sourceUrl||'';
    if(Number.isInteger(source.pdfPage)&&source.pdfPage>0)url=url.split('#')[0]+'#page='+source.pdfPage;
    return externalLink(url,(source.label||'官方來源')+(source.pdfPage?' · PDF '+source.pdfPage:''),'source-link');
  }).join('');
}
function renderUpdates(params=new URLSearchParams()) {
  renderNav('updates');
  updateFilters={version:params.get('version')||'all',topic:params.get('topic')||'all'};
  const versions=updates.map(release=>release.version);
  const topics=[...new Set(updates.flatMap(release=>release.topics||[]))];
  main.innerHTML=pageHead('從基礎筆記走到新版','依版本理解新增功能、適合誰，以及哪些既有觀念可以接著用。')
    +'<div class="version-baseline"><strong>基礎教學：'+e(D.versionMeta?.baseline||'2023.3')+'</strong><span>差異導讀依各條目原文核對，文件範圍至 '+e(D.versionMeta?.documentVersion||'2026.4')+'。</span><p>每個版本卡片保留官方來源、條件與實作檢核。基礎筆記仍按自己的來源版本標示。</p></div>'
    +(D.versionMeta?.latestVerified?'<p class="version-snapshot">官方版本快照：'+e(D.versionMeta.latestVerified.version)+' · 核對日 '+e(D.versionMeta.latestVerified.checkedAt)+' · '+externalLink(D.versionMeta.latestVerified.sourceUrl,'核對線上相容性表')+'</p>':'')
    +((D.versionMeta?.compatibilityNotes||[]).length?'<details class="compatibility-notes"><summary>Mac 相容性與已知問題：先核對版本與設備</summary>'+D.versionMeta.compatibilityNotes.map(note=>'<div><p>'+e(note.summary)+'</p><div class="feature-sources">'+sourceLinks(note.sources)+'</div></div>').join('')+'</details>':'')
    +'<div class="update-filters"><label>版本<select class="input-control" data-update-filter="version">'+optionList(versions,{},updateFilters.version,'所有版本')+'</select></label><label>工作主題<select class="input-control" data-update-filter="topic">'+optionList(topics,resourceLabels.topics,updateFilters.topic,'全部主題')+'</select></label></div>'
    +'<div id="updateResults"></div>';
  renderUpdateResults();
}
function renderUpdateResults() {
  const root=document.getElementById('updateResults'); if(!root)return;
  const selected=filteredUpdates();
  root.innerHTML='<p class="result-count">'+selected.length+' / '+updates.length+' 個版本</p>'+(selected.length?'<div class="release-timeline">'+selected.map((release,index)=>'<details class="release-block" '+(index===0||updateFilters.version!=='all'?'open':'')+'><summary><span class="release-version">'+e(release.version)+'</span><span><strong>'+e(release.title)+'</strong><small>'+e(release.summary)+'</small></span></summary><div class="release-content"><div class="release-sources">'+sourceLinks(release.sources)+'</div>'
    +(release.features||[]).filter(feature=>updateFilters.topic==='all'||!feature.topics?.length||feature.topics.includes(updateFilters.topic)).map(feature=>'<article class="update-feature" id="'+e(featureAnchor(release,feature,(release.features||[]).indexOf(feature)))+'"><h2>'+e(feature.name)+'</h2><p>'+e(feature.summary)+'</p>'
      +(feature.whoNeedsIt?'<p class="feature-audience"><strong>適合</strong> '+e(Array.isArray(feature.whoNeedsIt)?feature.whoNeedsIt.join('、'):feature.whoNeedsIt)+'</p>':'')
      +(feature.editionConstraints?'<p class="feature-conditions"><strong>適用條件</strong> '+e(Array.isArray(feature.editionConstraints)?feature.editionConstraints.join('；'):feature.editionConstraints)+'</p>':'')
      +((feature.steps||[]).length?'<ol class="feature-steps">'+feature.steps.map(step=>'<li>'+e(typeof step==='string'?step.text||step:step.text||step.title||'')+'</li>').join('')+'</ol>':'')
      +(feature.checkpoint?'<p class="practice-checkpoint"><strong>動手確認</strong> '+e(feature.checkpoint)+'</p>':'')
      +noteLinks(feature.noteIds)+'<div class="feature-sources">'+sourceLinks(feature.sources)+'</div></article>').join('')+'</div></details>').join('')+'</div>':empty('這個主題尚未收錄差異導讀','請切換其他主題或查看所有版本。','#/updates','查看全部版本'));
  const query=new URLSearchParams();for(const [key,value] of Object.entries(updateFilters))if(value!=='all')query.set(key,value);
  const anchor=currentRoute().anchor;
  history.replaceState(null,'','#/updates'+(query.size?'?'+query.toString():'')+(anchor&&document.getElementById(anchor)?'#'+encodeURIComponent(anchor):''));
}

/* Practice uses published bindings only and never captures operating-system shortcuts. */
let trainerState={basis:'2023.3',mode:'learn',group:'all',reviewOnly:false,index:0,questionId:null,revealed:false,answered:null};
function getPracticeBank(basis=trainerState.basis) {
  if(basis==='2026.4')return shortcutEvidence.filter(entry=>entry.version==='2026.4'&&entry.status==='verified'&&shortcutMap.has(entry.shortcutId)).map(entry=>({
    ...shortcutMap.get(entry.shortcutId),key:entry.macKey,context:entry.context,pdfPage:entry.pdfPage,sourceUrl:entry.sourceUrl,_basis:'2026.4',evidenceNote:entry.note||'',hazard:entry.hazard||''
  })).filter(question=>question.key&&question.context&&externalUrl(question.sourceUrl));
  return shortcuts.map(question=>({...question,_basis:'2023.3'}));
}
function practiceProgressKey(question) {return question._basis+':'+question.id;}
function practiceRecord() {
  return {known:[...state.practice.known],missed:[...state.practice.missed],attempts:state.practice.attempts,correct:state.practice.correct};
}
function mergePracticeRecord(record) {
  if(!record||typeof record!=='object')return;
  const valid=new Set(['2023.3','2026.4'].flatMap(basis=>getPracticeBank(basis).map(practiceProgressKey)));
  for(const field of ['known','missed'])if(Array.isArray(record[field]))for(const key of record[field]){
    const normalized=valid.has(key)?key:'2023.3:'+key;
    if(valid.has(normalized))state.practice[field].add(normalized);
  }
  for(const field of ['attempts','correct'])if(Number.isFinite(Number(record[field])))state.practice[field]=Math.max(state.practice[field],Math.min(1000000,Math.max(0,Math.floor(Number(record[field])))));
  state.practice.correct=Math.min(state.practice.correct,state.practice.attempts);
  for(const key of state.practice.missed)state.practice.known.delete(key);
}
function getPracticePool() {
  return getPracticeBank().filter(question=>(trainerState.group==='all'||question.group===trainerState.group)
    &&(!trainerState.reviewOnly||state.practice.missed.has(practiceProgressKey(question))));
}
function currentPracticeQuestion() {
  if(trainerState.answered!==null&&trainerState.questionId)return getPracticeBank().find(question=>question.id===trainerState.questionId);
  const pool=getPracticePool();if(!pool.length)return null;
  trainerState.index=((trainerState.index%pool.length)+pool.length)%pool.length;
  trainerState.questionId=pool[trainerState.index].id;
  return pool[trainerState.index];
}
function canonicalPracticeKey(key) {
  const modifierOrder='⌃⌥⇧⌘';
  return String(key).normalize('NFKC').replace(/\s+/g,'').replace(/[⌘⌥⌃⇧]+/g,run=>[...new Set(run)].sort((a,b)=>modifierOrder.indexOf(a)-modifierOrder.indexOf(b)).join(''));
}
function practiceChoices(question) {
  const bank=getPracticeBank(question._basis||trainerState.basis);
  const candidates=[...bank.filter(item=>item.group===question.group),...bank].map(item=>item.key);
  const seen=new Set([canonicalPracticeKey(question.key)]);
  const distractors=candidates.filter(key=>{const normalized=canonicalPracticeKey(key);if(seen.has(normalized))return false;seen.add(normalized);return true;}).slice(0,3);
  const choices=[...distractors];
  const slot=[...question.id].reduce((sum,char)=>sum+char.charCodeAt(0),0)%(choices.length+1);
  choices.splice(slot,0,question.key);
  return choices;
}
function recordPractice(question, correct, quiz) {
  const key=practiceProgressKey(question);
  if(correct){state.practice.known.add(key);state.practice.missed.delete(key);}
  else{state.practice.missed.add(key);state.practice.known.delete(key);}
  if(quiz){state.practice.attempts++;if(correct)state.practice.correct++;}
  persist();
}
function nextPractice(previousQuestion=currentPracticeQuestion()) {
  const question=previousQuestion;
  if(!(trainerState.reviewOnly&&question&&!state.practice.missed.has(practiceProgressKey(question))))trainerState.index++;
  trainerState.questionId=null;trainerState.revealed=false;trainerState.answered=null;
  renderPractice();
}
function renderPractice() {
  renderNav('practice');
  const verified=getPracticeBank('2026.4').length;
  if(trainerState.basis==='2026.4'&&!verified)trainerState.basis='2023.3';
  const bank=getPracticeBank(),pool=getPracticePool(),question=currentPracticeQuestion();
  const known=bank.filter(item=>state.practice.known.has(practiceProgressKey(item))).length;
  const missed=bank.filter(item=>state.practice.missed.has(practiceProgressKey(item))).length;
  const source=question?(question.sourceUrl||'https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2023.3.pdf'):'https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2023.3.pdf';
  main.innerHTML=pageHead('把常用 Mac 按鍵練熟','先看使用條件，再回想按鍵。練習只用畫面上的選項，不會攔截你電腦的快捷鍵。','<a class="secondary" href="#/shortcuts">查完整按鍵表</a>')
    +'<div class="practice-basis"><strong>目前依據：Pro Tools '+e(trainerState.basis)+' · Mac</strong><p>'+(trainerState.basis==='2026.4'?'僅使用已對照 2026.4 原文的按鍵與條件子集。':'題庫來自既有 2023.3 官方文件核對表。新版按鍵請查看 2026.4 官方指南。')+' 文件核對不代表逐鍵實機測試。</p>'+externalLink('https://resources.avid.com/SupportFiles/PT/Pro_Tools_Shortcuts_2026.4.pdf','查 2026.4 官方 Shortcuts Guide')+'</div>'
    +'<div class="practice-controls"><label>文件依據<select class="input-control" id="practiceBasis"><option value="2023.3" '+(trainerState.basis==='2023.3'?'selected':'')+'>2023.3 · '+shortcuts.length+' 筆</option>'+(verified?'<option value="2026.4" '+(trainerState.basis==='2026.4'?'selected':'')+'>2026.4 · '+verified+' 筆原文核對</option>':'')+'</select></label><label>工作情境<select class="input-control" id="practiceGroup">'+optionList([...new Set(bank.map(item=>item.group))],{},trainerState.group,'全部工作情境')+'</select></label><div class="practice-mode" role="group" aria-label="練習模式"><button class="chip '+(trainerState.mode==='learn'?'active':'')+'" data-action="practice-mode" data-mode="learn" aria-pressed="'+(trainerState.mode==='learn')+'">翻卡學習</button><button class="chip '+(trainerState.mode==='quiz'?'active':'')+'" data-action="practice-mode" data-mode="quiz" aria-pressed="'+(trainerState.mode==='quiz')+'">選擇測驗</button></div><button class="chip '+(trainerState.reviewOnly?'active':'')+'" data-action="practice-review" aria-pressed="'+trainerState.reviewOnly+'">只練待複習（'+missed+'）</button></div>'
    +'<div class="practice-stats"><span><strong>'+known+' / '+bank.length+'</strong> 已熟悉</span><span><strong>'+missed+'</strong> 待複習</span><span><strong>'+state.practice.correct+' / '+state.practice.attempts+'</strong> 測驗答對累計</span></div>'
    +(question?'<section class="practice-question" aria-label="快捷鍵練習題"><span class="practice-position">'+(trainerState.reviewOnly?'待複習':'情境練習')+' · '+Math.min(trainerState.index+1,Math.max(1,pool.length))+' / '+Math.max(1,pool.length)+'</span><h2>'+e(question.action)+'</h2><div class="practice-condition"><strong>必要條件</strong><p>'+e(question.context)+'</p></div>'
      +(trainerState.mode==='learn'?(trainerState.revealed?'<div id="practiceAnswer" class="practice-answer" tabindex="-1"><span>Mac 按鍵</span><strong>'+e(question.key)+'</strong></div><div class="practice-grade"><button class="secondary" data-action="practice-again">還要複習</button><button class="primary" data-action="practice-known">記住了，下一題</button></div>':'<button class="primary practice-reveal" data-action="practice-reveal" aria-expanded="false">顯示 Mac 按鍵</button>')
      :'<div class="practice-options">'+practiceChoices(question).map(key=>'<button class="practice-option '+(trainerState.answered!==null?(key===question.key?'correct':trainerState.answered===key?'incorrect':''):'')+'" data-action="practice-answer" data-answer="'+e(key)+'" '+(trainerState.answered!==null?'disabled':'')+'>'+e(key)+'</button>').join('')+'</div>'
        +(trainerState.answered!==null?'<div class="practice-feedback" id="practiceFeedback" tabindex="-1" role="status"><strong>'+(trainerState.answered===question.key?'答對了':'這題先放進待複習')+'</strong><p>正確按鍵：<b>'+e(question.key)+'</b></p><button class="primary" data-action="practice-next">下一題</button></div>':''))
      +(question.hazard==='not-undoable'?'<p class="practice-hazard"><strong>操作提醒</strong> 這個操作無法 Undo，請先在測試 Session 確認用途。</p>':'')+'<div class="practice-question-footer">'+externalLink(source.split('#')[0]+'#page='+Number(question.pdfPage),'核對官方原文 · PDF '+question.pdfPage,'source-link')+'<span>'+e(question.id)+' · '+e(question.group)+'</span></div></section>'
    :'<div class="empty-state"><h2>'+(trainerState.reviewOnly?'目前沒有待複習的按鍵':'這個情境沒有題目')+'</h2><p>可以切換工作情境，或回到全部題目開始練習。</p><button class="primary" data-action="practice-all">練習全部題目</button></div>');
}
function routeResource(id) { return '#/resource/'+encodeURIComponent(id); }
function featureAnchor(release, feature, index) { return 'update-'+release.id+'-'+(feature.id||index); }
function supplementSearchCard(document, query) {
  const resource=document.kind==='resource'?resourceMap.get(document.resourceId):null;
  const href=resource?routeResource(resource.id):'#/updates?version='+encodeURIComponent(document.releaseVersion)+'#'+encodeURIComponent(document.featureAnchor);
  const label=resource?'資源':'版本';
  const detail=resource?(resourceLabels.languages[resource.language]||resource.language)+' · '+(resource.formatLabel||resourceLabels.formats[resource.format]||resource.format):'Pro Tools '+document.releaseVersion;
  return '<article class="note-card supplement-search-card"><span class="chapter-pill">'+label+'</span><div class="note-main"><h3><a href="'+href+'">'+highlight(document.title,query)+'</a></h3><p>'+highlight(searchExcerpt(document,query),query)+'</p><div class="note-meta"><span>'+e(detail)+'</span></div></div></article>';
}
function renderResourceDetail(id) {
  renderNav('resources');
  const resource=resourceMap.get(id);
  if(!resource){main.innerHTML=empty('找不到這筆資源','請回資源庫重新選擇。','#/resources','返回資源庫');return;}
  const paths=learningPaths.filter(path=>(path.steps||[]).some(step=>(step.resourceIds||[]).includes(id)));
  main.innerHTML=pageHead(resource.title,'保留來源版本、查核範圍及使用條件，選擇適合現在目標的內容。','<a class="secondary" href="#/resources">返回資源庫</a>')
    +'<div class="resource-detail">'+resourceCard(resource)+'</div>'
    +(paths.length?'<section class="section"><div class="section-heading"><h2>放進一條實作路線</h2></div><div class="learning-path-grid">'+paths.map(pathCard).join('')+'</div></section>':'');
}

function renderHome() {
  renderHomeBase();
  const strip=main.querySelector('.dashboard-strip');
  strip?.insertAdjacentHTML('afterend','<section class="discovery-strip" aria-label="繼續拓展學習"><a href="#/resources"><span>找對資源</span><strong>'+resources.length+' 筆文件、影片與素材</strong><small>按語言、程度與目標篩選</small></a><a href="#/updates"><span>追上版本差異</span><strong>2023.3 → '+e(D.versionMeta?.documentVersion||'2026.4')+'</strong><small>從原文確認新功能與條件</small></a><a href="#/practice"><span>練成操作習慣</span><strong>Mac 快捷鍵練習</strong><small>翻卡、測驗與待複習</small></a></section>');
}

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
  else if (path === '/resources') renderResources(params);
  else if (path.startsWith('/resource/')) renderResourceDetail(decodeId(path.slice(10)));
  else if (path.startsWith('/path/')) renderLearningPath(decodeId(path.slice(6)));
  else if (path === '/updates') renderUpdates(params);
  else if (path === '/practice') renderPractice();
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
  const routeTitle=path.startsWith('/resource/')?resourceMap.get(decodeId(path.slice(10)))?.title:path.startsWith('/path/')?learningPaths.find(item=>item.id===decodeId(path.slice(6)))?.title:'';
  document.title = (doc ? (pageMap.has(doc.id) ? doc.title : cleanTitle(doc)) : routeTitle || navItems.find(item => item[2].slice(1) === path)?.[1] || '總覽') + ' · Pro Tools 工作台';
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
    case 'reset-resources':
      history.replaceState(null,'','#/resources'); renderResources(); break;
    case 'path-check': {
      const path=learningPaths.find(item=>item.id===control.dataset.path);
      const step=path?.steps?.[Number(control.dataset.step)];
      if(!step)break;
      const key=pathStepKey(path,step);
      if(state.pathChecks.has(key))state.pathChecks.delete(key);else state.pathChecks.add(key);
      persist();renderLearningPath(path.id);main.querySelector('[data-action="path-check"][data-step="'+Number(control.dataset.step)+'"]')?.focus({preventScroll:true});break;
    }
    case 'practice-mode':
      if(!['learn','quiz'].includes(control.dataset.mode))break;
      trainerState.mode=control.dataset.mode;trainerState.revealed=false;trainerState.answered=null;trainerState.questionId=null;renderPractice();break;
    case 'practice-review':
      trainerState.reviewOnly=!trainerState.reviewOnly;trainerState.index=0;trainerState.questionId=null;trainerState.revealed=false;trainerState.answered=null;renderPractice();break;
    case 'practice-reveal':
      trainerState.revealed=true;renderPractice();document.getElementById('practiceAnswer')?.focus();break;
    case 'practice-known':
    case 'practice-again': {
      const question=currentPracticeQuestion();if(!question)break;
      recordPractice(question,action==='practice-known',false);nextPractice(question);break;
    }
    case 'practice-answer': {
      if(trainerState.answered!==null)break;
      const question=currentPracticeQuestion();if(!question||!practiceChoices(question).includes(control.dataset.answer))break;
      trainerState.answered=control.dataset.answer;
      recordPractice(question,trainerState.answered===question.key,true);
      renderPractice();document.getElementById('practiceFeedback')?.focus();break;
    }
    case 'practice-next': nextPractice();break;
    case 'practice-all':
      trainerState.reviewOnly=false;trainerState.group='all';trainerState.index=0;trainerState.questionId=null;trainerState.answered=null;trainerState.revealed=false;renderPractice();break;
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
      const payload = { version: 1, exportedAt: new Date().toISOString(), saved: [...state.saved], read: [...state.read], recent: state.recent, font: state.font, theme: state.theme, themePreference: state.themePreference, pathChecks:[...state.pathChecks], practice:practiceRecord() };
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
  if(event.target.id==='resourceQuery')event.target.dataset.composing='true';
  if (event.target.id === 'shortcutQuery') composingShortcut = true;
});
document.addEventListener('compositionend', event => {
  if(event.target.id==='resourceQuery'){event.target.dataset.composing='false';resourceFilters.q=event.target.value;renderResourceResults();}
  if (event.target.id !== 'shortcutQuery') return;
  composingShortcut = false;
  shortcutState.q = event.target.value;
  renderShortcutResults();
});
document.addEventListener('input', event => {
  if(event.target.id==='resourceQuery'&&!event.isComposing&&event.target.dataset.composing!=='true'){resourceFilters.q=event.target.value;renderResourceResults();}
  if (event.target.id === 'shortcutQuery' && !event.isComposing && !composingShortcut) {
    shortcutState.q = event.target.value;
    renderShortcutResults();
  }
});
document.addEventListener('change', event => {
  const target=event.target;
  if(target.dataset.resourceFilter){resourceFilters[target.dataset.resourceFilter]=target.value;renderResourceResults();}
  if(target.dataset.updateFilter){updateFilters[target.dataset.updateFilter]=target.value;renderUpdateResults();}
  if(target.id==='practiceBasis'||target.id==='practiceGroup'){
    if(target.id==='practiceBasis'){trainerState.basis=target.value;trainerState.group='all';}else trainerState.group=target.value;
    trainerState.index=0;trainerState.questionId=null;trainerState.revealed=false;trainerState.answered=null;renderPractice();
  }
  if (event.target.id === 'shortcutGroup') {
    shortcutState.group = event.target.value;
    renderShortcutResults();
  }
});
document.getElementById('importProgress').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{if(file.size>2*1024*1024)throw new Error('檔案超過 2 MB，請選擇此工作台匯出的 JSON。');const p=JSON.parse(await file.text());if(p.version!==1||!Array.isArray(p.saved)||!Array.isArray(p.read))throw new Error('不是工作台支援的學習紀錄格式。');for(const id of p.saved)if(noteMap.has(id))state.saved.add(id);for(const id of p.read)if(noteMap.has(id))state.read.add(id);if(Array.isArray(p.recent))state.recent=[...new Set([...state.recent,...p.recent.filter(id=>noteMap.has(id))])].slice(0,12);if(Number.isFinite(Number(p.font)))state.font=Math.min(24,Math.max(16,Number(p.font)));if(p.themePreference==='system'){state.themePreference='system';state.theme=systemTheme.matches?'dark':'light';}else if(p.theme==='light'||p.theme==='dark'){state.theme=p.theme;state.themePreference=p.theme;}if(Array.isArray(p.pathChecks))for(const key of p.pathChecks){const normalized=normalizePathCheck(key);if(normalized)state.pathChecks.add(normalized);}mergePracticeRecord(p.practice);applyTheme();persist();document.getElementById('settingsDialog').close();render();toast('已合併收藏與閱讀進度。');}catch(err){toast(err.message||'無法讀取這份檔案。');}event.target.value='';});
document.getElementById('backdrop').addEventListener('click',closeMenu);
document.addEventListener('keydown',event=>{if(event.isComposing||composingSearch||event.keyCode===229)return;const typing=/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName||'')||document.activeElement?.isContentEditable;if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){event.preventDefault();closeMenu();searchInput.focus();searchInput.select();}else if(event.key==='/'&&!typing&&!event.metaKey&&!event.ctrlKey){event.preventDefault();closeMenu();searchInput.focus();}else if(event.key==='?'&&!typing){event.preventDefault();document.getElementById('helpDialog').showModal();}else if(event.key==='Escape'&&document.getElementById('sidebar').classList.contains('open')){closeMenu();document.querySelector('[data-action="menu"]').focus();}});
document.addEventListener('keydown',event=>{if(event.key!=='Tab'||!document.getElementById('sidebar').classList.contains('open'))return;const items=[...document.getElementById('sidebar').querySelectorAll('a[href],button:not([disabled])')].filter(el=>el.getClientRects().length);const first=items[0],last=items[items.length-1];if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}});
window.addEventListener('resize',()=>{if(!window.matchMedia('(max-width:760px)').matches)closeMenu();else document.getElementById('sidebar').inert=!document.getElementById('sidebar').classList.contains('open');});
if(Array.isArray(savedState.pathChecks))for(const key of savedState.pathChecks){const normalized=normalizePathCheck(key);if(normalized)state.pathChecks.add(normalized);}
mergePracticeRecord(savedState.practice);
window.addEventListener('hashchange',render);applyTheme();render();
systemTheme.addEventListener?.('change', event => {
  if (state.themePreference !== 'system') return;
  state.theme = event.matches ? 'dark' : 'light';
  applyTheme();
});
window.PTWorkbench = { data: D, state, rankNotes, rankDocuments, expandSearch, searchExcerpt, hasKey, render, featureNoteIds, resources, learningPaths, filterResources, filteredUpdates, practiceChoices, getPracticeBank, getPracticePool, trainerState, resourceLabels, routeResource, featureAnchor, canonicalPracticeKey };
if(!notes.length){main.innerHTML=empty('內容資料尚未準備好','請先執行資料建置腳本，確認 data.js 與網站檔案位於同一個資料夾。');}
})();
