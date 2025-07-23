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

const AnalyticsDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('monthly'); // daily, weekly, monthly
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedTransactions = localStorageService.getTransactions();
    setTransactions(loadedTransactions);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate total spending for all time
  const totalAllTime = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);

  // Calculate total spending for selected month
  const totalSelectedMonth = transactions
    .filter(transaction => transaction.date.startsWith(selectedMonth))
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  // Filter transactions based on time filter and selected month
  const getFilteredTransactions = () => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

    switch (timeFilter) {
      case 'daily':
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startOfToday;
        });
      case 'weekly':
        return transactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return transactionDate >= startOfWeek;
        });
      case 'monthly':
        return transactions.filter(transaction => 
          transaction.date.startsWith(selectedMonth)
        );
      default:
        return transactions;
    }
  };

  // Generate line chart data
  const getLineChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    const groupedData = {};

    // Group transactions by date
    filteredTransactions.forEach(transaction => {
      const date = transaction.date;
      if (!groupedData[date]) {
        groupedData[date] = 0;
      }
      groupedData[date] += transaction.amount;
    });

    // Sort dates and create chart data
    const sortedDates = Object.keys(groupedData).sort();
    const amounts = sortedDates.map(date => groupedData[date]);

    return {
      labels: sortedDates.map(date => new Date(date).toLocaleDateString()),
      datasets: [
        {
          label: 'Daily Spending',
          data: amounts,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
        },
      ],
    };
  };

  // Generate pie chart data for categories
  const getPieChartData = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryTotals = {};

    filteredTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = 0;
      }
      categoryTotals[transaction.category] += transaction.amount;
    });

    const categories = Object.keys(categoryTotals);
    const amounts = Object.values(categoryTotals);

    // Generate colors for each category
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384',
      '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#FF6384', '#C9CBCF', '#4BC0C0'
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: amounts,
          backgroundColor: colors.slice(0, categories.length),
          borderColor: colors.slice(0, categories.length).map(color => color.replace('0.6', '1')),
          borderWidth: 1,
        },
      ],
    };
  };

  // Generate category summary
  const getCategorySummary = () => {
    const filteredTransactions = getFilteredTransactions();
    const categoryTotals = {};

    filteredTransactions.forEach(transaction => {
      if (!categoryTotals[transaction.category]) {
        categoryTotals[transaction.category] = {
          total: 0,
          count: 0
        };
      }
      categoryTotals[transaction.category].total += transaction.amount;
      categoryTotals[transaction.category].count += 1;
    });

    return Object.entries(categoryTotals)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.total - a.total);
  };

  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Spending Trend - ${timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)}`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Spending by Category',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${context.label}: ${formatCurrency(context.parsed)} (${percentage}%)`;
          }
        }
      }
    },
  };

  const categorySummary = getCategorySummary();
  const filteredTotal = getFilteredTransactions().reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="analytics-dashboard">
      <div className="dashboard-container">
        <h2> Analytics Dashboard</h2>
        
        {/* Summary Cards */}
        <div className="summary-cards">
          <div className="summary-card total-all-time">
            <h3> Total Spending (All Time)</h3>
            <div className="amount">{formatCurrency(totalAllTime)}</div>
            <div className="subtitle">{transactions.length} transactions</div>
          </div>
          
          <div className="summary-card total-month">
            <h3> Total Spending (Selected Month)</h3>
            <div className="amount">{formatCurrency(totalSelectedMonth)}</div>
            <div className="subtitle">
              {transactions.filter(t => t.date.startsWith(selectedMonth)).length} transactions
            </div>
          </div>
          
          <div className="summary-card filtered-total">
            <h3>Filtered Period Total</h3>
            <div className="amount">{formatCurrency(filteredTotal)}</div>
            <div className="subtitle">{getFilteredTransactions().length} transactions</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="timeFilter">View by:</label>
            <select
              id="timeFilter"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
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
              <Line data={getLineChartData()} options={lineChartOptions} />
            </div>
          </div>
          
          <div className="chart-container">
            <div className="chart-card">
              <Pie data={getPieChartData()} options={pieChartOptions} />
            </div>
          </div>
        </div>

        {/* Category Summary */}
        <div className="category-summary">
          <h3>Category Breakdown</h3>
          {categorySummary.length === 0 ? (
            <div className="no-data">
              <p>No spending data for the selected period.</p>
            </div>
          ) : (
            <div className="category-list">
              {categorySummary.map((item, index) => (
                <div key={index} className="category-item">
                  <div className="category-info">
                    <div className="category-name">{item.category}</div>
                    <div className="category-count">{item.count} transactions</div>
                  </div>
                  <div className="category-amount">
                    {formatCurrency(item.total)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard; 