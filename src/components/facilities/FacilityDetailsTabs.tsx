
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, Building, Check, AlertTriangle } from 'lucide-react';
import { Facility } from '@/types/facility';

interface FacilityDetailsTabsProps {
  facility: Facility;
}

const FacilityDetailsTabs: React.FC<FacilityDetailsTabsProps> = ({ facility }) => {
  return (
    <Tabs defaultValue="details">
      <TabsList>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details" className="space-y-4 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{facility.capacity} people</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{facility.openHours}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Department
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>{facility.department}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Check className="mr-2 h-4 w-4" />
                Available For
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {facility.availableFor.map((userType) => (
                  <Badge key={userType} variant="outline" className="capitalize">
                    {userType}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {facility.requiresApproval && (
          <div className="rounded-md bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Approval Required</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Bookings for this facility require approval from a supervisor.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="features" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Facility Features</CardTitle>
            <CardDescription>
              Equipment and amenities available in this facility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {facility.features.map((feature) => (
                <li key={feature} className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="availability" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Availability Calendar</CardTitle>
            <CardDescription>
              Check when this facility is available for booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 text-center">
              <p className="text-muted-foreground">
                Detailed availability calendar coming soon
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default FacilityDetailsTabs;
