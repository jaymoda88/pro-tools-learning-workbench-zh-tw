"""Rebuild the portable website data. Python 3 standard library + vendored markdown2 2.5.5."""
from pathlib import Path
import sys,re,json,html,urllib.parse,shutil,unicodedata,argparse
ROOT=Path(__file__).resolve().parents[1];sys.path.insert(0,str(ROOT/'scripts/vendor'));import markdown2
args=argparse.ArgumentParser();args.add_argument('--source',type=Path,default=ROOT/'content');args=args.parse_args();SOURCE=args.source
cats=[('setup','入門與系統設定','Setup',1,10),('session','Session 與素材','Session',11,22),('record','錄音與播放','Recording',23,27),('edit','Audio 剪輯','Editing',28,34),('midi','MIDI 與編排','MIDI',35,40),('process','聲音處理','Processing',41,49),('mix','混音與交付','Mixing',50,54),('spatial','空間音訊與影像','Spatial',55,66)]
notes=[];allnames={p.stem:p for p in SOURCE.glob('*.md')};chapterfirst={}
for p in sorted(SOURCE.glob('PT-Ch*.md')):
 raw=p.read_text();m=re.search(r'^chapter:\s*(\d+)',raw,re.M)
 if not m:continue
 chapter=int(m[1]);body=re.sub(r'^---\n.*?\n---\n','',raw,count=1,flags=re.S);title=re.search(r'^# (.+)',body,re.M).group(1)
 summary=re.search(r'^> (?!\[!)(.+)',body,re.M)
 notes.append(dict(id=p.stem,title=title,chapter=chapter,category=next(c[0] for c in cats if c[3]<=chapter<=c[4]),summary=summary.group(1).replace('**','') if summary else '',markdown=body))
 chapterfirst.setdefault(chapter,p.stem)
ids={n['id'] for n in notes}
def slug(t):
 return ''.join(c for c in t.lower().strip() if c in ' -_' or unicodedata.category(c)[0] in 'LNM').replace(' ','-')
def route(id):return '#/note/'+urllib.parse.quote(id,safe='')
def wiki(m):
 embed=m.group(1);raw=m.group(2).replace('\\|','|');parts=raw.split('|',1);target=parts[0];label=parts[1] if len(parts)>1 else target;name,sep,anchor=target.partition('#')
 if name.endswith(('.png','.pdf')):
  url='assets/'+urllib.parse.quote(Path(name).name)+(('#'+anchor) if sep else '')
  return '<img alt="'+html.escape(Path(name).name,quote=True)+'" src="'+url+'">' if embed else '<a href="'+url+'" target="_blank" rel="noopener">'+html.escape(label)+'</a>'
 if name in ids:dest=route(name)+(('#'+slug(anchor)) if sep else '')
 elif not name:dest='#'+slug(anchor)
 elif name=='PT-00-Mac快捷鍵':dest='#/shortcuts'
 elif name=='PT-00-工作流程導航':dest='#/workflows'
 elif name.startswith('PT-00-'):
  ch=re.search(r'Ch(\d+)',anchor)
  dest=route(chapterfirst[int(ch.group(1))]) if ch and int(ch.group(1)) in chapterfirst else '#/topics'
 else:return '<span class="external-vault-link" title="原私人 vault 的跨書參照">'+html.escape(label)+'</span>'
 return '<a href="'+dest+'">'+html.escape(label)+'</a>'
