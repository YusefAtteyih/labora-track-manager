
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Microscope, Plus, Search, Filter, CircleSlash, CheckCircle2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import LabCard from '@/components/labs/LabCard';
import { useLabsData } from '@/hooks/useLabsData';

const Labs = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Fetch all labs data
  const { data: labs, isLoading } = useLabsData();

  // Apply filtering based on search term and status
  const filteredLabs = labs?.filter(lab => {
    const matchesSearch = 
      lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lab.description && lab.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lab.location && lab.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || lab.status === statusFilter;
    
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
                {statusFilter === 'booked' && (
                  <span className="flex items-center">
                    <CircleSlash className="mr-1 h-3 w-3 text-amber-500" />
                    Booked
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
                <DropdownMenuRadioItem value="booked">
                  <CircleSlash className="mr-1 h-3 w-3 text-amber-500" />
                  Booked
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
            <p className="text-muted-foreground">Loading labs...</p>
          </div>
        ) : filteredLabs && filteredLabs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLabs.map((lab) => (
              <LabCard key={lab.id} lab={lab} />
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
