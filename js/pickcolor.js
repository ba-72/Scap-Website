  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;
    if (max === min) {
      s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h *= 60;
    }
    return [h, s, l];
  }
  function hslToRgb(h, s, l) {
    h /= 360;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }

  // 2) 计算平均色并提亮/增饱和
  function extractDominantColor(img, enhanceSat=1.6, enhanceLight=1.4) {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  // 如果是深色模式，强制用 1.2，否则用传入的 enhanceLight
  const lightFactor = isDark ? 1.2 : enhanceLight;
    // 缩小画布以提速
    const maxSize = 200;
    let w = img.naturalWidth, h = img.naturalHeight;
    if (w > h && w > maxSize) {
      h = Math.round(h * maxSize / w); w = maxSize;
    } else if (h > w && h > maxSize) {
      w = Math.round(w * maxSize / h); h = maxSize;
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let r=0, g=0, b=0, count=0;
    const step = 4 * 10; // 每隔 10 像素取样
    for (let i = 0; i < data.length; i += step) {
      r += data[i]; g += data[i+1]; b += data[i+2];
      count++;
    }
    [r, g, b] = [r/count, g/count, b/count].map(v => Math.round(v));

    // 转 HSL，增强，再回 RGB
    let [hue, sat, light] = rgbToHsl(r, g, b);
    sat = Math.min(sat * enhanceSat, 1.6);
    light = Math.min(light * enhanceLight, 10);
    return hslToRgb(hue, sat, light);
  }

  // 3) 给单张卡片更新 description 背景
  function updateCardColor(card) {
    const content = card.querySelector('.content');
    const desc    = card.querySelector('.description');
    if (!content || !desc) return;

    const bg = getComputedStyle(content).backgroundImage;
    const url = bg.slice(5, -2); // 去掉 url("…")
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = url;
    img.onload = () => {
      const [r, g, b] = extractDominantColor(img);
      // 直接用纯色覆盖
      desc.style.setProperty('background', `rgb(${r}, ${g}, ${b})`, 'important');
    };
  }