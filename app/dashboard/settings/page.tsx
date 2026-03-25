import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Bell, Shield, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-blue-500">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black placeholder:text-black/40"
                    defaultValue="Jane Owner"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black placeholder:text-black/40"
                    defaultValue="jane@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Phone</label>
                <input
                  type="tel"
                  className="w-full rounded-lg border border-blue-100 bg-white px-4 py-3 text-black placeholder:text-black/40"
                  placeholder="Optional host phone number"
                />
              </div>
              <div className="pt-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-blue-500">Receive booking request emails</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-blue-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">SMS alerts</p>
                  <p className="text-sm text-blue-500">Get text alerts for urgent requests</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-blue-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-500">Control how your data is used and shared.</p>
              <Button variant="outline" className="w-full">
                Privacy Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Billing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-500">Manage your subscription and payment methods.</p>
              <Button variant="outline" className="w-full">
                Billing Portal
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-500 mb-4">Deleting your account will remove all your data permanently.</p>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}