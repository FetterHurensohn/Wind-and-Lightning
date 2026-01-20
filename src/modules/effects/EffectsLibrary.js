/**
 * Effects Module - Vollständige Effekt-Bibliothek
 * Filter, Color Grading, LUTs, Transitions, Masken
 */

import { v4 as uuidv4 } from 'uuid';

// === FILTER PRESETS ===
export const FILTER_PRESETS = {
  // Basic Adjustments
  basic: [
    { id: 'exposure', name: 'Belichtung', type: 'adjustment', parameters: { exposure: { min: -3, max: 3, default: 0 } } },
    { id: 'contrast', name: 'Kontrast', type: 'adjustment', parameters: { contrast: { min: -100, max: 100, default: 0 } } },
    { id: 'brightness', name: 'Helligkeit', type: 'adjustment', parameters: { brightness: { min: -100, max: 100, default: 0 } } },
    { id: 'saturation', name: 'Sättigung', type: 'adjustment', parameters: { saturation: { min: -100, max: 100, default: 0 } } },
    { id: 'vibrance', name: 'Dynamik', type: 'adjustment', parameters: { vibrance: { min: -100, max: 100, default: 0 } } },
    { id: 'highlights', name: 'Lichter', type: 'adjustment', parameters: { highlights: { min: -100, max: 100, default: 0 } } },
    { id: 'shadows', name: 'Schatten', type: 'adjustment', parameters: { shadows: { min: -100, max: 100, default: 0 } } },
    { id: 'whites', name: 'Weiß', type: 'adjustment', parameters: { whites: { min: -100, max: 100, default: 0 } } },
    { id: 'blacks', name: 'Schwarz', type: 'adjustment', parameters: { blacks: { min: -100, max: 100, default: 0 } } },
    { id: 'temperature', name: 'Temperatur', type: 'adjustment', parameters: { temperature: { min: -100, max: 100, default: 0 } } },
    { id: 'tint', name: 'Tönung', type: 'adjustment', parameters: { tint: { min: -100, max: 100, default: 0 } } }
  ],
  
  // Color Grading
  colorGrading: [
    { id: 'lift', name: 'Lift (Schatten)', type: 'colorWheel', parameters: { r: 0, g: 0, b: 0, luminance: 0 } },
    { id: 'gamma', name: 'Gamma (Mitteltöne)', type: 'colorWheel', parameters: { r: 0, g: 0, b: 0, luminance: 0 } },
    { id: 'gain', name: 'Gain (Lichter)', type: 'colorWheel', parameters: { r: 0, g: 0, b: 0, luminance: 0 } },
    { id: 'offset', name: 'Offset', type: 'colorWheel', parameters: { r: 0, g: 0, b: 0 } }
  ],
  
  // HSL
  hsl: [
    { id: 'hsl-red', name: 'Rot', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-orange', name: 'Orange', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-yellow', name: 'Gelb', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-green', name: 'Grün', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-aqua', name: 'Aqua', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-blue', name: 'Blau', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-purple', name: 'Lila', parameters: { hue: 0, saturation: 0, luminance: 0 } },
    { id: 'hsl-magenta', name: 'Magenta', parameters: { hue: 0, saturation: 0, luminance: 0 } }
  ],
  
  // Film Emulation
  film: [
    { id: 'kodak-portra-400', name: 'Kodak Portra 400', preview: 'linear-gradient(45deg, #d4a574, #8b6914)' },
    { id: 'kodak-ektar-100', name: 'Kodak Ektar 100', preview: 'linear-gradient(45deg, #ff6b6b, #ffd93d)' },
    { id: 'fuji-velvia-50', name: 'Fuji Velvia 50', preview: 'linear-gradient(45deg, #00c9ff, #92fe9d)' },
    { id: 'fuji-superia-400', name: 'Fuji Superia 400', preview: 'linear-gradient(45deg, #667eea, #764ba2)' },
    { id: 'ilford-hp5', name: 'Ilford HP5 (B&W)', preview: 'linear-gradient(45deg, #333, #999)' },
    { id: 'cinestill-800t', name: 'CineStill 800T', preview: 'linear-gradient(45deg, #00b4db, #0083b0)' }
  ],
  
  // Cinematic Looks
  cinematic: [
    { id: 'teal-orange', name: 'Teal & Orange', preview: 'linear-gradient(45deg, #008080, #ff8c00)' },
    { id: 'blockbuster', name: 'Blockbuster', preview: 'linear-gradient(45deg, #1a1a2e, #16213e)' },
    { id: 'vintage-film', name: 'Vintage Film', preview: 'linear-gradient(45deg, #c79081, #dfa579)' },
    { id: 'noir', name: 'Film Noir', preview: 'linear-gradient(45deg, #232526, #414345)' },
    { id: 'desaturated', name: 'Desaturated', preview: 'linear-gradient(45deg, #606c88, #3f4c6b)' },
    { id: 'high-contrast', name: 'High Contrast', preview: 'linear-gradient(45deg, #000, #fff)' }
  ],
  
  // Instagram-Style
  social: [
    { id: 'clarendon', name: 'Clarendon', preview: 'linear-gradient(45deg, #4facfe, #00f2fe)' },
    { id: 'gingham', name: 'Gingham', preview: 'linear-gradient(45deg, #f5f7fa, #c3cfe2)' },
    { id: 'moon', name: 'Moon', preview: 'linear-gradient(45deg, #2c3e50, #3498db)' },
    { id: 'lark', name: 'Lark', preview: 'linear-gradient(45deg, #ffecd2, #fcb69f)' },
    { id: 'reyes', name: 'Reyes', preview: 'linear-gradient(45deg, #ffe5b4, #ffd1dc)' },
    { id: 'juno', name: 'Juno', preview: 'linear-gradient(45deg, #ff9a9e, #fecfef)' }
  ]
};

