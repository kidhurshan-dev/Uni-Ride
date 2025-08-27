import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { User, Lock, Mail, GraduationCap, Building } from 'lucide-react';
import { createDemoUsers, demoUsers, demoSignIn } from '../utils/demo-setup';
import { health } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface DemoSetupProps {
  onSelectUser: (email: string, password: string) => void;
}

export const DemoSetup: React.FC<DemoSetupProps> = ({ onSelectUser }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [createdUsers, setCreatedUsers] = useState<string[]>([]);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check server status on component mount
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await health.check();
        setServerStatus('online');
      } catch (error) {
        console.error('Server status check failed:', error);
        setServerStatus('offline');
      }
    };

    checkServerStatus();
  }, []);

  const handleCreateDemoUsers = async () => {
    setIsCreating(true);
    try {
      // First check if the server is responding
      toast.info('Checking server connection...');
      console.log('🏥 Checking server health...');
      
      try {
        const healthCheck = await health.check();
        console.log('✅ Server is healthy:', healthCheck);
        toast.success('✅ Server connected successfully!');
      } catch (healthError) {
        console.error('❌ Server health check failed:', healthError);
        toast.error('❌ Cannot connect to server. Please try again in a moment.');
        setIsCreating(false);
        return;
      }

      toast.info('Creating demo users... This may take a moment.');
      console.log('👥 Starting demo user creation...');
      const results = await createDemoUsers();
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      const successEmails = results.filter(r => r.success).map(r => r.user);
      
      console.log('Demo user creation results:', results);
      
      if (successCount > 0) {
        toast.success(`✅ Created ${successCount} demo users successfully!`);
        setSetupComplete(true);
        setCreatedUsers(successEmails);
      }
      
      if (failCount > 0) {
        const failedResults = results.filter(r => !r.success);
        const alreadyExistCount = failedResults.filter(r => 
          r.error?.includes('already') || r.error?.includes('exist')
        ).length;
        
        if (alreadyExistCount === failCount) {
          toast.success('✅ Demo users already exist and ready to use!');
          setSetupComplete(true);
          setCreatedUsers(demoUsers.map(u => u.email));
        } else {
          toast.warning(`⚠️ ${failCount} users failed to create. ${successCount} created successfully.`);
          if (successCount > 0) {
            setSetupComplete(true);
            setCreatedUsers(successEmails);
          }
        }
      }
    } catch (error: any) {
      console.error('Demo user creation error:', error);
      toast.error('Failed to create demo users: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuickSignIn = async (email: string) => {
    if (!setupComplete && createdUsers.length === 0) {
      toast.error('Please create demo users first!');
      return;
    }

    try {
      const user = demoUsers.find(u => u.email === email);
      if (user) {
        onSelectUser(user.email, user.password);
        toast.info(`Selected ${user.name} - click "Sign In" on the previous screen`);
      }
    } catch (error: any) {
      toast.error('Failed to select user: ' + error.message);
    }
  };

  const hybridUsers = demoUsers.filter(u => u.userType === 'hybrid');
  const passengerUsers = demoUsers.filter(u => u.userType === 'passenger');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <GraduationCap className="w-5 h-5" />
            <span>Demo Setup - Uni-Ride</span>
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            Set up demo users and data to test the ride-sharing application
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Server Status Indicator */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'online' ? 'bg-green-500' : 
                serverStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
              }`} />
              <span className="text-sm font-medium">
                Backend Server: {
                  serverStatus === 'online' ? 'Online' : 
                  serverStatus === 'offline' ? 'Offline' : 'Checking...'
                }
              </span>
            </div>
          </div>

          <Button 
            onClick={handleCreateDemoUsers} 
            disabled={isCreating || serverStatus === 'offline'}
            className="w-full"
            variant={setupComplete ? "outline" : "default"}
          >
            {isCreating ? 'Creating Demo Users...' : 
             serverStatus === 'offline' ? 'Server Offline - Cannot Create Users' :
             setupComplete ? 'Recreate Demo Users' : '🚀 Create Demo Users First'}
          </Button>
          
          {setupComplete && (
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 font-medium">✅ Demo users ready!</p>
              <p className="text-green-600 text-sm">Click "Quick Sign In" below or manually enter credentials</p>
            </div>
          )}

          {!setupComplete && serverStatus === 'offline' && (
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-red-800 font-medium">🔌 Server Connection Issue</p>
              <p className="text-red-600 text-sm">The backend server is not responding. Please wait a moment and try refreshing the page.</p>
            </div>
          )}

          {!setupComplete && serverStatus === 'online' && (
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">⚠️ Create demo users first</p>
              <p className="text-blue-600 text-sm">You need to create demo users before you can sign in with them</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-5 h-5" />
            <h3 className="font-medium">Hybrid Users (Can offer & request rides)</h3>
            <Badge variant="outline">{hybridUsers.length} users</Badge>
          </div>
          
          <div className="grid gap-3">
            {hybridUsers.map((user) => (
              <Card key={user.email} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>Batch {user.batch}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="w-3 h-3" />
                        <span>{user.department}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>Password: demo123</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => handleQuickSignIn(user.email)}
                    disabled={!setupComplete && createdUsers.length === 0}
                    variant={setupComplete || createdUsers.includes(user.email) ? "default" : "outline"}
                  >
                    {setupComplete || createdUsers.includes(user.email) ? "Quick Sign In" : "Create Users First"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <div className="flex items-center space-x-2 mb-3">
            <User className="w-5 h-5" />
            <h3 className="font-medium">Passenger Users (Request rides only)</h3>
            <Badge variant="outline">{passengerUsers.length} users</Badge>
          </div>
          
          <div className="grid gap-3">
            {passengerUsers.map((user) => (
              <Card key={user.email} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="font-medium">{user.name}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <GraduationCap className="w-3 h-3" />
                        <span>Batch {user.batch}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Building className="w-3 h-3" />
                        <span>{user.department}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                      <Lock className="w-3 h-3" />
                      <span>Password: demo123</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant={setupComplete || createdUsers.includes(user.email) ? "outline" : "secondary"}
                    onClick={() => handleQuickSignIn(user.email)}
                    disabled={!setupComplete && createdUsers.length === 0}
                  >
                    {setupComplete || createdUsers.includes(user.email) ? "Quick Sign In" : "Create Users First"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">🎯 Testing Tips:</p>
              <ul className="space-y-1 text-blue-800">
                <li>• Sign in as a Hybrid user to post ride offers</li>
                <li>• Sign in as a Passenger to request rides</li>
                <li>• Same batch users get priority in matching</li>
                <li>• All passwords are: demo123</li>
                <li>• Emergency features limited to 2 requests/day for passengers</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-green-900">🚀 Quick Demo Flow:</p>
              <ol className="space-y-1 text-green-800">
                <li><strong>1. Click "Create Demo Users" above</strong></li>
                <li>2. Use "Quick Sign In" for John Doe (Hybrid user)</li>
                <li>3. Post a ride offer using the + button</li>
                <li>4. Sign out and sign in as Emma Brown (Passenger)</li>
                <li>5. Join the ride you just posted</li>
              </ol>
              <div className="mt-3 p-2 bg-green-100 rounded border-l-4 border-green-400">
                <p className="text-xs text-green-700">
                  <strong>Important:</strong> You must create demo users first before signing in!
                </p>
              </div>
              {serverStatus === 'offline' && (
                <div className="mt-2 p-2 bg-red-100 rounded border-l-4 border-red-400">
                  <p className="text-xs text-red-700">
                    <strong>Server Issue:</strong> The backend is not responding. Try refreshing the page or wait a moment for the server to start up.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};