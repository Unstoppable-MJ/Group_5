import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import PortfolioDetails from "./pages/PortfolioDetails";
import Nifty50PCA from "./pages/Nifty50PCA";
import PreciousMetalsPortfolio from "./pages/PreciousMetalsPortfolio";
import CryptoPortfolio from "./pages/CryptoPortfolio";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SentimentPortfolioSelect from "./pages/SentimentPortfolioSelect";
import SentimentStockSelect from "./pages/SentimentStockSelect";
import SentimentResult from "./pages/SentimentResult";
import MainLayout from "./layouts/MainLayout";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import API from "./services/api";

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

  const fetchPortfolios = () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return; // No auth, no portfolios

    API.get(`portfolios/?user_id=${userId}`)
      .then((res) => {
        setPortfolios(res.data);
        if (res.data.length > 0 && !activePortfolio) {
          setActivePortfolio(res.data[0].id);
        } else if (res.data.length === 0) {
          setActivePortfolio(""); // Clear active if empty
        }
      })
      .catch((err) => console.log(err));
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
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout portfolios={portfolios} activePortfolio={activePortfolio} setActivePortfolio={setActivePortfolio} refreshData={refreshData} fetchPortfolios={fetchPortfolios}>
                <Dashboard portfolios={portfolios} activePortfolio={activePortfolio} refreshData={refreshData} />
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