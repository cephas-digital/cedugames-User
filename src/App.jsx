import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { isSignedIn } from "./services/api";
import { BrandLoader } from "./components/Brand";

const ProtectedRoute = ({ children }) => isSignedIn() ? children : <Navigate to="/login" replace />;

const Background = lazy(() => import("./pages/background"));
const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/sign-up"));
const VerifyCard = lazy(() => import("./pages/auth/verification"));
const Quiz = lazy(() => import("./components/quiz/quiz"));
const AgeSelection = lazy(() => import("./pages/selection/ageSelection"));
const ProgramSelection = lazy(() => import("./pages/selection/programSelection"));
const LearnExplorer = lazy(() => import("./pages/selection/learnExplorer"));
const LevelSelection = lazy(() => import("./pages/selection/levelSelection"));
const LeaderBoard = lazy(() => import("./pages/games/leaderboard"));
const Shop = lazy(() => import("./pages/games/shop"));
const ResetPassword = lazy(() => import("./pages/auth/resetPassword"));
const Profile = lazy(() => import("./pages/games/profile"));
const LittleExplorer = lazy(() => import("./pages/selection/LittleExploere"));
const Home = lazy(() => import("./pages/games/home"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotPassword"));
const ChangePassword = lazy(() => import("./pages/auth/changePassword"));
const Notifications = lazy(() => import("./pages/games/notification"));
const DailyReward = lazy(() => import("./pages/games/dailyReward"));
const NotFound = lazy(() => import("./pages/notFound"));
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<BrandLoader fullScreen message="Loading your adventure…" />}>
        <Routes>
          <Route
            path="/"
            element={<Background />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/sign-up"
            element={<Signup />}
          />

          <Route
            path="/age-selection"
            element={<ProtectedRoute><ProgramSelection /></ProtectedRoute>}
          />
          <Route path="/age-selection/games" element={<ProtectedRoute><AgeSelection /></ProtectedRoute>} />
          <Route path="/learn" element={<ProtectedRoute><LearnExplorer /></ProtectedRoute>} />

          <Route
            path="/age-selection/little-explore"
            element={<ProtectedRoute><LittleExplorer /></ProtectedRoute>}
          />

          <Route
            path="/age-selection/little-explore/math"
            element={<ProtectedRoute><Home /></ProtectedRoute>}
          />

          <Route
            path="/age-selection/little-explore/english"
            element={<ProtectedRoute><Home /></ProtectedRoute>}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/verification"
            element={<VerifyCard />}
          />

          <Route
            path="/quiz"
            element={<ProtectedRoute><Quiz /></ProtectedRoute>}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/leaderboard"
            element={<ProtectedRoute><LeaderBoard /></ProtectedRoute>}
          />

          <Route
            path="/profile"
            element={<ProtectedRoute><Profile /></ProtectedRoute>}
          />
          <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

          <Route
            path="/shop"
            element={<ProtectedRoute><Shop /></ProtectedRoute>}
          />

          <Route
            path="/notification"
            element={<ProtectedRoute><Notifications /></ProtectedRoute>}
          />
          <Route path="/levels" element={<ProtectedRoute><LevelSelection /></ProtectedRoute>} />
          <Route path="/play" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/daily-reward" element={<ProtectedRoute><DailyReward /></ProtectedRoute>} />
          <Route path="/airtime" element={<Navigate to="/shop?tab=airtime" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
