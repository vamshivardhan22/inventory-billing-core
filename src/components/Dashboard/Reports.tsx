import React, { useState, useEffect } from "react";
import { ReportService } from "../../services/report_service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TrendingUp, Package, IndianRupee, Calendar, Loader2 } from "lucide-react";

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    dailySales: [],
    topProducts: [],
    totalGst: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [sales, products, gst] = await Promise.all([
          ReportService.dailySales(),
          ReportService.topProducts(),
          ReportService.gstReport()
        ]);
        setData({ dailySales: sales, topProducts: products, totalGst: gst });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const totalSales = data.dailySales.reduce((acc: number, curr: any) => acc + curr.total, 0);

  return (
    <div className="space-y-6 md:space-y-10">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Real-time insights into your sales and tax compliance.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          icon={<TrendingUp className="w-6 h-6 text-blue-600" />} 
          label="Total Sales" 
          value={`₹${totalSales.toLocaleString()}`}
          color="bg-blue-50"
        />
        <StatCard 
          icon={<IndianRupee className="w-6 h-6 text-green-600" />} 
          label="GST Collected" 
          value={`₹${data.totalGst.toLocaleString()}`}
          color="bg-green-50"
        />
        <StatCard 
          icon={<Package className="w-6 h-6 text-purple-600" />} 
          label="Top Product Qty" 
          value={data.topProducts[0]?.qty || 0}
          color="bg-purple-50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="font-bold flex items-center gap-2 text-gray-900">
              <Calendar className="w-5 h-5 text-gray-400" />
              Daily Sales
            </h3>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.dailySales}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} />
                <Tooltip 
                  cursor={{ fill: '#f9f9f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Bar dataKey="total" fill="#000" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="font-bold flex items-center gap-2 text-gray-900">
              <Package className="w-5 h-5 text-gray-400" />
              Top Products
            </h3>
          </div>
          <div className="h-64 md:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="product_id" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#999' }} width={80} />
                <Tooltip 
                  cursor={{ fill: '#f9f9f9' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Bar dataKey="qty" fill="#000" radius={[0, 4, 4, 0]} barSize={15}>
                  {data.topProducts.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={`rgba(0,0,0,${1 - index * 0.1})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 md:gap-5">
      <div className={`w-12 h-12 md:w-14 md:h-14 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider truncate">{label}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