// === BLUR & SHARPEN EFFECTS ===
export const BLUR_EFFECTS = [
  { id: 'gaussian-blur', name: 'Gauss\'scher Weichzeichner', parameters: { radius: { min: 0, max: 100, default: 10 } } },
  { id: 'motion-blur', name: 'Bewegungsunschärfe', parameters: { angle: { min: 0, max: 360, default: 0 }, distance: { min: 0, max: 100, default: 20 } } },
  { id: 'radial-blur', name: 'Radialer Weichzeichner', parameters: { amount: { min: 0, max: 100, default: 20 }, centerX: 50, centerY: 50 } },
  { id: 'zoom-blur', name: 'Zoom-Unschärfe', parameters: { amount: { min: 0, max: 100, default: 20 }, centerX: 50, centerY: 50 } },
  { id: 'tilt-shift', name: 'Tilt-Shift', parameters: { position: 50, blur: 20, size: 30 } },
  { id: 'lens-blur', name: 'Objektiv-Unschärfe', parameters: { radius: 15, brightness: 0, threshold: 128 } },
  { id: 'sharpen', name: 'Schärfen', parameters: { amount: { min: 0, max: 200, default: 50 }, radius: 1, threshold: 0 } },
  { id: 'unsharp-mask', name: 'Unscharf maskieren', parameters: { amount: 100, radius: 1, threshold: 0 } }
];

// === DISTORTION EFFECTS ===
export const DISTORTION_EFFECTS = [
  { id: 'lens-distortion', name: 'Objektivverzerrung', parameters: { amount: 0, scale: 100 } },
  { id: 'perspective', name: 'Perspektive', parameters: { horizontal: 0, vertical: 0 } },
  { id: 'wave', name: 'Welle', parameters: { amplitude: 10, frequency: 5, phase: 0 } },
  { id: 'twirl', name: 'Strudel', parameters: { angle: 0, radius: 100 } },
  { id: 'spherize', name: 'Kugel', parameters: { amount: 50 } },
  { id: 'pinch', name: 'Quetschen', parameters: { amount: 0 } }
];

