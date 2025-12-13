import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, AlertCircle } from "lucide-react"; 
import tiendaImg from "../assets/image.png"; 
import logoImg from "../assets/logo.png"; 
import api from "../api/axiosConfig"; 

const Loading = () => (
  <div className="flex items-center justify-center min-h-screen bg-black/50">
    <div className="w-16 h-16 border-4 border-t-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      // 👉 REDIRECCIÓN CLAVE: Mandamos al usuario a la pantalla de código
      navigate("/verify-code", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.error || "Error al enviar el correo.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${tiendaImg})`, backgroundSize: "cover", filter: "blur(10px) brightness(1.1)" }}></div>
      <div className="absolute inset-0 bg-black/20 z-10"></div>

      <div className="relative z-20 w-full max-w-md p-8 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl">
        <Link to="/"><motion.img src={logoImg} className="w-32 mb-6 mx-auto" whileHover={{ scale: 1.1 }} /></Link>
        
        <h1 className="text-2xl font-bold text-center text-white mb-2">Recuperar Contraseña</h1>
        <p className="text-center text-white/90 text-sm mb-6">Ingresa tu correo para recibir el código.</p>

        {error && <div className="bg-red-500/80 text-white p-3 rounded-xl mb-4 flex gap-2"><AlertCircle size={20}/>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
             <label className="text-white text-sm font-medium">Correo</label>
             {/* 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE 👇 */}
             <input 
               type="email" 
               required 
               value={email} 
               onChange={e => setEmail(e.target.value)} 
               className="w-full pl-10 py-2 mt-1 text-gray-900 placeholder-gray-400 bg-white/70 border border-white/40 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400" 
               placeholder="tu@email.com"
             />
             <Mail className="absolute left-3 top-9 text-gray-500" size={18}/>
          </div>
          <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition">Enviar Código</button>
        </form>
        <Link to="/" className="block text-center mt-4 text-white/80 hover:text-white text-sm">Volver</Link>
      </div>
    </div>
  );
}