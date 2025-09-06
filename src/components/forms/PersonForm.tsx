'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { personSchema, PersonFormData } from '@/lib/validations/person';
import { Person, Grade, Gender } from '@/types';
import { useData } from '@/contexts/DataContext';
import { User, GraduationCap, Building2, Mail, Phone, UserCheck, Save, Plus, Stethoscope, Check, ChevronsUpDown, Search, MapPin, CreditCard, Users2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonFormProps {
  person?: Person;
  open: boolean;
  onClose: () => void;
}

const genderOptions: {
  value: Gender;
  label: string;
  icon: string;
}[] = [
  { value: 'MALE', label: 'Male', icon: '♂' },
  { value: 'FEMALE', label: 'Female', icon: '♀' }
];

const gradeOptions: { 
  value: Grade; 
  label: string; 
  description: string; 
  color: string; 
  level: number;
  abbreviation: string;
}[] = [
  { 
    value: 'MO', 
    label: 'Medical Officer', 
    description: 'Junior medical professional starting their career',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    level: 1,
    abbreviation: 'MO'
  },
  { 
    value: 'REGISTRAR', 
    label: 'Registrar', 
    description: 'Specialist in training with 2-3 years experience',
    color: 'bg-green-50 text-green-700 border-green-200',
    level: 2,
    abbreviation: 'REG'
  },
  { 
    value: 'SENIOR_REGISTRAR', 
    label: 'Senior Registrar', 
    description: 'Advanced specialist trainee with 4-6 years experience',
    color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    level: 3,
    abbreviation: 'SR'
  },
  { 
    value: 'CONSULTANT', 
    label: 'Consultant', 
    description: 'Senior specialist physician with full certification',
    color: 'bg-red-50 text-red-700 border-red-200',
    level: 4,
    abbreviation: 'CONS'
  },
];

export function PersonForm({ person, open, onClose }: PersonFormProps) {
  const [loading, setLoading] = useState(false);
  const [gradeSearch, setGradeSearch] = useState('');
  const [hospitalSearch, setHospitalSearch] = useState('');
  const { hospitals, addPerson, updatePerson } = useData();

  const form = useForm<PersonFormData>({
    resolver: zodResolver(personSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      slmcNumber: '',
      nationalId: '',
      phone: '',
      phone2: '',
      personalEmail: '',
      pgimEmail: '',
      address: '',
      gender: undefined,
      currentHospitalId: '',
      currentGrade: 'MO',
      anaesthesiaTrainingDone: false,
    },
  });

  // Reset form when person changes or dialog opens
  useEffect(() => {
    if (open) {
      if (person) {
        form.reset({
          firstName: person.firstName,
          lastName: person.lastName,
          slmcNumber: person.slmcNumber,
          nationalId: person.nationalId || '',
          phone: person.phone || '',
          phone2: person.phone2 || '',
          personalEmail: person.personalEmail || '',
          pgimEmail: person.pgimEmail || '',
          address: person.address || '',
          gender: person.gender,
          currentHospitalId: person.currentHospitalId || '',
          currentGrade: person.currentGrade,
          anaesthesiaTrainingDone: person.anaesthesiaTrainingDone || false,
        });
      } else {
        form.reset({
          firstName: '',
          lastName: '',
          slmcNumber: '',
          nationalId: '',
          phone: '',
          phone2: '',
          personalEmail: '',
          pgimEmail: '',
          address: '',
          gender: undefined,
          currentHospitalId: '',
          currentGrade: 'MO',
          anaesthesiaTrainingDone: false,
        });
      }
    }
  }, [person, open, form]);

  // Helper function to remove undefined values (Firebase doesn't accept undefined)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cleanData = (obj: any) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cleaned: any = {};
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      if (value !== undefined && value !== '') {
        cleaned[key] = value;
      }
    });
    return cleaned;
  };

  const onSubmit = async (data: PersonFormData) => {
    try {
      setLoading(true);
      
      const baseData = {
        firstName: data.firstName,
        lastName: data.lastName,
        slmcNumber: data.slmcNumber,
        currentGrade: data.currentGrade,
        anaesthesiaTrainingDone: data.anaesthesiaTrainingDone || false,
        timeline: person ? person.timeline : [
          {
            from: new Date().toISOString(),
            hospitalId: data.currentHospitalId || '',
            grade: data.currentGrade,
            note: 'Initial assignment'
          }
        ]
      };

      // Add optional fields only if they have values
      const optionalFields = {
        nationalId: data.nationalId,
        phone: data.phone,
        phone2: data.phone2,
        personalEmail: data.personalEmail,
        pgimEmail: data.pgimEmail,
        address: data.address,
        gender: data.gender,
        currentHospitalId: data.currentHospitalId,
      };

      const personData = {
        ...baseData,
        ...cleanData(optionalFields)
      };
      
      if (person) {
        // If hospital or grade changed, update timeline
        if (person.currentHospitalId !== data.currentHospitalId || 
            person.currentGrade !== data.currentGrade) {
          const newTimelineEntry = {
            from: new Date().toISOString(),
            hospitalId: data.currentHospitalId || '',
            grade: data.currentGrade,
            note: 'Assignment updated'
          };
          
          // Close previous entry if exists
          const updatedTimeline = person.timeline.map(entry => 
            !entry.to ? { ...entry, to: new Date().toISOString() } : entry
          );
          
          personData.timeline = [...updatedTimeline, newTimelineEntry];
        }
        
        await updatePerson(person.id, personData);
      } else {
        await addPerson(personData);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving person:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setGradeSearch('');
    setHospitalSearch('');
    onClose();
  };

  // Clear search when form closes
  useEffect(() => {
    if (!open) {
      setGradeSearch('');
      setHospitalSearch('');
    }
  }, [open]);

  // Filter grades based on search
  const filteredGrades = gradeOptions.filter(grade =>
    grade.label.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.abbreviation.toLowerCase().includes(gradeSearch.toLowerCase()) ||
    grade.value.toLowerCase().includes(gradeSearch.toLowerCase())
  );

  // Filter hospitals based on search
  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    hospital.district.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
    hospital.province.toLowerCase().includes(hospitalSearch.toLowerCase())
  );

  const selectedGrade = form.watch('currentGrade');
  const selectedHospitalId = form.watch('currentHospitalId');
  
  const gradeInfo = gradeOptions.find(g => g.value === selectedGrade);
  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);

  const isEditing = !!person;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        {/* Enhanced Header - No extra close button since Sheet handles it */}
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-secondary/5 to-accent/5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-sm">
              {isEditing ? (
                <Stethoscope className="w-6 h-6 text-white" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Anaesthesiologist' : 'Add New Anaesthesiologist'}
              </SheetTitle>
              <SheetDescription className="text-base text-gray-600 mt-1">
                {isEditing 
                  ? 'Update anaesthesiologist information and current assignment' 
                  : 'Register a new anaesthesiologist in the management system'
                }
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <User className="w-5 h-5 text-secondary" />
                    <span>Personal Information</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">First Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Saman"
                              className="h-11 text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Given name as per official records
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Perera"
                              className="h-11 text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Family name as per official records
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="slmcNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                          <UserCheck className="w-4 h-4" />
                          <span>SLMC Registration Number</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., 12345"
                            className="h-11 text-base font-mono tracking-wider uppercase"
                            {...field}
                            maxLength={10}
                            onInput={(e) => {
                              // Allow only alphanumeric characters
                              const target = e.target as HTMLInputElement;
                              target.value = target.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Sri Lanka Medical Council official registration number
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="nationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                            <CreditCard className="w-4 h-4" />
                            <span>National ID Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 199123456789"
                              className="h-11 text-base font-mono tracking-wider"
                              {...field}
                              maxLength={12}
                              onInput={(e) => {
                                // Allow only numbers and V/X at the end
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9VX]/gi, '').toUpperCase();
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            National Identity Card number (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                            <Users2 className="w-4 h-4" />
                            <span>Gender</span>
                          </FormLabel>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  aria-label="Select gender"
                                  className="h-11 justify-between"
                                >
                                  {field.value ? (
                                    <div className="flex items-center space-x-2">
                                      <span>{genderOptions.find(g => g.value === field.value)?.icon}</span>
                                      <span>{genderOptions.find(g => g.value === field.value)?.label}</span>
                                    </div>
                                  ) : (
                                    "Select gender..."
                                  )}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[200px]" side="top" align="start">
                              {genderOptions.map((option) => (
                                <DropdownMenuItem
                                  key={option.value}
                                  onClick={() => {
                                    form.setValue("gender", option.value);
                                  }}
                                  className="flex items-center space-x-2 py-2 px-2"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === option.value ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span className="text-lg">{option.icon}</span>
                                  <span>{option.label}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <FormDescription>
                            Gender selection (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                          <MapPin className="w-4 h-4" />
                          <span>Address</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Full address"
                            className="h-11 text-base"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Complete residential address (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Contact Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <Phone className="w-5 h-5 text-primary" />
                    <span>Contact Information</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                            <Phone className="w-4 h-4" />
                            <span>Primary Mobile Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="e.g., +94 71 234 5678"
                              className="h-11 text-base"
                              {...field}
                              maxLength={15}
                              onInput={(e) => {
                                // Remove any non-digit, non-space, non-plus characters
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9+\s-]/g, '');
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Primary contact number (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                            <Phone className="w-4 h-4" />
                            <span>Secondary Mobile Number</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="e.g., +94 77 987 6543"
                              className="h-11 text-base"
                              {...field}
                              maxLength={15}
                              onInput={(e) => {
                                // Remove any non-digit, non-space, non-plus characters
                                const target = e.target as HTMLInputElement;
                                target.value = target.value.replace(/[^0-9+\s-]/g, '');
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Secondary contact number (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="personalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                            <Mail className="w-4 h-4" />
                            <span>Personal Email</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="personal@gmail.com"
                              className="h-11 text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Personal email address (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="pgimEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                            <Mail className="w-4 h-4" />
                            <span>PGIM Email</span>
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="email"
                              placeholder="name@pgim.cmb.ac.lk"
                              className="h-11 text-base"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Post Graduate Institute email (optional)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Professional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    <span>Professional Assignment</span>
                  </div>

                  <FormField
                    control={form.control}
                    name="currentGrade"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium">Current Professional Grade</FormLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                aria-label="Select professional grade"
                                className="h-11 justify-between"
                              >
                                {field.value && gradeInfo ? (
                                  <div className="flex items-center space-x-2">
                                    <Badge className={`${gradeInfo.color} text-xs font-medium border`}>
                                      {gradeInfo.abbreviation}
                                    </Badge>
                                    <span>{gradeInfo.label}</span>
                                  </div>
                                ) : (
                                  "Select professional grade..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            className="w-[350px] max-h-[300px] overflow-y-auto z-50" 
                            side="top" 
                            align="start"
                            sideOffset={4}
                            avoidCollisions={true}
                            sticky="always"
                          >
                            <div className="flex items-center border-b px-3 pb-2">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search grades (try 'MO', 'REG')..."
                                value={gradeSearch}
                                onChange={(e) => setGradeSearch(e.target.value)}
                              />
                            </div>
                            <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                              Professional Grades
                            </DropdownMenuLabel>
                            {filteredGrades.map((option) => (
                              <DropdownMenuItem
                                key={option.value}
                                onClick={() => {
                                  form.setValue("currentGrade", option.value);
                                  setGradeSearch('');
                                }}
                                className="flex items-center space-x-3 py-3 px-2"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <Badge className={`${option.color} text-xs font-medium border px-2 py-1`}>
                                  {option.abbreviation}
                                </Badge>
                                <div className="flex flex-col flex-1">
                                  <span className="font-medium text-gray-900">{option.label}</span>
                                  <span className="text-sm text-gray-500">{option.description}</span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                            {filteredGrades.length === 0 && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No grade found.
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <FormDescription>
                          Select the current professional grade and specialization level
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currentHospitalId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="flex items-center space-x-2 text-sm font-medium">
                          <Building2 className="w-4 h-4" />
                          <span>Current Hospital Assignment</span>
                        </FormLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                aria-label="Select hospital assignment"
                                className="h-11 justify-between"
                              >
                                {selectedHospital ? (
                                  <div className="flex flex-col items-start">
                                    <span className="font-medium">{selectedHospital.name}</span>
                                    <span className="text-sm text-muted-foreground">
                                      {selectedHospital.district}, {selectedHospital.province}
                                    </span>
                                  </div>
                                ) : field.value ? (
                                  "Hospital not found"
                                ) : (
                                  "Select hospital assignment..."
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent 
                            className="w-[400px] max-h-[300px] overflow-y-auto z-50" 
                            side="top" 
                            align="start"
                            sideOffset={4}
                            avoidCollisions={true}
                            sticky="always"
                          >
                            <div className="flex items-center border-b px-3 pb-2">
                              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                              <input
                                className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search hospitals..."
                                value={hospitalSearch}
                                onChange={(e) => setHospitalSearch(e.target.value)}
                              />
                            </div>
                            <DropdownMenuItem
                              onClick={() => {
                                form.setValue("currentHospitalId", "");
                                setHospitalSearch('');
                              }}
                              className="py-3 px-2"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  !field.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-gray-500 italic">No current assignment</span>
                              </div>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {filteredHospitals.map((hospital) => (
                              <DropdownMenuItem
                                key={hospital.id}
                                onClick={() => {
                                  form.setValue("currentHospitalId", hospital.id);
                                  setHospitalSearch('');
                                }}
                                className="py-3 px-2"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === hospital.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="font-medium text-gray-900">{hospital.name}</span>
                                  <span className="text-sm text-gray-500">
                                    {hospital.district}, {hospital.province} • {hospital.type.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                            {filteredHospitals.length === 0 && hospitalSearch && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No hospital found.
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <FormDescription>
                          Select the hospital where this anaesthesiologist is currently working (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="anaesthesiaTrainingDone"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center space-x-2 text-base font-medium">
                            <GraduationCap className="w-5 h-5" />
                            <span>Anaesthesia Training Completed</span>
                          </FormLabel>
                          <FormDescription>
                            Has this person completed formal anaesthesia training?
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="border-t bg-gray-50/50 px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {isEditing ? 'Updating existing anaesthesiologist record' : 'Creating new anaesthesiologist record'}
            </div>
            <div className="flex space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                className="h-11 px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading} 
                className="h-11 px-8 bg-secondary hover:bg-secondary/90"
                onClick={form.handleSubmit(onSubmit)}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Update Person' : 'Add Person'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}