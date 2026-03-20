import Navbar from "../components/Navbar";

export default function MainLayout({ children, refreshData, portfolios, activePortfolio, setActivePortfolio, fetchPortfolios }) {
  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      {/* Background ambient glow */}
      <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

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
      </div>
    </div>
  );
}