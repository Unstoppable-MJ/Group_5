import Navbar from "../components/Navbar";
import Chatbot from "../components/Chatbot";
import AnimatedBackground from "../components/AnimatedBackground";

export default function MainLayout({ children, refreshData, portfolios, activePortfolio, setActivePortfolio, fetchPortfolios }) {
  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex flex-col h-full">
        <Navbar
          refreshData={refreshData}
          portfolios={portfolios}
          activePortfolio={activePortfolio}
          setActivePortfolio={setActivePortfolio}
          fetchPortfolios={fetchPortfolios}
        />
        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full mt-4">
          {children}
        </main>
        <Chatbot activePortfolio={activePortfolio} portfolios={portfolios} />
      </div>
    </div>
  );
}
