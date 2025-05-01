"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Mail, Phone, Bell, Shield, Key, CreditCard, Upload } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setIsEditing(false)
    }, 1000)
  }

  return (
        <main className="flex flex-col">
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
              <div className="flex items-center space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                      {isSaving ? (
                        <div className="flex items-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                          Saving...
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_250px]">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Manage your personal information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                        <div className="mb-4 md:mb-0">
                          <Avatar className="h-24 w-24">
                            <AvatarImage src="/placeholder-user.jpg" alt="John Doe" />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          {isEditing && (
                            <div className="mt-2">
                              <Button variant="outline" size="sm" className="w-full">
                                <Upload className="mr-2 h-4 w-4" />
                                Change Photo
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="grid flex-1 gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                              id="firstName"
                              defaultValue="John"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                              id="lastName"
                              defaultValue="Doe"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              defaultValue="john.doe@example.com"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted" : ""}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              defaultValue="(555) 123-4567"
                              readOnly={!isEditing}
                              className={!isEditing ? "bg-muted" : ""}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">Company (Optional)</Label>
                        <Input
                          id="company"
                          defaultValue="Acme Inc."
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>Manage your address information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          defaultValue="123 Main St"
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            defaultValue="New York"
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State/Province</Label>
                          <Input
                            id="state"
                            defaultValue="NY"
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zip">Postal Code</Label>
                          <Input
                            id="zip"
                            defaultValue="10001"
                            readOnly={!isEditing}
                            className={!isEditing ? "bg-muted" : ""}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          defaultValue="United States"
                          readOnly={!isEditing}
                          className={!isEditing ? "bg-muted" : ""}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Tabs defaultValue="notifications" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>
                  <TabsContent value="notifications" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Manage how you receive notifications</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4 text-orange-500" />
                            <Label htmlFor="shipment-updates" className="text-sm font-medium">
                              Shipment Updates
                            </Label>
                          </div>
                          <Switch id="shipment-updates" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-orange-500" />
                            <Label htmlFor="email-notifications" className="text-sm font-medium">
                              Email Notifications
                            </Label>
                          </div>
                          <Switch id="email-notifications" defaultChecked />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-orange-500" />
                            <Label htmlFor="sms-notifications" className="text-sm font-medium">
                              SMS Notifications
                            </Label>
                          </div>
                          <Switch id="sms-notifications" />
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-orange-500" />
                            <Label htmlFor="billing-updates" className="text-sm font-medium">
                              Billing Updates
                            </Label>
                          </div>
                          <Switch id="billing-updates" defaultChecked />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="security" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Security Settings</CardTitle>
                        <CardDescription>Manage your account security</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <Key className="h-4 w-4 text-orange-500" />
                            <div>
                              <Label className="text-sm font-medium">Change Password</Label>
                              <p className="text-xs text-muted-foreground">Update your password</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Change
                          </Button>
                        </div>
                        <div className="flex items-center justify-between space-x-2">
                          <div className="flex items-center space-x-2">
                            <Shield className="h-4 w-4 text-orange-500" />
                            <div>
                              <Label htmlFor="two-factor" className="text-sm font-medium">
                                Two-Factor Authentication
                              </Label>
                              <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                            </div>
                          </div>
                          <Switch id="two-factor" />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Member Since</span>
                      <span>January 15, 2023</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Type</span>
                      <span>Business</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Login</span>
                      <span>April 30, 2025</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full text-red-500 hover:bg-red-50 hover:text-red-500">
                      Delete Account
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>
        </main>
  )
}
