# Spend Tracker

A simple and modern React application to track your spending, analyze expenses, and manage categories. 

## Features
- Add, edit, and delete expense transactions
- Categorize your spending
- Visual analytics dashboard (charts, summaries)
- Persistent data storage using localStorage
- Custom category management
- Responsive and clean UI

## Getting Started

### Prerequisites
- Node.js (v14 or higher recommended)
- npm (comes with Node.js)

### Installation
1. Clone the repository:
   ```sh
   git clone <your-repo-url>
   cd spend-tracker
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the development server:
   ```sh
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000).

## Project Structure
```
spend-tracker/
  src/
    components/         # Reusable UI components
    data/               # Default data (categories, etc.)
    pages/              # Main app pages (Journal, AnalyticsDashboard)
    services/           # Local storage utilities
    App.js              # Main app component
    index.js            # Entry point
  public/               # Static assets
  package.json          # Project metadata and scripts
```

## Usage
- **Journal:** Add and manage your daily expenses.
- **Analytics Dashboard:** Visualize your spending trends and category breakdowns.
- **Categories:** Add custom categories for your expenses.

## Contributing
1. Create a new branch for your feature or fix:
   ```sh
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit:
   ```sh
   git add .
   git commit -m "Describe your changes"
   ```
3. Push your branch:
   ```sh
   git push origin feature/your-feature-name
   ```
4. Open a Pull Request on GitHub.

## License
This project is licensed under the MIT License.
