from PIL import Image, ImageDraw, ImageFont
import sys
F = '/usr/share/fonts/opentype/inter/'
bold = lambda s: ImageFont.truetype(F + 'Inter-Bold.otf', s)
med = lambda s: ImageFont.truetype(F + 'Inter-Medium.otf', s)

def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle([0, 0, im.size[0] - 1, im.size[1] - 1], r, fill=255)
    out = Image.new('RGBA', im.size); out.paste(im, (0, 0), m); return out

def sheet(items, cols, out, title=None, bg=(14, 16, 20)):
    W1, H1 = 780, 1688
    gap, pad, cap = 70, 80, 150
    rows = (len(items) + cols - 1) // cols
    top = 170 if title else 0
    W = pad * 2 + cols * W1 + (cols - 1) * gap
    H = top + pad + rows * (cap + H1) + (rows - 1) * gap + pad
    img = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(img)
    if title:
        d.text((pad, pad - 10), title[0], font=bold(64), fill=(255, 255, 255))
        d.text((pad, pad + 70), title[1], font=med(36), fill=(160, 168, 180))
    for i, (path, name, sub) in enumerate(items):
        c, r = i % cols, i // cols
        x = pad + c * (W1 + gap); y = top + pad + r * (cap + H1 + gap)
        d.text((x + 6, y), name, font=bold(48), fill=(255, 255, 255))
        d.text((x + 6, y + 62), sub, font=med(32), fill=(160, 168, 180))
        shot = rounded(Image.open(path).convert('RGB'), 92)
        # thin outline so dark screens read as phones
        frame = Image.new('RGBA', (W1 + 8, H1 + 8), (0, 0, 0, 0))
        ImageDraw.Draw(frame).rounded_rectangle([0, 0, W1 + 7, H1 + 7], 96, outline=(70, 76, 88), width=4)
        img.paste(frame, (x - 4, y + cap - 4), frame)
        img.paste(shot, (x, y + cap), shot)
    img.save(out, quality=86, optimize=True)
    print(out, img.size)

o = 'out2/'
sheet([(o + 'a-apple.png', '1 · Simple map', 'Real map, one search bar, 5 big buttons'),
       (o + 'b-apple.png', '2 · Right now', 'A feed that changes with the time of day'),
       (o + 'c-apple.png', '3 · Just ask', 'Say what you want, get 3 picks and why'),
       (o + 'p-apple.png', 'Place page', 'Photos, one Directions button, critic, friends')],
      2, 'final/layouts.jpg', ('I Love Boston: simpler ideas', 'Mockups · Nov 19'))
sheet([(o + 'a-apple.png', 'Apple-style dark', 'Like your Apple Maps screenshot'),
       (o + 'a-night.png', 'Night', 'Darker, more contrast'),
       (o + 'a-light.png', 'Light', 'For daytime')],
      3, 'final/dark.jpg', ('New dark mode: pick one', 'Same screen, three looks'))
