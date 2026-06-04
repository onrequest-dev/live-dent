'use client';

import { motion, useInView, useMotionValue, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  IdCard,
  FileSpreadsheet,
  MessageCircle,
  BarChart3,
  Smartphone,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { FaTelegramPlane, FaWhatsapp, FaYoutube, FaInstagram } from 'react-icons/fa';
import { DoctorsShowcase } from '@/components/ui/DoctorsShowcase';
import { HeroParallax } from '@/components/ui/hero-parallax';
import CardStack from '@/components/ui/stack-card';
import { PortfolioGallery } from '@/components/ui/portfolio-gallery';
import { WhyChooseUs } from '@/components/ui/why-choose-us'
import { FutureFeatures } from '@/components/ui/future-features'
import { OnRequestAbout } from '@/components/ui/onrequest-about'
import { LiveDentFooter } from '@/components/ui/livedent-footer'
// ... (باقي المكونات المساعدة تبقى كما هي)

export default function Home() {

  return (
    <div className="min-h-screen bg-[#0A1628] relative" dir="rtl">
      {/* زوايا ذهبية */}
      <div className="absolute top-0 left-0 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle at 0% 0%, rgba(255,215,0,0.12) 0%, rgba(255,200,0,0.04) 40%, transparent 70%)' }} />
      <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,215,0,0.25) 0%, transparent 100%)', clipPath: 'polygon(0 0, 100% 0, 0 100%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none" style={{ background: 'radial-gradient(circle at 100% 100%, rgba(255,215,0,0.12) 0%, rgba(255,200,0,0.04) 40%, transparent 70%)' }} />
      <div className="absolute bottom-0 right-0 w-48 h-48 pointer-events-none" style={{ background: 'linear-gradient(315deg, rgba(255,215,0,0.25) 0%, transparent 100%)', clipPath: 'polygon(100% 100%, 0 100%, 100% 0)' }} />


      <div className="fixed inset-0 bg-gradient-to-b from-[#0A1628]/60 via-transparent to-[#0A1628]/60 pointer-events-none" style={{ zIndex: 1 }} />

      <div className="relative" style={{ zIndex: 2 }}>

        {/* Hero Parallax مع المحتوى النصي الأصلي */}
        <div className="relative">
          <HeroParallax />
        </div>

        {/* Feature Card Stack */}
        <CardStack />
        {/* pn2 section */}

        <section className="py-16 relative overflow-hidden bg-gradient-to-br from-[#0A1628] via-[#0D1F3A] to-[#0A1628]">
          <PortfolioGallery />
        </section>

        <WhyChooseUs />
        {/* <FutureFeatures /> */}
        <OnRequestAbout />
        {/* <DoctorsShowcase /> */}

        {/* Footer */}
        <footer className="border-t border-yellow-500/10 py-8">
          <LiveDentFooter />
        </footer>
      </div>
    </div>
  );
}