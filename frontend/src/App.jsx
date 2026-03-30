import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import LoginOTP from "./pages/LoginOTP";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PortfolioDetails from "./pages/PortfolioDetails";
import Nifty50PCA from "./pages/Nifty50PCA";
import PreciousMetalsPortfolio from "./pages/PreciousMetalsPortfolio";
import CryptoPortfolio from "./pages/CryptoPortfolio";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Welcome from "./pages/Welcome";
import PortfolioSelect from "./pages/PortfolioSelect";
import SentimentPortfolioSelect from "./pages/SentimentPortfolioSelect";
import SentimentStockSelect from "./pages/SentimentStockSelect";
import SentimentResult from "./pages/SentimentResult";
import QualityCheck from "./pages/QualityCheck";
import MainLayout from "./layouts/MainLayout";
import { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import API from "./services/api";

const PortfolioSync = ({ setActivePortfolio }) => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith("/dashboard/")) {
      const id = path.split("/")[2];
      if (id) {
        setActivePortfolio(id);
      }
      return;
    }

    if (path.startsWith("/portfolio/")) {
      const id = path.split("/")[2];
      if (id) {
        setActivePortfolio(id);
      }
      return;
    }

    if (path.startsWith("/sentiment/")) {
      const id = path.split("/")[2];
      if (id) {
        setActivePortfolio(id);
      }
      return;
    }

    if (path.startsWith("/quality-check/")) {
      const id = path.split("/")[2];
      if (id) {
        setActivePortfolio(id);
      }
    }
  }, [location, setActivePortfolio]);

  return null;
};

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem("user_id");
  if (!userId) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [portfolios, setPortfolios] = useState([]);
  const [activePortfolio, setActivePortfolio] = useState("");

  const fetchPortfolios = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return; // No auth, no portfolios

    try {
      const [portRes, sectorRes] = await Promise.all([
        API.get(`portfolios/?user_id=${userId}`),
        API.get('sector-portfolios/')
      ]);

      const combined = [...portRes.data, ...sectorRes.data];
      setPortfolios(combined);

      if (combined.length > 0 && !activePortfolio) {
        setActivePortfolio(combined[0].id);
      } else if (combined.length === 0) {
        setActivePortfolio(""); // Clear active if empty
      }
    } catch (err) {
      console.log("Error fetching portfolios: ", err);
    }
  };

  useEffect(() => {
    fetchPortfolios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshData = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <BrowserRouter>
      <PortfolioSync setActivePortfolio={setActivePortfolio} />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login-otp" element={<LoginOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={<Navigate to="/portfolios" replace />}
        />
        <Route
          path="/dashboard/:portfolioId"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <Dashboard portfolios={portfolios} refreshData={refreshData} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolios"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <PortfolioSelect portfolios={portfolios} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <Profile />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <Settings />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio/:id"
          element={
            <ProtectedRoute>
              <MainLayout
                refreshData={refreshData}
                portfolios={portfolios}
                activePortfolio={activePortfolio}
                setActivePortfolio={setActivePortfolio}
                fetchPortfolios={fetchPortfolios}
              >
                <PortfolioDetails key={`details-${refreshKey}-${activePortfolio}`} activePortfolio={activePortfolio} />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/nifty50-pca"
          element={
            <ProtectedRoute>
              <MainLayout
                refreshData={refreshData}
                portfolios={portfolios}
                activePortfolio={activePortfolio}
                setActivePortfolio={setActivePortfolio}
                fetchPortfolios={fetchPortfolios}
              >
                <Nifty50PCA />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/precious-metals"
          element={
            <ProtectedRoute>
              <MainLayout
                refreshData={refreshData}
                portfolios={portfolios}
                activePortfolio={activePortfolio}
                setActivePortfolio={setActivePortfolio}
                fetchPortfolios={fetchPortfolios}
              >
                <PreciousMetalsPortfolio />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/crypto-ai"
          element={
            <ProtectedRoute>
              <MainLayout
                refreshData={refreshData}
                portfolios={portfolios}
                activePortfolio={activePortfolio}
                setActivePortfolio={setActivePortfolio}
                fetchPortfolios={fetchPortfolios}
              >
                <CryptoPortfolio />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <Welcome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quality-check/:portfolioId"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <QualityCheck />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentiment"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <SentimentPortfolioSelect />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentiment/:portfolioId"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <SentimentStockSelect />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/sentiment/:portfolioId/:stockSymbol"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <SentimentResult />
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
