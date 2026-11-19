"""Draws downtown Boston from OpenFreeMap / OpenMapTiles vector tiles (OpenStreetMap data) as one SVG.
Colors come from CSS variables, so the same map follows the page's light or dark theme."""
import math, json, sys
import mapbox_vector_tile as mvt

DTX = (19831.867 * 256, 24240.75 * 256)          # Downtown Crossing in zoom-16 pixels
SCALE = float(sys.argv[1]) if len(sys.argv) > 1 else 2 ** (15.25 - 16)   # output px per zoom-16 px
RW = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0   # road width multiplier
NOBLD = True   # the guide's map leaves buildings out: lighter file, calmer look
FS = float(sys.argv[4]) if len(sys.argv) > 4 else 9.5   # street label size
B = dict(x0=-620, x1=620, y0=-660, y1=580)       # bounds around DTX, in zoom-16 px (the half-mile ring plus a margin)
TILES = [(4957, 6059), (4958, 6059), (4957, 6060), (4958, 6060)]
OUT = sys.argv[2] if len(sys.argv) > 2 else 'map.svg'
PFX = __import__('os').path.basename(OUT).split('.')[0]   # keeps label path ids unique when two maps share a page

def tile_pt(tx, ty, gx, gy):
    zx = tx * 1024 + gx / 4096 * 1024
    zy = ty * 1024 + gy / 4096 * 1024
    return ((zx - DTX[0] - B['x0']) * SCALE, (zy - DTX[1] - B['y0']) * SCALE)

W = (B['x1'] - B['x0']) * SCALE
H = (B['y1'] - B['y0']) * SCALE

layers = {}
for tx, ty in TILES:
    t = mvt.decode(open('mvt/%d_%d.pbf' % (tx, ty), 'rb').read(), default_options={'y_coord_down': True})
    for name, layer in t.items():
        for f in layer['features']:
            layers.setdefault(name, []).append((tx, ty, f))

def rings(tx, ty, geom):
    t = geom['type']; c = geom['coordinates']
    if t == 'Polygon': polys = [c]
    elif t == 'MultiPolygon': polys = c
    else: return []
    return [[[tile_pt(tx, ty, x, y) for x, y in ring] for ring in poly] for poly in polys]

def lines(tx, ty, geom):
    t = geom['type']; c = geom['coordinates']
    if t == 'LineString': ls = [c]
    elif t == 'MultiLineString': ls = c
    else: return []
    return [[tile_pt(tx, ty, x, y) for x, y in l] for l in ls]

def inview(pts, pad=40):
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return max(xs) > -pad and min(xs) < W + pad and max(ys) > -pad and min(ys) < H + pad

def fmt(v): return ('%.1f' % v).rstrip('0').rstrip('.')
def _rel(pts, close):
    # whole-pixel points, written as small relative steps (much smaller files, same look)
    r = [(int(round(x)), int(round(y))) for x, y in pts]
    out = [r[0]]
    for p in r[1:]:
        if p != out[-1]: out.append(p)
    if len(out) < (3 if close else 2): return ''
    d = 'M%d %d' % out[0]
    if len(out) > 1:
        d += 'l' + ' '.join('%d %d' % (b[0] - a[0], b[1] - a[1]) for a, b in zip(out, out[1:]))
    return d + ('z' if close else '')
def d_poly(polys):
    return ''.join(_rel(ring, True) for poly in polys for ring in poly if len(ring) >= 3)
def d_line(l):
    return _rel(l, False)
def simplify(l, tol=0.6):
    # drop points closer than tol to the previous kept point (keeps the end)
    if len(l) < 3: return l
    out = [l[0]]
    for p in l[1:-1]:
        if math.hypot(p[0] - out[-1][0], p[1] - out[-1][1]) >= tol: out.append(p)
    out.append(l[-1]); return out

svg = []
# ---- land cover: parks, grass, woods; water
green_cls = {'grass': 'park', 'wood': 'wood', 'park': 'park', 'garden': 'park', 'pitch': 'park', 'playground': 'park', 'cemetery': 'park2', 'recreation_ground': 'park'}
greens = {'park': [], 'park2': [], 'wood': []}
for name in ('landcover', 'landuse', 'park'):
    for tx, ty, f in layers.get(name, []):
        cls = f['properties'].get('class'); sub = f['properties'].get('subclass')
        key = green_cls.get(sub) or green_cls.get(cls)
        if name == 'park': key = 'park'
        if not key: continue
        for poly in rings(tx, ty, f['geometry']):
            if poly and inview(poly[0]): greens[key].append(d_poly([poly]))
