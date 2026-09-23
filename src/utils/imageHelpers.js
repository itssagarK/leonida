/**
 * Image helper utilities for The Leonida Wire
 */

/**
 * Returns a fully-qualified URL for an asset path to ensure
 * third-party canvas and iframe loaders resolve it correctly.
 * @param {string} path
 * @returns {string}
 */
export function getAbsoluteImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  if (typeof window !== 'undefined' && window.location) {
    return `${window.location.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path;
}

/**
 * Renders an image with a CSS filter to a high-quality data URL via an offscreen HTML5 canvas.
 * @param {string} imageUrl
 * @param {string} filterStyle
 * @returns {Promise<string>}
 */
export function renderFilteredImageToDataUrl(imageUrl, filterStyle = 'none') {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      return resolve(imageUrl);
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 1200;
        canvas.height = img.naturalHeight || img.height || 800;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          if (filterStyle && filterStyle !== 'none') {
            ctx.filter = filterStyle;
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
          resolve(dataUrl);
          return;
        }
      } catch (err) {
        console.warn('[Leonida Wire] Could not bake filter to canvas, using original:', err);
      }
      resolve(getAbsoluteImageUrl(imageUrl));
    };

    img.onerror = () => {
      resolve(getAbsoluteImageUrl(imageUrl));
    };

    img.src = getAbsoluteImageUrl(imageUrl);
  });
}
