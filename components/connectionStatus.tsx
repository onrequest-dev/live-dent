import { useEffect } from "react";

export function ConnectionStatus() {
  useEffect(() => {
    let statusDiv: HTMLDivElement | null = null;

    const updateStatus = () => {
      if (!navigator.onLine) {
        if (!statusDiv) {
          statusDiv = document.createElement("div");
          statusDiv.id = "connection-status";
          statusDiv.innerHTML = `
            <div style="
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: #f59e0b;
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              font-size: 13px;
              z-index: 9999;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              display: flex;
              align-items: center;
              gap: 8px;
            ">
              <span>⚠️</span>
              <span>غير متصل - سيتم حفظ التغييرات محلياً</span>
            </div>
          `;
          document.body.appendChild(statusDiv);
        }
      } else {
        if (statusDiv) {
          statusDiv.remove();
          statusDiv = null;
        }
      }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
      if (statusDiv) statusDiv.remove();
    };
  }, []);

  return null;
}
