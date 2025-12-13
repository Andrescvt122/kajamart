import {useState, useCallback} from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

const TOKEN_COOKIE_NAME = "kajamart_token";

export const useLogin = ()=>{
    const [loading, setLoading]=useState(false);
    const [error, setError]=useState(null);
    const URL_LOGIN = "http://localhost:3000/kajamart/api/auth/login"
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
                const message =
                err?.response?.data?.message ||
                err.message ||
                "Error al iniciar sesión.";
                setError(message);
                return{ok:false, message};
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

