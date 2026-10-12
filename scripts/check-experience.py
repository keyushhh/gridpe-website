"""Verify deployed scene assets and content destinations without network writes."""
from pathlib import Path
from urllib.parse import unquote
import re,json
root=Path(__file__).resolve().parent.parent
engine=(root/'assets/experience/engine.js').read_text()
css=(root/'assets/experience/experience.css').read_text()
css+='\n'+(root/'assets/experience/responsive.css').read_text()+'\n'+(root/'assets/experience/story.css').read_text()
html=(root/'gridpe-experience.html').read_text()
html+=''.join(p.read_text() for p in (root/'experience').glob('*.html'))
css+='\n'+(root/'assets/experience/companions.css').read_text()
for entry in ['pages.js', 'companions.css', 'notes-scene.js']:
 assert (root/'assets/experience'/entry).is_file(),entry
paths=set(re.findall(r'assets/[A-Za-z0-9_./% -]+\.(?:glb|webp|png|jpg|mp3|mp4|svg|ktx2|otf|ico)',engine+html))
paths.update(x.strip("\"'").lstrip('/') for x in re.findall(r'url\(([^)]+)\)',css))
paths.update(['vendor/draco/draco_wasm_wrapper.js','vendor/draco/draco_decoder.wasm','vendor/basis/basis_transcoder.js','vendor/basis/basis_transcoder.wasm','assets/videos/star_animation_480.mp4','assets/videos/star_animation_720.mp4'])
missing=[p for p in paths if not (root/unquote(p)).is_file()]
assert not missing, f'Missing public assets: {missing}'
for entry in ['engine.js','boot.js','viewport.js','waitlist.js']:
 module=root/'assets/experience'/entry
 assert module.is_file(),entry
 for imported in re.findall(r"(?:from\s+|import\s*\(?)[\"'](\.[^\"']+)[\"']",module.read_text()):
  assert (module.parent/imported).is_file(),f'Missing module: {entry} -> {imported}'
for href in re.findall(r'<link[^>]+href="(/assets/[^\"]+\.css)"',html):
 assert (root/href.lstrip('/')).is_file(),href
assert 'user-scalable=no' not in html and 'maximum-scale=1' not in html,'Browser zoom disabled'
for forbidden in ['htyygaanbsjnlftloicg','Join-Zero','zero.university','googletagmanager']:
 assert forbidden not in engine+html, f'Reference destination retained: {forbidden}'
for p in paths:
 assert (root/unquote(p)).stat().st_size>0,p
spec=json.loads((root/'assets/experience/content.json').read_text())
for slot in spec['slots']:
 x,y,w,h=slot['rect'];w,h=(h,w) if slot.get('rotate') else (w,h)
 assert x>=0 and y>=0 and (x+w)*1.5<=3073 and (y+h)*1.5<=3073,slot['id']
import subprocess
assert (root/'index.html').read_bytes()==subprocess.check_output(['git','show','HEAD:index.html']), 'Existing homepage changed'
print(f'{len(paths)} public asset paths verified; atlas bounds and signup destinations passed.')
