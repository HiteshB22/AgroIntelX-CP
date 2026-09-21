import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import FeatureCard from "../components/FeatureCard";
import { useRef } from "react";
import { useAuthStore } from "../store/authStore";
import WeatherWidget from "../components/WeatherWidget";

const Home = () => {
  const { user } = useAuthStore();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <div className="bg-gray-50 text-gray-900 overflow-hidden" ref={containerRef}>

      {/* ================= HERO ================= */}
      <section className="relative min-h-[90vh] flex items-center pt-20">
        {/* Dynamic Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-brand-200/40 mix-blend-multiply filter blur-[100px] animate-blob"></div>
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-brand-100/40 mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-16 items-center w-full">

          {/* Left Content */}
          <motion.div
            style={{ y: yHero, opacity: opacityHero }}
            className="space-y-8 z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-brand-100 shadow-sm"
            >
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-brand-500"></span>
              </span>
              <span className="text-sm font-bold text-brand-800 tracking-wide uppercase">AI-Powered Agriculture</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-gray-900 drop-shadow-sm"
            >
              Farming <br />
              <span className="text-brand-600 drop-shadow-sm">
                Reimagined
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-800 leading-relaxed max-w-xl font-medium"
            >
              Harness the power of AI to analyze soil, predict crop success, and maximize your yield with precision.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-4"
            >
              <Link to="/soil-analysis" className="cta-btn group flex items-center gap-2">
                Get Started Free
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link to="/about" className="secondary-btn flex items-center px-8 py-4 text-lg rounded-2xl bg-white/50 backdrop-blur-sm border-gray-200 shadow-sm hover:bg-white/80 text-gray-800">
                How it works
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring" }}
            className="relative z-10 perspective-1000 hidden lg:block"
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/50 transform-gpu transition-transform hover:scale-[1.02] duration-500">
              <img
                src="https://images.unsplash.com/photo-1705616458400-60593c810ade?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQwfHx8ZW58MHx8fHx8"
                alt="Smart Farming Dashboard"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/40 via-brand-800/10 to-transparent"></div>

              {/* Removed Floating UI Element Simulation as requested */}
            </div>

            {/* Decorative blurs behind image */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-400 to-blue-400 opacity-20 blur-2xl -z-10 rounded-3xl"></div>
          </motion.div>
        </div>
      </section>


      {/* ================= FEATURES ================= */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-brand-600 font-bold tracking-wide uppercase text-sm mb-3">Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Intelligence for Every Acre
            </h3>
            <p className="text-xl text-gray-500 leading-relaxed font-medium">
              We process millions of data points to give you actionable insights, making your farm more productive and resilient.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              title="Soil Intelligence"
              icon="🌱"
              description="Deep AI analysis of NPK, pH, and moisture levels to precisely determine your soil's health and needs."
            />
            <FeatureCard
              title="Yield Optimization"
              icon="🌾"
              description="Personalized crop recommendations tailored to your specific microclimate and soil profile."
            />
            <FeatureCard
              title="Risk Mitigation"
              icon="⚡"
              description="Proactive alerts for weather shifts, pest risks, and soil degradation before they impact your harvest."
            />
            <FeatureCard
              title="AI Agronomist"
              icon="💬"
              description="24/7 access to an expert AI assistant trained on global agronomy data and your farm's history."
            />
            <FeatureCard
              title="Predictive Analytics"
              icon="📊"
              description="Visualize long-term trends, compare seasonal data, and predict future yields with high accuracy."
            />
            <FeatureCard
              title="Secure & Private"
              icon="🔒"
              description="Bank-grade encryption ensures your proprietary farm data remains strictly yours."
            />
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="py-24 bg-brand-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>

        <div className="relative max-w-7xl mx-auto px-6 border-y border-brand-800/50 py-16">
          <div className="grid md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-brand-800/50">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="px-4 py-8 md:py-0"
            >
              <h3 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-brand-200 mb-2">10k+</h3>
              <p className="text-brand-300 font-medium text-lg uppercase tracking-wider">Active Farms</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="px-4 py-8 md:py-0"
            >
              <h3 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-brand-200 mb-2">95%</h3>
              <p className="text-brand-300 font-medium text-lg uppercase tracking-wider">Prediction Accuracy</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="px-4 py-8 md:py-0"
            >
              <h3 className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-brand-200 mb-2">5M+</h3>
              <p className="text-brand-300 font-medium text-lg uppercase tracking-wider">Acres Analyzed</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="py-32 bg-white text-center px-6 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-[100px] -z-10"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto glass border border-gray-100 p-12 md:p-20 rounded-[3rem] shadow-2xl relative overflow-hidden"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>

          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight relative z-10">
            Ready to Revolutionize Your Harvest?
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto font-medium relative z-10">
            Join thousands of forward-thinking farmers using AI to maximize yield, improve soil health, and secure their future.
          </p>
          <Link
            to="/signup"
            className="cta-btn relative z-10 px-12"
          >
            Create Free Account
          </Link>
        </motion.div>
      </section>

    </div>
  );
};

export default Home;
