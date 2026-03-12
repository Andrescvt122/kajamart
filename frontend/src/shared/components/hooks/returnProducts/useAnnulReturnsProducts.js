import { useAnnulReturnProduct } from "./useAnnulReturnProduct";

export const useAnnulReturnsProducts = () => {
  const { annulReturnProduct, loading, error } = useAnnulReturnProduct();

  return {
    annulReturnsProducts: annulReturnProduct,
    loading,
    error,
  };
};
