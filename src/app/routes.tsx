import { createBrowserRouter } from "react-router";
import LandingPage from "./components/LandingPage";
import PsychologistDashboard from "./components/PsychologistDashboard";
import PatientDashboard from "./components/PatientDashboard";
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
    path: "/patient/:patientId",
    Component: PatientDashboard,
  },
  {
    path: "/parent/:patientId",
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
