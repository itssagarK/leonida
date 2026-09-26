/**
 * Image helper utilities for The Leonida Wire
 * Robust URL resolution and canvas filter baking without black-screen regressions.
 */

/**
 * Returns a fully-qualified URL for an asset path to ensure
 * third-party canvas and iframe loaders resolve it correctly across
 * development, preview, and production subpath deployments.
 * @param {string} path
 * @returns {string}
 */
export function getAbsoluteImageUrl(path) {
  if (!path) return '';
  if (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('data:') ||
    path.startsWith('blob:')
  ) {
    return path;
  }

  const base = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const combinedPath = `${cleanBase}${cleanPath}`;

  if (typeof window !== 'undefined' && window.location) {
    try {
      return new URL(combinedPath, window.location.origin).href;
    } catch {
      return `${window.location.origin}${combinedPath.startsWith('/') ? '' : '/'}${combinedPath}`;
    }
  }

  return combinedPath;
}

/**
 * Renders an image with a CSS filter to a high-quality data URL via an offscreen HTML5 canvas.
 * Implements fetch-blob decoding to prevent CORS tainting and verifies pixel rendering
 * so transparent/unpainted canvases never export as solid black JPEGs.
 * @param {string} imageUrl
 * @param {string} filterStyle
 * @returns {Promise<string>}
 */
export async function renderFilteredImageToDataUrl(imageUrl, filterStyle = 'none') {
  if (typeof window === 'undefined') {
    return imageUrl;
  }

  const resolvedUrl = getAbsoluteImageUrl(imageUrl);

  // If no filter or 'none', directly return the clean resolved URL
  if (!filterStyle || filterStyle === 'none') {
    return resolvedUrl;
  }

  try {
    let blobUrl = null;
    let imgSource = resolvedUrl;

    // Strategy 1: Fetch as blob to bypass cross-origin canvas tainting on static servers
    if (!resolvedUrl.startsWith('data:') && !resolvedUrl.startsWith('blob:')) {
      try {
        const response = await fetch(resolvedUrl);
        if (response.ok) {
          const blob = await response.blob();
          blobUrl = URL.createObjectURL(blob);
          imgSource = blobUrl;
        }
      } catch (fetchErr) {
        // Fall back to standard image loader
        console.warn('[Leonida Wire] Fetch blob failed, falling back to Image loader:', fetchErr);
      }
    }

    const img = new Image();
    if (!blobUrl && !resolvedUrl.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    await new Promise((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = (e) => reject(new Error('Image failed to load in DOM: ' + e));
      img.src = imgSource;
    });

    // Ensure bitmap is fully decoded
    if (img.decode) {
      try {
        await img.decode();
      } catch (decodeErr) {
        console.warn('[Leonida Wire] img.decode error, proceeding with loaded image:', decodeErr);
      }
    }

    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;

    if (!w || !h) {
      throw new Error(`Zero image dimensions: ${w}x${h}`);
    }

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (!ctx) {
      throw new Error('Failed to obtain canvas 2D context');
    }

    // Apply CSS filter if supported
    try {
      if (filterStyle && filterStyle !== 'none') {
        ctx.filter = filterStyle;
      }
    } catch (filterErr) {
      console.warn('[Leonida Wire] Filter application error:', filterErr);
    }

    ctx.drawImage(img, 0, 0, w, h);

    // Clean up temporary blob URL
    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
    }

    // VERIFICATION: Check that image was actually drawn onto canvas (not blank transparent)
    // Transparent pixels exported as image/jpeg turn into pure solid black #000000.
    const sample = ctx.getImageData(Math.floor(w / 2), Math.floor(h / 2), 1, 1).data;
    if (sample[3] === 0) {
      console.warn('[Leonida Wire] Canvas center pixel has 0 alpha, falling back to raw image');
      return resolvedUrl;
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    return dataUrl;
  } catch (err) {
    console.warn('[Leonida Wire] renderFilteredImageToDataUrl failed, falling back to raw URL:', err);
    return resolvedUrl;
  }
}
