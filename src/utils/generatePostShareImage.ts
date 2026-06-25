const CARD_WIDTH = 1080;
const CARD_HEIGHT = 1520;
const PAD = 48;
const HEADER_H = 80;
const FOOTER_H = 168;
const SECTION_GAP = 20;
const CONTENT_W = CARD_WIDTH - PAD * 2;

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
};

/** 测量换行文本占用高度（不绘制） */
const measureWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number => {
  if (!text) return 0;
  const chars = text.split('');
  let line = '';
  let lineCount = 1;

  for (let i = 0; i < chars.length; i += 1) {
    const testLine = line + chars[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lineCount += 1;
      if (lineCount > maxLines) {
        return maxLines * lineHeight;
      }
      line = chars[i];
    } else {
      line = testLine;
    }
  }
  return lineCount * lineHeight;
};

/** 绘制换行文本，返回内容区底部 Y */
const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
): number => {
  if (!text) return y;
  ctx.textBaseline = 'top';
  const chars = text.split('');
  let line = '';
  let lineCount = 0;
  let currentY = y;

  for (let i = 0; i < chars.length; i += 1) {
    const testLine = line + chars[i];
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = chars[i];
      lineCount += 1;
      currentY += lineHeight;
      if (lineCount >= maxLines - 1) {
        const rest = text.slice(i).trim();
        const ellipsisLine = rest.length > 0 ? `${line}${rest}`.slice(0, 48) + '…' : line;
        ctx.fillText(ellipsisLine, x, currentY);
        return currentY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }
  return currentY;
};

export interface PostShareImageInput {
  coverUrl?: string;
  promptText: string;
  promptLabel: string;
  shareUrl: string;
  title?: string;
  authorName?: string;
  brandName?: string;
  scanHint: string;
  qrCanvas: HTMLCanvasElement;
}

interface TextBlockPlan {
  top: number;
  height: number;
  titleLines: number;
  hasAuthor: boolean;
  promptLines: number;
}

/** 自下而上预留文本区，避免与页脚重叠 */
const planTextBlock = (
  ctx: CanvasRenderingContext2D,
  input: PostShareImageInput,
  footerTop: number
): TextBlockPlan => {
  const titleFont = 'bold 30px system-ui, -apple-system, sans-serif';
  const authorFont = '22px system-ui, sans-serif';
  const labelFont = 'bold 22px system-ui, sans-serif';
  const promptFont = '22px ui-monospace, SFMono-Regular, Menlo, monospace';

  const titleLineHeight = 36;
  const authorLineHeight = 28;
  const labelLineHeight = 26;
  const promptLineHeight = 30;
  const promptMaxLines = 2;

  let height = 0;

  ctx.font = titleFont;
  const titleLines = input.title
    ? Math.min(
        2,
        Math.ceil(measureWrappedText(ctx, input.title, CONTENT_W, titleLineHeight, 2) / titleLineHeight)
      )
    : 0;
  if (titleLines > 0) {
    height += titleLines * titleLineHeight + 8;
  }

  const hasAuthor = Boolean(input.authorName);
  if (hasAuthor) {
    height += authorLineHeight + 8;
  }

  ctx.font = labelFont;
  height += labelLineHeight + 6;

  ctx.font = promptFont;
  height += measureWrappedText(ctx, input.promptText, CONTENT_W, promptLineHeight, promptMaxLines);

  const top = footerTop - SECTION_GAP - height;
  return { top, height, titleLines, hasAuthor, promptLines: promptMaxLines };
};

export async function generatePostShareImage(input: PostShareImageInput): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
  gradient.addColorStop(0, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  ctx.fillStyle = 'rgba(255,255,255,0.06)';
  roundRect(ctx, 24, 24, CARD_WIDTH - 48, CARD_HEIGHT - 48, 28);
  ctx.fill();

  const headerTop = PAD;
  const footerTop = CARD_HEIGHT - PAD - FOOTER_H;
  const textPlan = planTextBlock(ctx, input, footerTop);

  const imageTop = headerTop + HEADER_H;
  const imageBottom = textPlan.top - SECTION_GAP;
  const imageH = Math.max(360, imageBottom - imageTop);
  const imageX = PAD;

  // Header
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
  ctx.fillText(input.brandName || 'AI2OBJ', PAD, headerTop + 4);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '22px system-ui, -apple-system, sans-serif';
  ctx.fillText('Community', PAD, headerTop + 40);

  // Cover
  ctx.fillStyle = '#111827';
  roundRect(ctx, imageX, imageTop, CONTENT_W, imageH, 20);
  ctx.fill();

  const cover = await loadImage(input.coverUrl || '');
  if (cover) {
    const ratio = Math.max(CONTENT_W / cover.width, imageH / cover.height);
    const drawW = cover.width * ratio;
    const drawH = cover.height * ratio;
    const drawX = imageX + (CONTENT_W - drawW) / 2;
    const drawY = imageTop + (imageH - drawH) / 2;
    ctx.save();
    roundRect(ctx, imageX, imageTop, CONTENT_W, imageH, 20);
    ctx.clip();
    ctx.drawImage(cover, drawX, drawY, drawW, drawH);
    ctx.restore();
  } else {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '28px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI Artwork', imageX + CONTENT_W / 2, imageTop + imageH / 2);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
  }

  // Text block
  let textY = textPlan.top;

  if (input.title) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 30px system-ui, -apple-system, sans-serif';
    textY = drawWrappedText(ctx, input.title, PAD, textY, CONTENT_W, 36, textPlan.titleLines) + 8;
  }

  if (input.authorName) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '22px system-ui, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText(`@${input.authorName}`, PAD, textY);
    textY += 28 + 8;
  }

  ctx.fillStyle = '#60a5fa';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(input.promptLabel, PAD, textY);
  textY += 26 + 6;

  ctx.fillStyle = 'rgba(255,255,255,0.88)';
  ctx.font = '22px ui-monospace, SFMono-Regular, Menlo, monospace';
  drawWrappedText(ctx, input.promptText, PAD, textY, CONTENT_W, 30, textPlan.promptLines);

  // Footer divider
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PAD, footerTop);
  ctx.lineTo(CARD_WIDTH - PAD, footerTop);
  ctx.stroke();

  const qrSize = 120;
  const qrX = PAD;
  const qrY = footerTop + (FOOTER_H - qrSize - 16) / 2;

  ctx.fillStyle = '#ffffff';
  roundRect(ctx, qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 14);
  ctx.fill();
  ctx.drawImage(input.qrCanvas, qrX, qrY, qrSize, qrSize);

  const textX = qrX + qrSize + 28;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px system-ui, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(input.scanHint, textX, qrY + 8);

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '20px system-ui, sans-serif';
  drawWrappedText(
    ctx,
    input.shareUrl.replace(/^https?:\/\//, ''),
    textX,
    qrY + 48,
    CARD_WIDTH - textX - PAD,
    26,
    2
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Export failed'));
    }, 'image/png');
  });
}

export const POST_SHARE_CARD_WIDTH = CARD_WIDTH;
export const POST_SHARE_CARD_HEIGHT = CARD_HEIGHT;
