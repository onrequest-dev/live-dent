// lib/services/communication.ts

import { Patient, Session } from '@/types';

interface WhatsAppMessageOptions {
  patient: {fullName:string;gender:string;id:string};
  session?: Session;
  clinicName: string;
  messageType: 'reminder' | 'confirmation' | 'followUp' | 'custom';
  customMessage?: string;
  clinicId: string;
  date?: string;
  time?: string;
}

/**
 * الحصول على اسم اليوم بالعربية من تاريخ
 */
function getDayNameInArabic(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()];
  } catch {
    return '';
  }
}

/**
 * بناء جملة التاريخ والوقت إذا وجدا
 */
function buildDateTimePhrase(date?: string, time?: string): string {
  if (date && time) {
    const dayName = getDayNameInArabic(date);
    return `يوم ${dayName} الموافق ${date} في تمام الساعة ${time}`;
  } else if (date) {
    const dayName = getDayNameInArabic(date);
    return `يوم ${dayName} الموافق ${date}`;
  } else if (time) {
    return `في تمام الساعة ${time}`;
  }
  return '';
}

function getRandomMessage(messages: string[]): string {
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

/**
 * خمس صيغ مختلفة لرسائل التذكير
 */
function generateRandomReminder(
  title: string,
  patientName: string,
  clinicName: string,
  date: string | undefined,
  time: string | undefined,
  patientCardUrl: string
): string {
  const dateTimePhrase = buildDateTimePhrase(date, time);

  const msg1 = `السلام عليكم ورحمة الله وبركاته\n${title} ${patientName}، أسعد الله أوقاتكم.\n${dateTimePhrase ? `نود تذكيركم بموعدكم في ${dateTimePhrase} في عيادة ${clinicName}.\n` : `نود تذكيركم بموعدكم القادم في عيادة ${clinicName}.\n`}\nنذكركم بأهمية الالتزام بالموعد المحدد، مع ضرورة مراعاة المبلغ المتفق عليه للكشف والخدمات المطلوبة.\n\nللإطلاع على كامل التفاصيل والبطاقة الرقمية:\n${patientCardUrl}\n\nبكل سرور ننتظر حضوركم.`;

  const msg2 = `السلام عليكم.\n${title} ${patientName} الفاضل،\n${dateTimePhrase ? `يسرنا تذكيركم بموعدكم المرتقب ${dateTimePhrase} في عيادة ${clinicName}.\n` : `يسرنا تذكيركم بموعدكم المرتقب في عيادة ${clinicName}.\n`}\nننوه إلى ضرورة الالتزام بالموعد والوقت المحددين، مع مراعاة المبلغ المذكور في بطاقتكم الرقمية لتسوية المستحقات في نهاية الزيارة.\n\nتفاصيل أكثر تجدونها في بطاقتكم الإلكترونية:\n${patientCardUrl}\n\nفي انتظاركم بكل ترحيب.`;

  const msg3 = `تحية طيبة ${title} ${patientName}،\nنرجو أن تكونوا بأفضل حال.\n${dateTimePhrase ? `مجرد تذكير بسيط بموعدكم القريب ${dateTimePhrase} في عيادة ${clinicName}.\n` : `مجرد تذكير بسيط بموعدكم القريب في عيادة ${clinicName}.\n`}\nنود التنويه إلى أن جميع المواعيد ملزمة، وفي حال الرغبة في التأجيل، نرجو الإبلاغ قبل 24 ساعة. كما نأمل الالتزام بالمبلغ المحدد للخدمات الموضحة في بطاقتكم الرقمية.\n\nجميع التفاصيل متاحة في بطاقتكم الرقمية:\n${patientCardUrl}\n\nسعداء بلقائكم قريباً.`;

  const msg4 = `السلام عليكم ورحمة الله.\n${title} ${patientName}، أهلاً وسهلاً.\n${dateTimePhrase ? `تذكير لطيف بموعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `تذكير لطيف بموعدكم المقرر في عيادة ${clinicName}.\n`}\nنأمل منكم الالتزام بالوقت المحدد، مع مراعاة الدفعات المتفق عليها والموضحة في البطاقة الرقمية.\n\nللمزيد من المعلومات:\n${patientCardUrl}\n\nبانتظاركم بكل حفاوة.`;

  const msg5 = `مرحباً ${title} ${patientName}،\nنتمنى لكم يوماً طيباً.\n${dateTimePhrase ? `هذا تذكير بموعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `هذا تذكير بموعدكم المحدد في عيادة ${clinicName}.\n`}\nيرجى الالتزام بموعد الحضور، والدفعات المذكورة في بطاقتكم الرقمية للكشف والخدمات المقدمة.\n\nبطاقتكم الرقمية:\n${patientCardUrl}\n\nتشرفنا بثقتكم.`;

  const reminders = [msg1, msg2, msg3, msg4, msg5];
  return getRandomMessage(reminders);
}

/**
 * خمس صيغ مختلفة لرسائل التأكيد
 */
function generateRandomConfirmation(
  title: string,
  patientName: string,
  clinicName: string,
  date: string | undefined,
  time: string | undefined,
  patientCardUrl: string
): string {
  const dateTimePhrase = buildDateTimePhrase(date, time);

  const msg1 = `مرحباً ${title} ${patientName}، نتمنى لكم يوماً طيباً.\n${dateTimePhrase ? `يسرنا تأكيد حجز موعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `يسرنا تأكيد حجز موعدكم في عيادة ${clinicName}.\n`}\nنرجو منكم الحضور في الوقت المحدد، مع الالتزام بقيمة الخدمات المتفق عليها والتي تم إدراجها في بطاقتكم الرقمية.\n\nجميع التفاصيل بين يديكم من خلال الرابط:\n${patientCardUrl}\n\nبالتوفيق دائماً.`;

  const msg2 = `السلام عليكم ورحمة الله.\n${title} ${patientName}، أهلاً وسهلاً.\n${dateTimePhrase ? `تم بحمد الله تأكيد موعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `تم بحمد الله تأكيد موعدكم في عيادة ${clinicName}.\n`}\nنطلب منكم الالتزام بالوقت المحدد، مع العلم أن قيمة الخدمات المتفق عليها محددة في بطاقتكم الرقمية، ويرجى مراعاتها عند المراجعة.\n\nبطاقتكم الرقمية للتفاصيل الكاملة:\n${patientCardUrl}\n\nنشكر ثقتكم الغالية.`;

  const msg3 = `السلام عليكم ورحمة الله وبركاته\n${title} ${patientName}،\n${dateTimePhrase ? `تم تأكيد موعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `تم تأكيد موعدكم في عيادة ${clinicName}.\n`}\nنذكركم بضرورة الالتزام بوقت الحضور والمبلغ المتفق عليه للخدمات، والموضح تفصيلاً في بطاقتكم الرقمية.\n\nللإطلاع على كامل التفاصيل:\n${patientCardUrl}\n\nشاكرين لكم حسن تعاونكم.`;

  const msg4 = `تحية عطرة ${title} ${patientName}،\n${dateTimePhrase ? `نؤكد لكم موعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `نؤكد لكم موعدكم في عيادة ${clinicName}.\n`}\nيرجى الالتزام بالحضور في الوقت المحدد، والدفعات المذكورة في البطاقة الرقمية.\n\nبطاقتكم الإلكترونية:\n${patientCardUrl}\n\nبأرق التحايا والتقدير.`;

  const msg5 = `أهلاً ${title} ${patientName}،\n${dateTimePhrase ? `تم بنجاح حجز موعدكم ${dateTimePhrase} في عيادة ${clinicName}.\n` : `تم بنجاح حجز موعدكم في عيادة ${clinicName}.\n`}\nنأمل الالتزام بموعدكم، مع ضرورة الاطلاع على الدفعات المحددة في بطاقتكم الرقمية.\n\nزوروا بطاقتكم الرقمية للمزيد:\n${patientCardUrl}\n\nمع خالص التقدير والاحترام.`;

  const confirmations = [msg1, msg2, msg3, msg4, msg5];
  return getRandomMessage(confirmations);
}

/**
 * خمس صيغ مختلفة لرسائل المتابعة
 */
function generateRandomFollowUp(
  title: string,
  patientName: string,
  clinicName: string,
  patientCardUrl: string
): string {
  const msg1 = `السلام عليكم ورحمة الله وبركاته\n${title} ${patientName}،\nنرجو أن تكونوا بأتم الصحة والعافية بعد زيارتكم لعيادة ${clinicName}.\n\nبطاقتكم الرقمية للمتابعة:\n${patientCardUrl}\n\nدمتم سالمين.`;

  const msg2 = `مرحباً ${title} ${patientName}،\nنتمنى لكم دوام الصحة والعافية بعد موعدكم في عيادة ${clinicName}.\n\nللإطلاع على سجلكم الطبي وتفاصيل الزيارة:\n${patientCardUrl}\n\nمع أطيب الأمنيات بالشفاء.`;

  const msg3 = `السلام عليكم.\n${title} ${patientName} الفاضل،\nنأمل أن تكونوا بصحة جيدة بعد زيارتكم لعيادة ${clinicName}.\n\nبطاقتكم الإلكترونية للرجوع إليها:\n${patientCardUrl}\n\nحفظكم الله ورعاكم.`;

  const msg4 = `تحية طيبة ${title} ${patientName}،\nنرجو أن تكون زيارتكم لعيادة ${clinicName} قد نالت رضاكم.\n\nتفاصيل زيارتكم في بطاقتكم الرقمية:\n${patientCardUrl}\n\nنتمنى لكم موفور الصحة.`;

  const msg5 = `السلام عليكم ورحمة الله.\n${title} ${patientName}،\nطمأنينة منا بعد زيارتكم لعيادة ${clinicName}.\n\nبطاقتكم الرقمية متاحة دائماً:\n${patientCardUrl}\n\nرعاكم الله وأدام عليكم الصحة.`;

  const followUps = [msg1, msg2, msg3, msg4, msg5];
  return getRandomMessage(followUps);
}

export function generateWhatsAppMessage({
  patient,
  session,
  clinicName,
  messageType,
  customMessage,
  clinicId,
  date,
  time,
}: WhatsAppMessageOptions): string {
  const title = patient.gender === 'male' ? 'الأستاذ' : 'الأستاذة';
  const patientName = patient.fullName;
  const patientCardUrl = `https://live-dent.vercel.app/public-clinic/${clinicId}/${patient.id}`;
  
  const messages: Record<typeof messageType, string> = {
    reminder: generateRandomReminder(title, patientName, clinicName, date, time, patientCardUrl),
    confirmation: generateRandomConfirmation(title, patientName, clinicName, date, time, patientCardUrl),
    followUp: generateRandomFollowUp(title, patientName, clinicName, patientCardUrl),
    custom: customMessage ? 
      `${customMessage}\n\nللإطلاع على بطاقتكم الرقمية:\n${patientCardUrl}` : '',
  };
  
  return messages[messageType];
}

export function openWhatsAppChat(
  phone: string,
  message: string
): void {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
}

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

import { fetchTodaySessions } from './api';