// === STYLIZE EFFECTS ===
export const STYLIZE_EFFECTS = [
  { id: 'vignette', name: 'Vignette', parameters: { amount: 50, size: 50, roundness: 50, feather: 50 } },
  { id: 'grain', name: 'Filmkorn', parameters: { amount: 25, size: 25, roughness: 50 } },
  { id: 'glow', name: 'Glühen', parameters: { threshold: 50, radius: 10, intensity: 50 } },
  { id: 'halftone', name: 'Halbton', parameters: { size: 5, angle: 45 } },
  { id: 'posterize', name: 'Tontrennung', parameters: { levels: 6 } },
  { id: 'pixelate', name: 'Pixeln', parameters: { size: 10 } },
  { id: 'emboss', name: 'Relief', parameters: { angle: 135, height: 2 } },
  { id: 'oil-paint', name: 'Ölfarbe', parameters: { radius: 3, levels: 8 } },
  { id: 'cartoon', name: 'Cartoon', parameters: { edgeStrength: 1, colorLevels: 6 } }
];

// === GLITCH EFFECTS ===
export const GLITCH_EFFECTS = [
  { id: 'rgb-split', name: 'RGB-Split', parameters: { amount: 10, angle: 0 } },
  { id: 'digital-glitch', name: 'Digitaler Glitch', parameters: { intensity: 50, blockSize: 10 } },
  { id: 'scanlines', name: 'Scanlines', parameters: { density: 50, thickness: 1, opacity: 30 } },
  { id: 'vhs', name: 'VHS', parameters: { tracking: 50, noise: 30, distortion: 20 } },
  { id: 'bad-tv', name: 'Bad TV', parameters: { distortion: 30, rollSpeed: 0, noise: 50 } },
  { id: 'chromatic-aberration', name: 'Chromatische Aberration', parameters: { amount: 5 } }
];

// === TRANSITIONS ===
export const TRANSITIONS = {
  // Basic
  basic: [
    { id: 'cut', name: 'Schnitt', duration: 0, parameters: {} },
    { id: 'dissolve', name: 'Überblendung', duration: 1, parameters: { easing: 'linear' } },
    { id: 'fade-black', name: 'Schwarzblende', duration: 1, parameters: {} },
    { id: 'fade-white', name: 'Weißblende', duration: 1, parameters: {} }
  ],
  
  // Wipes
  wipe: [
    { id: 'wipe-left', name: 'Wischen links', duration: 0.5, parameters: { softness: 0 } },
    { id: 'wipe-right', name: 'Wischen rechts', duration: 0.5, parameters: { softness: 0 } },
    { id: 'wipe-up', name: 'Wischen hoch', duration: 0.5, parameters: { softness: 0 } },
    { id: 'wipe-down', name: 'Wischen runter', duration: 0.5, parameters: { softness: 0 } },
    { id: 'clock-wipe', name: 'Uhrzeiger', duration: 0.5, parameters: { startAngle: 0 } },
    { id: 'iris-wipe', name: 'Iris', duration: 0.5, parameters: { centerX: 50, centerY: 50 } }
  ],
  
  // Slide
  slide: [
    { id: 'slide-left', name: 'Schieben links', duration: 0.5, parameters: {} },
    { id: 'slide-right', name: 'Schieben rechts', duration: 0.5, parameters: {} },
    { id: 'slide-up', name: 'Schieben hoch', duration: 0.5, parameters: {} },
    { id: 'slide-down', name: 'Schieben runter', duration: 0.5, parameters: {} },
    { id: 'push-left', name: 'Drücken links', duration: 0.5, parameters: {} },
    { id: 'push-right', name: 'Drücken rechts', duration: 0.5, parameters: {} }
  ],
  
  // Zoom
  zoom: [
    { id: 'zoom-in', name: 'Zoom rein', duration: 0.5, parameters: { centerX: 50, centerY: 50 } },
    { id: 'zoom-out', name: 'Zoom raus', duration: 0.5, parameters: { centerX: 50, centerY: 50 } },
    { id: 'zoom-blur', name: 'Zoom Blur', duration: 0.5, parameters: { blurAmount: 20 } },
    { id: 'zoom-rotate', name: 'Zoom & Drehen', duration: 0.5, parameters: { rotation: 90 } }
  ],
  
  // 3D
  threeD: [
    { id: 'flip-horizontal', name: '3D Flip Horizontal', duration: 0.5, parameters: {} },
    { id: 'flip-vertical', name: '3D Flip Vertikal', duration: 0.5, parameters: {} },
    { id: 'cube-left', name: 'Würfel links', duration: 0.5, parameters: {} },
    { id: 'cube-right', name: 'Würfel rechts', duration: 0.5, parameters: {} },
    { id: 'page-curl', name: 'Seitenumblättern', duration: 0.5, parameters: {} },
    { id: 'spin-3d', name: '3D Spin', duration: 0.5, parameters: { axis: 'y' } }
  ],
  
  // Glitch
  glitch: [
    { id: 'glitch-1', name: 'Glitch 1', duration: 0.3, parameters: { intensity: 50 } },
    { id: 'glitch-2', name: 'Glitch 2', duration: 0.3, parameters: { intensity: 50 } },
    { id: 'rgb-shift', name: 'RGB Shift', duration: 0.3, parameters: { amount: 20 } },
    { id: 'data-mosh', name: 'Datamosh', duration: 0.5, parameters: {} }
  ],
  
  // Light
  light: [
    { id: 'flash', name: 'Blitz', duration: 0.3, parameters: { intensity: 100 } },
    { id: 'lens-flare', name: 'Lens Flare', duration: 0.5, parameters: { x: 50, y: 30 } },
    { id: 'light-leak', name: 'Lichteinfall', duration: 0.5, parameters: { color: '#ff6600' } },
    { id: 'sparkle', name: 'Funkeln', duration: 0.5, parameters: { density: 50 } }
  ]
};

