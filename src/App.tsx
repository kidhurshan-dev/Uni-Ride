import React, { useState, useEffect } from "react";
import {
  Home,
  Search,
  Users,
  User,
  Plus,
  Star,
  MapPin,
  Clock,
  MessageCircle,
  Car,
  Bike,
  User as UserIcon,
  LogIn,
  UserPlus,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
} from "./components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import { Input } from "./components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./components/ui/tabs";
import { ScrollArea } from "./components/ui/scroll-area";
import { Separator } from "./components/ui/separator";
import { Switch } from "./components/ui/switch";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Textarea } from "./components/ui/textarea";
import { toast } from "sonner@2.0.3";
import { ImageWithFallback } from "./components/figma/ImageWithFallback";
import {
  auth,
  rides,
  leaderboard,
  messaging,
  subscriptions,
  supabase,
} from "./utils/api";
import { DemoSetup } from "./components/DemoSetup";

// Components
const AuthScreen = ({
  onAuthSuccess,
}: {
  onAuthSuccess: () => void;
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoSetup, setShowDemoSetup] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    studentId: "",
    batch: "",
    department: "",
    userType: "passenger" as "passenger" | "hybrid",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // Validate email format
        if (!formData.email.endsWith("@eng.jfn.ac.lk")) {
          throw new Error(
            "Please use a valid university email (@eng.jfn.ac.lk)",
          );
        }

        await auth.signIn(formData.email, formData.password);
        toast.success("Signed in successfully!");
      } else {
        // Validate all required fields for signup
        if (
          !formData.name ||
          !formData.studentId ||
          !formData.batch ||
          !formData.department
        ) {
          throw new Error("Please fill in all required fields");
        }

        await auth.signUp(formData);
        toast.success("Account created successfully!");
      }
      onAuthSuccess();
    } catch (error: any) {
      console.error("Auth error:", error);

      // Provide more specific error messages
      let errorMessage =
        error.message || "Authentication failed";

      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage =
          "Invalid email or password. For demo accounts, make sure to create demo users first.";
      } else if (errorMessage.includes("already registered")) {
        errorMessage =
          "This email is already registered. Try signing in instead.";
      } else if (errorMessage.includes("network")) {
        errorMessage =
          "Network error. Please check your connection and try again.";
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectDemoUser = (
    email: string,
    password: string,
  ) => {
    setFormData({ ...formData, email, password });
    setShowDemoSetup(false);
    setIsLogin(true);

    // Give user clear feedback about what to do next
    setTimeout(() => {
      toast.info(
        'Demo user selected! Now click "Sign In" to continue.',
      );
    }, 300);
  };

  if (showDemoSetup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowDemoSetup(false)}
              className="mb-4"
            >
              ← Back to Sign In
            </Button>
          </div>
          <DemoSetup onSelectUser={handleSelectDemoUser} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-primary">
            Uni-Ride
          </h1>
          <p className="text-muted-foreground">
            University Ride Sharing Platform
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="University Email (@eng.jfn.ac.lk)"
              value={formData.email}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  email: e.target.value,
                })
              }
              required
            />

            <Input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  password: e.target.value,
                })
              }
              required
            />

            {!isLogin && (
              <>
                <Input
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  required
                />

                <Input
                  placeholder="Student ID"
                  value={formData.studentId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      studentId: e.target.value,
                    })
                  }
                  required
                />

                <Select
                  value={formData.batch}
                  onValueChange={(value) =>
                    setFormData({ ...formData, batch: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Batch Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2020">2020</SelectItem>
                    <SelectItem value="2021">2021</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      department: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Engineering">
                      Engineering
                    </SelectItem>
                    <SelectItem value="Technology">
                      Technology
                    </SelectItem>
                    <SelectItem value="Agriculture">
                      Agriculture
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-3">
                  <Label>Account Type</Label>
                  <div className="space-y-2">
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.userType === "passenger"
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          userType: "passenger",
                        })
                      }
                    >
                      <p className="font-medium">
                        Passenger Only
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Find rides from other students
                      </p>
                    </div>
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        formData.userType === "hybrid"
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      }`}
                      onClick={() =>
                        setFormData({
                          ...formData,
                          userType: "hybrid",
                        })
                      }
                    >
                      <p className="font-medium">
                        Rider (Driver + Passenger)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Offer rides and find rides (requires
                        verification)
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading
                ? "Processing..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </Button>
          </form>

          <div className="mt-4 text-center space-y-2">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>

            <div className="pt-2 border-t">
              <Button
                variant="outline"
                onClick={() => setShowDemoSetup(true)}
                className="text-sm w-full"
                size="sm"
              >
                🎭 Use Demo Data & Accounts
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Test the app with demo users. Create demo
                accounts first, then sign in.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const RideCard = ({
  ride,
  onCardClick,
  onSwipeAccept,
  onSwipeReject,
  showSwipeActions = false,
  currentUser,
}: any) => {
  const isOffer = ride.type === "offer";
  const user = isOffer
    ? {
        name: ride.driverName,
        avatar: ride.driverAvatar,
        rating: ride.driverRating,
        batch: ride.driverBatch,
      }
    : {
        name: ride.passengerName,
        avatar: ride.passengerAvatar,
        batch: ride.passengerBatch,
      };

  const isSameBatch =
    (ride.driverBatch || ride.passengerBatch) ===
    currentUser?.batch;

  return (
    <Card
      className={`mb-3 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSameBatch ? "border-blue-200 bg-blue-50/30" : ""
      } ${ride.isUrgent ? "border-red-200 bg-red-50/30" : ""}`}
      onClick={() => onCardClick(ride)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>
                {user.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <p className="font-medium truncate">
                  {user.name}
                </p>
                {isSameBatch && (
                  <Badge variant="outline" className="text-xs">
                    Batch {user.batch}
                  </Badge>
                )}
                {ride.isUrgent && (
                  <Badge
                    variant="destructive"
                    className="text-xs"
                  >
                    Urgent
                  </Badge>
                )}
              </div>

              <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-2">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {ride.from} → {ride.to}
                </span>
              </div>

              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{ride.departureTime}</span>
                </div>

                {isOffer && (
                  <>
                    <div className="flex items-center space-x-1">
                      {ride.vehicle === "bike" ? (
                        <Bike className="w-3 h-3" />
                      ) : ride.vehicle === "car" ? (
                        <Car className="w-3 h-3" />
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )}
                      <span>
                        {ride.availableSeats} seat
                        {ride.availableSeats > 1 ? "s" : ""}
                      </span>
                    </div>

                    {user.rating > 0 && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{user.rating}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {showSwipeActions && (
          <div className="flex space-x-2 mt-3 pt-3 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSwipeReject(ride);
              }}
            >
              Decline
            </Button>
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onSwipeAccept(ride);
              }}
            >
              Accept
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const MiniLeaderboard = ({
  leaderboardData,
}: {
  leaderboardData: any[];
}) => (
  <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50">
    <CardHeader className="pb-3">
      <div className="flex items-center space-x-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <h3 className="font-medium">Top Riders This Week</h3>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="space-y-2">
        {leaderboardData.slice(0, 3).map((rider, index) => (
          <div
            key={rider.id}
            className="flex items-center space-x-3"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                index === 0
                  ? "bg-yellow-500 text-white"
                  : index === 1
                    ? "bg-gray-400 text-white"
                    : "bg-orange-500 text-white"
              }`}
            >
              {index + 1}
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={rider.avatar} />
              <AvatarFallback>
                {rider.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {rider.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {rider.totalRides} rides • ⭐ {rider.rating}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {rider.badge}
            </Badge>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRide, setSelectedRide] = useState(null);
  const [showRideDialog, setShowRideDialog] = useState(false);
  const [showPostRideDialog, setShowPostRideDialog] =
    useState(false);
  const [showRequestDialog, setShowRequestDialog] =
    useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Data state
  const [availableRides, setAvailableRides] = useState([]);
  const [userRides, setUserRides] = useState([]);
  const [leaderboardData, setLeaderboardData] = useState([]);

  // Form state
  const [rideOfferForm, setRideOfferForm] = useState({
    from: "",
    to: "",
    departureTime: "",
    availableSeats: 1,
    vehicle: "bicycle",
    notes: "",
  });

  const [rideRequestForm, setRideRequestForm] = useState({
    from: "",
    to: "",
    departureTime: "",
    isUrgent: false,
    notes: "",
  });

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Subscribe to real-time updates when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadInitialData();

      const unsubscribeRides = subscriptions.subscribeToRides(
        setAvailableRides,
      );
      const unsubscribeUserRides =
        subscriptions.subscribeToUserRides(setUserRides);

      return () => {
        unsubscribeRides();
        unsubscribeUserRides();
      };
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const session = await auth.getSession();
      if (session) {
        const { user } = await auth.getProfile();
        setCurrentUser(user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      const [
        ridesResponse,
        userRidesResponse,
        leaderboardResponse,
      ] = await Promise.all([
        rides.getAvailableRides(),
        rides.getMyRides(),
        leaderboard.get(),
      ]);

      setAvailableRides(ridesResponse.rides || []);
      setUserRides(userRidesResponse.rides || []);
      setLeaderboardData(leaderboardResponse.leaderboard || []);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast.error("Failed to load ride data");
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    checkAuth();
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setIsAuthenticated(false);
      setCurrentUser(null);
      toast.success("Signed out successfully");
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  const handleCardClick = (ride: any) => {
    setSelectedRide(ride);
    setShowRideDialog(true);
  };

  const handleSwipeAccept = async (ride: any) => {
    try {
      if (ride.type === "offer") {
        await rides.acceptPassenger(
          ride.id,
          ride.passengers[0]?.id,
        );
      } else {
        // Handle ride request acceptance
      }
      toast.success("Passenger accepted!");
      loadInitialData();
    } catch (error) {
      toast.error("Failed to accept passenger");
    }
  };

  const handleSwipeReject = async (ride: any) => {
    try {
      if (ride.type === "offer") {
        await rides.rejectPassenger(
          ride.id,
          ride.passengers[0]?.id,
        );
      }
      toast.success("Passenger declined");
      loadInitialData();
    } catch (error) {
      toast.error("Failed to decline passenger");
    }
  };

  const handleJoinRide = async (ride: any) => {
    try {
      await rides.joinRide(ride.id);
      toast.success("Join request sent!");
      setShowRideDialog(false);
      loadInitialData();
    } catch (error: any) {
      toast.error(error.message || "Failed to join ride");
    }
  };

  const handlePostRideOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rides.postOffer(rideOfferForm);
      toast.success("Ride offer posted successfully!");
      setShowPostRideDialog(false);
      setRideOfferForm({
        from: "",
        to: "",
        departureTime: "",
        availableSeats: 1,
        vehicle: "bicycle",
        notes: "",
      });
      loadInitialData();
    } catch (error: any) {
      toast.error(error.message || "Failed to post ride offer");
    }
  };

  const handlePostRideRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await rides.postRequest(rideRequestForm);
      toast.success("Ride request posted successfully!");
      setShowRequestDialog(false);
      setRideRequestForm({
        from: "",
        to: "",
        departureTime: "",
        isUrgent: false,
        notes: "",
      });
      loadInitialData();
    } catch (error: any) {
      toast.error(
        error.message || "Failed to post ride request",
      );
    }
  };

  const handleContactRider = (ride: any) => {
    const isDriver = ride.type === "offer";
    const phoneNumber = isDriver
      ? ride.driverPhone
      : ride.passengerPhone;
    const message = messaging.getDefaultRideMessage(
      ride,
      !isDriver,
    );

    if (phoneNumber) {
      messaging.openWhatsApp(phoneNumber, message);
    } else {
      toast.info(
        "Phone number not available. Contact through the app.",
      );
    }
  };

  const filteredRides = availableRides.filter((ride) => {
    if (
      currentUser?.userType === "passenger" &&
      ride.type === "request"
    )
      return false;
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    const driverName = ride.driverName?.toLowerCase() || "";
    const passengerName =
      ride.passengerName?.toLowerCase() || "";
    const from = ride.from.toLowerCase();
    const to = ride.to.toLowerCase();

    return (
      driverName.includes(searchLower) ||
      passengerName.includes(searchLower) ||
      from.includes(searchLower) ||
      to.includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Uni-Ride
          </h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "home":
        return (
          <div className="space-y-4">
            <MiniLeaderboard
              leaderboardData={leaderboardData}
            />

            {/* User's Own Posts Section */}
            {userRides.length > 0 && (
              <div>
                <h3 className="font-medium mb-3 flex items-center space-x-2">
                  <span>Your Activities</span>
                  <Badge variant="secondary">
                    {userRides.length}
                  </Badge>
                </h3>
                {userRides.map((ride) => (
                  <RideCard
                    key={ride.id}
                    ride={ride}
                    onCardClick={handleCardClick}
                    showSwipeActions={
                      ride.passengers?.length > 0
                    }
                    onSwipeAccept={handleSwipeAccept}
                    onSwipeReject={handleSwipeReject}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            )}

            {userRides.length > 0 && <Separator />}

            {/* Community Posts */}
            <div>
              <h3 className="font-medium mb-3">
                Available Rides
              </h3>
              {filteredRides.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-muted-foreground">
                      No rides available at the moment
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check back later or post your own ride!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredRides
                  .slice(0, 10)
                  .map((ride) => (
                    <RideCard
                      key={ride.id}
                      ride={ride}
                      onCardClick={handleCardClick}
                      currentUser={currentUser}
                    />
                  ))
              )}
            </div>
          </div>
        );

      case "search":
        return (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              {currentUser?.userType === "passenger" && (
                <Dialog
                  open={showRequestDialog}
                  onOpenChange={setShowRequestDialog}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request a Ride</DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handlePostRideRequest}
                      className="space-y-4"
                    >
                      <p className="text-sm text-muted-foreground">
                        Emergency rides only. Limited to 2
                        requests per day.
                      </p>
                      <Input
                        placeholder="From location"
                        value={rideRequestForm.from}
                        onChange={(e) =>
                          setRideRequestForm({
                            ...rideRequestForm,
                            from: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="To location"
                        value={rideRequestForm.to}
                        onChange={(e) =>
                          setRideRequestForm({
                            ...rideRequestForm,
                            to: e.target.value,
                          })
                        }
                        required
                      />
                      <Input
                        placeholder="When do you need to travel?"
                        value={rideRequestForm.departureTime}
                        onChange={(e) =>
                          setRideRequestForm({
                            ...rideRequestForm,
                            departureTime: e.target.value,
                          })
                        }
                        required
                      />
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rideRequestForm.isUrgent}
                          onCheckedChange={(checked) =>
                            setRideRequestForm({
                              ...rideRequestForm,
                              isUrgent: checked,
                            })
                          }
                        />
                        <Label>Mark as urgent</Label>
                      </div>
                      <Textarea
                        placeholder="Additional notes (optional)"
                        value={rideRequestForm.notes}
                        onChange={(e) =>
                          setRideRequestForm({
                            ...rideRequestForm,
                            notes: e.target.value,
                          })
                        }
                      />
                      <Button type="submit" className="w-full">
                        Post Ride Request
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Search Results */}
            <div>
              {searchQuery && (
                <p className="text-sm text-muted-foreground mb-3">
                  Found {filteredRides.length} ride
                  {filteredRides.length !== 1 ? "s" : ""}
                </p>
              )}
              {filteredRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onCardClick={handleCardClick}
                  currentUser={currentUser}
                />
              ))}
            </div>
          </div>
        );

      case "riders":
        return (
          <div className="space-y-6">
            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <h3 className="font-medium">
                  Your Achievements
                </h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div
                    className={`text-center ${currentUser?.totalRides >= 25 ? "" : "opacity-50"}`}
                  >
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      🚀
                    </div>
                    <p className="text-xs font-medium">
                      Speedster
                    </p>
                    <p className="text-xs text-muted-foreground">
                      25 rides
                    </p>
                  </div>
                  <div
                    className={`text-center ${currentUser?.totalRides >= 50 ? "" : "opacity-50"}`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      🏆
                    </div>
                    <p className="text-xs font-medium">
                      Champion
                    </p>
                    <p className="text-xs text-muted-foreground">
                      50 rides
                    </p>
                  </div>
                  <div
                    className={`text-center ${currentUser?.totalRides >= 100 ? "" : "opacity-50"}`}
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      👑
                    </div>
                    <p className="text-xs font-medium">Hero</p>
                    <p className="text-xs text-muted-foreground">
                      100 rides
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Full Leaderboard */}
            <Card>
              <CardHeader>
                <h3 className="font-medium">
                  Weekly Leaderboard
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboardData
                    .slice(0, 10)
                    .map((rider, index) => (
                      <div
                        key={rider.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-muted/30"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                            index === 0
                              ? "bg-yellow-500 text-white"
                              : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                  ? "bg-orange-500 text-white"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={rider.avatar} />
                          <AvatarFallback>
                            {rider.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">
                            {rider.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {rider.totalRides} rides • ⭐{" "}
                            {rider.rating || 0}
                          </p>
                        </div>
                        <Badge variant="secondary">
                          {rider.badge}
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={currentUser?.avatar} />
                    <AvatarFallback>
                      {currentUser?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h2 className="font-medium">
                      {currentUser?.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Batch {currentUser?.batch} •{" "}
                      {currentUser?.department}
                    </p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          {currentUser?.rating || 0}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {currentUser?.totalRides || 0} rides
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {currentUser?.points || 0} points
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <h3 className="font-medium">Settings</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch
                    id="dark-mode"
                    checked={isDarkMode}
                    onCheckedChange={setIsDarkMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>User Type</Label>
                    <p className="text-sm text-muted-foreground">
                      {currentUser?.userType === "passenger"
                        ? "Passenger only"
                        : "Rider (Driver + Passenger)"}
                    </p>
                    {currentUser?.userType === "hybrid" &&
                      currentUser?.verificationStatus ===
                        "pending" && (
                        <Badge
                          variant="outline"
                          className="mt-1"
                        >
                          Verification Pending
                        </Badge>
                      )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Emergency Contacts
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Privacy Settings
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Help & Support
                  </Button>
                </div>

                <Separator />

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`min-h-screen bg-background ${isDarkMode ? "dark" : ""}`}
    >
      {/* Mobile Container */}
      <div className="max-w-md mx-auto bg-background min-h-screen relative">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-primary">
              {activeTab === "home"
                ? "Uni-Ride"
                : activeTab === "search"
                  ? "Search Rides"
                  : activeTab === "riders"
                    ? "Riders"
                    : "Profile"}
            </h1>
            {activeTab === "home" && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  @eng.jfn.ac.lk
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 pb-20">{renderTabContent()}</div>
        </ScrollArea>

        {/* Floating Action Button (Riders only) */}
        {currentUser?.userType === "hybrid" &&
          activeTab === "home" && (
            <Dialog
              open={showPostRideDialog}
              onOpenChange={setShowPostRideDialog}
            >
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="fixed bottom-20 left-1/2 transform -translate-x-1/2 rounded-full shadow-lg z-20 w-14 h-14"
                >
                  <Plus className="w-6 h-6" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Post a Ride</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handlePostRideOffer}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          from: "Current Location",
                        })
                      }
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Current Location
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          from: "Main Gate",
                        })
                      }
                    >
                      Main Gate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          to: "Engineering Faculty",
                        })
                      }
                    >
                      Engineering Faculty
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          to: "Library",
                        })
                      }
                    >
                      Library
                    </Button>
                  </div>
                  <Input
                    placeholder="From location"
                    value={rideOfferForm.from}
                    onChange={(e) =>
                      setRideOfferForm({
                        ...rideOfferForm,
                        from: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="To location"
                    value={rideOfferForm.to}
                    onChange={(e) =>
                      setRideOfferForm({
                        ...rideOfferForm,
                        to: e.target.value,
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Available seats"
                    type="number"
                    min="1"
                    max="4"
                    value={rideOfferForm.availableSeats}
                    onChange={(e) =>
                      setRideOfferForm({
                        ...rideOfferForm,
                        availableSeats: parseInt(
                          e.target.value,
                        ),
                      })
                    }
                    required
                  />
                  <Input
                    placeholder="Departure time (e.g., 10 minutes)"
                    value={rideOfferForm.departureTime}
                    onChange={(e) =>
                      setRideOfferForm({
                        ...rideOfferForm,
                        departureTime: e.target.value,
                      })
                    }
                    required
                  />
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={
                        rideOfferForm.vehicle === "bicycle"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          vehicle: "bicycle",
                        })
                      }
                    >
                      🚲 Bicycle
                    </Button>
                    <Button
                      type="button"
                      variant={
                        rideOfferForm.vehicle === "bike"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          vehicle: "bike",
                        })
                      }
                    >
                      🏍️ Bike
                    </Button>
                    <Button
                      type="button"
                      variant={
                        rideOfferForm.vehicle === "car"
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        setRideOfferForm({
                          ...rideOfferForm,
                          vehicle: "car",
                        })
                      }
                    >
                      🚗 Car
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Additional notes (optional)"
                    value={rideOfferForm.notes}
                    onChange={(e) =>
                      setRideOfferForm({
                        ...rideOfferForm,
                        notes: e.target.value,
                      })
                    }
                  />
                  <Button type="submit" className="w-full">
                    Post Ride
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-background border-t">
          <div className="flex">
            {[
              { id: "home", icon: Home, label: "Home" },
              { id: "search", icon: Search, label: "Search" },
              { id: "riders", icon: Users, label: "Riders" },
              { id: "profile", icon: User, label: "Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                  activeTab === tab.id
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon className="w-5 h-5 mb-1" />
                <span className="text-xs">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ride Details Dialog */}
        <Dialog
          open={showRideDialog}
          onOpenChange={setShowRideDialog}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ride Details</DialogTitle>
            </DialogHeader>
            {selectedRide && (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        selectedRide.driverAvatar ||
                        selectedRide.passengerAvatar
                      }
                    />
                    <AvatarFallback>
                      {(
                        selectedRide.driverName ||
                        selectedRide.passengerName
                      )?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {selectedRide.driverName ||
                        selectedRide.passengerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Batch{" "}
                      {selectedRide.driverBatch ||
                        selectedRide.passengerBatch}
                    </p>
                    {selectedRide.driverRating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm">
                          {selectedRide.driverRating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">
                      {selectedRide.from} → {selectedRide.to}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      Departing in {selectedRide.departureTime}
                    </span>
                  </div>
                  {selectedRide.availableSeats && (
                    <div className="flex items-center space-x-2 mt-2">
                      <UserIcon className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedRide.availableSeats} seat
                        {selectedRide.availableSeats > 1
                          ? "s"
                          : ""}{" "}
                        available
                      </span>
                    </div>
                  )}
                  {selectedRide.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedRide.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowRideDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleJoinRide(selectedRide)}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact & Join
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}