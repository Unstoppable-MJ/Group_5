import NiftyPCAChart from "../components/NiftyPCAChart";

export default function Nifty50PCA() {
    return (
        <div className="space-y-8 pb-12 w-full max-w-7xl mx-auto">
            {/* Header section */}
            <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-sm font-bold tracking-widest text-indigo-400 uppercase mb-2">Predefined AI Portfolio</h2>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
                        NIFTY50 PCA Clustering Portfolio
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl">
                        A completely isolated environment analyzing the top 50 companies on the National Stock Exchange of India using cutting-edge Principal Component Analysis and K-Means Clustering.
                    </p>
                </div>
            </div>

            {/* PCA Chart Section */}
            <div className="w-full relative z-10 mt-6">
                <NiftyPCAChart />
            </div>
        </div>
    );
}
