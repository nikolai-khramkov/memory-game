const SVG_NS = 'http://www.w3.org/2000/svg';

export const SYMBOLS = [
  { id: 'sun', label: 'Солнце' },
  { id: 'moon', label: 'Луна' },
  { id: 'star', label: 'Звезда' },
  { id: 'leaf', label: 'Лист' },
  { id: 'drop', label: 'Капля' },
  { id: 'flame', label: 'Пламя' },
  { id: 'heart', label: 'Сердце' },
  { id: 'gem', label: 'Кристалл' },
];

function svgEl(tag, attrs) {
  const node = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attrs)) {
    node.setAttribute(name, String(value));
  }
  return node;
}

function createSvg(symbolId) {
  const svg = svgEl('svg', {
    viewBox: '0 0 64 64',
    'aria-hidden': 'true',
    focusable: 'false',
  });
  svg.classList.add('icon', `icon-${symbolId}`);
  return svg;
}

function drawSun() {
  const nodes = [
    svgEl('circle', { cx: 32, cy: 32, r: 11, fill: 'currentColor' }),
  ];

  for (let index = 0; index < 8; index += 1) {
    const angle = (Math.PI / 4) * index;
    nodes.push(svgEl('line', {
      x1: 32 + Math.cos(angle) * 17,
      y1: 32 + Math.sin(angle) * 17,
      x2: 32 + Math.cos(angle) * 26,
      y2: 32 + Math.sin(angle) * 26,
      stroke: 'currentColor',
      'stroke-width': 4,
      'stroke-linecap': 'round',
    }));
  }

  return nodes;
}

function drawMoon() {
  return [
    svgEl('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      d: 'M40 8a22 22 0 1 0 0 48 16 16 0 1 1 0-48z',
    }),
  ];
}

function drawStar() {
  return [
    svgEl('polygon', {
      fill: 'currentColor',
      points: '32,6 39.5,24 58,24.5 43.5,36.5 49,55 32,44.5 15,55 20.5,36.5 6,24.5 24.5,24',
    }),
  ];
}

function drawLeaf() {
  return [
    svgEl('ellipse', {
      cx: 32,
      cy: 34,
      rx: 14,
      ry: 22,
      transform: 'rotate(-38 32 34)',
      fill: 'currentColor',
    }),
    svgEl('path', {
      d: 'M18 50c8-10 14-20 26-32',
      fill: 'none',
      stroke: '#f7f1e6',
      'stroke-width': 2.5,
      'stroke-linecap': 'round',
    }),
  ];
}

function drawDrop() {
  return [
    svgEl('path', {
      fill: 'currentColor',
      d: 'M32 6C32 6 12 28 12 40a20 20 0 0 0 40 0C52 28 32 6 32 6z',
    }),
    svgEl('ellipse', {
      cx: 25,
      cy: 38,
      rx: 4,
      ry: 6,
      fill: '#f7f1e6',
      opacity: '0.45',
    }),
  ];
}

function drawFlame() {
  return [
    svgEl('path', {
      fill: 'currentColor',
      d: 'M32 58c-11 0-18-8-16-19 1.5-8 7-11 8-21 0 0 7 7 5 16 7-7 10-18 7-26 12 9 18 22 16 34-2 10-10 16-20 16z',
    }),
  ];
}

function drawHeart() {
  return [
    svgEl('path', {
      fill: 'currentColor',
      d: 'M32 56S14 44.5 8 34C3.8 26.2 8 16 18.5 16c6.2 0 9.6 3.8 13.5 9.2C36 19.8 39.3 16 45.5 16 56 16 60.2 26.2 56 34 50 44.5 32 56 32 56z',
    }),
  ];
}

function drawGem() {
  return [
    svgEl('polygon', {
      fill: 'currentColor',
      points: '32,6 56,26 32,58 8,26',
    }),
    svgEl('polygon', {
      fill: '#f7f1e6',
      opacity: '0.35',
      points: '32,6 56,26 32,28 8,26',
    }),
    svgEl('path', {
      d: 'M8 26h48M32 6v52M18 26l14 32 14-32',
      fill: 'none',
      stroke: '#f7f1e6',
      'stroke-width': 2,
      opacity: '0.7',
    }),
  ];
}

const DRAW = {
  sun: drawSun,
  moon: drawMoon,
  star: drawStar,
  leaf: drawLeaf,
  drop: drawDrop,
  flame: drawFlame,
  heart: drawHeart,
  gem: drawGem,
};

export function createIcon(symbolId) {
  const draw = DRAW[symbolId];
  const svg = createSvg(symbolId);
  for (const shape of draw()) {
    svg.append(shape);
  }
  return svg;
}
