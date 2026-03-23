# ChatSense - Intelligent Stock Analysis & Prediction Platform

ChatSense is a comprehensive, AI-driven stock portfolio management and analysis platform. It combines a robust Django backend with a sleek React frontend to deliver advanced financial insights, predictive modeling, and machine learning explainability.

## 🔄 System Architecture & Workflow

### Architectural Flow (Text Representation)
1. **[User UI]** ➡️ Selects Portfolio or triggers AI Analysis
2. **[React Frontend]** ➡️ Sends asynchronous HTTP requests to the Django REST API
3. **[Django Backend]** ➡️ Spawns Concurrent Threads to `yfinance`
4. **[Yahoo Finance API]** ➡️ Returns Live Market Data + 1-Year Historical Prices
5. **[Machine Learning Pipeline]**:
    - Calculates Features: *Returns, Volatility, Momentum, P/E, Opportunity*
    - **Clustering**: Standardizes via `PCA` ➡️ Groups via `K-Means`.
    - **Predictive**: Imputes missing data ➡️ Trains `RandomForestRegressor`.
    - **Explainability**: Generates `SHAP` Global Arrays ➡️ Runs `LIME` tabular explainer.
6. **[Django Backend]** ➡️ Serializes Matrix Payload to JSON
7. **[React Frontend]** ➡️ Renders stateful `Recharts` UI (Scatterplots, Area Charts, Bar Charts)

## 🔄 Complete System Workflow

```mermaid
flowchart TD
    %% Define styles for different phases
    classDef initiation fill:#e0f2fe,stroke:#0284c7,stroke-width:2px,color:#0f172a
    classDef planning fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#0f172a
    classDef execution fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#0f172a
    classDef deployment fill:#ffedd5,stroke:#ea580c,stroke-width:2px,color:#0f172a

    %% 1. Project Initiation & Planning
    A([Project Initialization]) :::initiation --> B[Requirement Gathering] :::planning
    B --> C[System Design] :::planning

    %% 2. Data Pipeline
    C --> D[(Data Collection\nusing YFinance API)] :::execution
    D --> E[Data Preprocessing] :::execution
    E --> F[Feature Engineering] :::execution

    %% 3. Machine Learning Core
    F --> G{Machine Learning\nProcessing} :::execution
    
    G -->|Predictive Modeling| H[Linear Regression & RF\nfor Stock Prediction] :::execution
    G -->|Dimensionality Reduction| I[PCA Dimensionality\nReduction] :::execution
    G -->|Asset Grouping| J[K-Means Clustering] :::execution

    %% 4. Explainability Layer
    H --> K[Explainability Layer\nusing SHAP and LIME] :::execution

    %% 5. Visualization & UI
    I --> L[Visualization Layer\nPortfolio Growth, Value Matrix,\nPrediction Graphs] :::execution
    J --> L
    K --> L
    L --> M[[Interactive Dashboard]] :::execution

    %% 6. Deployment & Maintenance
    M --> N{Deployment} :::deployment
    N --> O([Maintenance and Updates]) :::deployment
```

## �🚀 Key Features

### 📊 Advanced Portfolio Management
* **User Portfolios:** Create and manage custom watchlists and portfolios.
* **Comparative Analytics:** Real-time holdings comparison and performance tracking.
* **Dynamic Visualizations:** Interactive charts powered by `Recharts` for Portfolio Growth and Value Matrices.

### 🤖 Explainable AI & Machine Learning
* **Predictive Modeling:** Utilizes `RandomForestRegressor` to forecast short-term asset returns based on historical volatility, momentum, and P/E metrics.
* **SHAP Global Importance:** Understand which financial metrics (e.g., Returns, Momentum, Opportunity Score) are driving the AI's predictions globally across the market.
* **LIME Local Explanations:** Dive deep into individual assets (e.g., Newmont Corp) to see exactly which features positively or negatively contributed to its specific forecast.

### 🧬 Dimensionality Reduction & Clustering
* **Multidimensional K-Means:** AI automatically groups stocks into clusters based on multi-variable financial health.
* **PCA (Principal Component Analysis):** Reduces complex 6D feature spaces into an actionable 2D scatter plot for the NIFTY 50 index.
* **Predefined AI Portfolios:** 
  * ⚡ **NIFTY50 AI Portfolio:** Real-time PCA clustering and valuation tracking for the top 50 Indian equities.
  * 🥇 **Precious Metals AI:** Deep-dive ML analysis (SHAP & LIME) on ~40 top-performing Gold and Silver ETFs/Miners.

---

## 📸 Screenshots

### Frontend Interface
*Place your frontend architectural and dashboard screenshots in the `docs/screenshots/` folder.*

![Dashboard & Portfolio View](docs/screenshots/frontend_dashboard.png)
> *The main portfolio tracking dashboard featuring Recharts visualizations and Framer Motion animations.*

![Machine Learning Explainability](docs/screenshots/frontend_ml_lime.png)
> *The AI Analysis view rendering SHAP global feature importance and LIME local explanations for Precious Metals.*

### Backend API & Architecture
*Place your backend terminal or API response screenshots in the `docs/screenshots/` folder.*

![Django REST API Response](docs/screenshots/backend_api_response.png)
> *The backend JSON payloads delivering live yfinance scraped data, PCA coordinates, and LIME matrices.*

---

## 🛠️ Technology Stack

**Frontend:**
* React.js (Vite)
* Tailwind CSS (Styling & Glassmorphism)
* Recharts (Data Visualization)
* Framer Motion (Animations)
* React Router (Navigation)

**Backend:**
* Python / Django REST Framework
* `yfinance` (Live Market Data)
* `scikit-learn` (PCA, K-Means Clustering, Random Forests)
* `shap` & `lime` (Local & Global ML Explainability)
* Pandas & NumPy (Data Engineering)

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/finova.git
cd finova
```

### 2. Backend Setup (Django)
```bash
# Navigate to the backend directory
cd stock_project

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
# Ensure ML libraries are installed: pip install scikit-learn pandas numpy yfinance shap lime

# Run migrations and start server
python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (React)
```bash
# Navigate to the frontend directory
cd stock_project/frontend

# Install node modules
npm install

# Start the development server
npm run dev
```

---

## 🧠 Application Architecture

1. **Data Ingestion:** The Django backend intercepts frontend API requests and concurrently scrapes live 1-year historical pricing and `.info` data via Yahoo Finance.
2. **Feature Engineering:** Raw data is converted into actionable metrics: Annual Returns, Volatility, Momentum (6-mo), P/E Ratios, and Opportunity Scores.
3. **Machine Learning Pipeline:** 
   - Data is imputed, scaled (`StandardScaler`), and passed through Scikit-Learn pipelines.
   - Clustering logic (`PCA` + `KMeans`) and Predictive logic (`RandomForestRegressor` + `SHAP` + `LIME`) are executed completely in-memory.
4. **Client Rendering:** Complex mathematical matrices are serialized to JSON and delivered to the React frontend where they are visualized via declarative Recharts components.
