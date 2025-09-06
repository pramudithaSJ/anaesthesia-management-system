'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
// Removed unused Select imports
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
import { hospitalSchema, HospitalFormData } from '@/lib/validations/hospital';
import { Hospital, HospitalType } from '@/types';
import { useData } from '@/contexts/DataContext';
import { Building2, MapPin, FileText, Users, Save, Plus, Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HospitalFormProps {
  hospital?: Hospital;
  open: boolean;
  onClose: () => void;
}

// Sri Lankan provinces
const provinces = [
  'Central Province',
  'Eastern Province', 
  'North Central Province',
  'North Western Province',
  'Northern Province',
  'Sabaragamuwa Province',
  'Southern Province',
  'Uva Province',
  'Western Province'
];

// Hospital types with abbreviations and search terms
const hospitalTypeOptions: { 
  value: HospitalType; 
  label: string; 
  description: string; 
  abbreviation: string;
  searchTerms: string[];
  category: string;
}[] = [
  { 
    value: 'BASE_HOSPITAL', 
    label: 'Base Hospital', 
    description: 'Regional healthcare centers', 
    abbreviation: 'BH',
    searchTerms: ['BH', 'base', 'regional'],
    category: 'Regional Hospitals'
  },
  { 
    value: 'DISTRICT_GENERAL_HOSPITAL', 
    label: 'District General Hospital', 
    description: 'District-level care', 
    abbreviation: 'DGH',
    searchTerms: ['DGH', 'district', 'general'],
    category: 'Regional Hospitals'
  },
  { 
    value: 'PROVINCIAL_GENERAL_HOSPITAL', 
    label: 'Provincial General Hospital', 
    description: 'Provincial-level care', 
    abbreviation: 'PGH',
    searchTerms: ['PGH', 'provincial', 'general'],
    category: 'Regional Hospitals'
  },
  { 
    value: 'NATIONAL_HOSPITAL', 
    label: 'National Hospital', 
    description: 'Premier healthcare institutions', 
    abbreviation: 'NH',
    searchTerms: ['NH', 'national', 'premier'],
    category: 'Major Hospitals'
  },
  { 
    value: 'TEACHING_HOSPITAL', 
    label: 'Teaching Hospital', 
    description: 'Medical education facilities', 
    abbreviation: 'TH',
    searchTerms: ['TH', 'teaching', 'education', 'university'],
    category: 'Major Hospitals'
  },
  { 
    value: 'SPECIALIZED_HOSPITAL', 
    label: 'Specialized Hospital', 
    description: 'Specialty medical care', 
    abbreviation: 'SH',
    searchTerms: ['SH', 'specialized', 'specialty'],
    category: 'Specialized Care'
  },
  { 
    value: 'GENERAL_HOSPITAL', 
    label: 'General Hospital', 
    description: 'General medical services', 
    abbreviation: 'GH',
    searchTerms: ['GH', 'general'],
    category: 'General Care'
  },
  { 
    value: 'DIVISIONAL_HOSPITAL', 
    label: 'Divisional Hospital', 
    description: 'Divisional healthcare', 
    abbreviation: 'DH',
    searchTerms: ['DH', 'divisional'],
    category: 'Local Care'
  },
  { 
    value: 'PRIMARY_MEDICAL_CARE_UNIT', 
    label: 'Primary Medical Care Unit', 
    description: 'Primary care services', 
    abbreviation: 'PMCU',
    searchTerms: ['PMCU', 'primary', 'medical', 'care', 'unit'],
    category: 'Primary Care'
  },
  { 
    value: 'MEDICAL_CLINIC', 
    label: 'Medical Clinic', 
    description: 'Outpatient services', 
    abbreviation: 'MC',
    searchTerms: ['MC', 'clinic', 'outpatient'],
    category: 'Primary Care'
  },
  { 
    value: 'MOH_OFFICE', 
    label: 'MOH Office', 
    description: 'Medical Officer of Health office', 
    abbreviation: 'MOH',
    searchTerms: ['MOH', 'medical', 'officer', 'health', 'office'],
    category: 'Administrative'
  },
  { 
    value: 'BOARD_MANAGED_HOSPITAL', 
    label: 'Board Managed Hospital', 
    description: 'Board-governed facilities', 
    abbreviation: 'BMH',
    searchTerms: ['BMH', 'board', 'managed'],
    category: 'Other'
  },
  { 
    value: 'REGIONAL_HEALTH_SERVICES_OFFICE', 
    label: 'Regional Health Services Office', 
    description: 'Regional health administration', 
    abbreviation: 'RHSO',
    searchTerms: ['RHSO', 'regional', 'health', 'services', 'office'],
    category: 'Administrative'
  },
  { 
    value: 'OTHER_HEALTH_INSTITUTION', 
    label: 'Other Health Institution', 
    description: 'Other healthcare facility', 
    abbreviation: 'OHI',
    searchTerms: ['OHI', 'other', 'health', 'institution'],
    category: 'Other'
  },
  { 
    value: 'OTHER_HOSPITAL', 
    label: 'Other Hospital', 
    description: 'Other hospital type', 
    abbreviation: 'OH',
    searchTerms: ['OH', 'other', 'hospital'],
    category: 'Other'
  },
];

export function HospitalForm({ hospital, open, onClose }: HospitalFormProps) {
  const [loading, setLoading] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState('');
  const [hospitalTypeSearch, setHospitalTypeSearch] = useState('');
  const { addHospital, updateHospital } = useData();

  const form = useForm<HospitalFormData>({
    resolver: zodResolver(hospitalSchema),
    defaultValues: {
      name: '',
      province: '',
      district: '',
      type: 'GENERAL_HOSPITAL',
      allocation: 0,
      notes: '',
    },
  });

  // Reset form when hospital changes or dialog opens
  useEffect(() => {
    if (open) {
      if (hospital) {
        form.reset({
          name: hospital.name,
          province: hospital.province,
          district: hospital.district,
          type: hospital.type,
          allocation: hospital.allocation,
          notes: hospital.notes || '',
        });
      } else {
        form.reset({
          name: '',
          province: '',
          district: '',
          type: 'GENERAL_HOSPITAL',
          allocation: 0,
          notes: '',
        });
      }
    }
  }, [hospital, open, form]);

  const onSubmit = async (data: HospitalFormData) => {
    try {
      setLoading(true);
      
      if (hospital) {
        await updateHospital(hospital.id, data);
      } else {
        await addHospital(data);
      }
      
      form.reset();
      onClose();
    } catch (error) {
      console.error('Error saving hospital:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setProvinceSearch('');
    setHospitalTypeSearch('');
    onClose();
  };

  // Clear search when form closes
  useEffect(() => {
    if (!open) {
      setProvinceSearch('');
      setHospitalTypeSearch('');
    }
  }, [open]);

  // Filter provinces based on search
  const filteredProvinces = provinces.filter(province => 
    province.toLowerCase().includes(provinceSearch.toLowerCase())
  );

  // Filter hospital types based on search
  const filteredHospitalTypes = hospitalTypeOptions.filter(option =>
    option.label.toLowerCase().includes(hospitalTypeSearch.toLowerCase()) ||
    option.abbreviation.toLowerCase().includes(hospitalTypeSearch.toLowerCase()) ||
    option.searchTerms.some(term => term.toLowerCase().includes(hospitalTypeSearch.toLowerCase()))
  );

  const isEditing = !!hospital;
  const selectedHospitalType = hospitalTypeOptions.find(h => h.value === form.watch('type'));

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-hidden flex flex-col">
        {/* Enhanced Header - No close button since Sheet handles it */}
        <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
              {isEditing ? (
                <Building2 className="w-6 h-6 text-white" />
              ) : (
                <Plus className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold text-gray-900">
                {isEditing ? 'Edit Hospital' : 'Add New Hospital'}
              </SheetTitle>
              <SheetDescription className="text-base text-gray-600 mt-1">
                {isEditing 
                  ? 'Update hospital information and staffing allocation' 
                  : 'Register a new hospital in the anaesthesia management system'
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
                {/* Basic Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>Basic Information</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Hospital Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., National Hospital of Sri Lanka"
                            className="h-11 text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the official registered name of the hospital
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-sm font-medium">Hospital Type</FormLabel>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                aria-label="Select hospital type"
                                className="h-11 justify-between"
                              >
                                {field.value ? (
                                  <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {selectedHospitalType?.abbreviation}
                                    </Badge>
                                    <span>{selectedHospitalType?.label}</span>
                                  </div>
                                ) : (
                                  "Select hospital type..."
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
                                placeholder="Search hospital types (try 'BH', 'DGH')..."
                                value={hospitalTypeSearch}
                                onChange={(e) => setHospitalTypeSearch(e.target.value)}
                              />
                            </div>
                            {Object.entries(
                              filteredHospitalTypes.reduce((groups, option) => {
                                const category = option.category;
                                if (!groups[category]) groups[category] = [];
                                groups[category].push(option);
                                return groups;
                              }, {} as Record<string, typeof hospitalTypeOptions>)
                            ).map(([category, options]) => (
                              options.length > 0 && (
                                <div key={category}>
                                  <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground px-2 py-1.5">
                                    {category}
                                  </DropdownMenuLabel>
                                  {options.map((option) => (
                                    <DropdownMenuItem
                                      key={option.value}
                                      onClick={() => {
                                        form.setValue("type", option.value);
                                        setHospitalTypeSearch('');
                                      }}
                                      className="flex items-center space-x-3 py-2 px-2"
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                      />
                                      <Badge variant="outline" className="text-xs font-mono">
                                        {option.abbreviation}
                                      </Badge>
                                      <div className="flex flex-col flex-1">
                                        <span className="font-medium">{option.label}</span>
                                        <span className="text-sm text-muted-foreground">
                                          {option.description}
                                        </span>
                                      </div>
                                    </DropdownMenuItem>
                                  ))}
                                  <DropdownMenuSeparator />
                                </div>
                              )
                            ))}
                            {filteredHospitalTypes.length === 0 && (
                              <div className="py-6 text-center text-sm text-muted-foreground">
                                No hospital type found.
                              </div>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <FormDescription>
                          Type abbreviation like &apos;BH&apos; for Base Hospital, or search by name
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Location Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <span>Location Details</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="province"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-sm font-medium">Province</FormLabel>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  aria-label="Select province"
                                  className="h-11 justify-between"
                                >
                                  {field.value || "Select province..."}
                                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              className="w-[300px] max-h-[250px] overflow-y-auto z-50" 
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
                                  placeholder="Search provinces..."
                                  value={provinceSearch}
                                  onChange={(e) => setProvinceSearch(e.target.value)}
                                />
                              </div>
                              {filteredProvinces.map((province) => (
                                <DropdownMenuItem
                                  key={province}
                                  onClick={() => {
                                    form.setValue("province", field.value === province ? "" : province);
                                    setProvinceSearch('');
                                  }}
                                  className="flex items-center py-2 px-2"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      field.value === province ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  <span>{province}</span>
                                </DropdownMenuItem>
                              ))}
                              {filteredProvinces.length === 0 && (
                                <div className="py-6 text-center text-sm text-muted-foreground">
                                  No province found.
                                </div>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          <FormDescription>
                            Select the administrative province
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="district"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">District</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., Colombo"
                              className="h-11"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Administrative district location
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Staffing Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <Users className="w-5 h-5 text-accent" />
                    <span>Staffing Allocation</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="allocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Government Allocated Positions</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0"
                            max="200"
                            step="1"
                            placeholder="Enter number of positions"
                            className="h-11 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                field.onChange(0);
                              } else {
                                const numValue = parseInt(value, 10);
                                if (!isNaN(numValue) && numValue >= 0 && numValue <= 200) {
                                  field.onChange(numValue);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseInt(e.target.value, 10);
                              if (isNaN(value) || value < 0) {
                                field.onChange(0);
                              } else if (value > 200) {
                                field.onChange(200);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of anaesthesiologist positions officially allocated by the Ministry of Health
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Additional Information Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-lg font-semibold text-gray-900">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span>Additional Information</span>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Notes & Comments</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter any additional notes, special considerations, or comments about this hospital..."
                            className="min-h-[120px] resize-none text-base"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Optional field for any additional information, special requirements, or administrative notes
                        </FormDescription>
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
              {isEditing ? 'Updating existing hospital record' : 'Creating new hospital record'}
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
                className="h-11 px-8 bg-primary hover:bg-primary/90"
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
                    <span>{isEditing ? 'Update Hospital' : 'Add Hospital'}</span>
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