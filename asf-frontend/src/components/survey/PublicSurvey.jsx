import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CheckCircle, AlertCircle } from 'lucide-react'

const PublicSurvey = () => {
  const { surveyId } = useParams()
  const [survey, setSurvey] = useState(null)
  const [responses, setResponses] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    loadSurvey()
  }, [surveyId])

  const loadSurvey = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}/public`)
      
      if (response.ok) {
        const data = await response.json()
        setSurvey(data)
        // Initialiser les réponses
        const initialResponses = {}
        data.questions.forEach((question, index) => {
          const questionId = question.id || `question_${index}`
          if (question.type === 'checkbox') {
            initialResponses[questionId] = []
          } else {
            initialResponses[questionId] = ''
          }
        })
        setResponses(initialResponses)
      } else if (response.status === 404) {
        setError('Enquête non trouvée ou inactive')
      } else {
        setError('Erreur lors du chargement de l\'enquête')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    })
    
    // Supprimer l'erreur de validation si elle existe
    if (validationErrors[questionId]) {
      setValidationErrors({
        ...validationErrors,
        [questionId]: null
      })
    }
  }

  const handleCheckboxChange = (questionId, option, checked) => {
    const currentValues = responses[questionId] || []
    let newValues
    
    if (checked) {
      newValues = [...currentValues, option]
    } else {
      newValues = currentValues.filter(v => v !== option)
    }
    
    handleInputChange(questionId, newValues)
  }

  const validateResponses = () => {
    const errors = {}
    
    survey.questions.forEach((question, index) => {
      const questionId = question.id || `question_${index}`
      if (question.required) {
        const response = responses[questionId]
        
        if (!response || 
            (Array.isArray(response) && response.length === 0) ||
            (typeof response === 'string' && response.trim() === '')) {
          errors[questionId] = 'Cette question est obligatoire'
        }
      }
    })
    
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const submitSurvey = async (e) => {
    e.preventDefault()
    
    if (!validateResponses()) {
      setError('Veuillez répondre à toutes les questions obligatoires')
      return
    }
    
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses }),
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de l\'envoi des réponses')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const renderQuestion = (question, index) => {
    const questionId = question.id || `question_${index}`
    const hasError = validationErrors[questionId]
    
    switch (question.type) {
      case 'text':
        return (
          <div key={questionId} className="space-y-2">
            <Label htmlFor={`question-${questionId}`} className="flex items-center">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={`question-${questionId}`}
              value={responses[questionId] || ''}
              onChange={(e) => handleInputChange(questionId, e.target.value)}
              placeholder="Votre réponse..."
              rows={3}
              className={hasError ? 'border-red-500' : ''}
            />
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        )

      case 'radio':
        return (
          <div key={questionId} className="space-y-3">
            <Label className="flex items-center">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={responses[questionId] || ''}
              onValueChange={(value) => handleInputChange(questionId, value)}
              className={hasError ? 'border border-red-500 rounded p-2' : ''}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionId}-${index}`} />
                  <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        )

      case 'checkbox':
        return (
          <div key={questionId} className="space-y-3">
            <Label className="flex items-center">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className={`space-y-2 ${hasError ? 'border border-red-500 rounded p-2' : ''}`}>
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${questionId}-${index}`}
                    checked={(responses[questionId] || []).includes(option)}
                    onCheckedChange={(checked) => handleCheckboxChange(questionId, option, checked)}
                  />
                  <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
                </div>
              ))}
            </div>
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        )

      case 'select':
        return (
          <div key={questionId} className="space-y-2">
            <Label className="flex items-center">
              {question.text}
              {question.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={responses[questionId] || ''}
              onValueChange={(value) => handleInputChange(questionId, value)}
            >
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder="Sélectionnez une option" />
              </SelectTrigger>
              <SelectContent>
                {question.options.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && (
              <p className="text-sm text-red-500">{hasError}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (loading && !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'enquête...</p>
        </div>
      </div>
    )
  }

  if (error && !survey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Merci !</h2>
            <p className="text-gray-600">
              Vos réponses ont été enregistrées avec succès.
            </p>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>ASF Consulting</strong><br />
                Votre avis nous aide à améliorer nos services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium">
              ASF Consulting
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {survey?.title}
          </h1>
          {survey?.description && (
            <p className="text-gray-600 text-lg">
              {survey.description}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Formulaire */}
        <Card>
          <CardContent className="p-6">
            <form onSubmit={submitSurvey} className="space-y-6">
              {survey?.questions.map((question, index) => (
                <div key={question.id || `question_${index}`} className="pb-6 border-b border-gray-200 last:border-b-0">
                  <div className="mb-4">
                    <span className="text-sm text-gray-500 font-medium">
                      Question {index + 1} sur {survey.questions.length}
                    </span>
                  </div>
                  {renderQuestion(question, index)}
                </div>
              ))}

              <div className="pt-6">
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Envoi en cours...' : 'Envoyer mes réponses'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Pied de page */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Cette enquête est proposée par <strong>ASF Consulting</strong>
          </p>
          <p className="mt-1">
            Société de conseil tunisienne spécialisée dans les sauvegardes environnementales et sociales
          </p>
        </div>
      </div>
    </div>
  )
}

export default PublicSurvey

