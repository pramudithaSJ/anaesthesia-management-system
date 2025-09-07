'use client';

// Force dynamic rendering to prevent static generation issues with Firebase
export const dynamic = 'force-dynamic';

import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { PeopleTable } from '@/components/tables/PeopleTable';

export default function PeoplePage() {
  return (
    <ProtectedLayout 
      title="People" 
      description="Manage anaesthesiologists and their hospital assignments"
    >
      <PeopleTable />
    </ProtectedLayout>
  );
}