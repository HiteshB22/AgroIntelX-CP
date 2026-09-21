import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { ArrowLeft, Download, Leaf, Sprout, Activity, Droplets, Thermometer, Database } from "lucide-react";
import jsPDF from "jspdf";
import WeatherWidget from "../components/WeatherWidget";

const Dashboard = () => {
  const location = useLocation(); 
  const navigate = useNavigate();
  const { data } = location.state || {};

  const inputData = data?.input_data || {};
  const aiData = data?.ai_analysis || {};

  console.log("aiData:---\n", aiData);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="glass p-10 rounded-3xl max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Database className="text-brand-600" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">No Data Available</h2>
          <p className="text-gray-500 font-medium pb-2">Please run a soil analysis first to view your dashboard.</p>
          <button
            onClick={() => navigate("/soil-analysis")}
            className="w-full primary-btn py-3"
          >
            Go to Analysis
          </button>
        </div>
      </div>
    );
  }

  const normalizedInput = {
    District_Name: inputData.District_Name || inputData.district || "N/A",
    Nitrogen: Number(inputData.Nitrogen || inputData.nitrogen || 0),
    Phosphorus: Number(inputData.Phosphorus || inputData.phosphorus || 0),
    Potassium: Number(inputData.Potassium || inputData.potassium || 0),
    pH: Number(inputData.pH || inputData.ph || 0),
    Rainfall: Number(inputData.Rainfall || inputData.rainfall || 0),
  };

  const healthScore = Number(aiData.soil_health_score) || 0;
  const topCrops = aiData.top_crops || [];
  const topFertilizers = aiData.top_fertilizers || [];

  // Normalize crops safely
  const processedCrops = topCrops.map((c, index) => {
    if (typeof c === "string") {
      return { crops: c, probability: 100 - index * 5 };
    }

    return {
      crops: c.crops || c.name || `Crop ${index + 1}`,
      probability: c.probability || c.score || 0,
    };
  });

  const processedFertilizers = topFertilizers.map((f, index) => {
    if (typeof f === "string") return { name: f, probability: 100 - (index * 5) };
    return { 
      name: f.fertilizer || f.name || `Fertilizer ${index + 1}`, 
      probability: f.probability || f.score || 0 
    };
  });

  const radarData = [
    { metric: "Nitrogen", user: normalizedInput.Nitrogen, optimal: 50 },
    { metric: "Phosphorus", user: normalizedInput.Phosphorus, optimal: 40 },
    { metric: "Potassium", user: normalizedInput.Potassium, optimal: 50 },
    { metric: "pH", user: normalizedInput.pH * 10, optimal: 68 }, // Scale pH for radar visibility relative to NPK
  ];

  const handleDownloadPDF = () => {
    const pdf = new jsPDF();
    pdf.setFontSize(22);
    pdf.setTextColor(22, 163, 74); // brand-600
    pdf.text("AgroIntelX Soil Report", 20, 20);
    pdf.setFontSize(12);
    pdf.setTextColor(55, 65, 81); // gray-700
    pdf.text(`District: ${normalizedInput.District_Name}`, 20, 35);
    pdf.text(`Health Score: ${healthScore}/100`, 20, 45);
    pdf.text(`Recommended Crop: ${aiData.recommended_crop || "N/A"}`, 20, 55);
    pdf.text(`Recommended Fertilizer: ${aiData.recommended_fertilizer || "N/A"}`, 20, 65);
    pdf.save("AgroIntelX_Report.pdf");
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-brand-900 -z-10 rounded-b-[4rem] lg:rounded-b-[8rem]"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-500/20 rounded-full blur-[120px] -z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-10">
        {/* ================= HEADER ================= */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12"
        >
          <div className="flex items-center gap-4 text-white">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md transition border border-white/20 text-white"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Analysis Dashboard
              </h1>
              <p className="text-brand-100 mt-1 font-medium">
                Detailed insights for {normalizedInput.District_Name}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadPDF}
            className="px-6 py-2.5 rounded-xl bg-white text-brand-900 font-bold hover:bg-brand-50 hover:shadow-lg hover:shadow-white/20 transition-all flex items-center gap-2"
          >
            <Download size={18} /> Export PDF Report
          </button>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-8">
          
          {/* ================= KPI STRIP ================= */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: "Nitrogen (N)", value: normalizedInput.Nitrogen, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Phosphorus (P)", value: normalizedInput.Phosphorus, icon: Activity, color: "text-purple-600", bg: "bg-purple-50" },
              { label: "Potassium (K)", value: normalizedInput.Potassium, icon: Activity, color: "text-orange-600", bg: "bg-orange-50" },
              { label: "pH Level", value: normalizedInput.pH, icon: Thermometer, color: "text-red-600", bg: "bg-red-50" },
              { label: "Rainfall", value: `${normalizedInput.Rainfall}mm`, icon: Droplets, color: "text-cyan-600", bg: "bg-cyan-50" },
              { label: "Location", value: normalizedInput.District_Name, icon: Leaf, color: "text-green-600", bg: "bg-green-50" },
            ].map((item, i) => (
              <div key={i} className="glass p-5 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${item.bg}`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                </div>
                <p className="text-2xl font-extrabold text-gray-900">{item.value}</p>
              </div>
            ))}
          </motion.div>

          {/* ================= AI INSIGHT ZONE ================= */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Health Score */}
            <motion.div variants={itemVariants} className="glass p-8 rounded-3xl relative overflow-hidden flex flex-col justify-center">
              {/* Circular Progress Background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border-[16px] border-gray-100 -z-10"></div>
              
              <div className="text-center relative z-10 flex flex-col items-center justify-center h-full">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overall</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-extrabold text-brand-600 leading-none">{healthScore}</span>
                  <span className="text-xl font-bold text-gray-400">/100</span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-700 font-semibold text-xs border border-brand-100">
                  <Activity size={16} />
                  {aiData.soil_health_grade || "Good"} Status
                </div>
              </div>
            </motion.div>

            {/* AI Summary */}
            <motion.div variants={itemVariants} className="glass p-8 rounded-3xl lg:col-span-2 flex flex-col">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="p-3 bg-brand-100 text-brand-700 rounded-xl">
                  <Sprout size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">AI Diagnostic Summary</h2>
                  <p className="text-sm font-medium text-gray-500">Expert analysis based on your soil profile</p>
                </div>
              </div>
              <div className="prose prose-brand max-w-none text-gray-700 leading-relaxed font-medium">
                {aiData.soil_health_analysis || "Our AI system has analyzed your soil profile and generated recommendations for optimal yield. Please refer to the charts below for a detailed breakdown."}
              </div>
            </motion.div>
          </div>

          {/* ================= WEATHER FORECAST ZONE ================= */}
          <motion.div variants={itemVariants}>
            <WeatherWidget defaultLocation={normalizedInput.District_Name} />
          </motion.div>

          {/* ================= CHART ZONE ================= */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Radar Comparison */}
            <motion.div variants={itemVariants} className="glass rounded-3xl p-8 pt-10">
              <div className="text-center mb-8">
                <h3 className="font-bold text-gray-900 text-xl">Soil Profile vs. Optimal</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Comparing your NPK levels against ideal targets</p>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 14, fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                      name="Your Soil"
                      dataKey="user"
                      stroke="#16a34a"
                      strokeWidth={3}
                      fill="#16a34a"
                      fillOpacity={0.4}
                    />
                    <Radar
                      name="Optimal Target"
                      dataKey="optimal"
                      stroke="#0ea5e9"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      fill="#0ea5e9"
                      fillOpacity={0.1}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Crop Probabilities */}
            <motion.div variants={itemVariants} className="glass rounded-3xl p-8 pt-10 flex flex-col">
              <div className="text-center mb-8">
                <h3 className="font-bold text-gray-900 text-xl">Alternative Crop Predictions</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">AI confidence scores for suitable alternatives</p>
              </div>
              <div className="h-[350px] grow">
                {topCrops.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedCrops} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="crops" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} dx={-10} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey="probability" 
                        fill="#16a34a" 
                        radius={[6, 6, 0, 0]}
                        barSize={40}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    Insufficient data for probability chart
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Fertilizer Matches */}
          <div className="grid lg:grid-cols-1 gap-8 mt-8">
            <motion.div variants={itemVariants} className="glass rounded-3xl p-8 pt-10 flex flex-col">
              <div className="text-center mb-8">
                <h3 className="font-bold text-gray-900 text-xl">Top Fertilizer Matches</h3>
                <p className="text-sm font-medium text-gray-500 mt-1">Recommended fertilizers and organic composts for your soil</p>
              </div>
              <div className="h-[350px] grow">
                {processedFertilizers.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={processedFertilizers} layout="vertical" margin={{ top: 20, right: 30, left: 50, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontWeight: 600 }} width={120} />
                      <Tooltip 
                        cursor={{ fill: '#f3f4f6' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar 
                        dataKey="probability" 
                        fill="#0ea5e9" 
                        radius={[0, 6, 6, 0]}
                        barSize={30}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">
                    Insufficient data for fertilizer chart
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* ================= RECOMMENDATIONS ================= */}
          <div className="grid md:grid-cols-2 gap-8 mt-8">
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-sm font-bold tracking-wider uppercase mb-4">
                  <Leaf size={14} /> Top Crop Match
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold mb-3">{aiData.recommended_crop || "Wheat"}</h3>
                <p className="text-brand-100 font-medium text-base max-w-sm">Highly recommended based on your NPK ratios and local rainfall.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/3 translate-x-1/3 group-hover:scale-110 transition-transform duration-700"></div>
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white/90 text-sm font-bold tracking-wider uppercase mb-4">
                  <Activity size={14} /> Ideal Fertilizer
                </div>
                <h3 className="text-3xl sm:text-4xl font-extrabold mb-3">{aiData.recommended_fertilizer || "Urea"}</h3>
                <p className="text-blue-100 font-medium text-base max-w-sm">Optimal combination to address current soil deficiencies and boost growth.</p>
              </div>
            </motion.div>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
