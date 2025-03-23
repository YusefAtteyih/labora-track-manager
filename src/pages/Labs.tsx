import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Plus, Search, Filter, CircleSlash, CheckCircle2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Facility } from '@/types/facility';
import FacilityCard from '@/components/facilities/FacilityCard';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';

const Labs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all facility data
  const { data: facilities, isLoading } = useQuery({
    queryKey: ['facilities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name');
        
      if (error) {
        console.error('Error fetching facilities:', error);
        throw new Error(error.message);
      }
      
      // Transform the data to match our Facility type
      return data.map((item: any) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        description: item.description || '',
        location: item.location || '',
        capacity: item.capacity || 0,
        status: item.status,
        image: item.image || '',
        openHours: item.open_hours || '',
        department: item.department || '',
        features: item.features || [],
        availableFor: item.available_for || [],
        requiresApproval: item.requires_approval || false,
        facultyId: item.faculty_id
      })) as Facility[];
    }
  });

  // Apply filtering based on search term and status
  const filteredFacilities = facilities?.filter(facility => {
    const matchesSearch = 
      facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (facility.description && facility.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (facility.location && facility.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (facility.type && facility.type.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || facility.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Microscope className="h-8 w-8 mr-2 text-lab-600" />
              Labs
            </h1>
            <p className="text-muted-foreground">
              Browse and manage laboratory facilities
            </p>
          </div>

          {isAdmin && (
            <Link to="/labs/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Lab
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search labs..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:w-[180px] justify-start">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === 'all' && 'All Status'}
                {statusFilter === 'available' && (
                  <span className="flex items-center">
                    <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                    Available
                  </span>
                )}
                {statusFilter === 'occupied' && (
                  <span className="flex items-center">
                    <CircleSlash className="mr-1 h-3 w-3 text-amber-500" />
                    Occupied
                  </span>
                )}
                {statusFilter === 'maintenance' && (
                  <span className="flex items-center">
                    <CircleSlash className="mr-1 h-3 w-3 text-red-500" />
                    Maintenance
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                <DropdownMenuRadioItem value="all">All Status</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="available">
                  <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                  Available
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="occupied">
                  <CircleSlash className="mr-1 h-3 w-3 text-amber-500" />
                  Occupied
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="maintenance">
                  <CircleSlash className="mr-1 h-3 w-3 text-red-500" />
                  Maintenance
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading facilities...</p>
          </div>
        ) : filteredFacilities && filteredFacilities.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((facility) => (
              <FacilityCard key={facility.id} facility={facility} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No labs found matching your criteria</p>
            {searchTerm && (
              <Button 
                variant="link" 
                onClick={() => setSearchTerm('')}
                className="mt-2"
              >
                Clear search
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Labs;
