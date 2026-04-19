import jwt from 'jsonwebtoken';

export const createJwt = (user:any)=>{
    const token = process.env.ACSSES_TOKEN_SCRET;
    if(!token) return;
    const access_token = jwt.sign(user,token);
    return access_token;
}

export const decodeJWT = (token: string)  => {
  try {
    // فك تشفير التوكن باستخدام secret key
    const SECRET_KEY = process.env.ACSSES_TOKEN_SCRET;
    if(!SECRET_KEY) return;
    const decoded = jwt.verify(token, SECRET_KEY);
    return decoded;  // هنا ستحصل على الكائن الأصلي
  } catch  {
    return null;  // في حالة حدوث خطأ (مثل التوكن غير صالح أو منتهي الصلاحية)
  }
};
