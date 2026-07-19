// sendMessage.ts
// Using built-in fetch to avoid requiring the axios package

// ======================== Configuration ========================
const BASE_URL = process.env.WHATSAPP_BASE_URL;
const API_KEY = process.env.WHATSAPP_API_KEY;
const SESSION_NAME = process.env.WHATSAPP_SESSION_NAME? process.env.WHATSAPP_SESSION_NAME : "my-session";

// ======================== Types ========================
interface SendMessageResponse {
  success: boolean;
  data?: any;
  error?: any;
}

interface SendMessageError {
  status?: number;
  data?: any;
  message?: string;
}

// ======================== Main Function ========================

/**
 * Send WhatsApp message
 * @param {string} phoneNumber - Phone number with country code (e.g., 966512345678)
 * @param {string} message - Message text
 * @param {string} sessionName - (Optional) Session name, default is 'my-session'
 * @returns {Promise<SendMessageResponse>} - Sending result
 */
async function sendMessage(
  phoneNumber: string,
  message: string,
  sessionName: string = SESSION_NAME
): Promise<SendMessageResponse> {
  try {
    // Ensure correct phone number format
    const chatId = phoneNumber.includes("@c.us")
      ? phoneNumber
      : `${phoneNumber}@c.us`;

    // Validate required config before sending
    if (!BASE_URL || !API_KEY) {
      const missing = [];
      if (!BASE_URL) missing.push('WHATSAPP_BASE_URL');
      if (!API_KEY) missing.push('WHATSAPP_API_KEY');
      throw new Error(`Missing WhatsApp configuration: ${missing.join(', ')}`);
    }

    // Send request using fetch (Node 18+)
    const url = `${BASE_URL}/api/sessions/${sessionName}/messages/send-text`;
    console.log(`📤 Sending message to ${phoneNumber} via ${url}`);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId: chatId, text: message }),
    });

    const data = await res.json().catch(() => null);
    
    if (!res.ok) {
      const error: SendMessageError = { status: res.status, data };
      throw error;
    }

    console.log(`✅ Message sent to ${phoneNumber}`);
    return { success: true, data };
  } catch (error) {
    const errorMessage = (error as any)?.data || (error as any)?.message || error;
    console.error(
      `❌ Failed to send message to ${phoneNumber}:`,
      errorMessage
    );
    return {
      success: false,
      error: errorMessage,
    };
  }
}



// Uncomment to test
// sendMessage("963936825904", message, SESSION_NAME);

// ======================== Exports ========================
export { sendMessage, type SendMessageResponse };