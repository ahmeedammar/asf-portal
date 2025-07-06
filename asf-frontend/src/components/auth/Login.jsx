import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '../../App'
import { LogIn, Eye, EyeOff } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!formData.username || !formData.password) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    const result = await login(formData.username, formData.password)
    
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Erreur de connexion')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre animés */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <img 
                src="/asf-logo.png" 
                alt="ASF Consulting Logo" 
                className="h-20 w-auto animate-bounce-slow"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 opacity-20 rounded-full blur-xl animate-pulse"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 animate-slide-up">
            ASF Consulting
          </h1>
          <p className="text-gray-600 animate-slide-up-delay">
            Portail Client - Votre espace de collaboration
          </p>
        </div>

        {/* Carte de connexion avec animations */}
        <Card className="backdrop-blur-sm bg-white/90 shadow-2xl border-0 animate-scale-in">
          <CardHeader className="space-y-1 pb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg animate-float">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-gray-900">Connexion</CardTitle>
            <CardDescription className="text-center text-gray-600">
              Connectez-vous à votre compte ASF Consulting
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="animate-shake">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 font-medium">Nom d'utilisateur</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Entrez votre nom d'utilisateur"
                  disabled={loading}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 hover:border-orange-300"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 font-medium">Mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Entrez votre mot de passe"
                    disabled={loading}
                    className="border-gray-300 focus:border-orange-500 focus:ring-orange-500 transition-all duration-300 hover:border-orange-300 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <Link 
                  to="/register" 
                  className="text-orange-600 hover:text-orange-500 font-medium transition-colors duration-300 hover:underline"
                >
                  Créer un compte
                </Link>
              </p>
            </div>
            
            {/* <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <p className="text-xs text-gray-700 text-center">
                <strong className="text-orange-800">Compte administrateur de test :</strong><br />
                Nom d'utilisateur : <span className="font-mono bg-white px-1 rounded">admin</span><br />
                Mot de passe : <span className="font-mono bg-white px-1 rounded">admin123</span>
              </p>
            </div> */}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 animate-fade-in-delay">
          <p className="text-sm text-gray-500">
            © 2025 ASF Consulting - Your Sustainability Partner
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login

