import { lazy, Suspense, type ReactNode } from "react";
import { createBrowserRouter } from "react-router";

import LandingPage from "@/pages/LandingPage";

const PractitionerDashboard = lazy(() => import("@/pages/PractitionerDashboard"));
const ProgressorDashboard = lazy(() => import("@/pages/ProgressorDashboard"));
const ParentDashboard = lazy(() => import("@/pages/ParentDashboard"));
const GameScreen = lazy(() => import("@/pages/GameScreen"));
const ResultScreen = lazy(() => import("@/pages/ResultScreen"));
const UpdatePassword = lazy(() => import("@/pages/UpdatePassword"));
const NotFound = lazy(() => import("@/pages/NotFound"));

function RouteFallback(): ReactNode {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
    </div>
  );
}

function LazyRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/practitioner",
    element: <LazyRoute component={PractitionerDashboard} />,
  },
  {
    path: "/progressor/:progressorId",
    element: <LazyRoute component={ProgressorDashboard} />,
  },
  {
    path: "/parent",
    element: <LazyRoute component={ParentDashboard} />,
  },
  {
    path: "/parent/:progressorId",
    element: <LazyRoute component={ParentDashboard} />,
  },
  {
    path: "/game/:gameId/:level",
    element: <LazyRoute component={GameScreen} />,
  },
  {
    path: "/result",
    element: <LazyRoute component={ResultScreen} />,
  },
  {
    path: "/update-password",
    element: <LazyRoute component={UpdatePassword} />,
  },
  {
    path: "*",
    element: <LazyRoute component={NotFound} />,
  },
]);

