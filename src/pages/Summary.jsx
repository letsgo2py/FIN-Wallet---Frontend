import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import Toast from "./Toast";
import "./Summary.css";

function Summary() {
  const [summary, setSummary] = useState({
    overview: {
      totalIncome: 0,
      totalExpenses: 0,
      netBalance: 0,
    },
    categoryWiseTotals: [],
    recentActivity: [],
    monthlyTrends: [],
    weeklyTrends: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const showToast = (message, type = "error") => {
    setToast({
      show: true,
      message,
      type,
    });

    setTimeout(() => {
      setToast({
        show: false,
        message: "",
        type: "error",
      });
    }, 4000);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");

        const res = await fetch("http://localhost:5000/api/transactions/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          showToast(data.message || "Failed to load summary", "error");
          return;
        }

        setSummary(data);
      } catch (error) {
        console.error("Error fetching summary:", error);
        showToast("Something went wrong while loading summary", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value || 0);

  const formatDate = (value) => {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
      return value;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const renderTrendItems = (items, emptyText) => {
    if (!items.length) {
      return <div className="summary-empty">{emptyText}</div>;
    }

    return items.map((item) => (
      <div key={item.period} className="trend-row">
        <div className="trend-period">{item.period}</div>
        <div className="trend-values">
          <span className="trend-income">In: {formatCurrency(item.income)}</span>
          <span className="trend-expense">Out: {formatCurrency(item.expense)}</span>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Toast message={toast.message} type={toast.type} show={toast.show} />
      <Navbar />

      <div className="summary-page">
        <div className="summary-header">
          <div>
            <h1 className="summary-title">Financial Summary</h1>
            <p className="summary-subtitle">
              A quick snapshot of income, expenses, trends, and recent activity.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="summary-loading">Loading summary...</div>
        ) : (
          <>
            <div className="summary-cards">
              <div className="summary-card income-card">
                <div className="card-label">Total Income</div>
                <div className="card-value">
                  {formatCurrency(summary.overview.totalIncome)}
                </div>
              </div>

              <div className="summary-card expense-card">
                <div className="card-label">Total Expenses</div>
                <div className="card-value">
                  {formatCurrency(summary.overview.totalExpenses)}
                </div>
              </div>

              <div className="summary-card balance-card">
                <div className="card-label">Net Balance</div>
                <div className="card-value">
                  {formatCurrency(summary.overview.netBalance)}
                </div>
              </div>
            </div>

            <div className="summary-grid">
              <section className="summary-panel">
                <div className="panel-title">Category Wise Totals</div>
                {summary.categoryWiseTotals.length === 0 ? (
                  <div className="summary-empty">No category data available.</div>
                ) : (
                  <div className="category-list">
                    {summary.categoryWiseTotals.map((item) => (
                      <div key={item.category} className="category-row">
                        <div className="category-name">{item.category}</div>
                        <div className="category-values">
                          <span className="trend-income">
                            In: {formatCurrency(item.income)}
                          </span>
                          <span className="trend-expense">
                            Out: {formatCurrency(item.expense)}
                          </span>
                          <span className="category-total">
                            Total: {formatCurrency(item.total)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="summary-panel">
                <div className="panel-title">Recent Activity</div>
                {summary.recentActivity.length === 0 ? (
                  <div className="summary-empty">No recent transactions found.</div>
                ) : (
                  <div className="activity-list">
                    {summary.recentActivity.map((item) => (
                      <div key={item.id} className="activity-row">
                        <div>
                          <div className="activity-category">{item.category}</div>
                          <div className="activity-date">{formatDate(item.date)}</div>
                        </div>
                        <div className={item.type === "INCOME" ? "trend-income" : "trend-expense"}>
                          {item.type === "INCOME" ? "+" : "-"} {formatCurrency(item.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="summary-panel">
                <div className="panel-title">Monthly Trends</div>
                <div className="trend-list">
                  {renderTrendItems(summary.monthlyTrends, "No monthly trend data available.")}
                </div>
              </section>

              <section className="summary-panel">
                <div className="panel-title">Weekly Trends</div>
                <div className="trend-list">
                  {renderTrendItems(summary.weeklyTrends, "No weekly trend data available.")}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default Summary;
