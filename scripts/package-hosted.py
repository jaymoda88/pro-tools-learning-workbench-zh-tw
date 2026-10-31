"""Build the owner-private hosted edition. Source PDFs remain in the offline bundle."""
from pathlib import Path
import shutil
root=Path(__file__).resolve().parents[1]
out=root/'site-dist'
if out.exists():shutil.rmtree(out)
shutil.copytree(root/'dist',out,ignore=shutil.ignore_patterns('*.pdf'))
base='https://resources.avid.com/SupportFiles/PT/'
for file in out.rglob('*'):
 if file.suffix in ('.js','.html'):
  s=file.read_text()
  for name in ['Pro_Tools_Reference_Guide_2023.3.pdf','Pro_Tools_Shortcuts_2023.3.pdf']:
   s=s.replace('assets/'+name,base+name)
  file.write_text(s)
print('Hosted edition prepared; PDF links use original Avid URLs, offline edition retains local PDFs.')
