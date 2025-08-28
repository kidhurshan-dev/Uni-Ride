import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Search, 
  Plus, 
  MapPin, 
  Clock, 
  Star, 
  Car, 
  Bike, 
  ChevronRight,
  Filter,
  AlertCircle
} from 'lucide-react';
import { rides } from '../../utils/api';
import { toast } from 'sonner';
import { RideDetailModal } from '../modals/RideDetailModal';
import { PostRequestModal } from '../modals/PostRequestModal';

interface SearchScreenProps {
  user: any;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allRides, setAllRides] = useState([]);
  const [filteredRides, setFilteredRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDetail, setShowRideDetail] = useState(false);
  const [showPostRequest, setShowPostRequest] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'offers', 'requests'

  useEffect(() => {
    loadRides();
  }, []);

  useEffect(() => {
    filterRides();
  }, [searchQuery, allRides, filterType]);

  const loadRides = async () => {
    try {
      setLoading(true);
      const [availableResponse, userResponse] = await Promise.all([
        rides.getAvailableRides(),
        rides.getMyRides()
      ]);
      
      // Combine all rides and sort by priority
      const combined = [
        ...(userResponse.rides || []),
        ...(availableResponse.rides || [])
      ];
      
      setAllRides(combined);
    } catch (error) {
      console.error('Error loading rides:', error);
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const filterRides = () => {
    let filtered = allRides;

    // Filter by type based on user permissions
    if (user.userType === 'passenger') {
      // Passengers only see ride offers
      filtered = filtered.filter(ride => ride.type === 'offer');
    } else {
      // Hybrid users can see both, but can filter
      if (filterType === 'offers') {
        filtered = filtered.filter(ride => ride.type === 'offer');
      } else if (filterType === 'requests') {
        filtered = filtered.filter(ride => ride.type === 'request');
      }
    }

    // Apply search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ride => 
        (ride.driverName || ride.passengerName || '').toLowerCase().includes(query) ||
        ride.from.toLowerCase().includes(query) ||
        ride.to.toLowerCase().includes(query) ||
        (ride.notes || '').toLowerCase().includes(query)
      );
    }

    setFilteredRides(filtered);
  };

  const handleRideClick = (ride) => {
    setSelectedRide(ride);
    setShowRideDetail(true);
  };

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      case 'bicycle': return <Bike className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  const RideCard = ({ ride }) => (
    <Card 
      className="mb-4 cursor-pointer transition-all hover:shadow-md"
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
            <Badge variant={ride.type === 'offer' ? 'default' : 'secondary'} className="text-xs">
              {ride.type === 'offer' ? 'Offering' : 'Requesting'}
            </Badge>
            {ride.isUrgent && (
              <Badge variant="destructive" className="text-xs">Urgent</Badge>
            )}
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
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Search Rides</h1>
        <Button
          onClick={() => setShowPostRequest(true)}
          size="sm"
          className="flex items-center space-x-1"
        >
          <Plus className="h-4 w-4" />
          <span>Request</span>
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by name, location, or notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Buttons - Only for Hybrid Users */}
      {user.userType === 'hybrid' && (
        <div className="flex space-x-2">
          <Button
            variant={filterType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('all')}
          >
            All Rides
          </Button>
          <Button
            variant={filterType === 'offers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('offers')}
          >
            Ride Offers
          </Button>
          <Button
            variant={filterType === 'requests' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType('requests')}
          >
            Ride Requests
          </Button>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} found
        </p>
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchQuery('')}
          >
            Clear search
          </Button>
        )}
      </div>

      {/* Rides List */}
      <div className="space-y-3">
        {filteredRides.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No matching rides found' : 'No rides available'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Try adjusting your search terms'
                  : 'Check back later for new rides'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRides.map(ride => (
            <RideCard key={ride.id} ride={ride} />
          ))
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

      {/* Post Request Modal */}
      {showPostRequest && (
        <PostRequestModal
          user={user}
          onClose={() => setShowPostRequest(false)}
          onSuccess={() => {
            setShowPostRequest(false);
            loadRides();
          }}
        />
      )}
    </div>
  );
};