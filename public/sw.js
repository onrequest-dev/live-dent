// public/sw.js

// تحميل Workbox من CDN
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js",
);

if (workbox) {
  console.log("✅ Workbox loaded successfully");

  // إنشاء قائمة الانتظار للمزامنة الخلفية
  const queue = new workbox.backgroundSync.BackgroundSyncQueue("clinic-queue", {
    maxRetentionTime: 7 * 24 * 60, // الاحتفاظ بالطلبات لمدة 7 أيام
    onSync: async ({ queue }) => {
      console.log("🔄 Syncing pending requests...");
      try {
        await queue.replayRequests();
        console.log("✅ All pending requests synced successfully");

        // إرسال إشعار لجميع الصفحات المفتوحة
        const clients = await clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: "SYNC_COMPLETE",
            message: "تمت مزامنة جميع الطلبات بنجاح",
          });
        });
      } catch (error) {
        console.error("❌ Failed to sync requests:", error);
      }
    },
  });

  // استراتيجية لطلبات GET - تخزين مؤقت للعمل دون اتصال
  workbox.routing.registerRoute(
    ({ url }) => url.pathname.startsWith("/api/v1/clinic/"),
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: "api-cache-v1",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // يوم واحد
        }),
      ],
    }),
  );

  // استراتيجية لطلبات POST, PUT, DELETE - استخدام Background Sync
  workbox.routing.registerRoute(
    ({ url, request }) =>
      url.pathname.startsWith("/api/v1/clinic/") &&
      ["POST", "PUT", "DELETE", "PATCH"].includes(request.method),
    new workbox.strategies.NetworkOnly({
      plugins: [queue],
    }),
  );

  // استراتيجية للملفات الثابتة (CSS, JS, etc)
  workbox.routing.registerRoute(
    ({ request }) =>
      request.destination === "style" ||
      request.destination === "script" ||
      request.destination === "font",
    new workbox.strategies.CacheFirst({
      cacheName: "static-assets-v1",
      plugins: [
        new workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يوم
        }),
      ],
    }),
  );

  // تفعيل الـ Service Worker فوراً
  self.skipWaiting();

  console.log("✅ Service Worker configured successfully");
} else {
  console.log("❌ Workbox failed to load");
}

// ============================================
// مستمعين إضافيين للتحكم الكامل
// ============================================

// عند تثبيت الـ Service Worker
self.addEventListener("install", (event) => {
  console.log("📦 Service Worker installing...");
  //强制执行 الـ SW الجديد
  event.waitUntil(self.skipWaiting());
});

// عند تفعيل الـ Service Worker
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activated and controlling all pages");
  // السيطرة على جميع الصفحات المفتوحة بدون إعادة تحميل
  event.waitUntil(clients.claim());
});

// عند استعادة الاتصال بالإنترنت
self.addEventListener("online", () => {
  console.log("🟢 Online - Service Worker will sync pending requests");

  // إشعار جميع الصفحات باستعادة الاتصال
  clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "ONLINE",
        message: "تم استعادة الاتصال بالإنترنت",
      });
    });
  });
});

// عند فقدان الاتصال
self.addEventListener("offline", () => {
  console.log("🔴 Offline - Service Worker working in offline mode");

  // إشعار جميع الصفحات بفقدان الاتصال
  clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: "OFFLINE",
        message: "فقد الاتصال بالإنترنت - سيتم حفظ التغييرات محلياً",
      });
    });
  });
});

// استقبال رسائل من الصفحات
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data && event.data.type === "GET_STATUS") {
    event.ports[0].postMessage({
      type: "STATUS",
      online: navigator.onLine,
      version: "1.0.0",
    });
  }
});

// معالجة الأخطاء العامة
self.addEventListener("error", (error) => {
  console.error("Service Worker error:", error);
});
