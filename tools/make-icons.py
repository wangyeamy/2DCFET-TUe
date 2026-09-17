#!/usr/bin/env python3
"""Generates the app icons: a De Stijl-style composition in Delft blue,
paper white and one orange square. No image libraries needed."""
import struct, zlib, os

INK    = (0x11, 0x15, 0x1B)
BLUE   = (0x12, 0x40, 0x9B)
ORANGE = (0xCF, 0x5F, 0x19)
PAPER  = (0xFF, 0xFF, 0xFF)


def compose(size, inset_ratio=0.0):
    """Returns a size x size RGB pixel buffer."""
    inset = int(size * inset_ratio)
    field = size - 2 * inset
    rule = max(2, round(field * 0.043))          # black rule thickness
    vx = inset + round(field * 0.60)             # vertical rule, left edge
    hy = inset + round(field * 0.58)             # horizontal rule, top edge
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            if x < inset or y < inset or x >= size - inset or y >= size - inset:
                c = BLUE if inset else INK       # bleed blue behind a maskable crop
            elif (x < inset + rule or y < inset + rule
                  or x >= size - inset - rule or y >= size - inset - rule):
                c = INK                          # frame
            elif vx <= x < vx + rule:
                c = INK                          # vertical rule
            elif x > vx and hy <= y < hy + rule:
                c = INK                          # horizontal rule, right column only
            elif x < vx:
                c = BLUE
            elif y < hy:
                c = PAPER
            else:
                c = ORANGE
            row += bytes(c)
        rows.append(bytes(row))
    return rows


def write_png(path, rows, size):
    raw = b''.join(b'\x00' + r for r in rows)

    def chunk(tag, data):
        body = tag + data
        return struct.pack('>I', len(data)) + body + struct.pack('>I', zlib.crc32(body) & 0xFFFFFFFF)

    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('>IIBBBBB', size, size, 8, 2, 0, 0, 0))
           + chunk(b'IDAT', zlib.compress(raw, 9))
           + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(png)
    return len(png)


here = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(here, 'icons')
os.makedirs(out, exist_ok=True)
for name, size, inset in [('icon-192.png', 192, 0.0), ('icon-512.png', 512, 0.0),
                          ('icon-180.png', 180, 0.0), ('icon-maskable-512.png', 512, 0.14)]:
    n = write_png(os.path.join(out, name), compose(size, inset), size)
    print('%-24s %5d bytes' % (name, n))
