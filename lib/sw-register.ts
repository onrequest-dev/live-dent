// lib/sw-register.ts

/**
 * تسجيل Service Worker وإدارة دورة حياته
 */

export function registerServiceWorker() {
  console.log("🚀 Attempting to register Service Worker...");
  
  // التحقق من أننا في بيئة المتصفح
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    console.warn("⚠️ Not in browser environment, skipping SW registration");
    return;
  }
  
  // التحقق من دعم المتصفح لـ Service Worker
  if (!('serviceWorker' in navigator)) {
    console.warn("⚠️ Service Worker not supported in this browser");
    return;
  }
  
  // الانتظار حتى تحميل الصفحة بالكامل
  window.addEventListener('load', async () => {
    try {
      // تسجيل الـ Service Worker مع خيارات محسنة
      const registration = await navigator.serviceWorker.register('sw.js', {
        scope: '/',
        updateViaCache: 'none', // منع الكاش لضمان الحصول على أحدث نسخة
      });
      
      console.log('✅ Service Worker registered successfully:', {
        scope: registration.scope,
        active: !!registration.active,
        waiting: !!registration.waiting,
        installing: !!registration.installing,
      });
      
      // ============================================
      // مراقبة التحديثات
      // ============================================
      
      // عند اكتشاف Service Worker جديد
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('🔄 New Service Worker found...');
        
        if (newWorker) {
          // مراقبة تغييرات حالة الـ SW الجديد
          newWorker.addEventListener('statechange', () => {
            console.log(`📊 New SW state: ${newWorker.state}`);
            
            // عند اكتمال التثبيت ووجود SW قديم نشط
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New Service Worker available - waiting to activate');
              
              // إشعار المستخدم بوجود تحديث
              showUpdateNotification(registration);
              
              // تفعيل التحديث تلقائياً بعد فترة قصيرة إذا لم يستجب المستخدم
              setTimeout(() => {
                if (registration.waiting) {
                  console.log('⏰ Auto-activating new Service Worker...');
                  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                }
              }, 30000); // 30 ثانية
            }
          });
        }
      });
      
      // ============================================
      // تفعيل فوري إذا كان SW في حالة انتظار
      // ============================================
      if (registration.waiting) {
        console.log('⏩ Found waiting SW, activating immediately...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      // ============================================
      // مراقبة تغييرات الـ Controller
      // ============================================
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          console.log('🔄 Service Worker controller changed, refreshing page...');
          window.location.reload();
        }
      });
      
      // ============================================
      // استقبال الرسائل من Service Worker
      // ============================================
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('📨 Message from Service Worker:', event.data);
        
        if (!event.data || !event.data.type) {
          console.warn('⚠️ Received message without type:', event.data);
          return;
        }
        
        // معالجة أنواع الرسائل المختلفة
        switch (event.data.type) {
          case 'ONLINE':
            console.log('🟢 Connection restored');
            showOnlineNotification(event.data.message || 'تم استعادة الاتصال بالإنترنت');
            break;
            
          case 'OFFLINE':
            console.log('🔴 Connection lost');
            showOfflineNotification(event.data.message || 'فقد الاتصال بالإنترنت - سيتم حفظ التغييرات محلياً');
            break;
            
          case 'SYNC_COMPLETE':
            console.log('✅ Background sync completed');
            showTemporaryNotification(
              event.data.message || 'تمت مزامنة جميع البيانات بنجاح',
              '#10b981'
            );
            break;
            
          case 'STATUS':
            console.log('📊 SW Status:', event.data);
            // يمكن تخزين الحالة أو عرضها للمستخدم
            break;
            
          case 'UPDATE_STATUS':
            console.log('📦 Update status:', event.data);
            break;
            
          default:
            console.log('📬 Unknown message type:', event.data.type);
        }
      });
      
      // ============================================
      // التحقق من وجود تحديثات بشكل دوري
      // ============================================
      setInterval(() => {
        console.log('🔍 Checking for Service Worker updates...');
        registration.update().catch((error) => {
          console.error('❌ Failed to check for updates:', error);
        });
      }, 60 * 60 * 1000); // كل ساعة
      
      console.log('✅ Service Worker setup completed successfully');
      
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      
      // تسجيل تفاصيل الخطأ
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      
      // إشعار المستخدم إذا فشل التسجيل في بيئة الإنتاج
      if (process.env.NODE_ENV === 'production') {
        console.error('⚠️ Production: SW registration failed, app will work without offline support');
      }
    }
  });
}

// ============================================
// دوال الإشعارات
// ============================================

