// lib/services/communication.ts

import { Patient, Session } from '@/types';

interface WhatsAppMessageOptions {
  patient: Patient;
  session?: Session;
  clinicName: string;
  messageType: 'reminder' | 'confirmation' | 'followUp' | 'custom';
  customMessage?: string;
  clinicId: string; // إضافة clinicId
}
/**
 * إنشاء رسالة واتساب مناسبة حسب الجنس ونوع الرسالة
 */
export function generateWhatsAppMessage({
  patient,
  session,
  clinicName,
  messageType,
  customMessage,
  clinicId, // إضافة clinicId
}: WhatsAppMessageOptions): string {
  const title = patient.gender === 'male' ? 'الأستاذ' : 'الأستاذة';
  const patientName = patient.fullName;
  
  // إنشاء رابط بطاقة المريض
  const patientCardUrl = `${window.location.origin}/public-clinic/${clinicId}/${patient.id}`;
  
  const messages: Record<typeof messageType, string> = {
    reminder: `السلام عليكم ورحمة الله وبركاته
${title} ${patientName}،
نذكركم بموعدكم اليوم في ${clinicName}
${session ? `الإجراء: ${session.plannedProcedure || 'كشف'}
الوقت: ${formatTimeForMessage(session.startTime)}` : ''}

📋 رابط بطاقة المريض الإلكترونية:
${patientCardUrl}

نتشرف بخدمتكم 🌹`,

    confirmation: `السلام عليكم ورحمة الله وبركاته
${title} ${patientName}،
تم تأكيد موعدكم في ${clinicName}
${session ? `التاريخ: ${formatDateForMessage(session.startTime)}
الوقت: ${formatTimeForMessage(session.startTime)}
الإجراء: ${session.plannedProcedure || 'كشف'}` : ''}

📋 رابط بطاقة المريض الإلكترونية:
${patientCardUrl}

بإمكانكم التواصل معنا على هذا الرقم لأي استفسار 🌷`,

    followUp: `السلام عليكم ورحمة الله وبركاته
${title} ${patientName}،
نتمنى أن تكونوا بخير بعد الجلسة العلاجية في ${clinicName}

📋 رابط بطاقة المريض الإلكترونية:
${patientCardUrl}

نرجو إعلامنا عن أي أعراض أو استفسار لديكم
دمتم بصحة وعافية 🌸`,

    custom: customMessage ? 
      `${customMessage}

📋 رابط بطاقة المريض الإلكترونية:
${patientCardUrl}` : '',
  };
  
  return messages[messageType];
}

/**
 * فتح محادثة واتساب مع مريض
 */
export function openWhatsAppChat(
  phone: string,
  message: string
): void {
  // تنظيف رقم الهاتف من أي رموز غير رقمية
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
}

/**
 * إرسال تذكير جماعي لمرضى اليوم
 */
// export async function sendBulkReminders(
//   clinicId: string,
//   clinicName: string
// ): Promise<{ success: number; failed: number }> {
//   try {
//     // جلب جلسات اليوم من API
//     const sessions = await fetchTodaySessions(clinicId);
    
//     let success = 0;
//     let failed = 0;
    
//     for (const session of sessions) {
//       try {
//         const message = generateWhatsAppMessage({
//           patient: session.patientSnapshot as any,
//           session,
//           clinicName,
//           messageType: 'reminder',
//         });
        
//         success++;
        
//         // تأخير بسيط بين كل رسالة لتجنب الحظر
//         await new Promise(resolve => setTimeout(resolve, 500));
//       } catch (error) {
//         failed++;
//       }
//     }
    
//     return { success, failed };
//   } catch (error) {
//     console.error('Failed to fetch sessions for bulk reminders', error);
//     throw error;
//   }
// }

// دوال مساعدة للتنسيق
function formatTimeForMessage(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDateForMessage(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// استيراد دالة جلب الجلسات
import { fetchTodaySessions } from './api';