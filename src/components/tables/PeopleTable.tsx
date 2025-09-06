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
import { Person } from '@/types';
import { PersonForm } from '@/components/forms/PersonForm';
import { Edit, Trash2, Search, Plus, Users, ChevronDown } from 'lucide-react';

export function PeopleTable() {
  const { 
    people, 
    peopleLoading, 
    deletePerson, 
    hospitals,
    loadMorePeople,
    hasMorePeople
  } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Person | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [personToDelete, setPersonToDelete] = useState<Person | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter people based on search term
  const filteredPeople = people.filter(person =>
    `${person.firstName} ${person.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.slmcNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.personalEmail && person.personalEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (person.pgimEmail && person.pgimEmail.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Add hospital names to people
  const peopleWithHospitals = filteredPeople.map(person => {
    const hospital = person.currentHospitalId 
      ? hospitals.find(h => h.id === person.currentHospitalId)
      : null;
    
    return {
      ...person,
      hospitalName: hospital?.name || 'Unassigned'
    };
  });

  const handleEdit = (person: Person) => {
    setSelectedPerson(person);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedPerson(undefined);
    setShowForm(true);
  };

  const handleDelete = (person: Person) => {
    setPersonToDelete(person);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!personToDelete) return;

    try {
      setDeleteLoading(true);
      await deletePerson(personToDelete.id);
      setShowDeleteDialog(false);
      setPersonToDelete(null);
    } catch (error) {
      console.error('Error deleting person:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      await loadMorePeople();
    } catch (error) {
      console.error('Error loading more people:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const getGradeBadge = (grade: string) => {
    const gradeConfig = {
      'MO': { label: 'MO', variant: 'secondary' as const },
      'REGISTRAR': { label: 'Registrar', variant: 'default' as const },
      'SENIOR_REGISTRAR': { label: 'Sr. Registrar', variant: 'default' as const },
      'CONSULTANT': { label: 'Consultant', variant: 'destructive' as const }
    };

    const config = gradeConfig[grade as keyof typeof gradeConfig] || 
      { label: grade, variant: 'secondary' as const };

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">People Management</h2>
          <p className="text-sm text-gray-600">Manage anaesthesiologists and their assignments</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search people..."
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
            <Users className="h-5 w-5 mr-2" />
            Anaesthesiologists ({filteredPeople.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {peopleLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>SLMC Number</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Current Hospital</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {peopleWithHospitals.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <div className="text-gray-500">
                            {searchTerm ? 'No people match your search' : 'No people found'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      peopleWithHospitals.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{person.firstName} {person.lastName}</div>
                              {(person.personalEmail || person.pgimEmail) && (
                                <div className="text-xs text-gray-500">
                                  {person.personalEmail || person.pgimEmail}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {person.slmcNumber}
                          </TableCell>
                          <TableCell>
                            {getGradeBadge(person.currentGrade)}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {person.hospitalName}
                              {person.currentHospitalId && (
                                <div className="text-xs text-gray-500">
                                  Assigned
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {person.phone && (
                              <div className="text-sm text-gray-600">
                                {person.phone}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(person)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(person)}
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

              {/* Load More Button */}
              {hasMorePeople && (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                  >
                    {loadingMore ? (
                      'Loading...'
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Load More
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Person Form */}
      <PersonForm
        person={selectedPerson}
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setSelectedPerson(undefined);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Person</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{personToDelete?.firstName} {personToDelete?.lastName}&quot;? 
              This action cannot be undone.
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