'use client';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { HospitalsTable } from '@/components/tables/HospitalsTable';

export default function HospitalsPage() {
  return (
    <ProtectedLayout 
      title="Hospitals" 
      description="Manage hospital information and staffing allocations"
    >
      <HospitalsTable />
    </ProtectedLayout>
  );
}