import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Card, CardContent } from '../ui/card';
import { MapPin, Clock, AlertCircle, Navigation, Users } from 'lucide-react';
import { rides } from '../../utils/api';
import { toast } from 'sonner';

interface PostRequestModalProps {
  user: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const PostRequestModal: React.FC<PostRequestModalProps> = ({ user, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    departureTime: '',
    isUrgent: false,
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
    { label: 'ASAP', value: 'ASAP' },
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
      await rides.postRequest(formData);
      toast.success('Ride request posted successfully!');
      onSuccess();
    } catch (error) {
      if (error.message.includes('Daily request limit')) {
        toast.error('You have reached your daily limit of 2 ride requests');
      } else {
        toast.error('Failed to post request: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLocation = (location: string, field: 'from' | 'to') => {
    setFormData(prev => ({ ...prev, [field]: location }));
  };

  const handleQuickTime = (timeValue: string) => {
    let timeString = '';
    
    switch (timeValue) {
      case 'ASAP':
        timeString = 'ASAP';
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-green-600" />
            <span>Request a Ride</span>
          </DialogTitle>
        </DialogHeader>

        {/* Daily Limit Warning for Passengers */}
        {user.userType === 'passenger' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Daily Limit</p>
                <p className="text-yellow-700">Passengers can post up to 2 ride requests per day</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* From Location */}
          <div className="space-y-2">
            <Label htmlFor="from">Pickup Location</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="from"
                placeholder="Where do you need pickup?"
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
                placeholder="Where do you want to go?"
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
            <Label htmlFor="departureTime">When do you need to go?</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="departureTime"
                placeholder="When do you need the ride?"
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

          {/* Urgent Toggle */}
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <Label htmlFor="urgent" className="text-red-800">Mark as Urgent</Label>
                <p className="text-xs text-red-600">For emergency situations only</p>
              </div>
            </div>
            <Switch
              id="urgent"
              checked={formData.isUrgent}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isUrgent: checked }))}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Additional Details (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any specific requirements or additional information..."
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
                {formData.isUrgent && (
                  <div className="flex items-center space-x-2 text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">URGENT REQUEST</span>
                  </div>
                )}
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
              {loading ? 'Posting...' : 'Post Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};