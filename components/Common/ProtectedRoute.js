// In React Native with react-navigation, protected routes are handled via navigation guards or context checks.
// This file provides a helper hook to check auth state.
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";

export const useRequireAuth = (navigation) => {
  const { user } = useContext(AuthContext);
  useEffect(() => {
    if (!user) {
      navigation.replace("Login");
    }
  }, [user]);
};
