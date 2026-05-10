// app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { admin_key } = body;

    // التحقق من أن المفتاح المرسل matches المفتاح في البيئة
    if (admin_key !== process.env.ADMIN_KEY) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid admin key" },
        { status: 401 },
      );
    }

    // إنشاء استجابة مع cookie
    const response = NextResponse.json(
      { success: true, message: "Admin login successful" },
      { status: 200 },
    );

    // تعيين httpOnly cookie
    response.cookies.set({
      name: "admin_token",
      value: process.env.ADMIN_TOKEN || "",
      httpOnly: true, // منع الوصول من JavaScript (أمان)
      secure: process.env.NODE_ENV === "production", // HTTPS فقط في الإنتاج
      sameSite: "strict", // منع إرسال الكوكيز عبر المواقع المختلفة
      maxAge: 60 * 60 * 24 * 356 * 10, // يوم واحد (بالثواني)
      path: "/", // متاح لجميع المسارات
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// إضافة طريقة GET لعرض نموذج تسجيل الدخول (اختياري)
export async function GET() {
  return new NextResponse(
    `
        <!DOCTYPE html>
        <html dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>تسجيل دخول المسؤول</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #0A1628 0%, #1A2A44 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 1rem;
                }
                .container {
                    background: rgba(15, 31, 53, 0.9);
                    backdrop-filter: blur(10px);
                    border-radius: 1.5rem;
                    padding: 2rem;
                    width: 100%;
                    max-width: 400px;
                    border: 1px solid rgba(20, 184, 166, 0.2);
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                h1 {
                    color: white;
                    text-align: center;
                    margin-bottom: 0.5rem;
                    font-size: 1.8rem;
                }
                .subtitle {
                    color: rgba(255,255,255,0.6);
                    text-align: center;
                    margin-bottom: 2rem;
                    font-size: 0.9rem;
                }
                .logo {
                    width: 80px;
                    height: 80px;
                    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 1.5rem;
                    font-size: 2rem;
                    font-weight: bold;
                    color: white;
                }
                input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: #1A2A44;
                    border: 1px solid rgba(20, 184, 166, 0.2);
                    border-radius: 0.75rem;
                    color: white;
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    transition: all 0.3s;
                }
                input:focus {
                    outline: none;
                    border-color: #14b8a6;
                    box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.2);
                }
                input::placeholder {
                    color: rgba(255,255,255,0.4);
                }
                button {
                    width: 100%;
                    padding: 0.75rem;
                    background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
                    border: none;
                    border-radius: 0.75rem;
                    color: #0A1628;
                    font-weight: bold;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                }
                button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(20, 184, 166, 0.3);
                }
                .error {
                    background: rgba(239, 68, 68, 0.1);
                    border: 1px solid rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    font-size: 0.875rem;
                }
                .success {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    color: #22c55e;
                    padding: 0.75rem;
                    border-radius: 0.75rem;
                    margin-bottom: 1rem;
                    text-align: center;
                    font-size: 0.875rem;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">LD</div>
                <h1>تسجيل دخول المسؤول</h1>
                <p class="subtitle">أدخل مفتاح المسؤول للوصول إلى لوحة التحكم</p>
                
                <div id="message"></div>
                
                <form id="loginForm">
                    <input 
                        type="password" 
                        id="adminKey" 
                        placeholder="أدخل مفتاح المسؤول" 
                        required
                        autocomplete="off"
                    />
                    <button type="submit">تسجيل الدخول</button>
                </form>
            </div>

            <script>
                const form = document.getElementById('loginForm');
                const messageDiv = document.getElementById('message');

                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const adminKey = document.getElementById('adminKey').value;
                    
                    messageDiv.innerHTML = '';
                    
                    try {
                        const response = await fetch('/admen/getToken', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ admin_key: adminKey }),
                        });
                        
                        const data = await response.json();
                        
                        if (response.ok) {
                            messageDiv.innerHTML = '<div class="success">✓ تم تسجيل الدخول بنجاح! جاري التحويل...</div>';
                            setTimeout(() => {
                                window.location.href = '/admin/dashboard';
                            }, 1500);
                        } else {
                            messageDiv.innerHTML = '<div class="error">✗ ' + (data.error || 'فشل تسجيل الدخول') + '</div>';
                        }
                    } catch (error) {
                        messageDiv.innerHTML = '<div class="error">✗ حدث خطأ في الاتصال بالخادم</div>';
                    }
                });
            </script>
        </body>
        </html>
        `,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
}
