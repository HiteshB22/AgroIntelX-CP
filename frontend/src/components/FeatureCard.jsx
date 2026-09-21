import { motion } from "framer-motion";

const FeatureCard = ({ title, description, icon }) => {
  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative h-full"
    >
      <div className="absolute inset-0 bg-linear-to-br from-brand-100 to-transparent opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300 -z-10 blur-xl"></div>
      
      <div className="h-full bg-white border border-gray-100 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-start relative overflow-hidden">
        
        {/* Decorative subtle background icon */}
        <div className="absolute -right-6 -bottom-6 text-9xl opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
          {icon}
        </div>

        <div className="w-14 h-14 bg-brand-50 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-inner group-hover:bg-brand-500 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-700 transition-colors">
          {title}
        </h3>

        <p className="text-gray-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
