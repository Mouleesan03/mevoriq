import io, os
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import uharfbuzz as hb
import cairosvg

NAVY="#0F1B2D"; MINT="#34D399"; INDIGO="#5265E8"; WHITE="#FFFFFF"
SLATE="#64748B"; SLATE_D="#B2C0D2"; BORDER="#E2E8F0"; BORDER_D="#293A51"
OUT="/home/claude/mevoriq-brand-kit"

def inst(path, loc):
    f=TTFont(path); f=instancer.instantiateVariableFont(f, loc)
    b=io.BytesIO(); f.save(b); data=b.getvalue()
    return TTFont(io.BytesIO(data)), data
manrope, manrope_b = inst("/home/claude/fonts/Manrope.ttf", {"wght":800})
inter, inter_b = inst("/home/claude/fonts/Inter.ttf", {"wght":600,"opsz":32})

def shape(data, text):
    face=hb.Face(data); font=hb.Font(face); buf=hb.Buffer(); buf.add_str(text); buf.guess_segment_properties()
    hb.shape(font, buf, {"kern":True,"liga":True})
    return [(i.codepoint, p.x_advance) for i,p in zip(buf.glyph_infos, buf.glyph_positions)]

def text_path(font, data, text, size, x, baseline, tracking=0.0):
    """returns (svg path d, end_x, glyph x positions)"""
    upem=font["head"].unitsPerEm; s=size/upem; gs=font.getGlyphSet(); order=font.getGlyphOrder()
    pen=SVGPathPen(gs); xs=[]; cx=x
    for gid,adv in shape(data,text):
        name=order[gid]; xs.append((name,cx))
        tp=TransformPen(pen,(s,0,0,-s,cx,baseline)); gs[name].draw(tp)
        cx+=adv*s+tracking*size
    return pen.getCommands(), cx-tracking*size, xs

def gbounds(font,name):
    gs=font.getGlyphSet(); bp=BoundsPen(gs); gs[name].draw(bp); return bp.bounds

cmap=manrope.getBestCmap()
DOTLESS=cmap[0x131]; IGLY=cmap[ord('i')]
UPEM_M=manrope["head"].unitsPerEm
CAP_M=manrope["OS/2"].sCapHeight

def symbol(x,y,size,bg=NAVY,fg=WHITE,node=MINT,ring=None,sw=6.5,show_node=True,rx=16,outline=False):
    k=size/64; ring=ring or bg
    t=f'<g transform="translate({x:.2f},{y:.2f}) scale({k:.5f})">'
    if outline: t+=f'<rect x="2" y="2" width="60" height="60" rx="{rx-2}" fill="none" stroke="{fg}" stroke-width="3"/>'
    elif bg: t+=f'<rect width="64" height="64" rx="{rx}" fill="{bg}"/>'
    t+=f'<path d="M16 46V22l16 17 16-17v24" fill="none" stroke="{fg}" stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round"/>'
    if show_node: t+=f'<circle cx="32" cy="39" r="6" fill="{node}" stroke="{ring}" stroke-width="2.5"/>'
    return t+'</g>'

def wordmark(x, baseline, size, color, dot):
    d,endx,xs=text_path(manrope, manrope_b, "Mevor\u0131q", size, x, baseline, -0.035)
    s=size/UPEM_M
    gx=[gx for n,gx in xs if n==DOTLESS][0]
    db=gbounds(manrope,DOTLESS); ib=gbounds(manrope,IGLY)
    stem=(db[2]-db[0]); r=stem*0.62*s
    cxp=gx+(db[0]+db[2])/2*s; cyp=baseline-(ib[3]*s)+r
    return f'<path d="{d}" fill="{color}"/><circle cx="{cxp:.2f}" cy="{cyp:.2f}" r="{r:.2f}" fill="{dot}"/>', endx

def svgdoc(w,h,body,bg=None,title="Mevoriq"):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" aria-label="{title}"><title>{title}</title>{b}{body}</svg>'

def horizontal(mode="light", product=None):
    SYM=120; GAP=32; WS=104; pad=24
    fg = NAVY if mode in("light","mono") else WHITE
    symbg = NAVY if mode=="light" else (WHITE if mode=="dark" else None)
    symfg = WHITE if mode=="light" else NAVY
    node = MINT if mode!="mono" else NAVY
    ring = NAVY if mode=="light" else (WHITE if mode=="dark" else WHITE)
    dot = MINT if mode!="mono" else NAVY
    H=SYM+2*pad; cy=H/2
    baseline=cy+ (CAP_M*WS/UPEM_M)/2
    body=symbol(pad,pad,SYM,bg=symbg,fg=symfg if mode!="mono" else NAVY,node=node,ring=ring,outline=(mode=="mono"))
    wm,endx=wordmark(pad+SYM+GAP, baseline, WS, fg, dot)
    body+=wm; x=endx
    if product:
        x+=GAP; body+=f'<rect x="{x:.2f}" y="{cy-WS/2:.2f}" width="2" height="{WS}" fill="{BORDER if mode!="dark" else BORDER_D}"/>'
        x+=2+GAP; PS=64
        icap=inter["OS/2"].sCapHeight*PS/inter["head"].unitsPerEm
        d,endp,_=text_path(inter, inter_b, product, PS, x, cy+icap/2, -0.01)
        col = SLATE if mode=="light" else (SLATE_D if mode=="dark" else NAVY)
        body+=f'<path d="{d}" fill="{col}"/>'; x=endp
    W=x+pad
    return svgdoc(W,H,body,title=f"Mevoriq {product or ''}".strip())

