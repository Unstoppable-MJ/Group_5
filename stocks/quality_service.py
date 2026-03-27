import logging
from typing import TypedDict

import numpy as np
import yfinance as yf
from langgraph.graph import END, START, StateGraph
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

from portfolio.models import Portfolio
from stocks.models import PortfolioStock, Stock, StockData

logger = logging.getLogger(__name__)


class QualityState(TypedDict, total=False):
    portfolio_id: str
    portfolio_name: str
    stocks: list
    top_stocks: list


def calculate_stock_metrics(current_price, max_price, pe_ratio):
    current_price = float(current_price) if current_price else 0.0
    max_price = float(max_price) if max_price and max_price > 0 else current_price
    pe_ratio = float(pe_ratio) if pe_ratio and pe_ratio > 0 else None

    discount_level = 0.0
    if max_price > 0 and current_price > 0:
        discount = ((max_price - current_price) / max_price) * 100
        discount_level = max(0, discount)

    calc_pe = pe_ratio if pe_ratio is not None else 15.0
    value_score = max(0.0, 100.0 - (calc_pe * 2.0))
    momentum_score = (current_price / max_price) * 100.0 if max_price > 0 else 50.0
    opportunity_score = (0.5 * discount_level) + (0.3 * momentum_score) + (0.2 * value_score)

    return round(discount_level, 2), round(opportunity_score, 2)


def clamp01(value):
    return max(0.0, min(1.0, float(value)))


def fetch_portfolio_stocks(portfolio_id):
    portfolio = Portfolio.objects.get(id=portfolio_id)
    portfolio_name = portfolio.name

    linked = list(PortfolioStock.objects.filter(portfolio=portfolio).select_related("stock"))
    if linked:
        stocks = []
        for entry in linked:
            cache_row = StockData.objects.filter(symbol=entry.stock.symbol).first()
            current_price = float(entry.current_price or 0)
            pe_ratio = float(entry.pe_ratio) if entry.pe_ratio is not None else None
            max_price = None

            if cache_row:
                if not current_price and cache_row.current_price is not None:
                    current_price = float(cache_row.current_price)
                if pe_ratio is None and cache_row.pe_ratio is not None:
                    pe_ratio = float(cache_row.pe_ratio)
                if cache_row.max_price_52w is not None:
                    max_price = float(cache_row.max_price_52w)

            if not current_price or pe_ratio is None or not max_price:
                hydrated = hydrate_market_metrics(entry.stock.symbol)
                current_price = current_price or hydrated["current_price"]
                pe_ratio = pe_ratio if pe_ratio is not None else hydrated["pe_ratio"]
                max_price = max_price or hydrated["max_price"]

            discount_level, opportunity = calculate_stock_metrics(current_price, max_price, pe_ratio)
            stocks.append({
                "symbol": entry.stock.symbol,
                "company_name": entry.stock.name,
                "sector": entry.stock.sector or "Unknown",
                "pe_ratio": pe_ratio,
                "discount_level": discount_level,
                "opportunity": opportunity,
                "current_price": current_price,
                "buy_price": float(entry.buy_price or 0),
            })
        return portfolio_name, stocks

    sector_name = portfolio_name.replace(" Portfolio", "").strip()
    sector_stocks = list(Stock.objects.filter(sector__iexact=sector_name).order_by("symbol")[:25])
    stocks = []
    for stock in sector_stocks:
        cache_row = StockData.objects.filter(symbol=stock.symbol).first()
        current_price = float(cache_row.current_price) if cache_row and cache_row.current_price is not None else 0.0
        max_price = float(cache_row.max_price_52w) if cache_row and cache_row.max_price_52w is not None else current_price
        pe_ratio = float(cache_row.pe_ratio) if cache_row and cache_row.pe_ratio is not None else None
        if not current_price or pe_ratio is None or not max_price:
            hydrated = hydrate_market_metrics(stock.symbol)
            current_price = current_price or hydrated["current_price"]
            max_price = max_price or hydrated["max_price"]
            pe_ratio = pe_ratio if pe_ratio is not None else hydrated["pe_ratio"]
        discount_level, opportunity = calculate_stock_metrics(current_price, max_price, pe_ratio)
        stocks.append({
            "symbol": stock.symbol,
            "company_name": stock.name,
            "sector": stock.sector or sector_name,
            "pe_ratio": pe_ratio,
            "discount_level": discount_level,
            "opportunity": opportunity,
            "current_price": current_price,
            "buy_price": 0.0,
        })
    return portfolio_name, stocks


def hydrate_market_metrics(symbol):
    current_price = 0.0
    max_price = 0.0
    pe_ratio = None

    try:
        ticker = yf.Ticker(symbol)
        history = ticker.history(period="1y")
        if not history.empty:
            current_price = float(history["Close"].iloc[-1])
            max_price = float(history["High"].max())

        try:
            pe_ratio = ticker.fast_info.get("trailing_pe", ticker.fast_info.get("forward_pe"))
        except Exception:
            pe_ratio = None

        if pe_ratio is None:
            try:
                info = ticker.info
                pe_ratio = info.get("trailingPE", info.get("forwardPE"))
            except Exception:
                pe_ratio = None
    except Exception as exc:
        logger.warning("Market metric hydration failed for %s: %s", symbol, exc)

    return {
        "current_price": float(current_price or 0.0),
        "max_price": float(max_price or current_price or 0.0),
        "pe_ratio": float(pe_ratio) if pe_ratio is not None else None,
    }


