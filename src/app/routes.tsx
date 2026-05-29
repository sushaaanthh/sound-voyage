import { createBrowserRouter } from "react-router";
import LandingPage from "./components/LandingPage";
import PsychologistDashboard from "./components/PsychologistDashboard";
import ExplorerDashboard from "./components/ExplorerDashboard";
import ParentDashboard from "./components/ParentDashboard";
import GameScreen from "./components/GameScreen";
import ResultScreen from "./components/ResultScreen";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/psychologist",
    Component: PsychologistDashboard,
  },
  {
    path: "/explorer/:explorerId",
    Component: ExplorerDashboard,
  },
  {
    path: "/parent/:explorerId",
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
]);
