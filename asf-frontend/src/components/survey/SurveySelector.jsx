import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, AlertCircle, CheckCircle } from 'lucide-react'

const SurveySelector = () => {
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadActiveSurveys()
  }, [])

  const loadActiveSurveys = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/active`)
      
      if (response.ok) {
        const data = await response.json()
        // Si c'est un seul sondage, on le met dans un tableau
        const surveysArray = Array.isArray(data) ? data : [data]
        setSurveys(surveysArray)
        
        // Si il n'y a qu'un seul sondage actif, rediriger automatiquement
        if (surveysArray.length === 1) {
          setTimeout(() => {
            navigate(`/survey/${surveysArray[0].id}`)
          }, 3000) // Délai de 1.5 secondes pour permettre à l'utilisateur de voir le sondage
        }
      } else if (response.status === 404) {
        setSurveys([])
        setError('Aucun sondage actif disponible pour le moment')
      } else {
        setError('Erreur lors du chargement des sondages')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleSurveySelect = (surveyId) => {
    navigate(`/survey/${surveyId}`)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des sondages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
              ASF Consulting
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sondages Disponibles
          </h1>
          <p className="text-gray-600 text-lg">
            Sélectionnez un sondage pour participer
          </p>
        </div>

        {error && surveys.length === 0 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {surveys.length === 1 && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Un sondage actif trouvé.
            </AlertDescription>
          </Alert>
        )}

        {surveys.length === 0 && !error ? (
          <Card>
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucun sondage disponible
              </h3>
              <p className="text-gray-600">
                Il n'y a actuellement aucun sondage actif. Revenez plus tard.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {surveys.map((survey) => (
              <Card key={survey.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{survey.title}</CardTitle>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Actif
                      </Badge>
                    </div>
                  </div>
                  {survey.description && (
                    <CardDescription className="mt-3">
                      {survey.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 mb-6">
                    {survey.created_at && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Créé le {formatDate(survey.created_at)}
                      </div>
                    )}
                    {survey.questions && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {survey.questions.length} question{survey.questions.length > 1 ? 's' : ''}
                      </div>
                    )}
                    {survey.response_count !== undefined && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2" />
                        {survey.response_count} réponse{survey.response_count > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={() => handleSurveySelect(survey.id)}
                    className="w-full"
                  >
                    Participer au sondage
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pied de page */}
        <div className="text-center mt-12 text-sm text-gray-500">
          <p>
            Sondages proposés par <strong>ASF Consulting</strong>
          </p>
          <p className="mt-1">
            Bureau de consulting tunisien spécialisé dans les sauvegardes environnementales et sociales
          </p>
        </div>
      </div>
    </div>
  )
}

export default SurveySelector

