import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect, createContext, useContext } from "react";
import { API_BASE_URL } from "./config/api";
import Navbar from "./components/Navbar";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/Dashboard";
import Forum from "./components/forum/Forum";
import AdminPanel from "./components/admin/AdminPanel";
import Survey from "./components/survey/Survey";
import PublicSurvey from "./components/survey/PublicSurvey";
import SurveyEdit from "./components/admin/SurveyEdit";
import SurveyStats from "./components/survey/SurveyStats";
import SurveyManagement from "./components/admin/SurveyManagement";
import SurveyCreator from "./components/admin/SurveyCreator";
import SurveySelector from "./components/survey/SurveySelector";
import "./App.css";

// Context pour l'authentification
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Composant pour protéger les routes
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error(
        "Erreur lors de la vérification de l'authentification:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion au serveur" };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion au serveur" };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    } finally {
      setUser(null);
    }
  };

  const authValue = {
    user,
    login,
    register,
    logout,
    loading,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Chargement de l'application...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={authValue}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              {/* Routes publiques */}
              <Route
                path="/survey/:surveyId/public"
                element={<PublicSurvey />}
              />
              <Route
                path="/login"
                element={
                  user ? <Navigate to="/dashboard" replace /> : <Login />
                }
              />
              <Route
                path="/register"
                element={
                  user ? <Navigate to="/dashboard" replace /> : <Register />
                }
              />
              <Route
                path="/survey/:surveyId"
                element={
                  user && user.is_admin ? <Survey /> : <SurveySelector />
                }
              />
              <Route path="/surveys" element={<SurveySelector />} />

              {/* Routes protégées */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forum"
                element={
                  <ProtectedRoute>
                    <Forum />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/survey"
                element={
                  <ProtectedRoute adminOnly>
                    <SurveyManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/survey/edit/:id" element={<SurveyEdit />} />
              <Route
                path="/survey/create"
                element={
                  <ProtectedRoute adminOnly>
                    <SurveyCreator />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/survey/:surveyId/stats"
                element={
                  <ProtectedRoute adminOnly>
                    <SurveyStats />
                  </ProtectedRoute>
                }
              />

              {/* Redirection par défaut */}
              <Route
                path="/"
                element={
                  user ? (
                    <Navigate to="/dashboard" replace />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