// === BLEND MODES ===
export const BLEND_MODES = [
  { id: 'normal', name: 'Normal' },
  { id: 'dissolve', name: 'Auflösen' },
  { id: 'darken', name: 'Abdunkeln' },
  { id: 'multiply', name: 'Multiplizieren' },
  { id: 'color-burn', name: 'Farbig nachbelichten' },
  { id: 'linear-burn', name: 'Linear nachbelichten' },
  { id: 'lighten', name: 'Aufhellen' },
  { id: 'screen', name: 'Negativ multiplizieren' },
  { id: 'color-dodge', name: 'Farbig abwedeln' },
  { id: 'linear-dodge', name: 'Linear abwedeln (Add)' },
  { id: 'overlay', name: 'Ineinanderkopieren' },
  { id: 'soft-light', name: 'Weiches Licht' },
  { id: 'hard-light', name: 'Hartes Licht' },
  { id: 'vivid-light', name: 'Strahlendes Licht' },
  { id: 'linear-light', name: 'Lineares Licht' },
  { id: 'pin-light', name: 'Punktlicht' },
  { id: 'difference', name: 'Differenz' },
  { id: 'exclusion', name: 'Ausschluss' },
  { id: 'hue', name: 'Farbton' },
  { id: 'saturation', name: 'Sättigung' },
  { id: 'color', name: 'Farbe' },
  { id: 'luminosity', name: 'Luminanz' }
];

// === MASK TYPES ===
export const MASK_TYPES = [
  { id: 'rectangle', name: 'Rechteck', parameters: { x: 0, y: 0, width: 100, height: 100, cornerRadius: 0 } },
  { id: 'ellipse', name: 'Ellipse', parameters: { x: 50, y: 50, radiusX: 50, radiusY: 50 } },
  { id: 'polygon', name: 'Polygon', parameters: { points: [] } },
  { id: 'freeform', name: 'Freihand', parameters: { path: [] } },
  { id: 'linear-gradient', name: 'Linearer Verlauf', parameters: { startX: 0, startY: 50, endX: 100, endY: 50 } },
  { id: 'radial-gradient', name: 'Radialer Verlauf', parameters: { centerX: 50, centerY: 50, radius: 50 } }
];

