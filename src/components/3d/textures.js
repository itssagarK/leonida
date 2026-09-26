import * as THREE from 'three';

/**
 * Procedural PBR Texture Generators for The Leonida Wire 3D Experiences
 * Self-contained canvas-generated textures: architectural light stone & crisp manila.
 */

// Cached textures
const textureCache = new Map();

/**
 * Creates a realistic manila paper / evidence folder canvas texture with fibers and grain
 */
export function getManilaPaperTexture(title = 'LEONIDA STATE INVESTIGATIVE BUREAU') {
  const cacheKey = `paper_${title}`;
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Base manila paper tone
  ctx.fillStyle = '#E8D8B6';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle paper color variegation
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, 'rgba(245, 235, 210, 0.5)');
  grad.addColorStop(0.5, 'rgba(230, 215, 185, 0.3)');
  grad.addColorStop(1, 'rgba(215, 195, 160, 0.5)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine paper fibers and noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Archival printed docket lines & header
  ctx.strokeStyle = 'rgba(60, 48, 30, 0.35)';
  ctx.lineWidth = 3;
  ctx.strokeRect(40, 40, 944, 944);

  ctx.lineWidth = 1.5;
  ctx.strokeRect(48, 48, 928, 928);

  // Folder tab label area
  ctx.fillStyle = 'rgba(40, 30, 15, 0.88)';
  ctx.font = 'bold 32px "Courier New", monospace';
  ctx.fillText(title, 80, 120);

  ctx.font = '22px "Courier New", monospace';
  ctx.fillStyle = 'rgba(50, 40, 20, 0.7)';
  ctx.fillText('FILE REF: #LSIB-2026-ARCHIVE-994', 80, 165);
  ctx.fillText('RESTRICTED ACCESS // MEDIA CUSTODY LOG', 80, 200);

  // Ruled evidence ledger lines
  ctx.strokeStyle = 'rgba(70, 55, 35, 0.2)';
  ctx.lineWidth = 1;
  for (let y = 260; y < 900; y += 42) {
    ctx.beginPath();
    ctx.moveTo(80, y);
    ctx.lineTo(940, y);
    ctx.stroke();
  }

  // Distressed red "CLASSIFIED // EVIDENCE" rubber stamp
  ctx.save();
  ctx.translate(620, 680);
  ctx.rotate(-0.15);
  ctx.strokeStyle = 'rgba(215, 35, 80, 0.78)';
  ctx.lineWidth = 6;
  ctx.strokeRect(-220, -60, 440, 120);
  ctx.lineWidth = 2;
  ctx.strokeRect(-212, -52, 424, 104);

  ctx.fillStyle = 'rgba(215, 35, 80, 0.82)';
  ctx.font = '900 38px "Courier New", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CLASSIFIED EVIDENCE', 0, -12);
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.fillText('THE LEONIDA WIRE // DEPT OF RECORDS', 0, 24);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates Peter Tarka architectural concrete/limestone studio desk surface texture
 */
export function getDeskSurfaceTexture() {
  const cacheKey = 'desk_surface';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Architectural pale stone / concrete base
  ctx.fillStyle = '#EAEBF0';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle tonal gradient
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0, 'rgba(245, 246, 250, 0.6)');
  grad.addColorStop(0.5, 'rgba(235, 236, 242, 0.3)');
  grad.addColorStop(1, 'rgba(225, 227, 235, 0.6)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Faint architectural cutting mat grid lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)';
  ctx.lineWidth = 1;
  for (let x = 0; x < 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 1024);
    ctx.stroke();
  }
  for (let y = 0; y < 1024; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Micro stone speckles / noise
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const n = (Math.random() - 0.5) * 14;
    data[i] = Math.min(255, Math.max(0, data[i] + n));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates normal map for paper crinkles and edge depth
 */
export function getPaperNormalMap() {
  const cacheKey = 'paper_normal';
  if (textureCache.has(cacheKey)) return textureCache.get(cacheKey);

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Flat normal vector in tangent space is (128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const perturb = (Math.random() - 0.5) * 20;
    data[i] = Math.min(255, Math.max(0, 128 + perturb));
    data[i + 1] = Math.min(255, Math.max(0, 128 + perturb));
    data[i + 2] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  textureCache.set(cacheKey, texture);
  return texture;
}
