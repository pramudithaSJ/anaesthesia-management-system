'use client';

import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Hospital } from '@/types';
import { HospitalForm } from '@/components/forms/HospitalForm';
import { Edit, Trash2, Search, Plus, Building2 } from 'lucide-react';

export function HospitalsTable() {
  const { hospitals, hospitalsLoading, deleteHospital, people } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hospitalToDelete, setHospitalToDelete] = useState<Hospital | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter hospitals based on search term
  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate assigned count for each hospital
  const hospitalsWithStats = filteredHospitals.map(hospital => {
    const assignedCount = people.filter(person => person.currentHospitalId === hospital.id).length;
    const percentage = hospital.allocation > 0 ? (assignedCount / hospital.allocation) * 100 : 0;
    return {
      ...hospital,
      assignedCount,
      percentage,
      status: percentage >= 100 ? 'full' : percentage >= 80 ? 'good' : percentage >= 50 ? 'warning' : 'critical'
    };
  });

  const handleEdit = (hospital: Hospital) => {
    setSelectedHospital(hospital);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedHospital(undefined);
    setShowForm(true);
  };

  const handleDelete = (hospital: Hospital) => {
    setHospitalToDelete(hospital);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!hospitalToDelete) return;

    try {
      setDeleteLoading(true);
      await deleteHospital(hospitalToDelete.id);
      setShowDeleteDialog(false);
      setHospitalToDelete(null);
    } catch (error) {
      console.error('Error deleting hospital:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string, assignedCount: number, allocation: number) => {
    const variant = 
      status === 'full' ? 'default' :
      status === 'good' ? 'secondary' :
      status === 'warning' ? 'destructive' :
      'destructive';

    return (
      <Badge variant={variant} className="text-xs">
        {assignedCount}/{allocation}
      </Badge>
    );
  };

  const formatHospitalType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Hospital Management</h2>
          <p className="text-sm text-gray-600">Manage hospitals and their allocations</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Hospital
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search hospitals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building2 className="h-5 w-5 mr-2" />
            Hospitals ({filteredHospitals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hospitalsLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hospital Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Staffing</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hospitalsWithStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="text-gray-500">
                          {searchTerm ? 'No hospitals match your search' : 'No hospitals found'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    hospitalsWithStats.map((hospital) => (
                      <TableRow key={hospital.id}>
                        <TableCell className="font-medium">
                          {hospital.name}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{hospital.district}</div>
                            <div className="text-gray-500">{hospital.province}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatHospitalType(hospital.type)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(hospital.status, hospital.assignedCount, hospital.allocation)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <div className={`w-2 h-2 rounded-full ${
                              hospital.status === 'full' ? 'bg-green-500' :
                              hospital.status === 'good' ? 'bg-green-400' :
                              hospital.status === 'warning' ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} />
                            <span className="text-sm">
                              {hospital.status === 'full' ? 'Fully Staffed' :
                               hospital.status === 'good' ? 'Well Staffed' :
                               hospital.status === 'warning' ? 'Understaffed' :
                               'Critical'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(hospital)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(hospital)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hospital Form */}
      <HospitalForm
        hospital={selectedHospital}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedHospital(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Hospital</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{hospitalToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}