'use client';

import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MainTab } from '../../../components/dashboard/tabs/MainTab';
import { PatientsTab } from '../../../components/dashboard/tabs/PatientsTab';
import { ClinicInfoTab } from '../../../components/dashboard/tabs/ClinicInfoTab';
import { DoctorCVTab } from '../../../components/dashboard/tabs/DoctorCVTab';
import { MessagesTab } from '../../../components/dashboard/tabs/MessagesTab';

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab') || 'main';

  const renderTab = () => {
    switch (tab) {
      case 'main':
        return <MainTab />;
      case 'patients':
        return <PatientsTab />;
      case 'clinic':
        return <ClinicInfoTab />;
      case 'cv':
        return <DoctorCVTab />;
      case 'messages':
        return <MessagesTab />;
      default:
        return <MainTab />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
      >
        {renderTab()}
      </motion.div>
    </AnimatePresence>
  );
}