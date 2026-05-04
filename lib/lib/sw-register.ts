// lib/sw-register.ts

export function registerServiceWorker() {
    console.log("🚀 Attempting to register Service Worker...");
  if (typeof window === 'undefined') return;
  
  if ('serviceWorker' in navigator) {
    // الانتظار حتى تحميل الصفحة بالكامل
    window.addEventListener('load', async () => {
      try {
        // تسجيل الـ Service Worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        console.log('✅ Service Worker registered successfully:', registration);
        
        // التحقق من وجود تحديث
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 New Service Worker found:', newWorker);
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🆕 New Service Worker available - Page will refresh');
                // إشعار المستخدم بوجود تحديث
                showUpdateNotification(registration);
              }
            });
          }
        });
        
        // محاولة تفعيل الـ SW فوراً إذا كان في انتظار
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
        
        // مراقبة تغييرات الـ Controller
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!refreshing) {
            refreshing = true;
            console.log('🔄 Service Worker changed, refreshing page...');
            window.location.reload();
          }
        });
        
        // استقبال الرسائل من Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          console.log('📨 Message from Service Worker:', event.data);
          
          // يمكن إضافة معالجة للرسائل هنا
          if (event.data.type === 'ONLINE') {
            showOnlineNotification(event.data.message);
          } else if (event.data.type === 'OFFLINE') {
            showOfflineNotification(event.data.message);
          } else if (event.data.type === 'SYNC_COMPLETE') {
            console.log('✅ Sync complete:', event.data.message);
          }
        });
        
      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    });
  } else {
    console.warn('⚠️ Service Worker not supported in this browser');
  }
}

// إشعار بتوفر تحديث جديد
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // إنشاء عنصر إشعار بسيط
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #3b82f6;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      cursor: pointer;
      display: flex;
      gap: 12px;
      align-items: center;
    ">
      <span>🔄</span>
      <span>نسخة جديدة متاحة! اضغط للتحديث</span>
    </div>
  `;
  
  notification.addEventListener('click', () => {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    notification.remove();
  });
  
  document.body.appendChild(notification);
  
  // إزالة الإشعار بعد 10 ثواني
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 10000);
}

// إشعار باستعادة الاتصال
function showOnlineNotification(message: string) {
  showTemporaryNotification('🟢 ' + message, '#10b981');
}

// إشعار بفقدان الاتصال
function showOfflineNotification(message: string) {
  showTemporaryNotification('⚠️ ' + message, '#f59e0b');
}

// إشعار مؤقت
function showTemporaryNotification(message: string, bgColor: string) {
  const notification = document.createElement('div');
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
      z-index: 10000;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      animation: slideIn 0.3s ease;
    ">
      ${message}
    </div>
  `;
  
  // إضافة حركة بسيطة
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // إزالة الإشعار بعد 3 ثواني
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 3000);
}

// دالة للتحقق من حالة الـ Service Worker
export async function getServiceWorkerStatus() {
  if (!('serviceWorker' in navigator)) {
    return { supported: false };
  }
  
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
    scope: registration.scope
  };
}