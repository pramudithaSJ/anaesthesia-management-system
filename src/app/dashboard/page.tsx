'use client';

import { useData } from '@/contexts/DataContext';

// Force dynamic rendering to prevent static generation issues with Firebase
export const dynamic = 'force-dynamic';
import { ProtectedLayout } from '@/components/layout/ProtectedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, UserCheck, AlertTriangle } from 'lucide-react';

export default function DashboardPage() {
  const { hospitals, people, hospitalsLoading, peopleLoading } = useData();

  // Calculate stats
  const totalHospitals = hospitals.length;
  const totalPeople = people.length;
  const totalAllocations = hospitals.reduce((sum, hospital) => sum + hospital.allocation, 0);
  const currentAssignments = people.filter(person => person.currentHospitalId).length;
  const vacancies = totalAllocations - currentAssignments;

  // Calculate staffing by hospital
  const hospitalStats = hospitals.map(hospital => {
    const assignedCount = people.filter(person => person.currentHospitalId === hospital.id).length;
    const percentage = hospital.allocation > 0 ? (assignedCount / hospital.allocation) * 100 : 0;
    return {
      ...hospital,
      assignedCount,
      percentage,
      status: percentage >= 100 ? 'full' : percentage >= 80 ? 'good' : percentage >= 50 ? 'warning' : 'critical'
    };
  });

  const criticalHospitals = hospitalStats.filter(h => h.status === 'critical').length;

  const stats = [
    {
      title: 'Total Hospitals',
      value: totalHospitals,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Anaesthesiologists',
      value: totalPeople,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Assigned Positions',
      value: currentAssignments,
      icon: UserCheck,
      color: 'text-secondary',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Vacant Positions',
      value: vacancies,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  return (
    <ProtectedLayout 
      title="Dashboard" 
      description="Overview of the Anaesthesia Management System"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardContent className="flex items-center p-6">
                  <div className={`rounded-full p-3 ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {hospitalsLoading || peopleLoading ? '...' : stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Hospital Staffing Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hospital Staffing Status</CardTitle>
            </CardHeader>
            <CardContent>
              {hospitalsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitalStats.slice(0, 5).map((hospital) => (
                    <div key={hospital.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">{hospital.name}</p>
                          <Badge
                            variant={
                              hospital.status === 'full' ? 'default' :
                              hospital.status === 'good' ? 'secondary' :
                              hospital.status === 'warning' ? 'destructive' :
                              'destructive'
                            }
                            className="text-xs"
                          >
                            {hospital.assignedCount}/{hospital.allocation}
                          </Badge>
                        </div>
                        <div className="mt-1 h-2 bg-gray-200 rounded-full">
                          <div
                            className={`h-2 rounded-full ${
                              hospital.status === 'full' ? 'bg-green-500' :
                              hospital.status === 'good' ? 'bg-green-400' :
                              hospital.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(hospital.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {hospitalStats.length > 5 && (
                    <p className="text-xs text-gray-500 text-center">
                      +{hospitalStats.length - 5} more hospitals
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Allocated Positions</span>
                  <span className="font-medium">{totalAllocations}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Currently Filled</span>
                  <span className="font-medium">{currentAssignments}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Vacant Positions</span>
                  <span className="font-medium text-red-600">{vacancies}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Understaffed Hospitals</span>
                  <span className="font-medium text-red-600">{criticalHospitals}</span>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Overall Staffing</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-2 rounded-full ${
                            (currentAssignments / totalAllocations) >= 0.8 ? 'bg-green-500' :
                            (currentAssignments / totalAllocations) >= 0.6 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{
                            width: `${totalAllocations > 0 ? (currentAssignments / totalAllocations) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {totalAllocations > 0 ? Math.round((currentAssignments / totalAllocations) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedLayout>
  );
}