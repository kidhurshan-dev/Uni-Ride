import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Trophy, Star, Crown, Medal, ChevronRight } from 'lucide-react';
import { leaderboard } from '../../utils/api';

export const MiniLeaderboard: React.FC = () => {
  const [topRiders, setTopRiders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopRiders();
  }, []);

  const loadTopRiders = async () => {
    try {
      const response = await leaderboard.get();
      setTopRiders((response.leaderboard || []).slice(0, 3));
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 3) return <Medal className="h-4 w-4 text-orange-600" />;
    return null;
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case 'Hero': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'Champion': return 'bg-gradient-to-r from-orange-400 to-red-500';
      case 'Expert': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'Speedster': return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topRiders.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No riders on leaderboard yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Top Riders</span>
          </div>
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-800">
            View All
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {topRiders.map((rider, index) => (
            <div
              key={rider.id}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-200' 
                  : 'bg-white/70 hover:bg-white'
              }`}
            >
              <div className="flex items-center justify-center w-6">
                {getRankIcon(rider.rank)}
              </div>

              <Avatar className={`h-10 w-10 ${index === 0 ? 'ring-2 ring-yellow-400' : ''}`}>
                <AvatarFallback className={`font-bold ${
                  index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : ''
                }`}>
                  {rider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${index === 0 ? 'text-yellow-800' : ''}`}>
                  {rider.name}
                </p>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-current" />
                    <span className="text-xs text-gray-600">{rider.rating}</span>
                  </div>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-600">{rider.totalRides} rides</span>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-bold ${index === 0 ? 'text-yellow-800' : 'text-gray-900'}`}>
                  {rider.points}
                </div>
                <p className="text-xs text-gray-600">pts</p>
              </div>

              <div className={`w-6 h-6 rounded-full ${getBadgeColor(rider.badge)} flex items-center justify-center`}>
                <Trophy className="h-3 w-3 text-white" />
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Message */}
        <div className="mt-4 p-3 bg-white/50 rounded-lg border border-indigo-100">
          <p className="text-xs text-center text-indigo-700">
            🚀 <strong>Share rides, earn points, climb the leaderboard!</strong>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};