import { supabase_server } from "@/server/supabase-server";
import { Clinic, DoctorProfile } from "@/types";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(request: NextRequest) {
    const admin_token = request.cookies.get("admin_token")?.value;
    if (admin_token !== process.env.ADMIN_TOKEN) {
        return new Response("Unauthorized", { status: 401 });
    }
    const req_body = await request.json(); 
    const clinic_data : Clinic = req_body.clinic_data;
    const credentials = req_body.credentials
    clinic_data.logo = "https://hzwxienpgfiaokdoqhmd.supabase.co/storage/v1/object/public/images/logos/logo_1b0b60f6-d0ac-4b65-94ea-e60be6ec475e.jpg"
    clinic_data.settings = {
  "primaryColor": "#4383a5",
  "workingHours": [
    {
      "day": 0,
      "end": "00:00",
      "start": "00:00",
      "isClosed": true
    },
    {
      "day": 1,
      "end": "17:00",
      "start": "11:00",
      "isClosed": false
    },
     {
      "day": 2,
      "end": "17:00",
      "start": "09:00",
      "isClosed": false
    },
     {
      "day": 3,
      "end": "17:00",
      "start": "09:00",
      "isClosed": false
    },
     {
      "day": 4,
      "end": "17:00",
      "start": "09:00",
      "isClosed": false
    },
    {
      "day": 5,
      "end": "17:00",
      "start": "09:00",
      "isClosed": false
    },
     {
      "day": 6,
      "end": "00:00",
      "start": "00:00",
      "isClosed": true
    }
],
  "secondaryColor": "#6d6d6d",
  "defaultAppointmentDuration": 30
    }
    const doctor_prof:DoctorProfile = clinic_data.doctorProfile;
    delete (clinic_data as any).doctorProfile;
    const {data,error} = await supabase_server.from("Clinic").insert(clinic_data).select("id").single();
    console.log(error)
    if(error) return new Response("error", { status: 500 });
    const clinicId = data?.id;
    const doctor_prof_with_clinic_id = {
  ...doctor_prof,
  clinicId: clinicId
    };
    const {data:doctor,error:doctor_error} = await supabase_server.from("DoctorProfile").insert(doctor_prof_with_clinic_id)
    console.log(doctor_error)
    if(doctor_error) return new Response("error", { status: 500 });

    const saltRounds = 10;
    const {username,password} = credentials;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const {data:userdatat,error:userError} = await supabase_server.from("employees").insert({"user_name":username,"hashed_password":hashedPassword,"role":"admin","clinicId":clinicId})
    console.log(userError)
    if(userError)  return new Response("error", { status: 500 });
    return new Response("ok", { status: 200 });


}