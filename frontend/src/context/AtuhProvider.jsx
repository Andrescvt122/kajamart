import React, { useEffect, useMemo, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./authContext";
import { useLogin } from "../shared/components/hooks/auth/useLogin";        // ajusta ruta
import { useRoleById } from "../shared/components/hooks/roles/useRoleById";     // ajusta ruta

const isExpired = (payload) => {
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

const mapRolePermissions = (roleData) => {
  return (
    roleData?.rol_permisos
      ?.map((rp) => rp?.permisos?.permiso_nombre)
      ?.filter(Boolean) || []
  );
};

export const AuthProvider = ({ children }) => {
  const { login, logout: logoutCookie, getToken } = useLogin();
  const { getRoleById } = useRoleById();

  const [payload, setPayload] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const initFromToken = useCallback(
    async (token) => {
      try {
        const decoded = jwtDecode(token);

        if (isExpired(decoded)) {
          logoutCookie();
          setPayload(null);
          setPermissions([]);
          setRole(null);
          return;
        }

        setPayload(decoded);
        console.log("✅ Token válido. Payload:", decoded);
        const roleData = await getRoleById(decoded.rol_id);
        setRole(roleData);

        setPermissions(mapRolePermissions(roleData));
      } catch {
        logoutCookie();
        setPayload(null);
        setPermissions([]);
        setRole(null);
      }
    },
    [getRoleById, logoutCookie]
  );

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      await initFromToken(token);
      setLoading(false);
    })();
  }, [getToken, initFromToken]);

  const signIn = useCallback(
    async ({ email, password }) => {
      setLoading(true);
      const res = await login({ email, password });
      if (res?.ok && res?.token) {
        await initFromToken(res.token);
      }
      setLoading(false);
      return res;
    },
    [login, initFromToken]
  );

  const signOut = useCallback(() => {
    logoutCookie();
    setPayload(null);
    setPermissions([]);
    setRole(null);
  }, [logoutCookie]);

  const isAuthenticated = !!payload && !isExpired(payload);

  const hasPermission = useCallback(
    (permName) => permissions?.includes(permName),
    [permissions]
  );
  console.log("User permissions:", permissions);
  const value = useMemo(
    () => ({
      loading,
      isAuthenticated,
      payload,
      role,
      permissions,
      signIn,
      signOut,
      hasPermission,
    }),
    [loading, isAuthenticated, payload, role, permissions, signIn, signOut, hasPermission]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
