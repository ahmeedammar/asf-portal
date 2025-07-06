import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Plus, 
  Trash2, 
  Eye, 
  BarChart3,
  Users,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

const SurveyManagement = () => {
  const navigate = useNavigate()
  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSurveys()
  }, [])

  const loadSurveys = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSurveys(data)
      } else {
        setError('Erreur lors du chargement des enquêtes')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const deleteSurvey = async (surveyId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette enquête ? Cette action est irréversible.')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${surveyId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setSurveys(surveys.filter(survey => survey.id !== surveyId))
      } else {
        setError('Erreur lors de la suppression de l\'enquête')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const toggleSurveyStatus = async (surveyId, isActive) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate'
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${surveyId}/${endpoint}`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        loadSurveys() // Reload to get updated data
      } else {
        setError('Erreur lors de la modification du statut de l\'enquête')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des enquêtes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Enquêtes</h1>
          <p className="text-gray-600 mt-2">Gérez vos enquêtes et consultez leurs statistiques</p>
        </div>
        <Button 
          onClick={() => navigate('/survey/create')}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Enquête</span>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Surveys Grid */}
      {surveys.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune enquête</h3>
            <p className="text-gray-600 mb-6">Commencez par créer votre première enquête</p>
            <Button onClick={() => navigate('/survey/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une enquête
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {surveys.map((survey) => (
            <Card key={survey.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{survey.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {survey.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={survey.is_active ? "default" : "secondary"}
                    className={survey.is_active ? "bg-green-100 text-green-800" : ""}
                  >
                    {survey.is_active ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  {/* Survey Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      <span>{survey.responses_count || 0} réponses</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(survey.created_at)}</span>
                    </div>
                  </div>

                  {/* Questions Count */}
                  <div className="text-sm text-gray-600">
                    {JSON.parse(survey.questions_json || '[]').length} question(s)
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/survey/${survey.id}/stats`)}
                      className="flex-1"
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/survey/edit/${survey.id}`)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/survey/${survey.id}`)}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    
                    <Button
                      variant={survey.is_active ? "secondary" : "default"}
                      size="sm"
                      onClick={() => toggleSurveyStatus(survey.id, survey.is_active)}
                      className="flex-1"
                    >
                      {survey.is_active ? 'Désactiver' : 'Activer'}
                    </Button>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteSurvey(survey.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default SurveyManagement