water = []
for tx, ty, f in layers.get('water', []):
    if f['properties'].get('class') == 'swimming_pool': continue
    for poly in rings(tx, ty, f['geometry']):
        if poly and inview(poly[0]): water.append(d_poly([poly]))
# ---- buildings (a slightly darker copy underneath gives them a little depth)
bld = []
for tx, ty, f in ([] if NOBLD else layers.get('building', [])):
    for poly in rings(tx, ty, f['geometry']):
        if poly and inview(poly[0]): bld.append(d_poly([poly]))
# ---- roads by class
ROAD = {'motorway': (5.2, 'hw'), 'trunk': (4.6, 'hw'), 'primary': (4.2, 'major'), 'secondary': (3.6, 'major'), 'tertiary': (3.0, 'minor'),
        'minor': (2.3, 'minor'), 'service': (1.3, 'service'), 'path': (0.9, 'path'), 'track': (0.9, 'path'), 'pier': (1.4, 'service')}
roads = {k: [] for k in ('hw', 'major', 'minor', 'service', 'path', 'ped')}
widths = {}
for tx, ty, f in layers.get('transportation', []):
    p = f['properties']; cls = p.get('class')
    if p.get('brunnel') == 'tunnel' or cls in ('rail', 'transit', 'bridge', 'ferry', 'aerialway'): continue
    if cls not in ROAD or cls in ('service', 'path', 'track', 'pier'): continue
    w, k = ROAD[cls]
    if p.get('subclass') in ('pedestrian',) or (cls == 'minor' and p.get('subclass') == 'pedestrian'): k = 'ped'; w = 2.6
    for l in lines(tx, ty, f['geometry']):
        if len(l) > 1 and inview(l):
            roads[k].append((w * RW, d_line(simplify(l))))
