import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Demands from "./pages/Demands";
import Missions from "./pages/Missions";
import Planning from "./pages/Planning";
import Chauffeurs from "./pages/Chauffeurs";
import Vehicles from "./pages/Vehicles";
import Clients from "./pages/Clients";
import Quotes from "./pages/Quotes";
import Alerts from "./pages/Alerts";
import Reporting from "./pages/Reporting";
import ClientPortal from "./pages/ClientPortal";
import CreateDemand from "./pages/CreateDemand";
import DemandDetail from "./pages/DemandDetail";
import Settings from "./pages/Settings";
import Search from "./pages/Search";
import Payments from "./pages/Payments";
import Reviews from "./pages/Reviews";
import Invoices from "./pages/Invoices";
import GPSTracking from "./pages/GPSTracking";
import APIDocumentation from "./pages/APIDocumentation";
import Support from "./pages/Support";
import PromoCodes from "./pages/PromoCodes";
import Chat from "./pages/Chat";
import History from "./pages/History";
import Bonuses from "./pages/Bonuses";
import CreateMission from "./pages/CreateMission";
import CreateChauffeur from "./pages/CreateChauffeur";
import CreateVehicle from "./pages/CreateVehicle";
import CreateClient from "./pages/CreateClient";
import CreateQuote from "./pages/CreateQuote";
import AuditTrail from "./pages/AuditTrail";
import Webhooks from "./pages/Webhooks";
import MissionDetail from "./pages/MissionDetail";
import ChauffeurDetail from "./pages/ChauffeurDetail";
import VehicleDetail from "./pages/VehicleDetail";
import ClientDetail from "./pages/ClientDetail";
import QuoteDetail from "./pages/QuoteDetail";
import LandingPage from "./pages/LandingPage";
import BookingForm from "./pages/BookingForm";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

function Router() {
  return (
    <Switch>
      {/* Public pages */}
      <Route path={"/"} component={LandingPage} />
      <Route path={"/login"} component={LoginPage} />
      <Route path={"/register"} component={RegisterPage} />
      <Route path={"/booking"} component={BookingForm} />
      <Route path={"/home"} component={Home} />

      {/* Admin dashboard */}
      <Route path={"/dashboard"} component={Dashboard} />

      {/* Demands */}
      <Route path={"/demands"} component={Demands} />
      <Route path={"/demands/new"} component={CreateDemand} />
      <Route path={"/demands/:id"} component={DemandDetail} />

      {/* Missions */}
      <Route path={"/missions"} component={Missions} />
      <Route path={"/missions/new"} component={CreateMission} />
      <Route path={"/missions/:id"} component={MissionDetail} />

      {/* Quotes */}
      <Route path={"/quotes"} component={Quotes} />
      <Route path={"/quotes/new"} component={CreateQuote} />
      <Route path={"/quotes/:id"} component={QuoteDetail} />

      {/* Chauffeurs */}
      <Route path={"/chauffeurs"} component={Chauffeurs} />
      <Route path={"/chauffeurs/new"} component={CreateChauffeur} />
      <Route path={"/chauffeurs/:id"} component={ChauffeurDetail} />

      {/* Vehicles */}
      <Route path={"/vehicles"} component={Vehicles} />
      <Route path={"/vehicles/new"} component={CreateVehicle} />
      <Route path={"/vehicles/:id"} component={VehicleDetail} />

      {/* Clients */}
      <Route path={"/clients"} component={Clients} />
      <Route path={"/clients/new"} component={CreateClient} />
      <Route path={"/clients/:id"} component={ClientDetail} />

      {/* Other modules */}
      <Route path={"/planning"} component={Planning} />
      <Route path={"/alerts"} component={Alerts} />
      <Route path={"/reporting"} component={Reporting} />
      <Route path={"/client-portal"} component={ClientPortal} />
      <Route path={"/settings"} component={Settings} />
      <Route path={"/search"} component={Search} />
      <Route path={"/payments"} component={Payments} />
      <Route path={"/reviews"} component={Reviews} />
      <Route path={"/invoices"} component={Invoices} />
      <Route path={"/gps-tracking"} component={GPSTracking} />
      <Route path={"/api-documentation"} component={APIDocumentation} />
      <Route path={"/support"} component={Support} />
      <Route path={"/promo-codes"} component={PromoCodes} />
      <Route path={"/chat"} component={Chat} />
      <Route path={"/history"} component={History} />
      <Route path={"/bonuses"} component={Bonuses} />
      <Route path={"/audit-trail"} component={AuditTrail} />
      <Route path={"/webhooks"} component={Webhooks} />

      {/* Legacy routes (backward compat) */}
      <Route path={"/create-mission"} component={CreateMission} />
      <Route path={"/create-chauffeur"} component={CreateChauffeur} />
      <Route path={"/create-vehicle"} component={CreateVehicle} />
      <Route path={"/create-client"} component={CreateClient} />
      <Route path={"/mission/:id"} component={MissionDetail} />
      <Route path={"/chauffeur/:id"} component={ChauffeurDetail} />
      <Route path={"/vehicle/:id"} component={VehicleDetail} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
