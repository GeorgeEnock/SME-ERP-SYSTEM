import React from 'react';
import {
  Package,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  ArrowRight,
  Lightbulb,
  ChartBar,    // replaces BarChart3
  ChartPie,    // replaces PieChart
  Star,
} from 'lucide-react';

interface DashboardData {
  total_revenue: number;
  total_products: number;
  low_stock_count: number;
  top_selling: { name: string; total_sold: number }[];
  sales_trends: { date: string; amount: number }[];
  marketing_insights?: {
    type: string;
    title: string;
    description: string;
    priority: string;
  }[];
  low_stock_products: {
    id: string | number;
    name: string;
    supplier__name: string;
    quantity: number;
  }[];
  category_distribution?: {
    category: string;
    quantity: number;
  }[];
}

interface ModernDashboardProps {
  data: DashboardData;
}

const ModernDashboard: React.FC<ModernDashboardProps> = ({ data }) => {
  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 animate-pulse">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const maxTrendAmount = React.useMemo(
    () => Math.max(...(data.sales_trends?.map(d => Number(d.amount) || 0) || []), 1),
    [data.sales_trends]
  );

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Executive Overview</h1>
        <p className="text-slate-500 mt-1">Real-time insights from your inventory and sales performance.</p>
      </header>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={`$${(Number(data.total_revenue) || 0).toLocaleString()}`}
          icon={<DollarSign size={20} className="text-emerald-600" />}
          trend="+12.5%"
        />
        <StatCard
          title="Active Products"
          value={data.total_products || 0}
          icon={<Package size={20} className="text-blue-600" />}
        />
        <StatCard
          title="Low Stock Alerts"
          value={data.low_stock_count || 0}
          icon={<AlertTriangle size={20} className="text-amber-600" />}
          isAlert={(data.low_stock_count || 0) > 0}
        />
        <StatCard
          title="Avg. Sale Value"
          value={`$${((Number(data.total_revenue) || 0) / (data.top_selling?.length || 1)).toFixed(2)}`}
          icon={<TrendingUp size={20} className="text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <ChartBar size={20} className="text-blue-600" /> Sales Performance
            </h3>
            <select className="text-sm border-none bg-slate-100 rounded-md p-1 focus:ring-2 focus:ring-blue-500">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.sales_trends?.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600 cursor-pointer"
                  style={{ height: `${(Number(day.amount || 0) / maxTrendAmount) * 100}%`, minHeight: '4px' }}
                />
                <span className="text-[10px] text-slate-400 mt-2 rotate-45 md:rotate-0">
                  {day.date?.split('-')[2] || day.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panel: Smart Insights */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-amber-600">
            <Lightbulb size={20} /> Smart Insights
          </h3>
          <div className="space-y-4">
            {data.marketing_insights?.map((insight, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
              >
                <div className="flex justify-between items-start mb-1">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      insight.priority === 'High'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-blue-100 text-blue-600'
                    }`}
                  >
                    {insight.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">{insight.priority} Priority</span>
                </div>
                <p className="text-sm font-bold text-slate-800 mb-1">{insight.title}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-8 py-2 text-sm text-blue-600 font-medium flex items-center justify-center gap-2 hover:bg-blue-50 rounded-lg transition-colors">
            View All Transactions <ArrowRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Star size={20} className="text-yellow-500" /> Top Selling Products
          </h3>
          <div className="space-y-4">
            {data.top_selling?.map((product, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{i + 1}.</span>
                  <span className="text-sm font-medium">{product.name}</span>
                </div>
                <div className="flex items-center gap-4 flex-1 max-w-[200px] ml-4">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500"
                      style={{
                        width: `${(product.total_sold / (data.top_selling?.[0]?.total_sold || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 w-12 text-right">
                    {product.total_sold} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <ChartPie size={20} className="text-purple-600" /> Category Distribution
          </h3>
          <div className="flex flex-wrap gap-3">
            {data.category_distribution?.map((cat, i) => (
              <div key={i} className="flex-1 min-w-[120px] p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {cat.category || 'General'}
                </p>
                <p className="text-lg font-bold text-slate-800">{cat.quantity.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stock Table */}
      <div className="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="font-semibold text-lg">Inventory Priority List</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">Supplier</th>
              <th className="px-6 py-4 font-medium">Stock Level</th>
              <th className="px-6 py-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.low_stock_products?.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium">{item.name}</td>
                <td className="px-6 py-4 text-slate-500">{item.supplier__name}</td>
                <td className="px-6 py-4">{item.quantity}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      item.quantity === 0
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {item.quantity === 0 ? 'Out of Stock' : 'Low Stock'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  isAlert?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, isAlert }) => (
  <div
    className={`bg-white p-6 rounded-2xl shadow-sm border ${
      isAlert ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200'
    }`}
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-slate-100 rounded-lg">{icon}</div>
      {trend && (
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          {trend}
        </span>
      )}
    </div>
    <p className="text-sm text-slate-500 font-medium">{title}</p>
    <h4 className="text-2xl font-bold mt-1">{value}</h4>
  </div>
);

export default ModernDashboard;