import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { 
  MapPin, 
  Clock, 
  Star, 
  Car, 
  Bike, 
  Users, 
  Phone, 
  MessageCircle,
  AlertCircle,
  Navigation,
  ChevronRight
} from 'lucide-react';
import { rides, messaging } from '../../utils/api';
import { toast } from 'sonner';

interface RideDetailModalProps {
  ride: any;
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const RideDetailModal: React.FC<RideDetailModalProps> = ({ 
  ride, 
  user, 
  onClose, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isOwnRide = ride.driverId === user.id || ride.passengerId === user.id;
  const isRideOffer = ride.type === 'offer';
  const canJoin = !isOwnRide && isRideOffer && user.userType !== 'hybrid';
  const canRespond = !isOwnRide && user.userType === 'hybrid';

  const getVehicleIcon = (vehicle) => {
    switch (vehicle) {
      case 'car': return <Car className="h-5 w-5" />;
      case 'bike': return <Bike className="h-5 w-5" />;
      case 'bicycle': return <Bike className="h-5 w-5" />;
      default: return <Car className="h-5 w-5" />;
    }
  };

  const handleJoinRide = async () => {
    if (!showConfirmation) {
      setShowConfirmation(true);
      return;
    }

    try {
      setLoading(true);
      await rides.joinRide(ride.id);
      toast.success('Join request sent successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to join ride: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppContact = () => {
    const riderName = ride.driverName || ride.passengerName;
    const message = messaging.getDefaultRideMessage(ride, !isRideOffer);
    
    // In a real app, you would have the phone number from the user profile
    // For demo purposes, we'll show a placeholder
    toast.info('WhatsApp integration would open here with pre-filled message');
    console.log('WhatsApp message:', message);
  };

  const getPriorityBadge = () => {
    if (ride.driverBatch === user.batch || ride.passengerBatch === user.batch) {
      return <Badge variant="secondary">Same Batch</Badge>;
    }
    if (ride.isUrgent) {
      return <Badge variant="destructive">Urgent</Badge>;
    }
    if (ride.driverRating >= 4.5) {
      return <Badge variant="outline">⭐ Top Rated</Badge>;
    }
    return null;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {isRideOffer ? (
              <Car className="h-5 w-5 text-indigo-600" />
            ) : (
              <Users className="h-5 w-5 text-green-600" />
            )}
            <span>
              {isRideOffer ? 'Ride Offer Details' : 'Ride Request Details'}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rider/Passenger Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-indigo-600 text-white font-bold">
                {(ride.driverName || ride.passengerName).charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{ride.driverName || ride.passengerName}</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Batch {ride.driverBatch || ride.passengerBatch}</Badge>
                {getPriorityBadge()}
              </div>
              {isRideOffer && ride.driverRating > 0 && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="text-sm font-medium">{ride.driverRating}</span>
                  <span className="text-sm text-gray-600">({ride.totalRides || 0} rides)</span>
                </div>
              )}
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Route Details</h4>
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-8 bg-gray-300"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-green-600" />
                    <span className="font-medium">{ride.from}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{ride.to}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{ride.departureTime}</span>
                </div>
                
                {isRideOffer && (
                  <div className="flex items-center space-x-1">
                    {getVehicleIcon(ride.vehicle)}
                    <span>{ride.availableSeats} seat{ride.availableSeats > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          {ride.notes && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Additional Information</h4>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">"{ride.notes}"</p>
              </div>
            </div>
          )}

          {/* Urgent Badge */}
          {ride.isUrgent && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Urgent Request</p>
                  <p className="text-sm text-red-600">This ride is needed urgently</p>
                </div>
              </div>
            </div>
          )}

          {/* Passengers (for ride offers) */}
          {isRideOffer && ride.passengers && ride.passengers.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Interested Passengers</h4>
              <div className="space-y-2">
                {ride.passengers.map((passenger, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {passenger.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{passenger.name}</span>
                    </div>
                    <Badge 
                      variant={passenger.status === 'accepted' ? 'default' : 
                               passenger.status === 'rejected' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {passenger.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {!showConfirmation ? (
              <>
                {/* Join/Respond Button */}
                {(canJoin || canRespond) && (
                  <Button 
                    onClick={handleJoinRide}
                    className="w-full"
                    size="lg"
                  >
                    {isRideOffer ? 'Join This Ride' : 'Offer This Ride'}
                  </Button>
                )}

                {/* WhatsApp Contact Button */}
                <Button 
                  variant="outline" 
                  onClick={handleWhatsAppContact}
                  className="w-full"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact via WhatsApp
                </Button>
              </>
            ) : (
              /* Confirmation Buttons */
              <div className="space-y-3">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    Are you sure you want to {isRideOffer ? 'join this ride' : 'offer this ride'}?
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    The {isRideOffer ? 'driver' : 'passenger'} will be notified of your interest.
                  </p>
                </div>
                
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleJoinRide}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Confirming...' : 'Yes, Confirm'}
                  </Button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button variant="ghost" onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};