
import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Calendar, Download, FileDown, Filter, Printer, RefreshCw } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useReportsData } from '@/hooks/useReportsData';
import { toast } from '@/hooks/use-toast';

const Reports = () => {
  const [timeRange, setTimeRange] = useState<string>('month');
  const [department, setDepartment] = useState<string>('all');
  
  const { data: reportsData, isLoading, refetch } = useReportsData();

  const handleRefresh = () => {
    refetch();
    toast({
      title: "Reports refreshed",
      description: "Reports data has been updated with the latest information.",
    });
  };

  const handleExport = (format: string) => {
    if (!reportsData) {
      toast({
        title: "Export failed",
        description: "No data available to export",
        variant: "destructive",
      });
      return;
    }

    let content = '';
    let fileName = `lab-reports-${new Date().toISOString().split('T')[0]}`;
    let dataUrl: string;

    if (format === 'CSV') {
      // Create CSV content
      const headers = ['Category', 'Label', 'Value', 'Trend'];
      content = headers.join(',') + '\n';
      
      // Add usage summary data
      reportsData.usageSummary.forEach(item => {
        content += `Usage,${item.label},${item.value},${item.trend}\n`;
      });
      
      // Add booking summary data
      reportsData.bookingSummary.forEach(item => {
        content += `Bookings,${item.label},${item.value},${item.trend}\n`;
      });
      
      // Add inventory summary data
      reportsData.inventorySummary.forEach(item => {
        content += `Inventory,${item.label},${item.value},${item.trend}\n`;
      });
      
      dataUrl = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
      fileName += '.csv';
    } else if (format === 'JSON') {
      content = JSON.stringify(reportsData, null, 2);
      dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(content);
      fileName += '.json';
    } else if (format === 'Print') {
      window.print();
      return;
    } else {
      toast({
        title: "Export failed",
        description: `Export format '${format}' not supported`,
        variant: "destructive",
      });
      return;
    }

    // Create download link and trigger download
    const link = document.createElement('a');
    link.setAttribute('href', dataUrl);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export successful",
      description: `Reports exported as ${format} format`,
    });
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <p>Loading reports data...</p>
        </div>
      </MainLayout>
    );
  }

  if (!reportsData) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <p>Error loading reports data. Please try again later.</p>
          <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
            <p className="text-muted-foreground">
              Analytics and reports for laboratory usage and resources
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Select defaultValue="export">
              <SelectTrigger className="w-[130px] h-9">
                <SelectValue placeholder="Export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="export" disabled>Export as</SelectItem>
                <SelectItem value="pdf" onClick={() => handleExport('PDF')}>
                  <div className="flex items-center">
                    <FileDown className="h-4 w-4 mr-2" />
                    PDF
                  </div>
                </SelectItem>
                <SelectItem value="csv" onClick={() => handleExport('CSV')}>
                  <div className="flex items-center">
                    <FileDown className="h-4 w-4 mr-2" />
                    CSV
                  </div>
                </SelectItem>
                <SelectItem value="json" onClick={() => handleExport('JSON')}>
                  <div className="flex items-center">
                    <FileDown className="h-4 w-4 mr-2" />
                    JSON
                  </div>
                </SelectItem>
                <SelectItem value="print" onClick={() => handleExport('Print')}>
                  <div className="flex items-center">
                    <Printer className="h-4 w-4 mr-2" />
                    Print
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Time Period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger className="w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="chemistry">Chemistry</SelectItem>
                <SelectItem value="physics">Physics</SelectItem>
                <SelectItem value="biology">Biology</SelectItem>
                <SelectItem value="computerScience">Computer Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList>
            <TabsTrigger value="usage">Facility Usage</TabsTrigger>
            <TabsTrigger value="bookings">Booking Analytics</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Status</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportsData.usageSummary.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-2xl">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <span className={item.trend > 0 ? "text-green-500" : "text-red-500"}>
                        {item.trend > 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
                      </span>
                      <span className="ml-1">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Facility Usage by Type</CardTitle>
                  <CardDescription>Distribution of facility usage by type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportsData.usageByType}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        />
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Facility Usage Over Time</CardTitle>
                  <CardDescription>Monthly trend of facility utilization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={reportsData.usageOverTime}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="laboratories" stroke="#0284c7" />
                        <Line type="monotone" dataKey="equipment" stroke="#7c3aed" />
                        <Line type="monotone" dataKey="classrooms" stroke="#16a34a" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportsData.bookingSummary.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-2xl">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <span className={item.trend > 0 ? "text-green-500" : "text-red-500"}>
                        {item.trend > 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
                      </span>
                      <span className="ml-1">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Booking Status Distribution</CardTitle>
                <CardDescription>Current booking statuses across all facilities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsData.bookingsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportsData.inventorySummary.map((item, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardDescription>{item.label}</CardDescription>
                    <CardTitle className="text-2xl">{item.value}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground flex items-center">
                      <span className={item.trend > 0 ? "text-green-500" : "text-red-500"}>
                        {item.trend > 0 ? "↑" : "↓"} {Math.abs(item.trend)}%
                      </span>
                      <span className="ml-1">vs. previous period</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status by Category</CardTitle>
                <CardDescription>Stock levels across different inventory categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsData.inventoryByCategory} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="category" width={150} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="inStock" fill="#16a34a" stackId="a" name="In Stock" />
                      <Bar dataKey="lowStock" fill="#f59e0b" stackId="a" name="Low Stock" />
                      <Bar dataKey="outOfStock" fill="#dc2626" stackId="a" name="Out of Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Reports;
