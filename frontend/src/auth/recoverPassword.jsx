import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import tiendaImg from "../assets/image.png";
import logoImg from "../assets/logo.png";
import api from "../api/axiosConfig";

const Loading = () => (
    <div className="flex items-center justify-center min-h-screen bg-black/50">
      <div className="w-16 h-16 border-4 border-t-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
);

export default function RecoverPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtenemos el email enviado desde la pantalla anterior
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Si no hay email (alguien entró por URL directa), lo devolvemos
  useEffect(() => {
    if (!email) {
        navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
        return setError("Las contraseñas no coinciden.");
    }
    if (code.length < 6) {
        return setError("El código debe tener 6 dígitos.");
    }

    setLoading(true);
    try {
      // Petición al Backend
      await api.post("/auth/reset-password", { 
          email: email, 
          codigo: code, 
          newPassword: password 
      });
      
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Código incorrecto o expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4">
      {/* Fondo */}
      <div className="absolute inset-0 z-0" style={{ backgroundImage: `url(${tiendaImg})`, backgroundSize: "cover", filter: "blur(10px) brightness(1.1)" }}></div>
      <div className="absolute inset-0 bg-black/20 z-10"></div>

      {/* Contenedor Principal */}
      <div className="relative z-20 w-full max-w-md p-8 bg-white/20 backdrop-blur-md rounded-3xl shadow-xl border border-white/10">
        
        {submitted ? (
           // --- VISTA DE ÉXITO ---
           <div className="text-center text-white">
             <motion.div 
               initial={{ scale: 0 }} animate={{ scale: 1 }}
               className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-lg"
             >
                <span className="text-3xl">✓</span>
             </motion.div>
             <h1 className="text-2xl font-bold">¡Éxito!</h1>
             <p className="mt-4 text-white/90">Contraseña actualizada correctamente.</p>
             <Link to="/" className="mt-6 block w-full py-2 bg-emerald-600 rounded-xl hover:bg-emerald-700 font-bold transition">
                Iniciar Sesión
             </Link>
           </div>
        ) : (
           // --- VISTA DE FORMULARIO ---
           <>
             <img src={logoImg} className="w-24 mx-auto mb-4" alt="logo"/>
             <h2 className="text-center text-white text-2xl font-bold mb-1">Verificar Código</h2>
             <p className="text-center text-white/80 text-sm mb-6">
                Enviado a: <span className="font-bold text-emerald-300">{email}</span>
             </p>

             {error && (
                <div className="bg-red-500/80 text-white p-2 rounded-lg mb-4 text-center text-sm border border-red-400">
                    {error}
                </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Input Código */}
                <div className="relative">
                    <label className="text-white text-sm font-medium ml-1">Código (6 dígitos)</label>
                    <input 
                        type="text" 
                        maxLength="6" 
                        value={code} 
                        // Corregido: onChange maneja el estado correctamente permitiendo escribir
                        onChange={(e) => setCode(e.target.value.replace(/\D/g,''))} 
                        className="w-full pl-3 py-2 mt-1 rounded-xl text-center tracking-widest font-bold text-lg text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                        placeholder="000000" 
                        required
                    />
                    <KeyRound className="absolute right-3 top-9 text-gray-500" size={18}/>
                </div>
                
                {/* Input Nueva Password */}
                <div className="relative">
                    <label className="text-white text-sm font-medium ml-1">Nueva Contraseña</label>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className="w-full pl-3 py-2 mt-1 rounded-xl text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                        required 
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-9 text-gray-500 hover:text-emerald-600"
                    >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                    </button>
                </div>

                {/* Input Confirmar Password */}
                <div className="relative">
                    <label className="text-white text-sm font-medium ml-1">Confirmar Contraseña</label>
                    <input 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="w-full pl-3 py-2 mt-1 rounded-xl text-gray-900 bg-white/90 focus:outline-none focus:ring-2 focus:ring-emerald-400" 
                        required 
                        minLength={6}
                        placeholder="Repite la contraseña"
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-2 transition shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                    Cambiar Contraseña
                </button>
             </form>
             
             {/* 🔴 AQUÍ ESTABA EL ERROR: Cambié 'class' por 'className' */}
             <Link to="/forgot-password" className="block text-center mt-4 text-white/70 text-sm hover:text-white transition">
                ¿No llegó el código? Reintentar
             </Link>
           </>
        )}
      </div>
    </div>
  );
}