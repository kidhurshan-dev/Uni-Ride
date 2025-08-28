import React, { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { AuthScreen } from './components/screens/AuthScreen';
import { MainApp } from './components/screens/MainApp';
import { DemoSetup } from './components/DemoSetup';
import { auth } from './utils/api';
import { toast } from 'sonner';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDemo, setShowDemo] = useState(false);
  const [demoCredentials, setDemoCredentials] = useState({ email: '', password: '' });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const session = await auth.getSession();
      if (session?.user) {
        const profile = await auth.getProfile();
        setUser(profile.user);
      }
    } catch (error) {
      console.log('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (email, password) => {
    try {
      setLoading(true);
      const { user: authUser } = await auth.signIn(email, password);
      
      if (authUser) {
        const profile = await auth.getProfile();
        setUser(profile.user);
        toast.success('Welcome to Uni-Ride!');
      }
    } catch (error) {
      toast.error('Sign in failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (userData) => {
    try {
      setLoading(true);
      await auth.signUp(userData);
      toast.success('Account created successfully! Please sign in.');
    } catch (error) {
      toast.error('Sign up failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Sign out failed: ' + error.message);
    }
  };

  const handleDemoSelect = (email, password) => {
    setDemoCredentials({ email, password });
    setShowDemo(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Uni-Ride...</p>
        </div>
      </div>
    );
  }

  if (showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Uni-Ride Demo Setup</h1>
            <p className="text-gray-600">Set up demo users to test the ride-sharing application</p>
            <button
              onClick={() => setShowDemo(false)}
              className="mt-4 text-indigo-600 hover:text-indigo-800 underline"
            >
              ← Back to Sign In
            </button>
          </div>
          <DemoSetup onSelectUser={handleDemoSelect} />
        </div>
        <Toaster />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthScreen 
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onShowDemo={() => setShowDemo(true)}
          demoCredentials={demoCredentials}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <MainApp user={user} onSignOut={handleSignOut} />
      <Toaster />
    </>
  );
}