def fetch_sentiment(symbol, company_name):
    analyzer = SentimentIntensityAnalyzer()
    titles = []

    try:
        ticker = yf.Ticker(symbol)
        for item in getattr(ticker, "news", [])[:5]:
            title = item.get("title") or item.get("text") or item.get("headline")
            if title:
                titles.append(title)
    except Exception as exc:
        logger.warning("Ticker news fetch failed for %s: %s", symbol, exc)

    if not titles:
        try:
            results = yf.Search(f"{company_name} stock news")
            for item in getattr(results, "news", [])[:5]:
                title = item.get("title") or item.get("text") or item.get("headline")
                if title:
                    titles.append(title)
        except Exception as exc:
            logger.warning("Search news fetch failed for %s: %s", symbol, exc)

    if not titles:
        try:
            cleaned_symbol = symbol.replace(".NS", "").replace("-", " ")
            results = yf.Search(f"{cleaned_symbol} share price news")
            for item in getattr(results, "news", [])[:5]:
                title = item.get("title") or item.get("text") or item.get("headline")
                if title:
                    titles.append(title)
        except Exception as exc:
            logger.warning("Fallback symbol news fetch failed for %s: %s", symbol, exc)

    titles = list(dict.fromkeys(titles))[:5]
    if not titles:
        return {
            "sentiment_label": "No Data",
            "sentiment_score": 0.0,
            "sentiment_quality": 0.5,
            "headlines": [],
        }

    symbol_key = symbol.replace(".NS", "").replace("-", "").lower()
    company_tokens = [token.lower() for token in company_name.replace(".", " ").split() if len(token) > 2]
    filtered_titles = []
    for title in titles:
        title_key = title.lower().replace("-", "").replace("&", "")
        if symbol_key and symbol_key in title_key:
            filtered_titles.append(title)
            continue
        if any(token in title.lower() for token in company_tokens[:3]):
            filtered_titles.append(title)

    if filtered_titles:
        titles = filtered_titles[:5]

    scores = [analyzer.polarity_scores(title)["compound"] for title in titles]
    avg_score = float(sum(scores) / len(scores))
    if avg_score >= 0.05:
        label = "Positive"
    elif avg_score <= -0.05:
        label = "Negative"
    else:
        label = "Neutral"

    return {
        "sentiment_label": label,
        "sentiment_score": round(avg_score, 4),
        "sentiment_quality": clamp01((avg_score + 1) / 2),
        "headlines": titles,
    }


def normalize_scores(stocks):
    pe_values = [s["pe_ratio"] for s in stocks if s["pe_ratio"] is not None and s["pe_ratio"] > 0]
    disc_values = [float(s["discount_level"] or 0) for s in stocks]
    opp_values = [float(s["opportunity"] or 0) for s in stocks]

    pe_min, pe_max = (min(pe_values), max(pe_values)) if pe_values else (None, None)
    disc_min, disc_max = (min(disc_values), max(disc_values)) if disc_values else (0.0, 0.0)
    opp_min, opp_max = (min(opp_values), max(opp_values)) if opp_values else (0.0, 0.0)

    for stock in stocks:
        pe = stock["pe_ratio"]
        if pe is None or pe <= 0 or pe_min is None or pe_max == pe_min:
            pe_quality = 0.2
        else:
            pe_quality = 1 - ((pe - pe_min) / (pe_max - pe_min))

        if disc_max == disc_min:
            discount_quality = 0.5
        else:
            discount_quality = (float(stock["discount_level"] or 0) - disc_min) / (disc_max - disc_min)

        if opp_max == opp_min:
            opportunity_quality = 0.5
        else:
            opportunity_quality = (float(stock["opportunity"] or 0) - opp_min) / (opp_max - opp_min)

        stock["pe_quality"] = round(clamp01(pe_quality), 4)
        stock["discount_quality"] = round(clamp01(discount_quality), 4)
        stock["opportunity_quality"] = round(clamp01(opportunity_quality), 4)


def build_reason(stock):
    reasons = []
    if stock["pe_quality"] >= 0.66:
        reasons.append("attractive valuation versus peers")
    if stock["discount_quality"] >= 0.66:
        reasons.append("trading at a meaningful discount from recent highs")
    if stock["sentiment_quality"] >= 0.6:
        reasons.append("supportive recent news sentiment")
    if stock["cluster_quality"] >= 0.6:
        reasons.append("belongs to the portfolio's stronger quality cluster")

    if not reasons:
        reasons.append("balanced profile across valuation, discount, sentiment, and cluster fit")

    return f"{stock['company_name']} ranks well due to " + ", ".join(reasons) + "."


