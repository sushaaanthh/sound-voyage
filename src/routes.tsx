import { createBrowserRouter } from "react-router";
import LandingPage from "@/pages/LandingPage";
import PractitionerDashboard from "@/pages/PractitionerDashboard";
import ProgressorDashboard from "@/pages/ProgressorDashboard";
import ParentDashboard from "@/pages/ParentDashboard";
import GameScreen from "@/pages/GameScreen";
import ResultScreen from "@/pages/ResultScreen";
import UpdatePassword from "@/pages/UpdatePassword";
import NotFound from "@/pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/practitioner",
    Component: PractitionerDashboard,
  },
  {
    path: "/progressor/:progressorId",
    Component: ProgressorDashboard,
  },
  {
    path: "/parent",
    Component: ParentDashboard,
  },
  {
    path: "/parent/:progressorId",
    Component: ParentDashboard,
  },
  {
    path: "/game/:gameId/:level",
    Component: GameScreen,
  },
  {
    path: "/result",
    Component: ResultScreen,
  },
  {
    path: "/update-password",
    Component: UpdatePassword,
  },
  {
    path: "*",
    Component: NotFound,
  },
]);

