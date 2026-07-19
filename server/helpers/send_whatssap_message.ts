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

// ======================== Helper Functions ========================

/**
 * Clean and format phone number
 * Removes all spaces, plus signs, and special characters
 * @param {string} phone - Raw phone number input
 * @returns {string} - Cleaned phone number with only digits
 */
function cleanPhoneNumber(phone: string): string {
  // Remove all spaces, plus signs, dashes, parentheses, and other special characters
  // Keep only digits
  return phone.replace(/[^\d]/g, '');
}

/**
 * Format phone number for WhatsApp
 * @param {string} phone - Raw phone number
 * @returns {string} - Formatted phone number with @c.us suffix
 */
function formatPhoneNumber(phone: string): string {
  // Clean the number first
  const cleaned = cleanPhoneNumber(phone);
  
  // Ensure it has @c.us suffix
  return cleaned.includes("@c.us") ? cleaned : `${cleaned}@c.us`;
}

// ======================== Main Function ========================

/**
 * Send WhatsApp message
 * @param {string} phoneNumber - Phone number in any format (e.g., +963 969 375 584, 963936825904, 00963969375584)
 * @param {string} message - Message text
 * @param {string} sessionName - (Optional) Session name, default is 'my-session'
 * @returns {Promise<SendMessageResponse>} - Sending result
 */
async function sendMessage(
  phoneNumber: string,
  message: string,
  sessionName: string = SESSION_NAME
): Promise<SendMessageResponse> {
    console.log("hi")
  try {
    // Format the phone number (remove spaces, plus signs, etc.)
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    // Extract clean number for logging (without @c.us)
    const cleanNumber = cleanPhoneNumber(phoneNumber);

    // Validate required config before sending
    if (!BASE_URL || !API_KEY) {
      const missing = [];
      if (!BASE_URL) missing.push('WHATSAPP_BASE_URL');
      if (!API_KEY) missing.push('WHATSAPP_API_KEY');
      throw new Error(`Missing WhatsApp configuration: ${missing.join(', ')}`);
    }

    // Send request using fetch (Node 18+)
    const url = `${BASE_URL}/api/sessions/${sessionName}/messages/send-text`;
    console.log(`📤 Sending message to ${cleanNumber} via ${url}`);
    
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chatId: formattedPhone, text: message }),
    });

    const data = await res.json().catch(() => null);
    
    if (!res.ok) {
      const error: SendMessageError = { status: res.status, data };
      throw error;
    }

    console.log(`✅ Message sent to ${cleanNumber}`);
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

// ======================== Examples ========================
// All of these will work:
// sendMessage("+963 969 375 584", "Hello");
// sendMessage("00963969375584", "Hello");
// sendMessage("963936825904", "Hello");
// sendMessage("+963-969-375-584", "Hello");
// sendMessage("(963) 969-375-584", "Hello");

// Uncomment to test
// sendMessage("+963 969 375 584", "Test message", SESSION_NAME);

// ======================== Exports ========================
export { sendMessage, type SendMessageResponse, cleanPhoneNumber, formatPhoneNumber };