import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Car, Users, Shield, GraduationCap, Mail, Lock, User, Phone, Building } from 'lucide-react';

interface AuthScreenProps {
  onSignIn: (email: string, password: string) => void;
  onSignUp: (userData: any) => void;
  onShowDemo: () => void;
  demoCredentials: { email: string; password: string };
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onSignIn, 
  onSignUp, 
  onShowDemo,
  demoCredentials 
}) => {
  const [signInData, setSignInData] = useState({
    email: demoCredentials.email || '',
    password: demoCredentials.password || ''
  });

  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    name: '',
    studentId: '',
    batch: '',
    department: '',
    userType: 'passenger'
  });

  useEffect(() => {
    if (demoCredentials.email && demoCredentials.password) {
      setSignInData({
        email: demoCredentials.email,
        password: demoCredentials.password
      });
    }
  }, [demoCredentials]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(signInData.email, signInData.password);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    onSignUp(signUpData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-600 p-3 rounded-full">
              <Car className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Uni-Ride</h1>
          <p className="text-gray-600">University Ride Sharing Platform</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <GraduationCap className="w-3 h-3 mr-1" />
              Students Only
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Verified Safe
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome Back</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">University Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="your.name@eng.jfn.ac.lk"
                        value={signInData.email}
                        onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Enter your password"
                        value={signInData.password}
                        onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full">
                    Sign In
                  </Button>
                </form>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={onShowDemo}
                    className="w-full mt-2"
                  >
                    🎭 Try Demo Users
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">University Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your.name@eng.jfn.ac.lk"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Only @eng.jfn.ac.lk emails accepted</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a strong password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        value={signUpData.name}
                        onChange={(e) => setSignUpData({...signUpData, name: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-studentid">Student ID</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="signup-studentid"
                        type="text"
                        placeholder="ENG2021001"
                        value={signUpData.studentId}
                        onChange={(e) => setSignUpData({...signUpData, studentId: e.target.value})}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Batch Year</Label>
                      <Select value={signUpData.batch} onValueChange={(value) => setSignUpData({...signUpData, batch: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2020">2020</SelectItem>
                          <SelectItem value="2021">2021</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={signUpData.department} onValueChange={(value) => setSignUpData({...signUpData, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select dept" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Engineering">Engineering</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Agriculture">Agriculture</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>User Type</Label>
                    <Select value={signUpData.userType} onValueChange={(value) => setSignUpData({...signUpData, userType: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="passenger">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            Passenger Only
                          </div>
                        </SelectItem>
                        <SelectItem value="hybrid">
                          <div className="flex items-center">
                            <Car className="w-4 h-4 mr-2" />
                            Hybrid (Driver + Passenger)
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      {signUpData.userType === 'hybrid' 
                        ? 'Requires vehicle verification (24-48 hours)' 
                        : 'Immediate access after registration'
                      }
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-sm text-gray-500">
          <p>By signing up, you agree to our Terms of Service</p>
          <p>and Privacy Policy for university students</p>
        </div>
      </div>
    </div>
  );
};