/**
 * إشعار بتوفر تحديث جديد للتطبيق
 */
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // التحقق من عدم وجود إشعار سابق
  const existingNotification = document.getElementById('sw-update-notification');
  if (existingNotification) {
    console.log('📢 Update notification already shown');
    return;
  }
  
  // إنشاء عنصر الإشعار
  const notificationContainer = document.createElement('div');
  notificationContainer.id = 'sw-update-notification';
  notificationContainer.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #3b82f6;
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 99999;
      box-shadow: 0 8px 16px rgba(0,0,0,0.2);
      cursor: pointer;
      display: flex;
      gap: 12px;
      align-items: center;
      animation: slideUp 0.3s ease;
      max-width: 90vw;
      direction: rtl;
    ">
      <span style="font-size: 20px;">🔄</span>
      <div style="display: flex; flex-direction: column; gap: 4px;">
        <span style="font-weight: bold;">نسخة جديدة متاحة!</span>
        <span style="font-size: 12px; opacity: 0.9;">اضغط هنا للتحديث إلى أحدث نسخة</span>
      </div>
      <button style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 18px;
      " title="إغلاق">✕</button>
    </div>
  `;
  
  // إضافة الحركة
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideUp {
      from {
        transform: translateX(-50%) translateY(100px);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  // معالج النقر على الإشعار
  const notificationDiv = notificationContainer.querySelector('div');
  if (notificationDiv) {
    notificationDiv.addEventListener('click', (e) => {
      // تجاهل النقر على زر الإغلاق
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON') {
        notificationContainer.remove();
        return;
      }
      
      console.log('👆 User clicked update notification');
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      notificationContainer.remove();
    });
  }
  
  // زر الإغلاق
  const closeButton = notificationContainer.querySelector('button');
  if (closeButton) {
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationContainer.remove();
    });
  }
  
  // إضافة الإشعار للصفحة
  document.body.appendChild(notificationContainer);
  
  // إزالة الإشعار تلقائياً بعد 15 ثانية
  setTimeout(() => {
    if (document.body.contains(notificationContainer)) {
      notificationContainer.remove();
    }
  }, 15000);
}

/**
 * إشعار باستعادة الاتصال بالإنترنت
 */
function showOnlineNotification(message: string) {
  showTemporaryNotification(`🟢 ${message}`, '#10b981');
}

/**
 * إشعار بفقدان الاتصال بالإنترنت
 */
function showOfflineNotification(message: string) {
  showTemporaryNotification(`⚠️ ${message}`, '#f59e0b');
}

/**
 * إشعار مؤقت يظهر ويختفي تلقائياً
 */
function showTemporaryNotification(message: string, bgColor: string) {
  // إزالة الإشعارات السابقة من نفس النوع
  const existingNotifications = document.querySelectorAll('.sw-temp-notification');
  existingNotifications.forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = 'sw-temp-notification';
  notification.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${bgColor};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInRight 0.3s ease;
      direction: rtl;
      max-width: 400px;
    ">
      ${message}
    </div>
  `;
  
  // إضافة الحركة
  if (!document.getElementById('sw-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'sw-notification-styles';
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOutRight {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(notification);
  
  // إزالة الإشعار بعد 3 ثواني مع حركة اختفاء
  setTimeout(() => {
    const notificationDiv = notification.querySelector('div');
    if (notificationDiv && document.body.contains(notification)) {
      notificationDiv.style.animation = 'slideOutRight 0.3s ease forwards';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          notification.remove();
        }
      }, 300);
    }
  }, 3000);
}

// ============================================
// دوال مساعدة
// ============================================

/**
 * الحصول على حالة Service Worker الحالية
 */
export async function getServiceWorkerStatus() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { supported: false };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      return { supported: true, registered: false };
    }
    
    return {
      supported: true,
      registered: true,
      active: !!registration.active,
      waiting: !!registration.waiting,
      installing: !!registration.installing,
      scope: registration.scope,
    };
  } catch (error) {
    console.error('❌ Error getting SW status:', error);
    return { supported: true, error: true };
  }
}

/**
 * إلغاء تسجيل Service Worker (لأغراض التطوير)
 */
export async function unregisterServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const success = await registration.unregister();
      if (success) {
        console.log('✅ Service Worker unregistered successfully');
        // مسح جميع الكاش
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log('✅ All caches cleared');
      } else {
        console.log('⚠️ Service Worker unregistration failed');
      }
    } else {
      console.log('ℹ️ No Service Worker to unregister');
    }
  } catch (error) {
    console.error('❌ Error unregistering SW:', error);
  }
}

/**
 * إرسال رسالة إلى Service Worker
 */
export async function sendMessageToSW(message: any) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.warn('⚠️ Service Worker not supported');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration && registration.active) {
      registration.active.postMessage(message);
      console.log('📤 Message sent to SW:', message);
    } else {
      console.warn('⚠️ No active Service Worker to send message to');
    }
  } catch (error) {
    console.error('❌ Error sending message to SW:', error);
  }
}

/**
 * التحقق من وجود تحديث لـ Service Worker
 */
export async function checkForUpdate() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return { hasUpdate: false };
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return {
        hasUpdate: !!registration.waiting || !!registration.installing,
        registration,
      };
    }
    return { hasUpdate: false };
  } catch (error) {
    console.error('❌ Error checking for update:', error);
    return { hasUpdate: false, error: true };
  }
}