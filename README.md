# 💰 bdgtr - Self-Hosted Budget Tracker

A modern, privacy-focused budget tracking application built with Next.js and shadcn/ui. Track your living expenses with a beautiful dark-themed dashboard, all while keeping your data local and secure.

![bdgtr Preview](./public/preview.png)
*Dark-themed dashboard for tracking house-related expenses*

## 🌟 Key Features

### 📊 Dashboard Overview
- Total expenses summary
- Monthly recurring expenses tracker
- Upcoming expenses (next 7 days)
- Top spending categories with visual indicators
- Recent expenses list
- Dark theme by default for comfortable viewing

### 💳 Expense Tracking
- Add and manage expenses with:
  - 📝 Name and amount
  - 🏷️ Category with emoji (e.g., "🏠 Rent/Mortgage", "🪑 Furniture")
  - 🔄 Frequency options (one-time, daily, weekly, monthly, etc.)
  - 📅 Due date tracking

### 📈 Reports & Analytics
- **Detailed Reports View**
  - Tabular view of all expenses
  - Sort by amount, date, or category
  - Search across all fields
- **Export Options**
  - Export to CSV for spreadsheet analysis
  - Generate PDF reports with formatting
  - Include category emojis in exports

### 🏠 House-Related Categories
- Specialized categories for home expenses:
  - 🏠 Rent/Mortgage
  - 🔌 Utilities
  - 🌐 Internet/Cable
  - 🪑 Furniture
  - 🛋️ Home Decor
  - 🧰 Appliances
  - 🧹 Cleaning Supplies
  - 🛠️ Home Maintenance
  - 🏡 Home Insurance
  - 🚰 Plumbing
  - ⚡ Electrical
  - ❄️ HVAC
  - 🏺 Kitchen Items
  - 🛁 Bathroom Items
  - 🌿 Landscaping
  - 📦 Storage/Moving
  - 💰 Other Housing

### 🔒 Privacy-First
- **100% Local Storage**: All data stays in your browser
- **No Server Required**: Works completely offline
- **Self-Contained**: No external dependencies for data storage
- **Private**: Your financial data never leaves your device

### 📱 Responsive Design
- Works seamlessly on desktop and mobile
- Adaptive sidebar for different screen sizes
- Clean, modern interface

## 🛠️ Technology Stack

- **Framework**: Next.js with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Data Storage**: Browser Local Storage
- **Type Safety**: TypeScript
- **Export Formats**: CSV, PDF (using jsPDF)

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/supthunder/bdgtr.git
cd bdgtr
```

2. Install dependencies:
```bash
pnpm install
```

3. Run the development server:
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📱 Usage

1. **Adding Expenses**
   - Click "Add Expense" button
   - Fill in expense details (name, amount, category)
   - Select frequency and due date
   - Submit to save

2. **Viewing Analytics**
   - See total expenses on the dashboard
   - View categorized spending
   - Track upcoming payments
   - Monitor recurring expenses

3. **Generating Reports**
   - Navigate to Reports page
   - Use search and filters to find specific expenses
   - Sort data by clicking column headers
   - Export filtered data to CSV or PDF

## 🔐 Data Privacy

All data is stored locally in your browser's localStorage. This means:
- No data is ever sent to any servers
- Your financial information remains completely private
- Data persists between sessions
- You can clear data any time using browser settings

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes. 