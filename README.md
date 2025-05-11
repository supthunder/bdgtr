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

# Budget Planner

A modern budget planning application built with Next.js, PostgreSQL, and Prisma.

## Features

- 💰 Track both income and expenses
- 📊 Comprehensive dashboard with financial overview
- 📅 Handle recurring and one-time transactions
- 📱 Responsive design for all devices
- 📤 Export data to CSV or PDF
- 🔍 Advanced sorting and filtering
- 🎨 Modern UI with dark mode support

## Tech Stack

- **Framework**: Next.js 14
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Package Manager**: pnpm
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- pnpm

## Getting Started

1. **Clone the repository**

```bash
git clone <your-repo-url>
cd planner
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up PostgreSQL**

Make sure PostgreSQL is running on your system. Then:

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

4. **Set up environment variables**

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/planner_db?schema=public"
```

5. **Initialize the database**

```bash
# Generate Prisma Client
pnpm prisma generate

# Push the schema to the database
pnpm prisma db push
```

6. **Run the development server**

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Migration

If you're migrating from the previous localStorage version to PostgreSQL:

1. Make sure your PostgreSQL database is set up
2. Run the application and visit any page
3. The migration script will automatically transfer your existing data to PostgreSQL

## Project Structure

```
├── app/                  # Next.js app directory
├── components/          # React components
├── lib/                # Utility functions and database client
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
└── types/              # TypeScript type definitions
```

## Development

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript compiler check

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details 