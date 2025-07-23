// localStorage service for managing spending tracker data

const TRANSACTIONS_KEY = 'spending_tracker_transactions';
const CUSTOM_CATEGORIES_KEY = 'spending_tracker_custom_categories';

export const localStorageService = {
  // Transaction methods
  getTransactions: () => {
    try {
      const transactions = localStorage.getItem(TRANSACTIONS_KEY);
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  },

  saveTransaction: (transaction) => {
    try {
      const transactions = localStorageService.getTransactions();
      const newTransaction = {
        ...transaction,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      transactions.push(newTransaction);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
      return newTransaction;
    } catch (error) {
      console.error('Error saving transaction:', error);
      return null;
    }
  },

  deleteTransaction: (id) => {
    try {
      const transactions = localStorageService.getTransactions();
      const updatedTransactions = transactions.filter(t => t.id !== id);
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      return false;
    }
  },

  updateTransaction: (id, updatedTransaction) => {
    try {
      const transactions = localStorageService.getTransactions();
      const index = transactions.findIndex(t => t.id === id);
      if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updatedTransaction };
        localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
        return transactions[index];
      }
      return null;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  },

  // Custom categories methods
  getCustomCategories: () => {
    try {
      const categories = localStorage.getItem(CUSTOM_CATEGORIES_KEY);
      return categories ? JSON.parse(categories) : [];
    } catch (error) {
      console.error('Error loading custom categories:', error);
      return [];
    }
  },

  saveCustomCategory: (category) => {
    try {
      const categories = localStorageService.getCustomCategories();
      if (!categories.includes(category)) {
        categories.push(category);
        localStorage.setItem(CUSTOM_CATEGORIES_KEY, JSON.stringify(categories));
      }
      return categories;
    } catch (error) {
      console.error('Error saving custom category:', error);
      return [];
    }
  },

  // Utility methods
  clearAllData: () => {
    try {
      localStorage.removeItem(TRANSACTIONS_KEY);
      localStorage.removeItem(CUSTOM_CATEGORIES_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }
}; 