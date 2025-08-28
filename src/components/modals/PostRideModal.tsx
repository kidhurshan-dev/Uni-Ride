import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent } from '../ui/card';
import { MapPin, Clock, Car, Bike, Users, Navigation } from 'lucide-react';
import { rides } from '../../utils/api';
import { toast } from 'sonner';

interface PostRideModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostRideModal: React.FC<PostRideModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureTime: '',
    availableSeats: 1,
    vehicle: 'bicycle',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  // Common locations for quick selection
  const commonLocations = [
    'Main Gate',
    'Engineering Faculty',
    'Technology Faculty',
    'Agriculture Faculty',
    'Library',
    'Hostel Complex',
    'Canteen',
    'Sports Complex',
    'Medical Center',
    'Admin Building'
  ];

  // Quick time options
  const quickTimes = [
    { label: 'Now', value: 'now' },
    { label: 'In 5 minutes', value: '5min' },
    { label: 'In 10 minutes', value: '10min' },
    { label: 'In 15 minutes', value: '15min' },
    { label: 'In 30 minutes', value: '30min' },
    { label: 'In 1 hour', value: '1hr' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to) {
      toast.error('Please select both pickup and destination locations');
      return;
    }

    if (formData.from === formData.to) {
      toast.error('Pickup and destination cannot be the same');
      return;
    }

    try {
      setLoading(true);
      await rides.postOffer(formData);
      toast.success('Ride offer posted successfully!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to post ride: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLocation = (location: string, field: 'from' | 'to') => {
    setFormData(prev => ({ ...prev, [field]: location }));
  };

  const handleQuickTime = (timeValue: string) => {
    let timeString = '';
    const now = new Date();
    
    switch (timeValue) {
      case 'now':
        timeString = 'Now';
        break;
      case '5min':
        timeString = 'in 5 minutes';
        break;
      case '10min':
        timeString = 'in 10 minutes';
        break;
      case '15min':
        timeString = 'in 15 minutes';
        break;
      case '30min':
        timeString = 'in 30 minutes';
        break;
      case '1hr':
        timeString = 'in 1 hour';
        break;
      default:
        timeString = timeValue;
    }
    
    setFormData(prev => ({ ...prev, departureTime: timeString }));
  };

  const getVehicleIcon = (vehicle: string) => {
    switch (vehicle) {
      case 'car': return <Car className="h-4 w-4" />;
      case 'bike': return <Bike className="h-4 w-4" />;
      case 'bicycle': return <Bike className="h-4 w-4" />;
      default: return <Car className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Car className="h-5 w-5 text-indigo-600" />
            <span>Post Ride Offer</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Location */}
          <div className="space-y-2">
            <Label htmlFor="from">Pickup Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="from"
                placeholder="Where are you starting from?"
                value={formData.from}
                onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {commonLocations.slice(0, 6).map(location => (
                <Button
                  key={location}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickLocation(location, 'from')}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* To Location */}
          <div className="space-y-2">
            <Label htmlFor="to">Destination</Label>
            <div className="relative">
              <Navigation className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="to"
                placeholder="Where are you going?"
                value={formData.to}
                onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {commonLocations.slice(6).map(location => (
                <Button
                  key={location}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickLocation(location, 'to')}
                >
                  {location}
                </Button>
              ))}
            </div>
          </div>

          {/* Departure Time */}
          <div className="space-y-2">
            <Label htmlFor="departureTime">Departure Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="departureTime"
                placeholder="When are you leaving?"
                value={formData.departureTime}
                onChange={(e) => setFormData(prev => ({ ...prev, departureTime: e.target.value }))}
                className="pl-10"
                required
              />
            </div>
            <div className="flex flex-wrap gap-1">
              {quickTimes.map(time => (
                <Button
                  key={time.value}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleQuickTime(time.value)}
                >
                  {time.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Vehicle and Seats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Select value={formData.vehicle} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bicycle">
                    <div className="flex items-center space-x-2">
                      <Bike className="h-4 w-4" />
                      <span>Bicycle</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="bike">
                    <div className="flex items-center space-x-2">
                      <Bike className="h-4 w-4" />
                      <span>Motorbike</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="car">
                    <div className="flex items-center space-x-2">
                      <Car className="h-4 w-4" />
                      <span>Car</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">Available Seats</Label>
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="seats"
                  type="number"
                  min="1"
                  max="4"
                  value={formData.availableSeats}
                  onChange={(e) => setFormData(prev => ({ ...prev, availableSeats: parseInt(e.target.value) || 1 }))}
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information for passengers..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Preview Card */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-2">Preview:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{formData.from || 'Pickup location'} → {formData.to || 'Destination'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{formData.departureTime || 'Departure time'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getVehicleIcon(formData.vehicle)}
                  <span>{formData.availableSeats} seat{formData.availableSeats > 1 ? 's' : ''} available</span>
                </div>
                {formData.notes && (
                  <p className="text-gray-600 italic">"{formData.notes}"</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Posting...' : 'Post Ride'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};