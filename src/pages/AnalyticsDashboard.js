import React, { useState, useEffect } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { localStorageService } from '../services/localStorage';
import './AnalyticsDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const currencies = {
  USD: '$',
  THB: '฿',
  MMK: 'Ks'
};

const AnalyticsDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedTransactions = localStorageService.getTransactions();
    setTransactions(loadedTransactions);
  };

  const groupByCurrency = (list) => {
    return list.reduce((acc, t) => {
      const currency = t.currency || 'USD';
      if (!acc[currency]) acc[currency] = 0;
      acc[currency] += t.amount;
      return acc;
    }, {});
  };

  const formatCurrency = (amount, currency) => {
    const symbol = currencies[currency] || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getFilteredTransactions = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    switch (timeFilter) {
      case 'daily':
        return transactions.filter(t => new Date(t.date).toDateString() === today.toDateString());
      case 'weekly':
        return transactions.filter(t => new Date(t.date) >= startOfWeek);
      case 'monthly':
        return transactions.filter(t => t.date.startsWith(selectedMonth));
      default:
        return transactions;
    }
  };

  const getLineChartData = () => {
    const filtered = getFilteredTransactions();
    const dailyTotals = {};
    filtered.forEach(t => {
      const date = t.date;
      if (!dailyTotals[date]) dailyTotals[date] = 0;
      dailyTotals[date] += t.amount;
    });
    const sortedDates = Object.keys(dailyTotals).sort();
    const amounts = sortedDates.map(date => dailyTotals[date]);

    return {
      labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Spending (Mixed Currency)',
          data: amounts,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  const getPieChartData = () => {
    const filtered = getFilteredTransactions();
    const categoryTotals = {};
    filtered.forEach(t => {
      const key = `${t.category} (${t.currency || 'USD'})`;
      if (!categoryTotals[key]) categoryTotals[key] = 0;
      categoryTotals[key] += t.amount;
    });

    const labels = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#8A2BE2', '#7FFF00', '#DC143C', '#00CED1'
    ];

    return {
      labels,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  const categorySummary = () => {
    const summary = {};
    getFilteredTransactions().forEach(t => {
      const key = `${t.category} (${t.currency || 'USD'})`;
      if (!summary[key]) summary[key] = { total: 0, count: 0, currency: t.currency };
      summary[key].total += t.amount;
      summary[key].count += 1;
    });
    return Object.entries(summary).map(([cat, data]) => ({ category: cat, ...data })).sort((a, b) => b.total - a.total);
  };

  const allTimeTotals = groupByCurrency(transactions);
  const monthTotals = groupByCurrency(transactions.filter(t => t.date.startsWith(selectedMonth)));
  const filteredTotals = groupByCurrency(getFilteredTransactions());

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-container">
        <h2>Analytics Dashboard</h2>

        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card">
            <h3>Total Spending (All Time)</h3>
            {Object.entries(allTimeTotals).map(([currency, amount]) => (
              <div key={currency}>{formatCurrency(amount, currency)}</div>
            ))}
            <div className="subtitle">{transactions.length} transactions</div>
          </div>

          <div className="summary-card">
            <h3>Total Spending (Selected Month)</h3>
            {Object.entries(monthTotals).map(([currency, amount]) => (
              <div key={currency}>{formatCurrency(amount, currency)}</div>
            ))}
            <div className="subtitle">{transactions.filter(t => t.date.startsWith(selectedMonth)).length} transactions</div>
          </div>

          <div className="summary-card">
            <h3>Total for Filtered Period</h3>
            {Object.entries(filteredTotals).map(([currency, amount]) => (
              <div key={currency}>{formatCurrency(amount, currency)}</div>
            ))}
            <div className="subtitle">{getFilteredTransactions().length} transactions</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="timeFilter">View by:</label>
            <select id="timeFilter" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="monthSelect">Select Month:</label>
            <input
              type="month"
              id="monthSelect"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-section">
          <div className="chart-container">
            <div className="chart-card">
              <Line data={getLineChartData()} options={{ responsive: true }} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-card">
              <Pie data={getPieChartData()} options={{ responsive: true }} />
            </div>
          </div>
        </div>

        {/* Category Summary */}
        <div className="category-summary">
          <h3>Category Breakdown</h3>
          {categorySummary().length === 0 ? (
            <p>No spending data for the selected period.</p>
          ) : (
            categorySummary().map((item, index) => (
              <div key={index} className="category-item">
                <div className="category-info">
                  <div className="category-name">{item.category}</div>
                  <div className="category-count">{item.count} transactions</div>
                </div>
                <div className="category-amount">{formatCurrency(item.total, item.currency)}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
