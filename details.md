# Project Details: Finova / ChatSense

This document encompasses the project's structure, features, workflow, tech stack, and file-level details based on the current implementation.

## 1. Features
- **Advanced Portfolio Management**:
  - Create and manage custom watchlists and portfolios.
  - Comparative analytics for real-time holdings comparison.
  - Dynamic visualizations using Recharts (Portfolio Growth, Value Matrices).
- **Explainable AI & Machine Learning**:
  - Predictive modeling short-term asset returns using `RandomForestRegressor`.
  - Global feature importance using `SHAP` to understand market drivers.
  - Local feature explanation using `LIME` for individual asset forecasts.
- **Dimensionality Reduction & Clustering**:
  - Group stocks into clusters based on multi-variable financial health via Multidimensional K-Means.
  - Reduce complex 6D feature spaces into actionable 2D scatter plots using PCA.
- **Predefined AI Portfolios**:
  - NIFTY50 AI Portfolio tracking top 50 Indian equities.
  - Precious Metals AI for deep-dive ML analysis on Gold and Silver ETFs.
- **Chatbot & AI Insights**:
  - AI-driven chatbot for financial insights and document retrieval (utilizing Gemini models and ChromaDB vector search).
- **Authentication**:
  - Secure user authentication, OTP capabilities, and user session management.

## 2. Workflow
The application follows a structured workflow for delivering AI-powered financial insights:
1. **User Request**: The user selects a portfolio or asks for AI analysis via the React frontend UI.
2. **API Call**: The React frontend sends asynchronous HTTP requests to the Django REST API in the backend.
3. **Data Collection**: The Django backend concurrently fetches live market data and historical prices via the `yfinance` library.
4. **Machine Learning Pipeline** (Inside `stocks/views.py`):
   - Computes features: Returns, Volatility, Momentum, P/E, Opportunity.
   - **Clustering**: Standardizes via `StandardScaler` + PCA and groups via K-Means.
   - **Prediction**: Imputes missing data and trains a `RandomForestRegressor`.
   - **Explainability**: Applies SHAP for global importance arrays and LIME for local tabular explanations.
5. **Serialization & Response**: The Django backend serializes the complex matrix payload (coordinates, predictions, LIME matrices) into JSON format.
6. **UI Rendering**: The React frontend consumes the JSON and orchestrates `Recharts` visualizations (Scatterplots, Area Charts, Bar Charts) giving the user dynamic, interactive insights.

## 3. Tech Stack
- **Frontend**: React.js (built with Vite), Tailwind CSS for styling, Recharts for Data Visualization, Framer Motion for animations, React Router for navigation.
- **Backend**: Python 3, Django REST Framework.
- **Data Engineering & ML**: `yfinance` (market data layer), `scikit-learn` (PCA, K-Means Clustering, RandomForest validation), `shap` & `lime` (Local & Global ML Explainability), `pandas` & `numpy` (dataframes and numerical operations).
- **Database Architecture**: SQLite3 (`db.sqlite3`) for relational models, ChromaDB (`chromadb_data`) for AI vector embeddings.
- **Additional Services**: `ngrok` for webhook testing / proxy tunneling.

## 4. Overall Directory Structure
```text
d:\Project_Intership\EDA\stock_project\
├── .env                     # Environment variables (API keys, DB credentials)
├── manage.py                # Django project management script
├── requirements.txt         # Python backend dependencies
├── db.sqlite3               # SQLite database file
├── README.md                # General project documentation
├── stock_project/           # Core Django settings wrapper
├── stocks/                  # Django App: ML, yfinance integration, and stock logic
├── portfolio/               # Django App: Handles user portfolios and watchlists
├── users/                   # Django App: Authentication (login, registration, OTP)
├── chatbot/                 # Django App: Generative AI, RAG & vector DB (ChromaDB) integrations
└── frontend/                # React Vite Application Root
    ├── package.json         # Node.js dependencies
    └── src/
        ├── components/      # Reusable React UI components (Charts, Buttons, etc.)
        ├── pages/           # React route views (Dashboard, Login, Portfolios)
        ├── services/        # API call utilities interface
        ├── layouts/         # UI layout wrappers (Navbar, Sidebar)
        ├── index.css        # Tailwind global directives
        ├── App.jsx          # Main React application entry & router setup
        └── main.jsx         # React DOM rendering entry
```

## 5. Detailed Breakdown: What Each File Includes

### Backend Component Files
* **`manage.py`**: The command-line utility for interacting with the Django project (running migrations, starting the dev server, running scripts).
* **`stock_project/settings.py`**: Contains all configuration parameters for the Django project (installed apps mapping, middleware configuration, database definition, CORS, template settings).
* **`stock_project/urls.py`**: Top-level API URL routing mapping domain paths to specific app URLs (`api/stocks/`, `api/users/`, etc.).
* **`stocks/views.py`**: **Core Logic Hub**. Contains the heavy lifting for fetching Yahoo Finance data, preprocessing pandas dataframes, running PCA coordinate reductions, K-Means clustering, Random Forest predictions, and generating the complex JSON payloads carrying LIME/SHAP explanations.
* **`stocks/models.py`**: Defines standard database models modeling stock abstractions, ticker definitions, and any sector caches.
* **`portfolio/models.py`**: Defines models for linking financial assets to user accounts (`Portfolio` entity, `Watchlist` entity).
* **`users/views.py` & `users/models.py`**: Manages the authentication layer extending Django's abstract user. Includes specific logic for handling Telegram OTP verifications and JWT/Session login flows.
* **`chatbot/views.py`**: Exposes the chatbot endpoints calling out to Gemini models utilizing ChromaDB for RAG context extraction.
* **`requirements.txt`**: Python manifest of pip packages. Explicitly demands `django`, `pandas`, `scikit-learn`, `shap`, `lime`, and `yfinance`.
* **Root Utility Scripts** (e.g., `seed_ai.py`, `populate_stocks.py`, `index_to_chroma.py`): Ad-hoc Python scripts created for migrating data, seeding the database, testing ML clustering (`test_cluster.py`), and dumping vectors to ChromaDB.

### Frontend Component Files (within `frontend/src/`)
* **`main.jsx`**: The React DOM bootstrap file where the entire application mounts to the HTML root node.
* **`App.jsx`**: The application shell housing the global contexts and React Router implementation linking path URLs to `<Page />` components.
* **`pages/`**: Holds top-level routing components (e.g., `CryptoPortfolio.jsx`, dashboard views). These represent fully constructed screens pulling in multiple widgets.
* **`components/`**: Modular, isolated UI blocks that construct views. 
  - *Example (`PEAnalysisChart.jsx`)*: Reusable charting components utilizing `Recharts` to inject props (like LIME matrix details or PCA coordinates) dynamically.
* **`services/`**: Abstracts HTTP logic (likely `axios` fetch calls) so business logic views don't couple directly with raw fetch APIs.
* **`index.css` & `App.css`**: Configures the underlying CSS architecture injecting Tailwind's `@tailwind base; @tailwind components; @tailwind utilities;`.
