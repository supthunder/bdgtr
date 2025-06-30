# 💰 bdgtr - Self-Hosted Budget Tracker

A modern, privacy-focused budget tracking application built with Next.js, PostgreSQL, and shadcn/ui. Track your finances with a beautiful dashboard, comprehensive analytics, and advanced features like automated backups and smart data parsing.

![bdgtr Preview](./public/preview.png)
*Modern dashboard with financial overview and analytics*

## 🌟 Key Features

### 📊 Enhanced Dashboard
- **Financial Overview Cards**: Total Income, Total Expenses, Balance, Mortgage, and Utilities tracking
- **Interactive Monthly Distribution Chart**: 
  - Visual income vs expenses comparison
  - Horizontal scrolling with click-and-drag support
  - Auto-positioning to current month context
  - 18 months of data display
  - Smooth scrolling with fade indicators
- **Top Categories**: Budget tracking with progress bars and emoji indicators
- **Recent Transactions**: Quick overview of latest financial activity
- **Dark theme** optimized for comfortable viewing

### 💳 Smart Transaction Management
- **Add Income & Expenses** with comprehensive details:
  - 📝 Name, amount, and description
  - 🏷️ Category with emoji indicators
  - 🔄 Frequency options (one-time, daily, weekly, monthly, etc.)
  - 📅 Date tracking
- **Intelligent Paste Functionality**:
  - Smart parsing of bank/credit card statements
  - Automatic extraction of date, amount, and description
  - Cleans up transaction IDs and phone numbers
  - Auto-fills form fields for quick entry
- **Optimistic Updates**: Real-time UI updates for better user experience

### 🔄 Automated Backup System
- **Daily Automated Backups**: 
  - Automatic backup creation on dashboard load
  - Smart daily checking to avoid duplicates
- **Multiple Formats**:
  - **CSV files**: Excel-compatible for spreadsheet analysis
  - **SQL files**: Complete database backups for restoration
- **Backup Management Interface**:
  - View all backups with creation dates
  - Import/restore functionality
  - Compact, scrollable dialog for all screen sizes
- **Data stored in**: `backup data/` folder (git-ignored for privacy)

### 📈 Advanced Reports & Analytics
- **Comprehensive Reports View**:
  - Tabular view of all transactions
  - Advanced sorting by amount, date, category, or type
  - Search across all fields
  - Filter by income/expense type
- **Export Options**:
  - Export filtered data to CSV
  - Generate formatted PDF reports
  - Include category emojis and full transaction details

### 🏠 Specialized Categories
Pre-configured categories for comprehensive expense tracking:
- 🏠 Rent/Mortgage
- 🔌 Utilities  
- 🌐 Internet/Cable
- 🪑 Furniture
- 🛋️ Home Decor
- 🧰 Appliances
- 🧹 Cleaning Supplies
- 🛠️ Home Maintenance
- 🏡 Home Insurance
- 🚗 Transportation
- 🍔 Food & Dining
- 💰 And many more...

### 🔒 Privacy & Security
- **Self-Hosted**: Complete control over your data
- **Local Database**: PostgreSQL running on your machine
- **No External Dependencies**: All data processing happens locally
- **Automated Backups**: Regular data protection
- **Git-Ignored Sensitive Data**: Backup folder excluded from version control

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Charts**: Recharts for data visualization
- **Type Safety**: TypeScript
- **Package Manager**: pnpm
- **Export Formats**: CSV, PDF, SQL

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 12+
- pnpm

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd bdgtr
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up PostgreSQL**
```bash
# Login to PostgreSQL
sudo -u postgres psql

# Create a new user (if not exists)
ALTER USER "user" WITH PASSWORD 'password';
ALTER USER "user" WITH SUPERUSER;

# Create database
CREATE DATABASE planner_db;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE planner_db TO "user";

# Exit PostgreSQL
\q
```

4. **Configure environment variables**

Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/planner_db?schema=public"
```

5. **Initialize the database**
```bash
pnpm prisma generate
pnpm prisma db push
```

6. **Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start tracking your finances!

## 📱 Usage Guide

### Adding Transactions
1. **Quick Entry**: Click "Add Income" or "Add Expense"
2. **Smart Paste**: Use the "Paste" button to parse bank statement data
3. **Form Fields**: Fill in name, amount, category, frequency, and date
4. **Submit**: Transaction appears immediately with optimistic updates

### Using the Paste Feature
The paste functionality can intelligently parse bank/credit card statements. Example format:
```
06/01/25	06/01/25	SHOPMYEXCHANGE.COM 800-527-2345 TX#24138294R3HLSTEEF	$1,422.55
```
The parser will extract:
- **Date**: 06/01/25
- **Amount**: $1,422.55  
- **Description**: SHOPMYEXCHANGE.COM (cleaned of phone numbers and transaction IDs)

### Managing Backups
1. **Automatic**: Backups are created daily when you visit the dashboard
2. **Manual**: Use the backup dialog to create immediate backups
3. **Restore**: Import previous backups to restore data
4. **View**: See all backups with creation timestamps

### Viewing Analytics
1. **Dashboard**: Get an overview of your financial health
2. **Monthly Chart**: Scroll through 18 months of income vs expense data
3. **Categories**: Track spending by category with visual progress indicators
4. **Reports**: Detailed analysis with sorting, filtering, and export options

## 🎉 Recent Updates

### Latest Improvements
- ✨ **New Dashboard Cards**: Added Mortgage and Utilities tracking cards
- 📊 **Enhanced Monthly Chart**: Horizontal scrolling, auto-positioning, and smooth animations
- 📋 **Smart Paste Feature**: Intelligent parsing of bank statement data
- 💾 **Automated Backup System**: Daily backups with CSV and SQL formats
- 🎨 **UI Refinements**: Changed "Due Date" to "Date" for simplicity
- 🔄 **Optimistic Updates**: Real-time UI responses for better UX

### Chart Improvements
- Fixed CSS color variables with proper hex colors
- Added click-and-drag horizontal scrolling
- Intelligent positioning to show current month context
- Fade indicators for scroll boundaries
- Hidden scrollbars for clean interface

### Technical Enhancements
- 🚀 Dynamic route handling with proper revalidation
- 💾 Enhanced data fetching and caching
- 🛠️ Improved error handling with rollback functionality
- 🎯 Optimized database queries and performance

## 🛠️ Development Tools

- **Prisma Studio**: Visual database editor
  ```bash
  pnpm prisma studio
  ```
- **Database Reset**: Reset database schema
  ```bash
  pnpm prisma db push --force-reset
  ```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- 🐛 Report bugs
- 💡 Suggest features  
- 🔧 Submit pull requests
- 📚 Improve documentation

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes. 