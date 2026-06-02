// lib/telegram-media.ts

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

class TelegramMediaManager {
  private botToken: string;
  private chatId: string;
  private baseUrl: string;

  constructor(config: TelegramConfig) {
    this.botToken = config.botToken;
    this.chatId = config.chatId;
    this.baseUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  async addImage(imageBuffer: Buffer, caption?: string): Promise<string> {
    const formData = new FormData();
    formData.append('chat_id', this.chatId);
    const photoBlob = new Blob([new Uint8Array(imageBuffer)]);
    formData.append('photo', photoBlob, 'image.jpg');
    if (caption) formData.append('caption', caption);

    const response = await fetch(`${this.baseUrl}/sendPhoto`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.ok) throw new Error(`Telegram API error: ${result.description}`);
    return result.result.photo[result.result.photo.length - 1].file_id;
  }

  async addDocument(fileBuffer: Buffer, caption?: string, fileName?: string): Promise<string> {
    const formData = new FormData();
    formData.append('chat_id', this.chatId);
    const documentBlob = new Blob([new Uint8Array(fileBuffer)]);
    formData.append('document', documentBlob, fileName || 'document.pdf');
    if (caption) formData.append('caption', caption);

    const response = await fetch(`${this.baseUrl}/sendDocument`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!result.ok) throw new Error(`Telegram API error: ${result.description}`);
    return result.result.document.file_id;
  }

  async getFileUrl(fileId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/getFile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_id: fileId }),
    });
    const data = await response.json();
    if (!data.ok) throw new Error(`Failed to get file: ${data.description}`);
    return `https://api.telegram.org/file/bot${this.botToken}/${data.result.file_path}`;
  }

  // ✅ تعديل: إزالة هذه الدالة تماماً - لن نستخدمها من المتصفح
  // async getFileBuffer(fileId: string): Promise<Buffer> {
  //   // هذه الدالة تسبب CORS error - لن نستخدمها
  // }

  // ✅ دالة جديدة: الحصول على الرابط فقط (سيتم عرضه مباشرة في img)
  getDirectFileUrl(fileId: string): Promise<string> {
    return this.getFileUrl(fileId);
  }
}

// إنشاء نسخة واحدة (ضع التوكن في env متغير عام NEXT_PUBLIC_*)
const botToken = process.env.NEXT_PUBLIC_XRAY_TELEGRAM_BOT_TOKEN!;
const chatId = process.env.NEXT_PUBLIC_XRAY_TELEGRAM_CHAT_ID!;
export const telegramClient = new TelegramMediaManager({ botToken, chatId });