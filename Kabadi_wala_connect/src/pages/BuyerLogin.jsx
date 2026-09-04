import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { loginBuyer } from "../services/authService";
import { FaStore, FaEnvelope, FaLock } from "react-icons/fa";

export const BuyerLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginBuyer(email.trim(), password);
      navigate("/buyer/dashboard");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center p-4 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-3xl mx-auto mb-4">
            <FaStore />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Buyer Login</h1>
          <p className="text-sm text-gray-600 mt-1">Access your recycler dashboard</p>
        </div>

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Business email"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-2 border-gray-200 font-bold focus:border-emerald-600 focus:outline-none"
              />
            </div>
            {error && <p className="text-xs font-bold text-red-600">⚠️ {error}</p>}
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">
              Log In as Buyer
            </Button>
          </form>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          New buyer?{" "}
          <Link to="/buyer/register" className="font-bold text-emerald-700 hover:underline">
            Register depot
          </Link>
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Collector Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
