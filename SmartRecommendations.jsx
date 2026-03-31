import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle, TrendingUp, ShoppingBag, Zap } from 'lucide-react';

const SmartRecommendations = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/summary/');
        setData(response.data);
      } catch (err) {
        setError("Unable to generate recommendations. Please check connection.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse text-gray-500">Analysing business trends...</div>;
  if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">{error}</div>;

  return (
    <div className="space-y-8">
      {/* Restock Section */}
      <section>
        <div className="flex items-center mb-4">
          <AlertCircle className="text-orange-500 mr-2" size={20} />
          <h2 className="text-xl font-bold text-gray-800">Restock Soon</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.low_stock_products?.map((item) => (
            <div key={item.id} className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{item.name}</h3>
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                  {item.quantity} left
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Supplier: {item.supplier__name || 'Unknown'}</p>
              <button className="w-full py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors">
                Create Purchase Order
              </button>
            </div>
          ))}
          {data.low_stock_products?.length === 0 && (
            <p className="text-sm text-gray-400 italic">Inventory levels are healthy across all products.</p>
          )}
        </div>
      </section>

      {/* Marketing Campaigns Section */}
      <section>
        <div className="flex items-center mb-4">
          <Zap className="text-yellow-500 mr-2" size={20} />
          <h2 className="text-xl font-bold text-gray-800">Campaign Suggestions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.marketing_insights?.map((insight, idx) => (
            <div key={idx} className="relative bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-6 rounded-2xl shadow-sm">
              <div className="absolute top-4 right-4">
                <span className={`text-[10px] uppercase tracking-widest font-black px-2 py-1 rounded ${
                  insight.priority === 'High' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {insight.priority} Priority
                </span>
              </div>
              <div className="flex items-center mb-4">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 mr-3">
                  {insight.type === 'Bundle' ? <ShoppingBag className="text-indigo-600" size={18} /> : <TrendingUp className="text-green-600" size={18} />}
                </div>
                <h3 className="font-bold text-gray-900">{insight.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {insight.description}
              </p>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                  Launch Campaign
                </button>
                <button className="px-4 py-2 border border-gray-200 text-gray-500 text-xs font-bold rounded-lg hover:bg-gray-50">
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default SmartRecommendations;