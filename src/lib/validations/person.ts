import { z } from 'zod';
import { Grade, Gender } from '@/types';

const grades: [Grade, ...Grade[]] = ['MO', 'REGISTRAR', 'SENIOR_REGISTRAR', 'CONSULTANT'];
const genders: [Gender, ...Gender[]] = ['MALE', 'FEMALE'];

export const personSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name is too long'),
  slmcNumber: z.string().min(1, 'SLMC number is required').max(20, 'SLMC number is too long'),
  nationalId: z.string().max(20, 'National ID is too long').optional(),
  phone: z.string().optional(),
  phone2: z.string().optional(),
  personalEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  pgimEmail: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  address: z.string().max(500, 'Address is too long').optional(),
  gender: z.enum(genders, {
    message: 'Please select a gender'
  }).optional(),
  currentHospitalId: z.string().optional(),
  currentGrade: z.enum(grades, {
    message: 'Please select a valid grade'
  }),
  anaesthesiaTrainingDone: z.boolean().optional(),
});

export type PersonFormData = z.infer<typeof personSchema>;