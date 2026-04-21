// app/test-empty/page.tsx
'use client';

import { EmptyState } from '@/components/ui/EmptyState';

export default function TestEmptyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <EmptyState />
    </div>
  );
}