def run_quality_check(portfolio_id):
    def load_portfolio(state: QualityState):
        portfolio_name, stocks = fetch_portfolio_stocks(state["portfolio_id"])
        return {"portfolio_name": portfolio_name, "stocks": stocks}

    def enrich_sentiment(state: QualityState):
        enriched = []
        for stock in state["stocks"]:
            sentiment = fetch_sentiment(stock["symbol"], stock["company_name"])
            enriched.append({**stock, **sentiment})
        normalize_scores(enriched)
        return {"stocks": enriched}

    def cluster_stocks(state: QualityState):
        stocks = state["stocks"]
        if not stocks:
            return {"stocks": []}

        feature_rows = []
        for stock in stocks:
            feature_rows.append([
                float(stock["pe_quality"]),
                float(stock["discount_quality"]),
                float(stock["sentiment_quality"]),
                float(stock["opportunity_quality"]),
            ])

        if len(feature_rows) == 1:
            stocks[0]["cluster_label"] = 0
            stocks[0]["cluster_quality"] = 1.0
            return {"stocks": stocks}

        scaler = StandardScaler()
        scaled = scaler.fit_transform(np.array(feature_rows, dtype=float))
        unique_rows = np.unique(np.round(scaled, 6), axis=0)
        unique_count = len(unique_rows)

        if unique_count <= 1:
            for stock in stocks:
                stock["cluster_label"] = 0
                stock["cluster_quality"] = 0.75
            return {"stocks": stocks}

        k = min(3, len(feature_rows), unique_count)
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(scaled)
        centers = model.cluster_centers_

        cluster_scores = {}
        cluster_distances = {}
        for cluster_id in range(k):
            member_indexes = [idx for idx, label in enumerate(labels) if label == cluster_id]
            cluster_members = [stocks[idx] for idx in member_indexes]
            if not cluster_members:
                cluster_scores[cluster_id] = 0.5
                cluster_distances[cluster_id] = {}
                continue
            avg_score = np.mean([
                (member["pe_quality"] * 0.35)
                + (member["discount_quality"] * 0.25)
                + (member["sentiment_quality"] * 0.25)
                + (member["opportunity_quality"] * 0.15)
                for member in cluster_members
            ])
            cluster_scores[cluster_id] = float(avg_score)

            center = centers[cluster_id]
            distances = {}
            raw_distances = []
            for idx in member_indexes:
                dist = float(np.linalg.norm(scaled[idx] - center))
                distances[idx] = dist
                raw_distances.append(dist)

            max_dist = max(raw_distances) if raw_distances else 0.0
            min_dist = min(raw_distances) if raw_distances else 0.0
            normalized = {}
            for idx, dist in distances.items():
                if max_dist == min_dist:
                    normalized[idx] = 1.0
                else:
                    normalized[idx] = 1 - ((dist - min_dist) / (max_dist - min_dist))
            cluster_distances[cluster_id] = normalized

        for idx, stock in enumerate(stocks):
            label = int(labels[idx])
            stock["cluster_label"] = label
            proximity_score = cluster_distances.get(label, {}).get(idx, 0.5)
            stock["cluster_quality"] = round(
                (cluster_scores[label] * 0.65) + (float(proximity_score) * 0.35),
                4,
            )

        return {"stocks": stocks}

    def rank_stocks(state: QualityState):
        ranked = []
        for stock in state["stocks"]:
            quality_score = (
                stock["pe_quality"] * 0.35
                + stock["discount_quality"] * 0.25
                + stock["sentiment_quality"] * 0.25
                + stock["cluster_quality"] * 0.15
            )
            stock["quality_score"] = round(float(quality_score) * 100, 2)
            stock["reason"] = build_reason(stock)
            ranked.append(stock)

        ranked.sort(key=lambda item: item["quality_score"], reverse=True)
        return {"stocks": ranked, "top_stocks": ranked[:3]}

    workflow = StateGraph(QualityState)
    workflow.add_node("load_portfolio", load_portfolio)
    workflow.add_node("enrich_sentiment", enrich_sentiment)
    workflow.add_node("cluster_stocks", cluster_stocks)
    workflow.add_node("rank_stocks", rank_stocks)
    workflow.add_edge(START, "load_portfolio")
    workflow.add_edge("load_portfolio", "enrich_sentiment")
    workflow.add_edge("enrich_sentiment", "cluster_stocks")
    workflow.add_edge("cluster_stocks", "rank_stocks")
    workflow.add_edge("rank_stocks", END)

    app = workflow.compile()
    final_state = app.invoke({"portfolio_id": str(portfolio_id)})

    return {
        "portfolio_name": final_state.get("portfolio_name"),
        "evaluated_count": len(final_state.get("stocks", [])),
        "top_stocks": final_state.get("top_stocks", []),
        "all_stocks": final_state.get("stocks", []),
        "methodology": {
            "weights": {
                "pe_quality": 0.35,
                "discount_quality": 0.25,
                "sentiment_quality": 0.25,
                "cluster_quality": 0.15,
            },
            "engine": "LangGraph",
        },
    }
