/** DOM fixtures check rendering/state only; this is not a browser layout test. */
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const data = {window:{}};
vm.runInNewContext(fs.readFileSync('dist/data.js','utf8'), data);
const fixture = data.window.PT_DATA;
const source = fs.readFileSync('dist/app.js','utf8');
const index = fs.readFileSync('dist/index.html','utf8');
assert.match(index, /name="author" content="許惟傑 Xue_hwcxx"/);
assert.match(index, /class="author-credit" href="https:\/\/github.com\/jaymoda88"/);
assert.match(index, /href="responsive.css"/);

for (const mobile of [false,true]) {
  const elements = new Map(), docEvents = new Map(), winEvents = new Map(), storage = new Map();
  let document;
  function element(id) {
    if (!elements.has(id)) {
      const classes = new Set(), attrs = new Map();
      elements.set(id, {
        innerHTML:'',value:'',dataset:{},inert:false,style:{setProperty(){}},
        classList:{add:k=>classes.add(k),remove:k=>classes.delete(k),contains:k=>classes.has(k),toggle(k,on){const enabled=on??!classes.has(k);enabled?classes.add(k):classes.delete(k);return enabled;}},
        setAttribute:(k,v)=>attrs.set(k,String(v)),getAttribute:k=>attrs.get(k),
        events:new Map(),addEventListener(type,fn){this.events.set(type,fn);},focus(){document.activeElement=this;},select(){},
        querySelectorAll(){return[];},showModal(){},close(){}
      });
    }
    return elements.get(id);
  }
  const listen = registry => (type,fn) => registry.set(type,[...(registry.get(type)||[]),fn]);
  document = {
    getElementById:element,querySelector:selector=>element(selector),querySelectorAll:()=>[],
    addEventListener:listen(docEvents),documentElement:element('html'),body:element('body'),
    activeElement:null,head:{append(){}},title:''
  };
  const context = {
    window:{PT_DATA:fixture,scrollTo(){},addEventListener:listen(winEvents),matchMedia:()=>({matches:mobile})},
    document,localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v)},
    location:{hash:'#/'},history:{replaceState(){},pushState(){}},navigator:{},
    URLSearchParams,URL,Blob,Set,Map,console,setTimeout:()=>0,clearTimeout(){}
  };
  context.window.document=document;
  vm.createContext(context);vm.runInContext(source,context);
  const app=context.window.PTWorkbench;
  const route = hash => {context.location.hash=hash;for(const fn of winEvents.get('hashchange')||[])fn();};
  const click = (action,id) => {
    const control=element(`[data-action="${action}"]`);control.dataset={action,id};
    const event={target:{closest:selector=>selector==='[data-action]'?control:null},preventDefault(){}};
    for(const fn of docEvents.get('click')||[])fn(event);
  };
  assert.equal((element('mobileNav').innerHTML.match(/<a /g)||[]).length,6);
  assert.equal((element('mobileNav').innerHTML.match(/aria-current="page"/g)||[]).length,1);
  assert.equal(element('sidebar').inert,mobile);
  for(const query of ['Clip Gain','沒有聲音','補錄','Freeze','Automation'])assert.ok(app.rankNotes(query).length>0,query);
  assert.equal(app.rankNotes('zzzx不存在字串').length,0);
  assert.equal(app.hasKey('⌘Space','A'),false);
  assert.equal(app.hasKey('⇧S','S'),true);
  for(const hash of ['#/topics','#/workflows','#/tools','#/saved','#/search?q=Clip%20Gain'])route(hash);
  route('#/shortcuts');
  assert.match(element('mobileNav').innerHTML, /href="#\/shortcuts" aria-label="Mac 快捷鍵" aria-current="page"/);
  assert.match(element('main').innerHTML, /<details class="keyboard-panel keyboard-disclosure" open>/);
  const result=element('shortcutResults').innerHTML;
  assert.match(result,/135 \/ 135/);
  for(const label of ['功能／用途','Mac 按鍵','必要條件','來源']){
    assert.equal(result.split(`data-label="${label}"`).length-1,135,`All shortcuts must retain ${label}`);
  }
  // Open every article: recent-reading persistence must never interrupt rendering.
  for(const n of fixture.notes){route('#/note/'+encodeURIComponent(n.id));assert.match(element('main').innerHTML,/reader-paper/);}
  const id=fixture.notes[0].id;
  route('#/note/'+encodeURIComponent(id));
  click('bookmark',id);click('read',id);click('font-larger');click('theme');
  const saved=JSON.parse(storage.get('pro-tools-workbench-v1'));
  assert.ok(saved.saved.includes(id));assert.ok(saved.read.includes(id));assert.equal(saved.font,19);assert.equal(saved.theme,'dark');
  if(mobile){
    click('menu');assert.ok(element('sidebar').classList.contains('open'));
    assert.equal(element('.workspace').inert,true);assert.equal(element('mobileNav').inert,true);
    assert.equal(document.activeElement,element('.drawer-close'));
    for(const fn of docEvents.get('keydown')||[])fn({key:'Escape'});
    assert.equal(element('sidebar').inert,true);assert.equal(element('.workspace').inert,false);
    assert.equal(element('mobileNav').inert,false);assert.equal(document.activeElement,element('[data-action="menu"]'));
    click('menu');element('backdrop').events.get('click')();
    assert.equal(document.activeElement,element('[data-action="menu"]'));
    click('menu');
    for(const fn of docEvents.get('keydown')||[])fn({key:'k',metaKey:true,preventDefault(){}});
    assert.equal(element('sidebar').classList.contains('open'),false);
    assert.equal(document.activeElement,element('globalSearch'));
  }
}
console.log('PASS: mobile/desktop DOM fixtures, 122 reader routes each, search, shortcut labels, persistent state, drawer and Escape focus. Layout and device rendering are not tested.');