for n in notes:
 body=re.sub(r'%%.*?%%','',n['markdown'],flags=re.S);body=re.sub(r'^# .+\n','',body,count=1,flags=re.M)
 body=re.sub(r'(!?)\[\[([^\]]+)\]\]',wiki,body)
 # math is preserved verbatim for KaTeX; keep it away from Markdown underscore parsing.
 maths=[]
 def mathhold(m):maths.append(m.group(0));return 'PTMATHPLACEHOLDER'+str(len(maths)-1)+'END'
 body=re.sub(r'\$\$.*?\$\$|(?<!\$)\$[^$\n]+\$(?!\$)',mathhold,body,flags=re.S)
 body=re.sub(r'^> \[!([a-z]+)\][+-]?\s*(.*)',lambda m:'> **'+(m.group(2) or {'tip':'實務連結','warning':'注意','important':'重點','abstract':'Takeaway'}.get(m.group(1),'補充'))+'**',body,flags=re.M)
 rendered=str(markdown2.markdown(body,extras=['tables','fenced-code-blocks','strike','task_list','footnotes']))
 rendered=rendered.replace('class="language-mermaid"','class="language-mermaid"')
 # markdown2 may emit a Pygments wrapper; force Mermaid code to the supported plain block.
 def unfence(m):
  lang=m.group(1);code=m.group(2)
  if lang!='mermaid':return m.group(0)
  return '<pre><code class="language-mermaid">'+html.escape(code)+'</code></pre>'
 # Render Mermaid separately because syntax highlighting can change its DOM.
 original_blocks=re.findall(r'```mermaid\n(.*?)```',body,re.S)
 if original_blocks:
  for block in original_blocks:
   blockhtml=str(markdown2.markdown('```mermaid\n'+block+'```',extras=['fenced-code-blocks'])).strip()
   rendered=rendered.replace(blockhtml,'<pre><code class="language-mermaid">'+html.escape(block)+'</code></pre>')
 for i,math in enumerate(maths):rendered=rendered.replace('PTMATHPLACEHOLDER'+str(i)+'END',html.escape(math))
 headings=[];seen={}
 def heading(m):
  level=int(m.group(1));content=m.group(2);text=html.unescape(re.sub('<[^>]+>','',content));base=slug(text);x=seen.get(base,0);seen[base]=x+1;id=base+(('-'+str(x)) if x else '');headings.append(dict(id=id,text=text,level=level));return '<h'+str(level)+' id="'+html.escape(id,quote=True)+'">'+content+'</h'+str(level)+'>'
 rendered=re.sub(r'<h([1-6])>(.*?)</h\1>',heading,rendered,flags=re.S)
 n.update(html=rendered,headings=headings,plain=html.unescape(re.sub('<[^>]+>',' ',rendered)))
shortcuts=[];group=''
for line in (SOURCE/'PT-00-Mac快捷鍵.md').read_text().splitlines():
 if re.match(r'^## \d\d｜',line):group=line[3:]
 if not re.match(r'^\| K\d{3} ',line):continue
 cells=re.split(r'(?<!\\)\|',line)[1:-1];cells=[x.strip() for x in cells];src=re.search(r'#page=(\d+)',cells[4]);sp=re.search(r'S(\d+)',cells[4]);shortcuts.append(dict(id=cells[0],action=cells[1],key=cells[2].strip('`'),context=cells[3],sourcePage=int(sp.group(1)),pdfPage=int(src.group(1)),group=group))
workflows=[dict(title=t,description=d,chapters=c) for t,d,c in [
 ('開始第一個 Session','從 Audio／MIDI 與資料結構，到建立 Track 和設定 I/O。',[2,11,7,6,12,13]),('錄好人聲與樂器','準備路由與監聽，再決定錄音、補錄與 Take 管理。',[6,24,25,27,33]),('把鼓剪得準又自然','先理解選取與工具，再分析、對拍及平滑接縫。',[29,30,34,32,45]),('整理人聲與 Comping','保留原始演奏，挑選 Take，再處理 Clip Gain、音準與動態。',[33,32,44,46,53]),('從混音到交付','看懂訊號路由、效果與 Automation，再選擇輸出方法。',[50,51,53,47,54]),('排查沒有聲音與延遲','從引擎、I/O、監聽與混音路徑逐層縮小範圍。',[7,6,24,50]),('MIDI 編曲與 Tempo','掌握事件與時間座標，再進入編輯、量化與編排。',[10,26,35,36,39,48]),('空間音訊與影像','從 Multichannel 路由進入 Atmos、同步與 Video。',[55,56,57,58,60,63])]]
data=dict(notes=notes,shortcuts=shortcuts,workflows=workflows,categories=[dict(id=c[0],name=c[1],english=c[2]) for c in cats])
(ROOT/'dist').mkdir(exist_ok=True);(ROOT/'dist/data.js').write_text('window.PT_DATA = '+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n')
assert len(notes)==122 and len(shortcuts)==135
print(f'Built {len(notes)} notes, {len(shortcuts)} shortcuts, {len(workflows)} workflows.')
