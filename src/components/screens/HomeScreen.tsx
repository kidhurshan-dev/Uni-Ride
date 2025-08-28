import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { 
  MapPin, 
  Clock, 
  Star, 
  Users, 
  Car, 
  Bike, 
  Trophy,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import { rides } from '../../utils/api';
import { toast } from 'sonner';
import { RideDetailModal } from '../modals/RideDetailModal';
import { MiniLeaderboard } from '../components/MiniLeaderboard';

interface HomeScreenProps {
  user: any;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ user }) => {
  const [availableRides, setAvailableRides] = useState([]);
  const [userRides, setUserRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDetail, setShowRideDetail] = useState(false);

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const [availableResponse, userResponse] = await Promise.all([
        rides.getAvailableRides(),
        rides.getMyRides()
      ]);
      
      setAvailableRides(availableResponse.rides || []);
      setUserRides(userResponse.rides || []);
    } catch (error) {
      console.error('Error loading rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleRideClick = (ride) => {
    setSelectedRide(ride);
    setShowRideDetail(true);
  };

  const handleSwipeAction = async (rideId, action) => {
    try {
      if (action === 'accept') {
        // Handle passenger acceptance
        await rides.acceptPassenger(rideId, user.id);
        toast.success('Passenger accepted!');
      } else {
        // Handle rejection
        await rides.rejectPassenger(rideId, user.id);
        toast.success('Passenger rejected');
      }
      loadRides(); // Refresh rides
    } catch (error) {
      toast.error('Action failed: ' + error.message);
    }
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      case 'bicycle': return <Bike className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const getPriorityBadge = (ride) => {
    if (ride.driverBatch === user.batch || ride.passengerBatch === user.batch) {
      return <Badge variant="secondary" className="text-xs">Same Batch</Badge>;
    }
    if (ride.isUrgent) {
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    }
    if (ride.driverRating >= 4.5) {
      return <Badge variant="outline" className="text-xs">⭐ Top Rated</Badge>;
    }
    return null;
  };

  const RideCard = ({ ride, isUserRide = false }) => (
    <Card 
      className={`mb-4 cursor-pointer transition-all hover:shadow-md ${
        ride.status === 'pending' ? 'border-orange-200 bg-orange-50' : ''
      } ${ride.status === 'accepted' ? 'border-green-200 bg-green-50' : ''}`}
      onClick={() => handleRideClick(ride)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {(ride.driverName || ride.passengerName || 'U').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {ride.driverName || ride.passengerName}
              </p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  Batch {ride.driverBatch || ride.passengerBatch}
                </Badge>
                {ride.type === 'offer' && ride.driverRating > 0 && (
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs ml-1">{ride.driverRating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-1">
            {getPriorityBadge(ride)}
            <Badge variant={ride.type === 'offer' ? 'default' : 'secondary'} className="text-xs">
              {ride.type === 'offer' ? 'Offering Ride' : 'Requesting Ride'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{ride.from}</span>
            <ChevronRight className="h-3 w-3 text-gray-400" />
            <span className="font-medium">{ride.to}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{ride.departureTime}</span>
              </div>
              
              {ride.type === 'offer' && (
                <div className="flex items-center space-x-1">
                  {getVehicleIcon(ride.vehicle)}
                  <span>{ride.availableSeats} seats</span>
                </div>
              )}
            </div>

            {ride.isUrgent && (
              <div className="flex items-center space-x-1 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-xs font-medium">URGENT</span>
              </div>
            )}
          </div>

          {ride.notes && (
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
              "{ride.notes}"
            </p>
          )}

          {/* Show passenger status for user's own rides */}
          {isUserRide && ride.passengers && ride.passengers.length > 0 && (
            <div className="flex items-center space-x-2 pt-2 border-t">
              <Users className="h-4 w-4 text-gray-500" />
              <div className="flex -space-x-1">
                {ride.passengers.slice(0, 3).map((passenger, index) => (
                  <Avatar key={index} className="h-6 w-6 border-2 border-white">
                    <AvatarFallback className="text-xs">
                      {passenger.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              <span className="text-xs text-gray-600">
                {ride.passengers.length} passenger{ride.passengers.length > 1 ? 's' : ''} interested
              </span>
            </div>
          )}
        </div>

        {/* Swipe actions for user's own rides with pending passengers */}
        {isUserRide && ride.passengers && ride.passengers.some(p => p.status === 'pending') && (
          <div className="flex space-x-2 mt-3 pt-3 border-t">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
              onClick={(e) => {
                e.stopPropagation();
                handleSwipeAction(ride.id, 'accept');
              }}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              onClick={(e) => {
                e.stopPropagation();
                handleSwipeAction(ride.id, 'reject');
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
        <p className="text-gray-600">Find your next ride or share yours</p>
      </div>

      {/* Mini Leaderboard */}
      <MiniLeaderboard />

      {/* User's Own Posts Section */}
      {userRides.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Activities</h2>
            <Badge variant="outline">{userRides.length}</Badge>
          </div>
          <div className="space-y-3">
            {userRides.map(ride => (
              <RideCard key={ride.id} ride={ride} isUserRide={true} />
            ))}
          </div>
        </div>
      )}

      {/* Available Rides Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Available Rides</h2>
          <Badge variant="outline">{availableRides.length}</Badge>
        </div>
        
        {availableRides.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rides available</h3>
              <p className="text-gray-600">
                {user.userType === 'hybrid' 
                  ? 'Be the first to post a ride offer!' 
                  : 'Check back later for new ride offers'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {availableRides.map(ride => (
              <RideCard key={ride.id} ride={ride} />
            ))}
          </div>
        )}
      </div>

      {/* Ride Detail Modal */}
      {showRideDetail && selectedRide && (
        <RideDetailModal
          ride={selectedRide}
          user={user}
          onClose={() => {
            setShowRideDetail(false);
            setSelectedRide(null);
          }}
          onSuccess={() => {
            setShowRideDetail(false);
            setSelectedRide(null);
            loadRides();
          }}
        />
      )}
    </div>
  );
};