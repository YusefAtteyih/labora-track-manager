
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Plus, Search, Filter, CircleSlash, CheckCircle2 } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import { useEquipmentData } from '@/hooks/useEquipmentData';

const Equipment = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'org_admin';
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch all equipment data
  const { data: equipment, isLoading } = useEquipmentData();

  // Get unique categories for filtering
  const categories = React.useMemo(() => {
    if (!equipment) return [];
    const uniqueCategories = new Set(equipment.map(item => item.category).filter(Boolean));
    return Array.from(uniqueCategories);
  }, [equipment]);

  // Apply filtering based on search term and filters
  const filteredEquipment = equipment?.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center">
              <Wrench className="h-8 w-8 mr-2 text-blue-600" />
              Equipment
            </h1>
            <p className="text-muted-foreground">
              Browse and manage laboratory equipment
            </p>
          </div>

          {isAdmin && (
            <Link to="/equipment/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Equipment
              </Button>
            </Link>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search equipment..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:w-[180px] justify-start">
                <Filter className="mr-2 h-4 w-4" />
                {statusFilter === 'all' ? 'All Status' : `Status: ${statusFilter}`}
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
                  In Use
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="maintenance">
                  <CircleSlash className="mr-1 h-3 w-3 text-red-500" />
                  Maintenance
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="sm:w-[180px] justify-start">
                  <Filter className="mr-2 h-4 w-4" />
                  {categoryFilter === 'all' ? 'All Categories' : categoryFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                  <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                  {categories.map(category => (
                    <DropdownMenuRadioItem key={category} value={category}>
                      {category}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">Loading equipment...</p>
          </div>
        ) : filteredEquipment && filteredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEquipment.map((item) => (
              <EquipmentCard key={item.id} equipment={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted-foreground">No equipment found matching your criteria</p>
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

export default Equipment;