def stacked(mode="light"):
    SYM=160; WS=96; pad=24
    d,endx,_=text_path(manrope, manrope_b, "Mevor\u0131q", WS, 0, 0, -0.035)
    W=max(SYM,endx)+2*pad
    fg=NAVY if mode=="light" else WHITE
    body=symbol((W-SYM)/2,pad,SYM,bg=NAVY if mode=="light" else WHITE,fg=WHITE if mode=="light" else NAVY,ring=NAVY if mode=="light" else WHITE)
    baseline=pad+SYM+36+CAP_M*WS/UPEM_M
    wm,_=wordmark((W-endx)/2, baseline, WS, fg, MINT)
    H=baseline+WS*0.28+pad
    return svgdoc(W,H,body+wm,title="Mevoriq")

def meet_badge(x,y,size):
    k=size/40
    return (f'<g transform="translate({x:.2f},{y:.2f}) scale({k:.5f})"><circle cx="20" cy="20" r="18" fill="{INDIGO}" stroke="{WHITE}" stroke-width="3"/>'
            f'<circle cx="20" cy="20" r="11" fill="none" stroke="{MINT}" stroke-width="2.4" opacity="0.55"/><circle cx="20" cy="20" r="5" fill="{MINT}"/></g>')

def app_icon_meet(size=512):
    # icon inset so badge fits inside the square canvas
    ic=size*0.86; b=size*0.36
    return svgdoc(size,size, symbol(0,0,ic,rx=15)+meet_badge(size-b,size-b,b), title="Mevoriq Meet app icon")

def write(rel, txt):
    p=os.path.join(OUT,rel); os.makedirs(os.path.dirname(p),exist_ok=True); open(p,"w").write(txt); return p
def png(svgtxt, rel, w=None, h=None, scale=None):
    p=os.path.join(OUT,rel); os.makedirs(os.path.dirname(p),exist_ok=True)
    kw={}
    if w: kw["output_width"]=w
    if h: kw["output_height"]=h
    if scale: kw["scale"]=scale
    cairosvg.svg2png(bytestring=svgtxt.encode(), write_to=p, **kw)

L="logos/mevoriq"; M="logos/mevoriq-meet"; I="icons"
svgs={
 f"{L}/svg/mevoriq-logo-horizontal-primary.svg": horizontal("light"),
 f"{L}/svg/mevoriq-logo-horizontal-dark.svg": horizontal("dark"),
 f"{L}/svg/mevoriq-logo-horizontal-monochrome.svg": horizontal("mono"),
 f"{L}/svg/mevoriq-logo-stacked.svg": stacked("light"),
 f"{L}/svg/mevoriq-logo-stacked-dark.svg": stacked("dark"),
 f"{L}/svg/mevoriq-symbol.svg": svgdoc(64,64,symbol(0,0,64),title="Mevoriq symbol"),
 f"{L}/svg/mevoriq-symbol-white.svg": svgdoc(64,64,symbol(0,0,64,bg=WHITE,fg=NAVY,ring=WHITE),title="Mevoriq symbol white"),
 f"{L}/svg/mevoriq-symbol-monochrome.svg": svgdoc(64,64,symbol(0,0,64,bg=None,fg=NAVY,node=NAVY,ring=WHITE,outline=True),title="Mevoriq symbol monochrome"),
 f"{L}/svg/mevoriq-favicon.svg": svgdoc(64,64,symbol(0,0,64,sw=8,rx=14),title="Mevoriq"),
 f"{M}/svg/mevoriq-meet-horizontal.svg": horizontal("light","Meet"),
 f"{M}/svg/mevoriq-meet-horizontal-dark.svg": horizontal("dark","Meet"),
 f"{M}/svg/mevoriq-meet-horizontal-monochrome.svg": horizontal("mono","Meet"),
 f"{M}/svg/mevoriq-meet-badge.svg": svgdoc(40,40,meet_badge(0,0,40),title="Mevoriq Meet badge"),
 f"{M}/svg/mevoriq-meet-app-icon.svg": app_icon_meet(512),
}
for rel,t in svgs.items():
    write(rel,t)
    if "/svg/" in rel and "favicon" not in rel and "badge" not in rel:
        base=os.path.basename(rel)[:-4]; root=rel.split("/svg/")[0]
        for sc in (1,2,4):
            png(t, f"{root}/png/{base}@{sc}x.png", scale=sc)

fav16=svgdoc(64,64,symbol(0,0,64,sw=9,rx=14,show_node=False))
fav=svgs[f"{L}/svg/mevoriq-favicon.svg"]
png(fav16,f"{I}/favicon-16.png",16,16)
png(fav,f"{I}/favicon-32.png",32,32); png(fav,f"{I}/favicon-48.png",48,48)
full=svgdoc(64,64,f'<rect width="64" height="64" fill="{NAVY}"/>'+symbol(8,8,48,rx=0))  # full-bleed for iOS/PWA masks
png(full,f"{I}/apple-touch-icon-180.png",180,180)
png(svgs[f"{L}/svg/mevoriq-symbol.svg"],f"{I}/pwa-icon-192.png",192,192)
png(svgs[f"{L}/svg/mevoriq-symbol.svg"],f"{I}/pwa-icon-512.png",512,512)
png(full,f"{I}/pwa-icon-maskable-512.png",512,512)
avatar=svgdoc(64,64,f'<rect width="64" height="64" fill="{NAVY}"/>'+symbol(12,12,40,bg=None))
png(avatar,f"{I}/social-avatar-1024.png",1024,1024)
png(svgs[f"{M}/svg/mevoriq-meet-app-icon.svg"],f"{I}/mevoriq-meet-app-icon-1024.png",1024,1024)
print("done")
