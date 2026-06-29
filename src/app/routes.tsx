import { createBrowserRouter } from "react-router";
import LandingPage from "./components/LandingPage";
import PractitionerDashboard from "./components/PractitionerDashboard";
import ProgressorDashboard from "./components/ProgressorDashboard";
import ParentDashboard from "./components/ParentDashboard";
import GameScreen from "./components/GameScreen";
import ResultScreen from "./components/ResultScreen";
import NotFound from "./components/NotFound";

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
    path: "*",
    Component: NotFound,
  },
]);

