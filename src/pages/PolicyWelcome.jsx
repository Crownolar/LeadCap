import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PolicyWelcome = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            initial={{ rotate: -20 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-emerald-500 w-20 h-20 rounded-full flex items-center justify-center shadow-xl"
          >
            <ShieldCheck className="text-white w-12 h-12" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-3xl font-bold text-white mb-3"
        >
          Welcome, Policy Makers
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="text-gray-300 text-lg"
        >
          <span className="text-emerald-400 font-semibold">
            Health Management
          </span>
          <br />
          Empowering decisions with accurate lead exposure insights.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PolicyWelcome;