// === EASING FUNCTIONS ===
export const EASING_FUNCTIONS = [
  { id: 'linear', name: 'Linear' },
  { id: 'ease-in', name: 'Ease In' },
  { id: 'ease-out', name: 'Ease Out' },
  { id: 'ease-in-out', name: 'Ease In/Out' },
  { id: 'ease-in-quad', name: 'Ease In Quad' },
  { id: 'ease-out-quad', name: 'Ease Out Quad' },
  { id: 'ease-in-out-quad', name: 'Ease In/Out Quad' },
  { id: 'ease-in-cubic', name: 'Ease In Cubic' },
  { id: 'ease-out-cubic', name: 'Ease Out Cubic' },
  { id: 'ease-in-out-cubic', name: 'Ease In/Out Cubic' },
  { id: 'ease-in-expo', name: 'Ease In Expo' },
  { id: 'ease-out-expo', name: 'Ease Out Expo' },
  { id: 'ease-in-out-expo', name: 'Ease In/Out Expo' },
  { id: 'ease-in-back', name: 'Ease In Back' },
  { id: 'ease-out-back', name: 'Ease Out Back' },
  { id: 'ease-in-out-back', name: 'Ease In/Out Back' },
  { id: 'ease-in-elastic', name: 'Ease In Elastic' },
  { id: 'ease-out-elastic', name: 'Ease Out Elastic' },
  { id: 'ease-in-bounce', name: 'Ease In Bounce' },
  { id: 'ease-out-bounce', name: 'Ease Out Bounce' }
];

// === EFFECT FACTORY ===
export function createEffect(type, preset = null) {
  return {
    id: uuidv4(),
    type,
    preset,
    enabled: true,
    parameters: preset?.parameters ? { ...preset.parameters } : {},
    blendMode: 'normal',
    opacity: 100,
    mask: null,
    keyframes: {},
    createdAt: Date.now()
  };
}

// === MASK FACTORY ===
export function createMask(type, parameters = {}) {
  const maskType = MASK_TYPES.find(m => m.id === type);
  return {
    id: uuidv4(),
    type,
    enabled: true,
    inverted: false,
    feather: 0,
    expansion: 0,
    opacity: 100,
    parameters: { ...maskType?.parameters, ...parameters },
    keyframes: {},
    tracking: null
  };
}

// === LUT SUPPORT ===
export function parseLUT(fileContent, format = 'cube') {
  // Parse .cube or .3dl LUT files
  const lines = fileContent.split('\n');
  const lut = {
    title: '',
    size: 0,
    domainMin: [0, 0, 0],
    domainMax: [1, 1, 1],
    data: []
  };
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#') || trimmed === '') continue;
    
    if (trimmed.startsWith('TITLE')) {
      lut.title = trimmed.split('"')[1] || '';
    } else if (trimmed.startsWith('LUT_3D_SIZE')) {
      lut.size = parseInt(trimmed.split(' ')[1]);
    } else if (trimmed.startsWith('DOMAIN_MIN')) {
      lut.domainMin = trimmed.split(' ').slice(1).map(parseFloat);
    } else if (trimmed.startsWith('DOMAIN_MAX')) {
      lut.domainMax = trimmed.split(' ').slice(1).map(parseFloat);
    } else {
      const values = trimmed.split(/\s+/).map(parseFloat);
      if (values.length === 3 && !isNaN(values[0])) {
        lut.data.push(values);
      }
    }
  }
  
  return lut;
}

export function exportLUT(lut, format = 'cube') {
  let output = '';
  
  if (format === 'cube') {
    output += `TITLE "${lut.title || 'Custom LUT'}"\n`;
    output += `LUT_3D_SIZE ${lut.size}\n`;
    output += `DOMAIN_MIN ${lut.domainMin.join(' ')}\n`;
    output += `DOMAIN_MAX ${lut.domainMax.join(' ')}\n`;
    output += '\n';
    
    for (const point of lut.data) {
      output += `${point[0].toFixed(6)} ${point[1].toFixed(6)} ${point[2].toFixed(6)}\n`;
    }
  }
  
  return output;
}

export default {
  FILTER_PRESETS,
  BLUR_EFFECTS,
  DISTORTION_EFFECTS,
  STYLIZE_EFFECTS,
  GLITCH_EFFECTS,
  TRANSITIONS,
  BLEND_MODES,
  MASK_TYPES,
  EASING_FUNCTIONS,
  createEffect,
  createMask,
  parseLUT,
  exportLUT
};
