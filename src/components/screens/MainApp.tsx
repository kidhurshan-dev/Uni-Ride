import React, { useState } from 'react';
import { Home, Search, Trophy, User, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { HomeScreen } from './HomeScreen';
import { SearchScreen } from './SearchScreen';
import { RidersScreen } from './RidersScreen';
import { ProfileScreen } from './ProfileScreen';
import { PostRideModal } from '../modals/PostRideModal';

interface MainAppProps {
  user: any;
  onSignOut: () => void;
}

export const MainApp: React.FC<MainAppProps> = ({ user, onSignOut }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showPostRide, setShowPostRide] = useState(false);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'riders', label: 'Riders', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'home':
        return <HomeScreen user={user} />;
      case 'search':
        return <SearchScreen user={user} />;
      case 'riders':
        return <RidersScreen user={user} />;
      case 'profile':
        return <ProfileScreen user={user} onSignOut={onSignOut} />;
      default:
        return <HomeScreen user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 pb-20 relative">
        {renderScreen()}
        
        {/* Floating Action Button - Only for Hybrid Users */}
        {user?.userType === 'hybrid' && (
          <Button
            onClick={() => setShowPostRide(true)}
            className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg z-40"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-indigo-600 bg-indigo-50' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : ''}`} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Post Ride Modal */}
      {showPostRide && (
        <PostRideModal
          user={user}
          onClose={() => setShowPostRide(false)}
          onSuccess={() => {
            setShowPostRide(false);
            // Refresh home screen
          }}
        />
      )}
    </div>
  );
};