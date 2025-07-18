import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, User, Save, Loader } from "lucide-react";
import { IUser } from "@/types";
import { updateUserById } from "@/lib/scripts/users.scripts";

const Settings = () => {
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);
  const [resetLoading, setResetLoading] = useState<boolean>(false);

  const { theme, toggleTheme } = useTheme();
  const { user, setUser } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setUpdateLoading(true);

      const updatingFields: Partial<IUser> = {
        ...user,
        role: "admin",
        name: profile.name,
        email: profile.email,
      };

      const response = await updateUserById(user._id as string, updatingFields);

      if (response.ok) {
        const { user } = response.data;
        setUser(user);
        toast({
          title: "Profile Updated",
          description:
            "Your profile information has been updated successfully.",
        });
      } else {
        toast({
          title: "Profile update failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Profile update failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUpdateLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (profile.currentPassword !== user?.password) {
      toast({
        title: "Error",
        description: "Incorrect current password",
        variant: "destructive",
      });
      return;
    }

    if (profile.newPassword !== profile.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setResetLoading(true);

      const updatingFileds: Partial<IUser> = {
        ...user,
        password: profile.confirmPassword,
      };

      const response = await updateUserById(user._id as string, updatingFileds);

      if (response.ok) {
        const { user } = response.data;
        setUser(user);
        toast({
          title: "Password Changed",
          description: "Your password has been updated successfully.",
        });
        setProfile((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      } else {
        toast({
          title: "Password reset failed",
          description: response.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span>Theme Settings</span>
            </CardTitle>
            <CardDescription>
              Choose your preferred theme for the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                {!updateLoading ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Profile
                  </>
                ) : (
                  <>
                    Updating...
                    <Loader className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Update your account password for security
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={profile.currentPassword}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={profile.newPassword}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={profile.confirmPassword}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <Button type="submit">
                {!resetLoading ? (
                  "Change Password"
                ) : (
                  <>
                    Changing...
                    <Loader className="h-4 w-4 mr-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Settings */}
        {/* <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>
              Advanced settings for the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive email alerts for new transactions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Auto-approve Small Transactions</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically process transactions under $100
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">
                      Auto-logout after 30 minutes of inactivity
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  );
};

export default Settings;
