// client/helpers/auth.ts


export async function switchClinic(targetClinicId: string) {
    try {
        const response = await fetch('/api/v1/accounts/profiles', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ clinicId: targetClinicId }),
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                error: data.error || 'فشل تبديل العيادة',
            };
        }
        sessionStorage.removeItem("newsessions"); 
        sessionStorage.removeItem("newpatients"); 
        return {
            success: true,
            data: data,
        };
    } catch (error) {
        console.error('Switch clinic error:', error);
        return {
            
            success: false,
            error: 'حدث خطأ في الاتصال بالخادم',
        };
    }
}