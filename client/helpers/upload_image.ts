import { supabase_client } from "@/lib/supabase-client";
import { compressLogo, compressPfpImage } from "./compress_images";

export const handleUploadImage = async (file: File, type: 'logo' | 'pfp', clinicId?: string, menuId?: string): Promise<string> => {
  
  if (!file) {
    console.error("No file provided");
    throw new Error("No file provided");
  }
  let compressed_file ;
  if(type === 'logo') compressed_file = await compressLogo(file);
  else if(type === 'pfp') compressed_file = await compressPfpImage(file);
  else compressed_file = file;

  // 1. إنشاء مسار فريد للصورة
  const fileExt = file.name.split('.').pop();
  
  let fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
  if(type === 'pfp' && menuId) {
    fileName = `pfp_${menuId}.${fileExt}`;
  }
  if(type === 'logo'&&clinicId){
    fileName = `logo_${clinicId}.${fileExt}`;
  }
    const filePath = `${type}s/${fileName}`; 
  try {
    const { data, error } = await supabase_client.storage
      .from('images') 
      .upload(filePath, compressed_file, {
        cacheControl: '0',
        upsert: true, 
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    const { data: { publicUrl } } = supabase_client.storage
      .from('images')
      .getPublicUrl(filePath);
    
    if(!publicUrl) throw new Error("فشل تحميل الصورة" ); 
    return publicUrl;

  } catch (error) {
    throw new Error("فشل في تحميل الصورة");
  }
};