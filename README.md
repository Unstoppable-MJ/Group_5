 # ChatSense - Intelligent Stock Analysis & Prediction Platform

ChatSense is a comprehensive, AI-driven stock portfolio management and analysis platform. It combines a robust Django backend with a sleek React frontend to deliver advanced financial insights, predictive modeling, and machine learning explainability.

---

## 📸 Project Showcase
## Login Page 
<img width="1888" height="853" alt="image" src="https://github.com/user-attachments/assets/b2354152-7f13-4b46-9965-636faf68645f" />

## Forgot Password Feature using telegram bot

<img width="1912" height="972" alt="image" src="https://github.com/user-attachments/assets/e578836a-1692-443a-83fd-a7e6116f1f84" />

## Welcome Page

<img width="1912" height="964" alt="image" src="https://github.com/user-attachments/assets/b12cd070-73da-4002-a9d8-d0581f956022" />

## Nifty 200 India stocks portfolio 

<img width="1915" height="971" alt="image" src="https://github.com/user-attachments/assets/6afdbe4a-7eae-4d37-a6d3-63d39bfdcc5b" />

<img width="1919" height="974" alt="image" src="https://github.com/user-attachments/assets/31640920-4dde-47a6-b501-10b128a72caa" />

## Nifty 200 USA stocks portfolio

<img width="1910" height="967" alt="image" src="https://github.com/user-attachments/assets/099d26a8-a709-4d4a-b540-eec29eec302e" />

## Portfolio Overview

<img width="1919" height="977" alt="image" src="https://github.com/user-attachments/assets/170fb178-dfe7-44e4-a568-6226e444f92d" />
<img width="1919" height="680" alt="image" src="https://github.com/user-attachments/assets/8a5302ed-76c3-4903-bbaa-28a180ebaaf7" />
<img width="1903" height="952" alt="image" src="https://github.com/user-attachments/assets/abc40386-66ca-4e8d-a830-c4b2b3828d3e" />

## Forecasting

<img width="1908" height="960" alt="image" src="https://github.com/user-attachments/assets/0c80f38f-2bf2-4556-a230-8b9beb7bb106" />

## Using Different models

<img width="1889" height="954" alt="image" src="https://github.com/user-attachments/assets/9b817ddf-92e2-4046-ac23-7eba04d05377" />

## Metric Evalution of each model

<img width="1892" height="928" alt="image" src="https://github.com/user-attachments/assets/eeba4ae9-be8b-409f-a4c5-94ec68727b75" />

## Portfolio Details

<img width="1919" height="969" alt="image" src="https://github.com/user-attachments/assets/1ad64c40-d9c7-426a-a086-c5d535d56897" />

## K-means Clustring

<img width="1912" height="964" alt="image" src="https://github.com/user-attachments/assets/46f5dc12-79cf-44b4-98e4-17d0343719e0" />
<img width="1919" height="956" alt="image" src="https://github.com/user-attachments/assets/5e581658-3f1a-4603-9e20-ae063a9e6658" />

## Sentimatnt Analysis

<img width="1920" height="954" alt="image" src="https://github.com/user-attachments/assets/904204d2-824c-47c0-ad11-d5e050c45e28" />
<img width="1919" height="963" alt="image" src="https://github.com/user-attachments/assets/6fff6ad2-2499-4d21-81db-9e9dc5457891" />
<img width="1915" height="972" alt="image" src="https://github.com/user-attachments/assets/17d0d081-33ad-409d-9bf2-ab71e304bc07" />
<img width="1919" height="896" alt="image" src="https://github.com/user-attachments/assets/d7205219-c840-44c5-9d4d-40e4a77e5528" />

## AI review on sentiment analysis

<img width="1915" height="965" alt="image" src="https://github.com/user-attachments/assets/9542115a-f671-4f1c-9979-39261dc1673e" />

## Chatbot features

<img width="539" height="765" alt="image" src="https://github.com/user-attachments/assets/e4cc28f3-ba9c-470e-a0e7-d7240c957971" />
<img width="544" height="768" alt="image" src="https://github.com/user-attachments/assets/8a832efd-8256-4bc7-ac99-0f207fd1b3c5" />
<img width="541" height="771" alt="image" src="https://github.com/user-attachments/assets/6687ca69-f653-49fc-b39f-598e3fc91cf8" />

## Quality Analysis

<img width="1919" height="965" alt="image" src="https://github.com/user-attachments/assets/4c592aeb-9e6e-4a2f-87c4-9833f3b04a30" />
<img width="1901" height="970" alt="image" src="https://github.com/user-attachments/assets/6c5748ee-ea8d-45eb-9d66-149263c8c5e1" />
<img width="1900" height="915" alt="image" src="https://github.com/user-attachments/assets/b8fbf533-c2f5-4721-afbb-5c5d0206388d" />

## 🚀 Key Features

- **Advanced Portfolio Management:** Create and manage custom watchlists with real-time performance tracking.
- **Explainable AI (XAI):** Uses `SHAP` and `LIME` to explain why the AI model makes specific stock predictions.
- **Dimensionality Reduction:** Visualizes complex 6D financial data in 2D using `PCA` and `K-Means` clustering.
- **Live Market Data:** Real-time integration with `yfinance` for up-to-the-minute stock metrics.
- **Interactive Visualizations:** Beautifully rendered charts using `Recharts` and smooth animations with `Framer Motion`.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (or SQLite for local development)

### 2. Backend Setup
```bash
# Navigate to project root
cd stock_project

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run migrations & start server
python manage.py migrate
python manage.py runserver 8004
```

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install modules
npm install

# Start development server
npm run dev
```

---

## 🛠️ Technology Stack

**Frontend:** `React.js (Vite)`, `Tailwind CSS`, `Recharts`, `Framer Motion`, `Axios`  
**Backend:** `Django REST Framework`, `yfinance`, `scikit-learn`  
**AI/ML:** `SHAP`, `LIME`, `PCA`, `K-Means`, `RandomForestRegressor`  

---

## 📁 Directory Structure
```text
stock_project/
├── docs/
│   └── screenshots/     <-- PUT YOUR SCREENSHOTS HERE
├── frontend/            <-- React Application
├── stock_project/       <-- Django Project Settings
├── stocks/              <-- Stock Analysis App
├── chatbot/             <-- AI Chat System
└── manage.py
```
