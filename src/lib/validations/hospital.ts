import { z } from 'zod';
import { HospitalType } from '@/types';

const hospitalTypes: [HospitalType, ...HospitalType[]] = [
  'BASE_HOSPITAL',
  'BOARD_MANAGED_HOSPITAL',
  'DISTRICT_GENERAL_HOSPITAL',
  'DIVISIONAL_HOSPITAL',
  'GENERAL_HOSPITAL',
  'MEDICAL_CLINIC',
  'MOH_OFFICE',
  'NATIONAL_HOSPITAL',
  'REGIONAL_HEALTH_SERVICES_OFFICE',
  'OTHER_HEALTH_INSTITUTION',
  'OTHER_HOSPITAL',
  'PRIMARY_MEDICAL_CARE_UNIT',
  'PROVINCIAL_GENERAL_HOSPITAL',
  'SPECIALIZED_HOSPITAL',
  'TEACHING_HOSPITAL'
];

export const hospitalSchema = z.object({
  name: z.string().min(1, 'Hospital name is required').max(200, 'Name is too long'),
  province: z.string().min(1, 'Province is required').max(100, 'Province name is too long'),
  district: z.string().min(1, 'District is required').max(100, 'District name is too long'),
  type: z.enum(hospitalTypes, {
    message: 'Please select a valid hospital type'
  }),
  allocation: z.number().min(0, 'Allocation must be 0 or greater').max(100, 'Allocation seems too high'),
  notes: z.string().optional(),
});

export type HospitalFormData = z.infer<typeof hospitalSchema>;