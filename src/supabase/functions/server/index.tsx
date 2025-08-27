import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

console.log('🚀 Uni-Ride server initializing...');
console.log('Environment check:', {
  supabaseUrl: Deno.env.get('SUPABASE_URL') ? '✅ Set' : '❌ Missing',
  serviceRoleKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? '✅ Set' : '❌ Missing'
});

const app = new Hono();

// Enable CORS and logging
app.use('*', cors({
  origin: '*', // Allow all origins for demo
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing required environment variables: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
console.log('✅ Supabase client initialized successfully');

// Helper function to verify user authentication
async function verifyUser(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { error: 'No access token provided', user: null };
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return { error: 'Invalid access token', user: null };
  }

  return { error: null, user };
}

// User Registration
app.post('/make-server-64aaa3dc/auth/signup', async (c) => {
  try {
    console.log('📝 Signup request received');
    const requestData = await c.req.json();
    console.log('Request data:', { ...requestData, password: '***' }); // Don't log password
    
    const { email, password, name, studentId, batch, department, userType } = requestData;
    
    // Validate university email
    if (!email.endsWith('@eng.jfn.ac.lk')) {
      console.log('❌ Invalid email domain:', email);
      return c.json({ error: 'Invalid university email domain' }, 400);
    }

    // Create user account
    console.log('🔐 Creating Supabase auth user...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        name,
        student_id: studentId,
        batch,
        department,
        user_type: userType,
        verified: userType === 'passenger', // Passengers are auto-verified
        verification_status: userType === 'hybrid' ? 'pending' : 'verified'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log('❌ Supabase auth error:', authError);
      return c.json({ error: authError.message }, 400);
    }

    console.log('✅ Supabase auth user created:', authData.user.id);

    // Store user profile in KV store
    console.log('💾 Storing user profile in KV store...');
    const userProfile = {
      id: authData.user.id,
      email,
      name,
      studentId,
      batch,
      department,
      userType,
      rating: 0,
      totalRides: 0,
      points: 0,
      verified: userType === 'passenger',
      verificationStatus: userType === 'hybrid' ? 'pending' : 'verified',
      createdAt: new Date().toISOString()
    };

    await kv.set(`user:${authData.user.id}`, userProfile);
    await kv.set(`user:email:${email}`, authData.user.id);
    console.log('✅ User profile stored successfully');

    console.log('✅ User signup completed successfully for:', email);
    return c.json({ 
      message: 'User created successfully',
      user: userProfile,
      needsVerification: userType === 'hybrid'
    });

  } catch (error) {
    console.log('❌ Signup error:', error);
    return c.json({ 
      error: 'Internal server error during signup',
      details: error.message 
    }, 500);
  }
});

// Get User Profile
app.get('/make-server-64aaa3dc/auth/profile', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ user: userProfile });

  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Internal server error fetching profile' }, 500);
  }
});

