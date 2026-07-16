import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const Background = lazy(() => import("./pages/background"));
const Login = lazy(() => import("./pages/auth/login"));
const Signup = lazy(() => import("./pages/auth/sign-up"));
const VerifyCard = lazy(() => import("./pages/auth/verification"));
const Quiz = lazy(() => import("./components/quiz/quiz"));
const AgeSelection = lazy(() => import("./pages/selection/ageSelection"));
const LeaderBoard = lazy(() => import("./pages/games/leaderboard"));
const Shop = lazy(() => import("./pages/games/shop"));
const ResetPassword = lazy(() => import("./pages/auth/resetPassword"));
const Profile = lazy(() => import("./pages/games/profile"));
const LittleExplorer = lazy(() => import("./pages/selection/LittleExploere"));
const Home = lazy(() => import("./pages/games/home"));
const ForgotPassword = lazy(() => import("./pages/auth/forgotPassword"));
const Notifications = lazy(() => import("./pages/games/notification"));
const NotFound = lazy(() => import("./pages/notFound"));
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="app-loading" role="status">Loading…</div>}>
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
            element={<AgeSelection />}
          />

          <Route
            path="/age-selection/little-explore"
            element={<LittleExplorer />}
          />

          <Route
            path="/age-selection/little-explore/math"
            element={<Home />}
          />

          <Route
            path="/age-selection/little-explore/english"
            element={<Home />}
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
            element={<Quiz />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/leaderboard"
            element={<LeaderBoard />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/shop"
            element={<Shop />}
          />

          <Route
            path="/notification"
            element={<Notifications />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
