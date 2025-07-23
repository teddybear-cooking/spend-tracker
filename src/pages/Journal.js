import React, { useState, useEffect } from 'react';
import { localStorageService } from '../services/localStorage';
import defaultCategories from '../data/spendingCategories.json';
import './Journal.css';

const Journal = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    category: '',
    amount: '',
    description: ''
  });
  const [newCategory, setNewCategory] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedTransactions = localStorageService.getTransactions();
    const customCategories = localStorageService.getCustomCategories();
    setTransactions(loadedTransactions);
    setCategories([...defaultCategories, ...customCategories]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.date || !formData.category || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const transactionData = {
      ...formData,
      amount: amount
    };

    if (editingTransaction) {
      localStorageService.updateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
    } else {
      localStorageService.saveTransaction(transactionData);
    }

    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: '',
      description: ''
    });

    loadData();
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      localStorageService.saveCustomCategory(newCategory.trim());
      setNewCategory('');
      setShowAddCategory(false);
      loadData();
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      date: transaction.date,
      category: transaction.category,
      amount: transaction.amount.toString(),
      description: transaction.description || ''
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      localStorageService.deleteTransaction(id);
      loadData();
    }
  };

  const cancelEdit = () => {
    setEditingTransaction(null);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      category: '',
      amount: '',
      description: ''
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="journal">
      <div className="journal-container">
        <h2>💸 Expense Journal</h2>
        
        {/* Transaction Input Form */}
        <div className="transaction-form-card">
          <h3>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h3>
          <form onSubmit={handleSubmit} className="transaction-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="amount">Amount *</label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <div className="category-input-container">
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCategory(!showAddCategory)}
                  className="add-category-btn"
                >
                  ➕
                </button>
              </div>
            </div>

            {showAddCategory && (
              <div className="add-category-form">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter new category"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button type="button" onClick={handleAddCategory}>Add</button>
                <button type="button" onClick={() => setShowAddCategory(false)}>Cancel</button>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
              </button>
              {editingTransaction && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Transactions History */}
        <div className="transactions-history">
          <h3>Transaction History ({transactions.length})</h3>
          {transactions.length === 0 ? (
            <div className="no-transactions">
              <p>No transactions yet. Add your first expense above!</p>
            </div>
          ) : (
            <div className="transactions-list">
              {transactions
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-main">
                      <div className="transaction-date">
                        {new Date(transaction.date).toLocaleDateString()}
                      </div>
                      <div className="transaction-details">
                        <div className="transaction-category">{transaction.category}</div>
                        {transaction.description && (
                          <div className="transaction-description">{transaction.description}</div>
                        )}
                      </div>
                      <div className="transaction-amount">
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                    <div className="transaction-actions">
                      <button 
                        onClick={() => handleEdit(transaction)}
                        className="edit-btn"
                      >
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(transaction.id)}
                        className="delete-btn"
                      >
                        🗑️ Delete
                      </button>
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

export default Journal; 