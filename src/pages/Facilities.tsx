import React, { useState } from 'react';
import { Search, FilterIcon, Plus } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FacilityCard from '@/components/facilities/FacilityCard';
import { useFacilityData } from '@/hooks/useFacilityData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Facilities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: facilities, isLoading, error } = useFacilityData();
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const isAdmin = user?.role === 'org_admin';

  // Filter facilities based on search query and active tab
  const filteredFacilities = facilities?.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && facility.type === activeTab;
  });

  const handleAddFacility = () => {
    navigate('/facilities/new');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Facilities</h2>
            <p className="text-muted-foreground">
              Browse and book laboratory facilities
            </p>
          </div>
          {isAdmin && (
            <Button className="sm:w-auto" onClick={handleAddFacility}>
              <Plus className="mr-2 h-4 w-4" />
              Add Facility
            </Button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search facilities..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1">
            <FilterIcon className="h-3.5 w-3.5" />
            <span>Filter</span>
          </Button>
        </div>

        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Facilities</TabsTrigger>
            <TabsTrigger value="lab">Laboratories</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="classroom">Classrooms</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {isLoading ? (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Loading facilities...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-destructive">Error loading facilities</p>
              </div>
            ) : filteredFacilities && filteredFacilities.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No facilities found</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="lab" className="mt-0">
            {/* Content will be filtered automatically based on the tab */}
            {isLoading ? (
              <p className="text-muted-foreground text-center py-10">Loading laboratories...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities?.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="equipment" className="mt-0">
            {/* Equipment tab content */}
            {isLoading ? (
              <p className="text-muted-foreground text-center py-10">Loading equipment...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities?.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="classroom" className="mt-0">
            {/* Classroom tab content */}
            {isLoading ? (
              <p className="text-muted-foreground text-center py-10">Loading classrooms...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFacilities?.map((facility) => (
                  <FacilityCard key={facility.id} facility={facility} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Facilities;
