import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  PieChart,
  TrendingUp
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

const SurveyStats = () => {
  const { surveyId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [surveyData, setSurveyData] = useState(null)
  const [responses, setResponses] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadSurveyStatistics()
    loadSurveyResponses()
  }, [surveyId, currentPage])

  const loadSurveyStatistics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${surveyId}/statistics`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setSurveyData(data)
      } else {
        setError('Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const loadSurveyResponses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${surveyId}/responses?page=${currentPage}&per_page=10`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setResponses(data.responses)
        setTotalPages(data.pages)
      } else {
        setError('Erreur lors du chargement des réponses')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
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

  const renderQuestionStatistics = (questionKey, questionStats) => {
    const question = questionStats.question
    
    return (
      <Card key={questionKey} className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>{question.text}</span>
            <Badge variant={question.required ? "destructive" : "secondary"}>
              {question.required ? "Obligatoire" : "Optionnel"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Type: {question.type} • {questionStats.answered_count} réponse(s) • 
            Taux de réponse: {questionStats.response_rate.toFixed(1)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          {question.type === 'text' && (
            <div className="space-y-2">
              <h4 className="font-medium">Réponses textuelles ({questionStats.text_responses?.length || 0}):</h4>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {questionStats.text_responses?.map((response, index) => (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                    "{response}"
                  </div>
                )) || <p className="text-gray-500">Aucune réponse</p>}
              </div>
            </div>
          )}
          
          {(question.type === 'radio' || question.type === 'select') && questionStats.option_counts && (
            <div className="space-y-2">
              <h4 className="font-medium">Répartition des réponses:</h4>
              {Object.entries(questionStats.option_counts).map(([option, count]) => (
                <div key={option} className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(count / questionStats.answered_count) * 100} 
                      className="w-24 h-2"
                    />
                    <span className="text-sm font-medium">{count} ({((count / questionStats.answered_count) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'checkbox' && questionStats.option_counts && (
            <div className="space-y-2">
              <h4 className="font-medium">Options sélectionnées:</h4>
              {Object.entries(questionStats.option_counts).map(([option, count]) => (
                <div key={option} className="flex items-center justify-between">
                  <span className="text-sm">{option}</span>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(count / surveyData.total_responses) * 100} 
                      className="w-24 h-2"
                    />
                    <span className="text-sm font-medium">{count} sélection(s)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {question.type === 'rating' && questionStats.average_rating && (
            <div className="space-y-2">
              <h4 className="font-medium">Note moyenne: {questionStats.average_rating.toFixed(2)}/5</h4>
              {questionStats.rating_counts && Object.entries(questionStats.rating_counts).map(([rating, count]) => (
                <div key={rating} className="flex items-center justify-between">
                  <span className="text-sm">{rating} étoile(s)</span>
                  <div className="flex items-center space-x-2">
                    <Progress 
                      value={(count / questionStats.answered_count) * 100} 
                      className="w-24 h-2"
                    />
                    <span className="text-sm font-medium">{count} ({((count / questionStats.answered_count) * 100).toFixed(1)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  const renderResponseDetails = (response) => {
    const responseData = JSON.parse(response.responses_json)
    
    return (
      <Card key={response.id} className="mb-4">
        <CardHeader>
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Réponse #{response.id}</span>
            <span className="text-xs text-gray-500">{formatDate(response.submitted_at)}</span>
          </CardTitle>
          <CardDescription>
            {response.user_id ? `Utilisateur ID: ${response.user_id}` : 'Utilisateur anonyme'} • 
            IP: {response.ip_address}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(responseData).map(([questionKey, answer]) => {
              const questionIndex = parseInt(questionKey.replace('question_', ''))
              const question = surveyData?.survey?.questions?.[questionIndex]
              
              return (
                <div key={questionKey} className="border-l-2 border-blue-200 pl-3">
                  <p className="font-medium text-sm">{question?.text || questionKey}</p>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(answer) ? answer.join(', ') : answer || 'Pas de réponse'}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Chargement des statistiques...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="mb-4">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/survey')} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour aux enquêtes
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/survey')} variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{surveyData?.survey?.title}</h1>
            <p className="text-gray-600">{surveyData?.survey?.description}</p>
          </div>
        </div>
        <Badge variant={surveyData?.survey?.is_active ? "default" : "secondary"}>
          {surveyData?.survey?.is_active ? "Active" : "Inactive"}
        </Badge>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Réponses</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveyData?.total_responses || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveyData?.total_questions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {surveyData?.required_questions || 0} obligatoires, {surveyData?.optional_questions || 0} optionnelles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Complétion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveyData?.completion_percentage || 0}%</div>
            <Progress value={surveyData?.completion_percentage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions Répondues (Total)</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveyData?.total_answered_questions || 0}</div>
            <p className="text-xs text-muted-foreground">
              sur {surveyData?.total_possible_answers || 0} possibles
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Statistics and Responses */}
      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statistics" className="flex items-center space-x-2">
            <PieChart className="w-4 h-4" />
            <span>Statistiques par Question</span>
          </TabsTrigger>
          <TabsTrigger value="responses" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Réponses Détaillées</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="mt-6">
          <div className="space-y-4">
            {surveyData?.statistics && Object.entries(surveyData.statistics).map(([questionKey, questionStats]) =>
              renderQuestionStatistics(questionKey, questionStats)
            )}
          </div>
        </TabsContent>

        <TabsContent value="responses" className="mt-6">
          <div className="space-y-4">
            {responses.length > 0 ? (
              <>
                {responses.map(renderResponseDetails)}
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Précédent
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {currentPage} sur {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Suivant
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réponse</h3>
                  <p className="text-gray-500">Cette enquête n'a pas encore reçu de réponses.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SurveyStats