# ---- street names along their streets
names = []
seen = {}
for tx, ty, f in layers.get('transportation_name', []):
    p = f['properties']; nm = p.get('name:en') or p.get('name')
    cls = p.get('class')
    if not nm or cls not in ('primary', 'secondary', 'tertiary', 'minor', 'trunk'): continue
    if p.get('brunnel') == 'tunnel': continue
    for l in lines(tx, ty, f['geometry']):
        if len(l) < 2 or not inview(l, -10): continue
        length = sum(math.hypot(l[i + 1][0] - l[i][0], l[i + 1][1] - l[i][1]) for i in range(len(l) - 1))
        need = len(nm) * FS * 0.58 + 14
        if length < need: continue
        if l[-1][0] < l[0][0]: l = l[::-1]                       # read left to right
        mid = l[len(l) // 2]
        prev = seen.get(nm, [])
        if any(math.hypot(mid[0] - a, mid[1] - b) < 340 * SCALE for a, b in prev): continue
        prev.append(mid); seen[nm] = prev
        names.append((nm, d_line(simplify(l, 1.5)), length, need, cls))
# ---- neighborhood names
places = []
for tx, ty, f in layers.get('place', []):
    p = f['properties']
    if p.get('class') not in ('suburb', 'neighbourhood', 'quarter'): continue
    nm = p.get('name:en') or p.get('name')
    x, y = tile_pt(tx, ty, *f['geometry']['coordinates'])
    if 20 < x < W - 20 and 20 < y < H - 20 and nm not in [q[0] for q in places] and nm not in ('Church Green', 'Dock Square', 'Downtown Boston'):
        places.append((nm, x, y))
park_names = []
for tx, ty, f in layers.get('park', []):
    nm = f['properties'].get('name:en') or f['properties'].get('name')
    if not nm: continue
    for poly in rings(tx, ty, f['geometry']):
        ring = poly[0]
        if len(ring) < 3: continue
        a = 0; cx = 0; cy = 0
        for i in range(len(ring)):
            x1, y1 = ring[i]; x2, y2 = ring[(i + 1) % len(ring)]
            cr = x1 * y2 - x2 * y1; a += cr; cx += (x1 + x2) * cr; cy += (y1 + y2) * cr
        if abs(a) < 1e-6: continue
        a /= 2; cx /= (6 * a); cy /= (6 * a)
        area = abs(a)
        if area < 9000 * SCALE * SCALE: continue
        if 0 < cx < W and 0 < cy < H: park_names.append((nm, cx, cy, area))
best = {}
for nm, x, y, ar in park_names:
    if nm not in best or ar > best[nm][2]: best[nm] = (x, y, ar)
park_names = [(nm, v[0], v[1]) for nm, v in best.items()]
water_names = []
for tx, ty, f in layers.get('water_name', []):
    nm = f['properties'].get('name:en') or f['properties'].get('name')
    g = f['geometry']
    if g['type'] != 'Point' or not nm: continue
    x, y = tile_pt(tx, ty, *g['coordinates'])
    if 0 < x < W and 0 < y < H and nm not in [q[0] for q in water_names]: water_names.append((nm, x, y))

out = ['<!-- Map data (c) OpenStreetMap contributors, ODbL. Tiles: OpenFreeMap, OpenMapTiles schema. Drawn by genmap.py -->', '<svg xmlns="http://www.w3.org/2000/svg" class="rmap" width="%s" height="%s" viewBox="0 0 %s %s">' % (fmt(W), fmt(H), fmt(W), fmt(H))]
out.append('<rect width="100%" height="100%" class="m-land"/>')
for k in ('park2', 'wood', 'park'):
    if greens[k]: out.append('<path class="m-%s" d="%s"/>' % (k, ''.join(greens[k])))
if water: out.append('<path class="m-water" d="%s"/>' % ''.join(water))
# paths inside parks first (under buildings), then buildings with depth

if bld:
    allb = ''.join(bld)
    # one copy of the buildings, drawn twice: a shadow 1.6px down, then the roofs
    out.append('<defs><path id="%s-bld" d="%s"/></defs>' % (PFX, allb))
    out.append('<use href="#%s-bld" class="m-bld-side" transform="translate(0 1.6)"/>' % PFX)
    out.append('<use href="#%s-bld" class="m-bld"/>' % PFX)
def road_group(keys, cls, extra):
    segs = [(w, d) for k in keys for w, d in roads[k]]
    return '<g class="%s" fill="none" stroke-linecap="round" stroke-linejoin="round">' % cls + ''.join('<path d="%s" stroke-width="%s"/>' % (d, fmt(w + extra)) for w, d in segs if d) + '</g>'
out.append(road_group(['minor', 'ped', 'major', 'hw'], 'm-case', 1.6 * RW))
out.append(road_group(['ped'], 'm-ped', 0))
out.append(road_group(['minor'], 'm-minor', 0))
out.append(road_group(['major'], 'm-major', 0))
out.append(road_group(['hw'], 'm-hw', 0))
# labels
out.append('<defs>' + ''.join('<path id="%s-sn%d" d="%s"/>' % (PFX, i, d) for i, (nm, d, L, need, cls) in enumerate(names)) + '</defs>')
lab = ['<g class="m-street-lbl" font-size="%s" font-weight="600">' % fmt(FS)]
for i, (nm, d, L, need, cls) in enumerate(names):
    lab.append('<text dy="%s">' % fmt(FS * 0.34) + '<textPath href="#%s-sn%d" startOffset="50%%" text-anchor="middle">%s</textPath></text>' % (PFX, i, nm.replace('&', '&amp;')))
lab.append('</g>')
out += lab
out.append('<g class="m-hood-lbl" font-size="9.5" font-weight="700" letter-spacing="1.6" text-anchor="middle">' + ''.join('<text x="%s" y="%s">%s</text>' % (fmt(x), fmt(y), nm.upper().replace('&', '&amp;')) for nm, x, y in places) + '</g>')
out.append('<g class="m-water-lbl" font-size="10" font-weight="600" font-style="italic" text-anchor="middle">' + ''.join('<text x="%s" y="%s">%s</text>' % (fmt(x), fmt(y), nm.replace('&', '&amp;')) for nm, x, y in water_names) + '</g>')
out.append('<g class="m-park-lbl" font-size="%s" font-weight="600" text-anchor="middle">' % fmt(FS + 1) + ''.join('<text x="%s" y="%s">%s</text>' % (fmt(x), fmt(y), nm.replace('&', '&amp;')) for nm, x, y in park_names) + '</g>')
out.append('</svg>')
s = ''.join(out)
open(OUT, 'w').write(s)
meta = {'W': W, 'H': H, 'scale': SCALE, 'bounds': B, 'dtx_px': [(-B['x0']) * SCALE, (-B['y0']) * SCALE], 'names': len(names), 'places': places, 'water_names': water_names, 'bytes': len(s)}
json.dump(meta, open(OUT + '.json', 'w'), indent=1)
print(json.dumps({k: meta[k] for k in ('W', 'H', 'dtx_px', 'names', 'bytes')}))
print('places', [p[0] for p in places]); print('water', [p[0] for p in water_names]); print('parks', [p[0] for p in park_names])
