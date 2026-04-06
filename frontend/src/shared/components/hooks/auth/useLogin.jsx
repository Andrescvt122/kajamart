import {useState, useCallback} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from '../../../../context/useAtuh';
const TOKEN_COOKIE_NAME = "kajamart_token";

export const useLogin = ()=>{
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState(null);
    const INVALID_CREDENTIALS_MESSAGE = "Correo y/o contraseña incorrectas";
    const URL_LOGIN = "https://kajamart-api-hmate3egacewdkct.canadacentral-01.azurewebsites.net/kajamart/api/auth/login"
    const login=useCallback(
        async ({email, password}) =>{
            setLoading(true);
            setError(null);
            try{
                //payload
                const {data}= await axios.post(URL_LOGIN,{email, password});
                //token
                const token = data?.token;
                if(!token) throw new Error("La respuesta no trae token");
                //guardar token en cookies
                Cookies.set(TOKEN_COOKIE_NAME, token, {
                    expires: 7, 
                    sameSite: 'Strict',
                    //si esta en produccino = true, si esta en desarrollo = false
                    secure: import.meta.env.PROD,
                });
                return {ok:true, token, data};
            }catch(err){
                let message = "Error al iniciar sesión.";
                const status = err.response?.status;
                if (!err.response) {
                    message = "no se puede establecer conexión";
                } else if (status === 401) {
                    message = INVALID_CREDENTIALS_MESSAGE;
                } else {
                    const data = err.response.data;
                    message = (typeof data === 'string' ? data : data?.message || data?.error || data?.msg) || err.message || message;
                }
                setError(message);
                return{ok:false, message, status};
            }finally{
                setLoading(false);
            }
        },
        []
    );
    const logout = useCallback(()=>{
        Cookies.remove(TOKEN_COOKIE_NAME);
    }, []);
    const getToken = useCallback (()=>{
        return Cookies.get(TOKEN_COOKIE_NAME);
    }, []);
    return{
        login, logout, getToken, loading, error
    }
}

