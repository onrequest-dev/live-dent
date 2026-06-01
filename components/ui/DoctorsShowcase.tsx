// components/ui/DoctorsShowcase.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';

type Doctor = {
  id: number;
  name: string;
  specialty: string;
  image: string;
  description: string;
};

type DoctorsShowcaseProps = {
  doctors?: Doctor[];
};

const defaultDoctors: Doctor[] = [
  {
    id: 1,
    name: "د. أحمد الحكيم",
    specialty: "جراحة الفم والأسنان",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    description: "استشاري جراحة الفم والأسنان بخبرة تزيد عن 15 عاماً في زراعة الأسنان والجراحات التجميلية."
  },
  {
    id: 2,
    name: "د. نورا سليمان",
    specialty: "تقويم الأسنان",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop",
    description: "أخصائية تقويم الأسنان المعتمدة، حاصلة على جائزة أفضل تصميم ابتسامة 2023."
  },
  {
    id: 3,
    name: "د. كريم المنصور",
    specialty: "تجميل وزراعة الأسنان",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    description: "خبير في تجميل وزراعة الأسنان، أكثر من 1000 عملية زراعة ناجحة."
  },
  {
    id: 4,
    name: "د. ليلى مراد",
    specialty: "علاج الجذور",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
    description: "أخصائية علاج الجذور تحت الميكروسكوب، بأحدث التقنيات العالمية."
  },
  {
    id: 5,
    name: "د. أحمد الحكيم",
    specialty: "جراحة الفم والأسنان",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    description: "استشاري جراحة الفم والأسنان بخبرة تزيد عن 15 عاماً في زراعة الأسنان والجراحات التجميلية."
  },
  {
    id: 6,
    name: "د. نورا سليمان",
    specialty: "تقويم الأسنان",
    image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop",
    description: "أخصائية تقويم الأسنان المعتمدة، حاصلة على جائزة أفضل تصميم ابتسامة 2023."
  },
  {
    id: 7,
    name: "د. كريم المنصور",
    specialty: "تجميل وزراعة الأسنان",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop",
    description: "خبير في تجميل وزراعة الأسنان، أكثر من 1000 عملية زراعة ناجحة."
  },
  {
    id: 8,
    name: "د. ليلى مراد",
    specialty: "علاج الجذور",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop",
    description: "أخصائية علاج الجذور تحت الميكروسكوب، بأحدث التقنيات العالمية."
  },
];

export const DoctorsShowcase: React.FC<DoctorsShowcaseProps> = ({ doctors = defaultDoctors }) => {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDoctorClick = (doctor: Doctor) => {
    setSelectedDoctor(selectedDoctor?.id === doctor.id ? null : doctor);
  };

  return (
    <section className="py-16 relative overflow-hidden" dir="rtl">
      {/* خلفية بسيطة */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A1628] via-[#0D1F3A] to-[#0A1628]" />
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        {/* عنوان بسيط */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            أفضل الأطباء{' '}
            <span className="text-yellow-400">اللذين يعملون معنا</span>
          </h2>
          <div className="w-112 h-0.5 bg-yellow-500 mx-auto rounded-full" />
        </div>

        {/* قائمة الأطباء المصغرة */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="relative">
              {/* الصورة المصغرة */}
              <motion.button
                onClick={() => handleDoctorClick(doctor)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative focus:outline-none group"
              >
                <div className="relative">
                  <img
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2 transition-all duration-300"
                    style={{
                      borderColor: selectedDoctor?.id === doctor.id ? '#D4AF37' : 'rgba(212, 175, 55, 0.3)',
                      boxShadow: selectedDoctor?.id === doctor.id ? '0 0 0 3px rgba(212, 175, 55, 0.2)' : 'none'
                    }}
                  />
                  {/* نقطة ذهبية نشطة */}
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-yellow-400 transition-opacity ${
                    selectedDoctor?.id === doctor.id ? 'opacity-100' : 'opacity-0'
                  }`} />
                </div>
              </motion.button>

              {/* الاسم تحت الصورة (للموبايل) */}
              <p className="text-center text-xs text-gray-400 mt-2 md:hidden">
                {doctor.name.split(' ').slice(0, 2).join(' ')}
              </p>
            </div>
          ))}
        </div>

        {/* بطاقة المعلومات المنبثقة */}
        <AnimatePresence>
          {selectedDoctor && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="mt-8 flex justify-center"
            >
              <div className="max-w-md w-full bg-gradient-to-br from-[#0F1F35]/95 to-[#0A1628]/95 backdrop-blur-sm rounded-2xl border border-yellow-500/30 p-5 shadow-2xl relative">
                {/* زر إغلاق للشاشات الكبيرة */}
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <X size={18} />
                </button>
                
                <div className="flex gap-4">
                  {/* صورة أكبر */}
                  <img
                    src={selectedDoctor.image}
                    alt={selectedDoctor.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-yellow-400"
                  />
                  
                  {/* المعلومات */}
                  <div className="flex-1 text-right">
                    <h3 className="text-white font-bold text-lg mb-1">
                      {selectedDoctor.name}
                    </h3>
                    <p className="text-yellow-400 text-sm mb-2">
                      {selectedDoctor.specialty}
                    </p>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {selectedDoctor.description}
                    </p>
                    
                    {/* أيقونات إضافية */}
                    <div className="flex gap-2 mt-3">
                      {[1, 2, 3].map((i) => (
                        <Star key={i} size={12} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};