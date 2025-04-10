
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { MapPin, CalendarIcon } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useFacilityData } from '@/hooks/useFacilityData';
import { useAuth } from '@/context/AuthContext';
import FacilityStatusBadge from '@/components/facilities/FacilityStatusBadge';
import FacilityDetailsTabs from '@/components/facilities/FacilityDetailsTabs';
import FacilityQuickBooking from '@/components/facilities/FacilityQuickBooking';
import FacilityBookingDialog from '@/components/facilities/FacilityBookingDialog';

const FacilityDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { data: facilities, isLoading } = useFacilityData();
  const [facility, setFacility] = useState<any>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  // Check if the URL includes the book parameter and open booking dialog if it does
  useEffect(() => {
    console.log("Checking URL for booking parameter:", location.search);
    const shouldOpenBookingDialog = new URLSearchParams(location.search).get('book') === 'true';
    if (shouldOpenBookingDialog) {
      console.log("Opening booking dialog from URL parameter");
      setIsBookingDialogOpen(true);
      // Clean up the URL without triggering a navigation
      const newUrl = location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [location]);

  // Find the facility with the matching id
  useEffect(() => {
    if (facilities && id) {
      console.log("Looking for facility with ID:", id);
      const foundFacility = facilities.find(facility => facility.id === id);
      if (foundFacility) {
        console.log("Found facility:", foundFacility.name);
        setFacility(foundFacility);
      } else {
        console.log("Facility not found in loaded facilities data");
      }
    }
  }, [facilities, id]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <p>Loading facility details...</p>
        </div>
      </MainLayout>
    );
  }

  if (!facility) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-screen">
          <h2 className="text-2xl font-bold mb-2">Facility Not Found</h2>
          <p className="text-muted-foreground mb-4">The facility you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/facilities')}>Return to Facilities</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{facility.name}</h2>
            <div className="flex items-center text-muted-foreground mt-1">
              <MapPin className="mr-1.5 h-4 w-4" />
              <span>{facility.location}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <FacilityStatusBadge status={facility.status} />
            {facility.status === 'available' && (
              <Button onClick={() => setIsBookingDialogOpen(true)}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Facility
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{facility.description}</p>
              </CardContent>
            </Card>

            <FacilityDetailsTabs facility={facility} />
          </div>

          <div>
            <FacilityQuickBooking 
              facility={facility} 
              onBookNow={() => setIsBookingDialogOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <FacilityBookingDialog
        isOpen={isBookingDialogOpen}
        onOpenChange={setIsBookingDialogOpen}
        facilityId={id || ''}
        facilityName={facility.name}
        capacityLimit={facility.capacity}
      />
    </MainLayout>
  );
};

export default FacilityDetails;
