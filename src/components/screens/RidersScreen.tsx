import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Trophy, 
  Star, 
  Car, 
  Users, 
  Award, 
  Crown, 
  Shield, 
  Zap,
  TrendingUp,
  Medal
} from 'lucide-react';
import { leaderboard } from '../../utils/api';
import { toast } from 'sonner';

interface RidersScreenProps {
  user: any;
}

export const RidersScreen: React.FC<RidersScreenProps> = ({ user }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await leaderboard.get();
      setLeaderboardData(response.leaderboard || []);
      
      // Find current user in leaderboard
      const currentUser = response.leaderboard?.find(rider => rider.id === user.id);
      setUserStats(currentUser);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Hero': return <Crown className="h-5 w-5 text-yellow-500" />;
      case 'Champion': return <Trophy className="h-5 w-5 text-orange-500" />;
      case 'Expert': return <Award className="h-5 w-5 text-purple-500" />;
      case 'Speedster': return <Zap className="h-5 w-5 text-blue-500" />;
      default: return <Shield className="h-5 w-5 text-gray-500" />;
    }
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

  const getRankIcon = (rank) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Medal className="h-6 w-6 text-orange-600" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getNextBadgeInfo = (currentBadge, totalRides, rating) => {
    if (currentBadge === 'Hero') return null;
    
    const badges = [
      { name: 'Beginner', rides: 0, rating: 0 },
      { name: 'Speedster', rides: 10, rating: 0 },
      { name: 'Expert', rides: 25, rating: 4.0 },
      { name: 'Champion', rides: 50, rating: 4.5 },
      { name: 'Hero', rides: 100, rating: 4.8 }
    ];
    
    const currentIndex = badges.findIndex(b => b.name === currentBadge);
    const nextBadge = badges[currentIndex + 1];
    
    if (!nextBadge) return null;
    
    const ridesNeeded = Math.max(0, nextBadge.rides - totalRides);
    const ratingNeeded = Math.max(0, nextBadge.rating - rating);
    
    return { ...nextBadge, ridesNeeded, ratingNeeded };
  };

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Riders Leaderboard</h1>
        <p className="text-gray-600">Compete, contribute, and climb the ranks!</p>
      </div>

      {/* User Stats Card */}
      {user.userType === 'hybrid' && (
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 border-2 border-white">
                  <AvatarFallback className="bg-white text-indigo-600 font-bold">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <p className="text-indigo-100">Batch {user.batch}</p>
                </div>
              </div>
              {userStats && (
                <div className="text-right">
                  <div className="flex items-center justify-end mb-1">
                    {getRankIcon(userStats.rank)}
                  </div>
                  <p className="text-indigo-100 text-sm">Rank #{userStats.rank}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{user.totalRides || 0}</div>
                <div className="text-indigo-100 text-sm">Total Rides</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.rating || 0}</div>
                <div className="text-indigo-100 text-sm">Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{user.points || 0}</div>
                <div className="text-indigo-100 text-sm">Points</div>
              </div>
            </div>

            {/* Current Badge */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className={`p-2 rounded-full ${getBadgeColor(userStats?.badge || 'Beginner')}`}>
                {getBadgeIcon(userStats?.badge || 'Beginner')}
              </div>
              <span className="font-bold">{userStats?.badge || 'Beginner'} Rider</span>
            </div>

            {/* Progress to Next Badge */}
            {(() => {
              const nextBadge = getNextBadgeInfo(
                userStats?.badge || 'Beginner', 
                user.totalRides || 0, 
                user.rating || 0
              );
              
              if (!nextBadge) return null;
              
              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress to {nextBadge.name}</span>
                    <span>{Math.max(0, nextBadge.rides - nextBadge.ridesNeeded)}/{nextBadge.rides} rides</span>
                  </div>
                  <Progress 
                    value={(Math.max(0, nextBadge.rides - nextBadge.ridesNeeded) / nextBadge.rides) * 100} 
                    className="bg-indigo-400"
                  />
                  {nextBadge.ridesNeeded > 0 && (
                    <p className="text-indigo-100 text-xs">
                      {nextBadge.ridesNeeded} more rides needed
                      {nextBadge.ratingNeeded > 0 && ` • ${nextBadge.ratingNeeded.toFixed(1)} rating needed`}
                    </p>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Passenger Encouragement Card */}
      {user.userType === 'passenger' && (
        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardContent className="p-6 text-center">
            <Car className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Become a Rider?</h3>
            <p className="text-green-100 mb-4">
              Join the leaderboard by becoming a hybrid user! Share rides, earn points, and help your fellow students.
            </p>
            <Button variant="secondary" className="bg-white text-green-600 hover:bg-green-50">
              Upgrade to Hybrid User
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span>Top Riders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-center space-x-4">
              {/* 2nd Place */}
              <div className="text-center">
                <div className="bg-gray-100 p-4 rounded-lg mb-2">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="bg-gray-400 text-white text-lg font-bold">
                      {leaderboardData[1]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Medal className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                  <p className="font-bold text-sm">{leaderboardData[1]?.name}</p>
                  <p className="text-xs text-gray-600">{leaderboardData[1]?.points} pts</p>
                </div>
                <div className="bg-gray-300 h-16 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-bold">2nd</span>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-yellow-50 p-4 rounded-lg mb-2 border-2 border-yellow-200">
                  <Avatar className="h-20 w-20 mx-auto mb-2">
                    <AvatarFallback className="bg-yellow-500 text-white text-xl font-bold">
                      {leaderboardData[0]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                  <p className="font-bold">{leaderboardData[0]?.name}</p>
                  <p className="text-sm text-gray-600">{leaderboardData[0]?.points} pts</p>
                  <Badge className="mt-1 bg-yellow-500">{leaderboardData[0]?.badge}</Badge>
                </div>
                <div className="bg-yellow-400 h-20 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">1st</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center">
                <div className="bg-orange-50 p-4 rounded-lg mb-2">
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarFallback className="bg-orange-500 text-white text-lg font-bold">
                      {leaderboardData[2]?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <Medal className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                  <p className="font-bold text-sm">{leaderboardData[2]?.name}</p>
                  <p className="text-xs text-gray-600">{leaderboardData[2]?.points} pts</p>
                </div>
                <div className="bg-orange-400 h-12 rounded-t-lg flex items-center justify-center">
                  <span className="text-white font-bold">3rd</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Full Rankings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {leaderboardData.map((rider, index) => (
            <div
              key={rider.id}
              className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                rider.id === user.id 
                  ? 'bg-indigo-50 border-2 border-indigo-200' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-center w-8">
                {getRankIcon(rider.rank)}
              </div>

              <Avatar className="h-10 w-10">
                <AvatarFallback className={`font-bold ${
                  rider.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : ''
                }`}>
                  {rider.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium">{rider.name}</p>
                  {rider.id === user.id && (
                    <Badge variant="outline" className="text-xs">You</Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">Batch {rider.batch}</p>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-1 mb-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  <span className="font-medium">{rider.rating}</span>
                </div>
                <p className="text-sm text-gray-600">{rider.totalRides} rides</p>
              </div>

              <div className="text-right">
                <div className="font-bold text-lg">{rider.points}</div>
                <p className="text-xs text-gray-600">points</p>
              </div>

              <div className="flex items-center">
                <div className={`p-2 rounded-full ${getBadgeColor(rider.badge)}`}>
                  {getBadgeIcon(rider.badge)}
                </div>
              </div>
            </div>
          ))}

          {leaderboardData.length === 0 && (
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No riders yet</h3>
              <p className="text-gray-600">Be the first to start sharing rides!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievement System Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Achievement Badges</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {[
              { name: 'Beginner', rides: '0+ rides', rating: 'Any rating', icon: 'Shield', color: 'gray' },
              { name: 'Speedster', rides: '10+ rides', rating: 'Any rating', icon: 'Zap', color: 'blue' },
              { name: 'Expert', rides: '25+ rides', rating: '4.0+ rating', icon: 'Award', color: 'purple' },
              { name: 'Champion', rides: '50+ rides', rating: '4.5+ rating', icon: 'Trophy', color: 'orange' },
              { name: 'Hero', rides: '100+ rides', rating: '4.8+ rating', icon: 'Crown', color: 'yellow' }
            ].map((badge, index) => (
              <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full ${getBadgeColor(badge.name)}`}>
                  {getBadgeIcon(badge.name)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{badge.name}</p>
                  <p className="text-sm text-gray-600">{badge.rides} • {badge.rating}</p>
                </div>
                {userStats?.badge === badge.name && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};