// Update User Profile
app.put('/make-server-64aaa3dc/auth/profile', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`);
    
    if (!currentProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ user: updatedProfile });

  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Internal server error updating profile' }, 500);
  }
});

// Post a Ride Offer
app.post('/make-server-64aaa3dc/rides/offer', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile || userProfile.userType !== 'hybrid') {
      return c.json({ error: 'Only verified riders can post ride offers' }, 403);
    }

    const { from, to, departureTime, availableSeats, vehicle, notes } = await c.req.json();
    
    const rideId = `ride_${Date.now()}_${user.id}`;
    const ride = {
      id: rideId,
      type: 'offer',
      driverId: user.id,
      driverName: userProfile.name,
      driverBatch: userProfile.batch,
      driverRating: userProfile.rating,
      from,
      to,
      departureTime,
      availableSeats,
      vehicle,
      notes,
      status: 'active',
      passengers: [],
      createdAt: new Date().toISOString()
    };

    await kv.set(`ride:${rideId}`, ride);
    await kv.set(`user_rides:${user.id}:${rideId}`, rideId);

    return c.json({ message: 'Ride offer posted successfully', ride });

  } catch (error) {
    console.log('Post ride offer error:', error);
    return c.json({ error: 'Internal server error posting ride offer' }, 500);
  }
});

// Post a Ride Request
app.post('/make-server-64aaa3dc/rides/request', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Check daily request limit for passenger users
    if (userProfile.userType === 'passenger') {
      const today = new Date().toISOString().split('T')[0];
      const requestCount = await kv.get(`daily_requests:${user.id}:${today}`) || 0;
      
      if (requestCount >= 2) {
        return c.json({ error: 'Daily request limit reached (2 requests per day)' }, 429);
      }
    }

    const { from, to, departureTime, isUrgent, notes } = await c.req.json();
    
    const requestId = `request_${Date.now()}_${user.id}`;
    const request = {
      id: requestId,
      type: 'request',
      passengerId: user.id,
      passengerName: userProfile.name,
      passengerBatch: userProfile.batch,
      from,
      to,
      departureTime,
      isUrgent: isUrgent || false,
      notes,
      status: 'active',
      responses: [],
      createdAt: new Date().toISOString()
    };

    await kv.set(`ride:${requestId}`, request);
    await kv.set(`user_rides:${user.id}:${requestId}`, requestId);

    // Update daily request count for passengers
    if (userProfile.userType === 'passenger') {
      const today = new Date().toISOString().split('T')[0];
      const currentCount = await kv.get(`daily_requests:${user.id}:${today}`) || 0;
      await kv.set(`daily_requests:${user.id}:${today}`, currentCount + 1);
    }

    return c.json({ message: 'Ride request posted successfully', request });

  } catch (error) {
    console.log('Post ride request error:', error);
    return c.json({ error: 'Internal server error posting ride request' }, 500);
  }
});

// Get Available Rides (with priority sorting)
app.get('/make-server-64aaa3dc/rides', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Get all active rides
    const rideKeys = await kv.getByPrefix('ride:');
    const rides = rideKeys
      .filter(ride => ride.status === 'active')
      .filter(ride => {
        // Filter based on user type
        if (userProfile.userType === 'passenger') {
          return ride.type === 'offer'; // Passengers only see ride offers
        }
        return true; // Hybrid users see both offers and requests
      })
      .filter(ride => ride.driverId !== user.id && ride.passengerId !== user.id); // Don't show own rides

    // Sort by priority
    const sortedRides = rides.sort((a, b) => {
      // Same batch priority
      const aSameBatch = (a.driverBatch || a.passengerBatch) === userProfile.batch;
      const bSameBatch = (b.driverBatch || b.passengerBatch) === userProfile.batch;
      
      if (aSameBatch && !bSameBatch) return -1;
      if (!aSameBatch && bSameBatch) return 1;
      
      // Urgent priority
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      
      // High rated drivers priority (for offers)
      if (a.type === 'offer' && b.type === 'offer') {
        if (a.driverRating > b.driverRating) return -1;
        if (a.driverRating < b.driverRating) return 1;
      }
      
      // Most recent first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return c.json({ rides: sortedRides });

  } catch (error) {
    console.log('Get rides error:', error);
    return c.json({ error: 'Internal server error fetching rides' }, 500);
  }
});

// Join a Ride Offer
app.post('/make-server-64aaa3dc/rides/:rideId/join', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const rideId = c.req.param('rideId');
    const ride = await kv.get(`ride:${rideId}`);
    
    if (!ride || ride.status !== 'active') {
      return c.json({ error: 'Ride not found or no longer active' }, 404);
    }

    if (ride.type !== 'offer') {
      return c.json({ error: 'Can only join ride offers' }, 400);
    }

    if (ride.driverId === user.id) {
      return c.json({ error: 'Cannot join your own ride' }, 400);
    }

    if (ride.passengers && ride.passengers.length >= ride.availableSeats) {
      return c.json({ error: 'Ride is full' }, 400);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const passenger = {
      id: user.id,
      name: userProfile.name,
      batch: userProfile.batch,
      status: 'pending',
      joinedAt: new Date().toISOString()
    };

    const updatedRide = {
      ...ride,
      passengers: [...(ride.passengers || []), passenger],
      updatedAt: new Date().toISOString()
    };

    await kv.set(`ride:${rideId}`, updatedRide);

    return c.json({ message: 'Join request sent successfully', ride: updatedRide });

  } catch (error) {
    console.log('Join ride error:', error);
    return c.json({ error: 'Internal server error joining ride' }, 500);
  }
});

// Accept/Reject Passenger
app.post('/make-server-64aaa3dc/rides/:rideId/passenger/:passengerId/:action', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const rideId = c.req.param('rideId');
    const passengerId = c.req.param('passengerId');
    const action = c.req.param('action'); // 'accept' or 'reject'

    const ride = await kv.get(`ride:${rideId}`);
    
    if (!ride || ride.driverId !== user.id) {
      return c.json({ error: 'Ride not found or unauthorized' }, 404);
    }

    const updatedPassengers = ride.passengers.map(p => 
      p.id === passengerId 
        ? { ...p, status: action === 'accept' ? 'accepted' : 'rejected' }
        : p
    );

    const updatedRide = {
      ...ride,
      passengers: updatedPassengers,
      updatedAt: new Date().toISOString()
    };

    await kv.set(`ride:${rideId}`, updatedRide);

    return c.json({ 
      message: `Passenger ${action}ed successfully`, 
      ride: updatedRide 
    });

  } catch (error) {
    console.log('Accept/reject passenger error:', error);
    return c.json({ error: 'Internal server error processing passenger action' }, 500);
  }
});

// Get User's Rides
app.get('/make-server-64aaa3dc/rides/my', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const userRideKeys = await kv.getByPrefix(`user_rides:${user.id}:`);
    const rideIds = userRideKeys.map(key => key.split(':').pop());
    
    const rides = [];
    for (const rideId of rideIds) {
      const ride = await kv.get(`ride:${rideId}`);
      if (ride) {
        rides.push(ride);
      }
    }

    return c.json({ rides });

  } catch (error) {
    console.log('Get user rides error:', error);
    return c.json({ error: 'Internal server error fetching user rides' }, 500);
  }
});

// Get Leaderboard
app.get('/make-server-64aaa3dc/leaderboard', async (c) => {
  try {
    const userKeys = await kv.getByPrefix('user:');
    const riders = userKeys
      .filter(user => user.userType === 'hybrid' && user.totalRides > 0)
      .sort((a, b) => {
        // Sort by points first, then by rating, then by total rides
        if (b.points !== a.points) return b.points - a.points;
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.totalRides - a.totalRides;
      })
      .slice(0, 50); // Top 50

    const leaderboard = riders.map((rider, index) => ({
      rank: index + 1,
      id: rider.id,
      name: rider.name,
      batch: rider.batch,
      rating: rider.rating,
      totalRides: rider.totalRides,
      points: rider.points,
      badge: getBadge(rider.totalRides, rider.rating)
    }));

    return c.json({ leaderboard });

  } catch (error) {
    console.log('Get leaderboard error:', error);
    return c.json({ error: 'Internal server error fetching leaderboard' }, 500);
  }
});

// Rate a Ride
app.post('/make-server-64aaa3dc/rides/:rideId/rate', async (c) => {
  try {
    const { error, user } = await verifyUser(c.req.raw);
    if (error) {
      return c.json({ error }, 401);
    }

    const rideId = c.req.param('rideId');
    const { rating, review } = await c.req.json();

    if (rating < 1 || rating > 5) {
      return c.json({ error: 'Rating must be between 1 and 5' }, 400);
    }

    const ride = await kv.get(`ride:${rideId}`);
    if (!ride) {
      return c.json({ error: 'Ride not found' }, 404);
    }

    // Store the rating
    const ratingData = {
      rideId,
      raterId: user.id,
      targetId: ride.driverId,
      rating,
      review,
      createdAt: new Date().toISOString()
    };

    await kv.set(`rating:${rideId}:${user.id}`, ratingData);

    // Update driver's rating
    const driverProfile = await kv.get(`user:${ride.driverId}`);
    if (driverProfile) {
      const currentRating = driverProfile.rating || 0;
      const totalRides = driverProfile.totalRides || 0;
      const newRating = ((currentRating * totalRides) + rating) / (totalRides + 1);
      
      const updatedProfile = {
        ...driverProfile,
        rating: parseFloat(newRating.toFixed(1)),
        totalRides: totalRides + 1,
        points: (driverProfile.points || 0) + (rating * 10), // 10 points per rating point
        updatedAt: new Date().toISOString()
      };

      await kv.set(`user:${ride.driverId}`, updatedProfile);
    }

    return c.json({ message: 'Rating submitted successfully' });

  } catch (error) {
    console.log('Rate ride error:', error);
    return c.json({ error: 'Internal server error submitting rating' }, 500);
  }
});

// Helper function to determine badge based on rides and rating
function getBadge(totalRides: number, rating: number) {
  if (totalRides >= 100 && rating >= 4.8) return 'Hero';
  if (totalRides >= 50 && rating >= 4.5) return 'Champion';
  if (totalRides >= 25 && rating >= 4.0) return 'Expert';
  if (totalRides >= 10) return 'Speedster';
  return 'Beginner';
}

// Health check
app.get('/make-server-64aaa3dc/health', (c) => {
  console.log('🏥 Health check requested');
  return c.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    endpoints: {
      signup: '/make-server-64aaa3dc/auth/signup',
      profile: '/make-server-64aaa3dc/auth/profile',
      rides: '/make-server-64aaa3dc/rides'
    }
  });
});

// Catch all route for debugging
app.all('*', (c) => {
  console.log('🔍 Unknown route requested:', c.req.method, c.req.url);
  return c.json({ 
    error: 'Route not found',
    method: c.req.method,
    path: c.req.url,
    availableRoutes: [
      'POST /make-server-64aaa3dc/auth/signup',
      'GET /make-server-64aaa3dc/auth/profile',
      'GET /make-server-64aaa3dc/health'
    ]
  }, 404);
});

console.log('🚀 Starting Uni-Ride server...');
console.log('📋 Available routes:');
console.log('  POST /make-server-64aaa3dc/auth/signup');
console.log('  GET  /make-server-64aaa3dc/auth/profile');
console.log('  GET  /make-server-64aaa3dc/health');

serve(app.fetch);