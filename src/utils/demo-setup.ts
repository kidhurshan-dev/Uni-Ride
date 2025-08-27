// Demo data setup for Uni-Ride app
import { auth } from './api';

export interface DemoUser {
  email: string;
  password: string;
  name: string;
  studentId: string;
  batch: string;
  department: string;
  userType: 'passenger' | 'hybrid';
}

// Demo user accounts for testing
export const demoUsers: DemoUser[] = [
  // Hybrid users (can both offer and request rides)
  {
    email: 'john.doe@eng.jfn.ac.lk',
    password: 'demo123',
    name: 'John Doe',
    studentId: 'ENG2021001',
    batch: '2021',
    department: 'Engineering',
    userType: 'hybrid'
  },
  {
    email: 'sarah.wilson@eng.jfn.ac.lk',
    password: 'demo123',
    name: 'Sarah Wilson',
    studentId: 'ENG2022003',
    batch: '2022',
    department: 'Engineering',
    userType: 'hybrid'
  },
  {
    email: 'mike.chen@eng.jfn.ac.lk',
    password: 'demo123',
    name: 'Mike Chen',
    studentId: 'TEC2020005',
    batch: '2020',
    department: 'Technology',
    userType: 'hybrid'
  },
  
  // Passenger-only users
  {
    email: 'emma.brown@eng.jfn.ac.lk',
    password: 'demo123',
    name: 'Emma Brown',
    studentId: 'ENG2023008',
    batch: '2023',
    department: 'Engineering',
    userType: 'passenger'
  },
  {
    email: 'alex.taylor@eng.jfn.ac.lk',
    password: 'demo123',
    name: 'Alex Taylor',
    studentId: 'AGR2022012',
    batch: '2022',
    department: 'Agriculture',
    userType: 'passenger'
  },
  {
    email: 'lisa.davis@eng.jfn.ac.lk',
    password: 'demo123',
    name: 'Lisa Davis',
    studentId: 'TEC2021015',
    batch: '2021',
    department: 'Technology',
    userType: 'passenger'
  }
];

// Function to create demo users
export async function createDemoUsers() {
  const results = [];
  
  console.log('🚀 Starting demo user creation process...');
  
  for (const user of demoUsers) {
    try {
      console.log(`📝 Creating demo user: ${user.name} (${user.email})`);
      
      // Add a small delay to avoid rate limiting
      if (results.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      const result = await auth.signUp(user);
      results.push({ success: true, user: user.email, result });
      console.log(`✅ Successfully created: ${user.name}`);
    } catch (error: any) {
      console.error(`❌ Failed to create ${user.name}:`, error);
      
      let errorMsg = error.message || 'Unknown error';
      if (errorMsg.includes('already')) {
        errorMsg = 'User already exists';
      } else if (errorMsg.includes('network')) {
        errorMsg = 'Network connection error';
      } else if (errorMsg.includes('rate')) {
        errorMsg = 'Too many requests, please try again later';
      }
      
      results.push({ success: false, user: user.email, error: errorMsg });
    }
  }
  
  console.log('📊 Demo user creation completed:', {
    total: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length
  });
  
  return results;
}

// Sample ride offers for demo
export const sampleRideOffers = [
  {
    from: 'Main Gate',
    to: 'Engineering Faculty',
    departureTime: 'in 15 minutes',
    availableSeats: 2,
    vehicle: 'bike',
    notes: 'Going to morning lectures, can drop off at Faculty main building'
  },
  {
    from: 'Library',
    to: 'Hostel Complex',
    departureTime: 'in 30 minutes',
    availableSeats: 1,
    vehicle: 'bicycle',
    notes: 'Quiet ride after study session'
  },
  {
    from: 'Engineering Faculty',
    to: 'Main Gate',
    departureTime: 'in 5 minutes',
    availableSeats: 3,
    vehicle: 'car',
    notes: 'Going to town, can drop anyone at main gate'
  }
];

// Sample ride requests for demo
export const sampleRideRequests = [
  {
    from: 'Hostel',
    to: 'Technology Faculty',
    departureTime: 'ASAP',
    isUrgent: true,
    notes: 'Late for an important lab session!'
  },
  {
    from: 'Agriculture Faculty',
    to: 'Library',
    departureTime: 'in 20 minutes',
    isUrgent: false,
    notes: 'Need to return some books before closing time'
  }
];

// Quick sign-in function for demo users
export async function demoSignIn(email: string) {
  const user = demoUsers.find(u => u.email === email);
  if (!user) {
    throw new Error('Demo user not found');
  }
  
  return auth.signIn(user.email, user.password);
}

// Get demo user by email
export function getDemoUser(email: string): DemoUser | undefined {
  return demoUsers.find(u => u.email === email);
}

// Display demo credentials
export function showDemoCredentials() {
  console.log('🎭 Demo User Credentials:');
  console.log('========================');
  
  console.log('\n🚗 Hybrid Users (Can offer & request rides):');
  demoUsers.filter(u => u.userType === 'hybrid').forEach(user => {
    console.log(`${user.name} (${user.batch})`);
    console.log(`  📧 ${user.email}`);
    console.log(`  🔐 ${user.password}`);
    console.log(`  🏢 ${user.department}\n`);
  });
  
  console.log('👥 Passenger Users (Request rides only):');
  demoUsers.filter(u => u.userType === 'passenger').forEach(user => {
    console.log(`${user.name} (${user.batch})`);
    console.log(`  📧 ${user.email}`);
    console.log(`  🔐 ${user.password}`);
    console.log(`  🏢 ${user.department}\n`);
  });
  
  console.log('💡 All demo users use password: demo123');
}