
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { AlertTriangle, Bell, Lock, Moon, Palette, Shield, User } from 'lucide-react';

// Form schema for profile settings
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

// Form schema for notification settings
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(false),
  bookingReminders: z.boolean().default(true),
  maintenanceAlerts: z.boolean().default(true),
  systemUpdates: z.boolean().default(true),
});

// Form schema for appearance settings
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).default("system"),
  fontSize: z.enum(["sm", "md", "lg"]).default("md"),
});

// Form schema for security settings
const securityFormSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
});

const Settings = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Notifications form
  const notificationForm = useForm<z.infer<typeof notificationFormSchema>>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      bookingReminders: true,
      maintenanceAlerts: true,
      systemUpdates: true,
    },
  });

  // Appearance form
  const appearanceForm = useForm<z.infer<typeof appearanceFormSchema>>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      fontSize: "md",
    },
  });

  // Security form
  const securityForm = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      twoFactorEnabled: false,
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileFormSchema>) => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1000);

    console.log(data);
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationFormSchema>) => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    }, 1000);

    console.log(data);
  };

  const onAppearanceSubmit = (data: z.infer<typeof appearanceFormSchema>) => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Appearance settings updated",
        description: "Your display preferences have been saved.",
      });
    }, 1000);

    console.log(data);
  };

  const onSecuritySubmit = (data: z.infer<typeof securityFormSchema>) => {
    setIsUpdating(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Security settings updated",
        description: "Your security settings have been updated.",
      });
    }, 1000);

    console.log(data);
  };

  return (
    <MainLayout>
      <div className="container max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences.
            </p>
          </div>
          
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full md:w-fit grid-cols-4 md:grid-cols-none mb-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="hidden md:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="appearance" className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                <span className="hidden md:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden md:inline">Security</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Profile Settings */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                  <CardDescription>
                    Manage your personal information and how it appears on the platform.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <Avatar className="w-16 h-16 border">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="text-lg">
                          {user?.name?.substring(0, 2).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Profile Picture</h4>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Change Photo</Button>
                          <Button size="sm" variant="outline">Remove</Button>
                        </div>
                      </div>
                    </div>

                    <Separator />
                    
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your name" {...field} />
                              </FormControl>
                              <FormDescription>
                                This is your public display name.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Your email" {...field} readOnly/>
                              </FormControl>
                              <FormDescription>
                                Your email address is used for important notifications.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="pt-4">
                          <Button type="submit" disabled={isUpdating}>
                            {isUpdating ? "Saving..." : "Update Profile"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notification Settings */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Configure how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive email notifications about your bookings and account.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Push Notifications</FormLabel>
                              <FormDescription>
                                Receive push notifications on your device.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="bookingReminders"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Booking Reminders</FormLabel>
                              <FormDescription>
                                Receive reminders about upcoming bookings.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="maintenanceAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Maintenance Alerts</FormLabel>
                              <FormDescription>
                                Receive alerts about facility maintenance.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="systemUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">System Updates</FormLabel>
                              <FormDescription>
                                Receive notifications about system updates and new features.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="pt-4">
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? "Saving..." : "Save Notification Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Appearance Settings */}
            <TabsContent value="appearance">
              <Card>
                <CardHeader>
                  <CardTitle>Appearance Settings</CardTitle>
                  <CardDescription>
                    Customize how the application looks and feels.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...appearanceForm}>
                    <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-4">
                      <FormField
                        control={appearanceForm.control}
                        name="theme"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Theme</FormLabel>
                            <div className="relative w-full">
                              <FormControl>
                                <select
                                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                                  {...field}
                                >
                                  <option value="light">Light</option>
                                  <option value="dark">Dark</option>
                                  <option value="system">System</option>
                                </select>
                              </FormControl>
                            </div>
                            <FormDescription>
                              Select a theme for the application interface.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={appearanceForm.control}
                        name="fontSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Font Size</FormLabel>
                            <div className="relative w-full">
                              <FormControl>
                                <select
                                  className="w-full h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary"
                                  {...field}
                                >
                                  <option value="sm">Small</option>
                                  <option value="md">Medium</option>
                                  <option value="lg">Large</option>
                                </select>
                              </FormControl>
                            </div>
                            <FormDescription>
                              Adjust the text size for better readability.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="rounded-lg border p-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Moon className="h-5 w-5 text-muted-foreground" />
                          <h4 className="text-sm font-medium">Dark Mode Settings</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Configure when dark mode is activated.
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          <Button variant="outline" size="sm" className="justify-start">System</Button>
                          <Button variant="outline" size="sm" className="justify-start">Light</Button>
                          <Button variant="outline" size="sm" className="justify-start">Dark</Button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? "Saving..." : "Save Appearance Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Security Settings */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-4">
                      <div className="rounded-lg border p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium">Change Password</h4>
                            <p className="text-sm text-muted-foreground">
                              Update your password for better security.
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Change Password
                          </Button>
                        </div>
                      </div>
                      
                      <FormField
                        control={securityForm.control}
                        name="twoFactorEnabled"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                              <FormDescription>
                                Add an extra layer of security to your account.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20">
                        <div className="flex gap-2">
                          <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Account Recovery Options</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                              You have not set up any recovery options. We recommend adding a recovery email or phone number.
                            </p>
                            <Button variant="outline" size="sm" className="mt-2">
                              Set Up Recovery Options
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-lg border p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-muted-foreground" />
                            <h4 className="text-sm font-medium">Session Management</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Manage your active sessions and sign out from other devices.
                          </p>
                          <div className="bg-muted/50 p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="text-sm font-medium">Current Session</h5>
                                <p className="text-xs text-muted-foreground">
                                  This Device · Last active now
                                </p>
                              </div>
                              <span className="text-xs bg-primary/10 text-primary py-1 px-2 rounded-full">Active</span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            Sign Out All Other Devices
                          </Button>
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button type="submit" disabled={isUpdating}>
                          {isUpdating ? "Saving..." : "Save Security Settings"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
