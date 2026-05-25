// // public/sw.js

// // تحميل Workbox من CDN
// importScripts(
//   "https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js",
// );

// // تفعيل وحدات Workbox المطلوبة
// workbox.setConfig({
//   debug: false,
// });

// if (workbox) {
//   console.log("✅ Workbox loaded successfully");

//   // التحقق من توفر BackgroundSync
//   if (workbox.backgroundSync) {
//     // إنشاء قائمة الانتظار للمزامنة الخلفية
//     const queue = new workbox.backgroundSync.Queue("clinic-queue", {
//       maxRetentionTime: 7 * 24 * 60, // الاحتفاظ بالطلبات لمدة 7 أيام
//       onSync: async ({ queue }) => {
//         console.log("🔄 Syncing pending requests...");
//         try {
//           await queue.replayRequests();
//           console.log("✅ All pending requests synced successfully");

//           // إرسال إشعار لجميع الصفحات المفتوحة
//           const clients = await self.clients.matchAll();
//           clients.forEach((client) => {
//             client.postMessage({
//               type: "SYNC_COMPLETE",
//               message: "تمت مزامنة جميع الطلبات بنجاح",
//             });
//           });
//         } catch (error) {
//           console.error("❌ Failed to sync requests:", error);
//         }
//       },
//     });

//     // استراتيجية لطلبات GET - تخزين مؤقت للعمل دون اتصال
//     workbox.routing.registerRoute(
//       ({ url }) => url.pathname.startsWith("/api"),
//       new workbox.strategies.StaleWhileRevalidate({
//         cacheName: "api-cache-v1",
//         plugins: [
//           new workbox.cacheableResponse.CacheableResponsePlugin({
//             statuses: [0, 200],
//           }),
//           new workbox.expiration.ExpirationPlugin({
//             maxEntries: 100,
//             maxAgeSeconds: 24 * 60 * 60, // يوم واحد
//           }),
//         ],
//       }),
//     );

//     // استراتيجية لطلبات POST, PUT, DELETE - استخدام Background Sync
//     workbox.routing.registerRoute(
//       ({ url, request }) =>
//         url.pathname.startsWith("/api") &&
//         ["POST", "PUT", "DELETE", "PATCH"].includes(request.method),
//       new workbox.strategies.NetworkOnly({
//         plugins: [queue],
//       }),
//     );

//     console.log("✅ Background Sync Queue initialized");
//   } else {
//     console.warn("⚠️ BackgroundSync not available");
//   }

//   // استراتيجية للملفات الثابتة (CSS, JS, etc)
//   workbox.routing.registerRoute(
//     ({ request }) =>
//       request.destination === "style" ||
//       request.destination === "script" ||
//       request.destination === "font" ||
//       request.destination === "image",
//     new workbox.strategies.CacheFirst({
//       cacheName: "static-assets-v1",
//       plugins: [
//         new workbox.cacheableResponse.CacheableResponsePlugin({
//           statuses: [0, 200],
//         }),
//         new workbox.expiration.ExpirationPlugin({
//           maxEntries: 100,
//           maxAgeSeconds: 30 * 24 * 60 * 60, // 30 يوم
//         }),
//       ],
//     }),
//   );

//   // التخزين المؤقت للصفحات (للعمل دون اتصال)
//   workbox.routing.registerRoute(
//     ({ request }) => request.mode === "navigate",
//     new workbox.strategies.NetworkFirst({
//       cacheName: "pages-cache-v1",
//       plugins: [
//         new workbox.cacheableResponse.CacheableResponsePlugin({
//           statuses: [0, 200],
//         }),
//         new workbox.expiration.ExpirationPlugin({
//           maxEntries: 50,
//           maxAgeSeconds: 7 * 24 * 60 * 60, // أسبوع
//         }),
//       ],
//     }),
//   );

//   console.log("✅ Service Worker configured successfully");
// } else {
//   console.log("❌ Workbox failed to load");
// }

// // ============================================
// // مستمعين إضافيين للتحكم الكامل
// // ============================================

// // عند تثبيت الـ Service Worker
// self.addEventListener("install", (event) => {
//   console.log("📦 Service Worker installing...");
//   // تفعيل الـ SW الجديد فوراً دون انتظار
//   self.skipWaiting();
// });

// // عند تفعيل الـ Service Worker
// self.addEventListener("activate", (event) => {
//   console.log("🚀 Service Worker activated and controlling all pages");
//   // السيطرة على جميع الصفحات المفتوحة بدون إعادة تحميل
//   event.waitUntil(
//     (async () => {
//       // تنظيف الكاش القديم إذا وجد
//       const cacheWhitelist = [
//         "api-cache-v1",
//         "static-assets-v1",
//         "pages-cache-v1",
//       ];
//       const cacheNames = await caches.keys();

//       await Promise.all(
//         cacheNames.map((cacheName) => {
//           if (!cacheWhitelist.includes(cacheName)) {
//             console.log(`🗑️ Deleting old cache: ${cacheName}`);
//             return caches.delete(cacheName);
//           }
//         }),
//       );

//       // السيطرة على جميع العملاء
//       await self.clients.claim();

//       console.log("✅ Activation complete");
//     })(),
//   );
// });

// // عند استعادة الاتصال بالإنترنت
// self.addEventListener("online", () => {
//   console.log("🟢 Online - Service Worker will sync pending requests");

//   // إشعار جميع الصفحات باستعادة الاتصال
//   self.clients.matchAll().then((clients) => {
//     clients.forEach((client) => {
//       client.postMessage({
//         type: "ONLINE",
//         message: "تم استعادة الاتصال بالإنترنت",
//       });
//     });
//   });
// });

// // عند فقدان الاتصال
// self.addEventListener("offline", () => {
//   console.log("🔴 Offline - Service Worker working in offline mode");

//   // إشعار جميع الصفحات بفقدان الاتصال
//   self.clients.matchAll().then((clients) => {
//     clients.forEach((client) => {
//       client.postMessage({
//         type: "OFFLINE",
//         message: "فقد الاتصال بالإنترنت - سيتم حفظ التغييرات محلياً",
//       });
//     });
//   });
// });

// // استقبال رسائل من الصفحات
// self.addEventListener("message", (event) => {
//   console.log("📨 SW received message:", event.data);

//   // تخطي الانتظار والتفعيل الفوري
//   if (event.data && event.data.type === "SKIP_WAITING") {
//     console.log("⏩ Skipping waiting phase...");
//     self.skipWaiting();
//   }

//   // إرسال حالة الـ Service Worker
//   if (event.data && event.data.type === "GET_STATUS") {
//     console.log("📊 Sending status to client...");
//     // استخدام event.source للإرسال مباشرة للمرسل
//     if (event.source) {
//       event.source.postMessage({
//         type: "STATUS",
//         online: self.navigator.onLine,
//         version: "1.0.0",
//         timestamp: Date.now(),
//       });
//     }
//   }

//   // إرسال إشعار بالتحديث
//   if (event.data && event.data.type === "CHECK_UPDATE") {
//     // يمكن إضافة منطق التحقق من التحديثات هنا
//     if (event.source) {
//       event.source.postMessage({
//         type: "UPDATE_STATUS",
//         hasUpdate: false,
//         message: "أنت تستخدم أحدث نسخة",
//       });
//     }
//   }
// });

// // معالجة الأخطاء العامة
// self.addEventListener("error", (error) => {
//   console.error("Service Worker error:", error);
// });

// // معالجة الوعود غير المعالجة
// self.addEventListener("unhandledrejection", (event) => {
//   console.error("Unhandled promise rejection in SW:", event.reason);
// });
