import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { 
  User, 
  Mail, 
  GraduationCap, 
  Building, 
  Star, 
  Car, 
  Users, 
  Settings, 
  Moon, 
  Sun, 
  Shield, 
  LogOut,
  Edit,
  Award,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileScreenProps {
  user: any;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ user, onSignOut }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);

  const handleSignOut = () => {
    onSignOut();
  };

  const handleUpgradeToHybrid = () => {
    toast.info('Upgrade feature coming soon! Contact admin for vehicle verification.');
  };

  const handleEditProfile = () => {
    toast.info('Profile editing feature coming soon!');
  };

  const getUserTypeInfo = () => {
    if (user.userType === 'hybrid') {
      return {
        title: 'Hybrid User',
        description: 'Can offer and request rides',
        icon: <Car className="h-5 w-5 text-indigo-600" />,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200'
      };
    } else {
      return {
        title: 'Passenger User',
        description: 'Can request rides only',
        icon: <Users className="h-5 w-5 text-green-600" />,
        color: 'bg-green-50 text-green-700 border-green-200'
      };
    }
  };

  const userTypeInfo = getUserTypeInfo();

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-indigo-600 text-white text-2xl font-bold">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              <Badge className={`${userTypeInfo.color} border`}>
                {userTypeInfo.icon}
                <span className="ml-1">{userTypeInfo.title}</span>
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={handleEditProfile}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="font-medium">{user.studentId}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Building className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Department</p>
                <p className="font-medium">{user.department}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Batch</p>
                <p className="font-medium">{user.batch}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-green-600">Verified</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Card - Only for Hybrid Users */}
      {user.userType === 'hybrid' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Your Stats</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">{user.totalRides || 0}</div>
                <p className="text-sm text-gray-600">Total Rides</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-2xl font-bold text-yellow-600">{user.rating || 0}</span>
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{user.points || 0}</div>
                <p className="text-sm text-gray-600">Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Card - Only for Passenger Users */}
      {user.userType === 'passenger' && (
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6 text-center">
            <Car className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Become a Hybrid User</h3>
            <p className="text-indigo-100 mb-4">
              Share rides with fellow students and earn points on the leaderboard!
            </p>
            <Button 
              variant="secondary" 
              className="bg-white text-indigo-600 hover:bg-indigo-50"
              onClick={handleUpgradeToHybrid}
            >
              Upgrade Account
            </Button>
            <p className="text-xs text-indigo-200 mt-2">
              Requires vehicle verification (24-48 hours)
            </p>
          </CardContent>
        </Card>
      )}

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              <div>
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-gray-600">Toggle dark theme</p>
              </div>
            </div>
            <Switch
              id="dark-mode"
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="h-5 w-5" />
              <div>
                <Label htmlFor="notifications">Push Notifications</Label>
                <p className="text-sm text-gray-600">Ride updates and messages</p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MapPin className="h-5 w-5" />
              <div>
                <Label htmlFor="location">Location Sharing</Label>
                <p className="text-sm text-gray-600">Share location during rides</p>
              </div>
            </div>
            <Switch
              id="location"
              checked={locationSharing}
              onCheckedChange={setLocationSharing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <Shield className="h-4 w-4 mr-2" />
            Privacy & Security
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Phone className="h-4 w-4 mr-2" />
            Emergency Contacts
          </Button>
          
          <Button variant="outline" className="w-full justify-start">
            <Mail className="h-4 w-4 mr-2" />
            Change Password
          </Button>
          
          <Separator />
          
          <Button 
            variant="destructive" 
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="p-4 text-center text-sm text-gray-600">
          <p>Uni-Ride v1.0.0</p>
          <p>University of Jaffna - Faculty of Engineering</p>
          <p className="mt-2">
            <span className="text-indigo-600">Terms of Service</span> • <span className="text-indigo-600">Privacy Policy</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};