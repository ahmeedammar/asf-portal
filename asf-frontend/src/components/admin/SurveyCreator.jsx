import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save,
  Building2
} from 'lucide-react'
import { API_BASE_URL } from '../../config/api'

const SurveyCreator = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    is_active: false,
    questions: []
  })

  const questionTypes = [
    { value: 'text', label: 'Texte libre' },
    { value: 'radio', label: 'Choix unique' },
    { value: 'checkbox', label: 'Choix multiple' },
    { value: 'select', label: 'Liste déroulante' },
    { value: 'rating', label: 'Notation (1-5)' }
  ]

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      text: '',
      type: 'text',
      required: false,
      options: []
    }
    setSurvey(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }))
  }

  const updateQuestion = (questionId, field, value) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, [field]: value } : q
      )
    }))
  }

  const deleteQuestion = (questionId) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }))
  }

  const addOption = (questionId) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { ...q, options: [...q.options, ''] }
          : q
      )
    }))
  }

  const updateOption = (questionId, optionIndex, value) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.map((opt, idx) => 
                idx === optionIndex ? value : opt
              )
            }
          : q
      )
    }))
  }

  const deleteOption = (questionId, optionIndex) => {
    setSurvey(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId 
          ? { 
              ...q, 
              options: q.options.filter((_, idx) => idx !== optionIndex)
            }
          : q
      )
    }))
  }

  const saveSurvey = async () => {
    if (!survey.title.trim()) {
      setError('Le titre de l\'enquête est obligatoire')
      return
    }

    if (survey.questions.length === 0) {
      setError('L\'enquête doit contenir au moins une question')
      return
    }

    // Validate questions
    for (const question of survey.questions) {
      if (!question.text.trim()) {
        setError('Toutes les questions doivent avoir un texte')
        return
      }
      
      if (['radio', 'checkbox', 'select'].includes(question.type) && question.options.length < 2) {
        setError(`La question "${question.text}" doit avoir au moins 2 options`)
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(survey)
      })

      if (response.ok) {
        setSuccess('Enquête créée avec succès!')
        setTimeout(() => {
          navigate('/survey')
        }, 2000)
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la création de l\'enquête')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const needsOptions = (type) => {
    return ['radio', 'checkbox', 'select'].includes(type)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header with ASF Logo */}
      <div className="mb-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/survey')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la liste
        </Button>
        
        <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
          <CardHeader>
            <div className="flex items-center space-x-4">
              <img src="/asf-logo.png" alt="ASF Consulting Logo" className="h-12 w-12" />
              <div>
                <CardTitle className="text-2xl">ASF Consulting</CardTitle>
                <CardDescription className="text-blue-100">
                  Création d'une nouvelle enquête
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Alerts */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Survey Basic Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Informations de base</CardTitle>
          <CardDescription>
            Définissez le titre et la description de votre enquête
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Titre de l'enquête *</Label>
            <Input
              id="title"
              value={survey.title}
              onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Entrez le titre de votre enquête"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={survey.description}
              onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Décrivez brièvement votre enquête (optionnel)"
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={survey.is_active}
              onCheckedChange={(checked) => setSurvey(prev => ({ ...prev, is_active: checked }))}
            />
            <Label htmlFor="is_active">Activer l'enquête immédiatement</Label>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Questions</CardTitle>
              <CardDescription>
                Ajoutez les questions de votre enquête
              </CardDescription>
            </div>
            <Button onClick={addQuestion}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {survey.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune question ajoutée</p>
              <p className="text-sm">Cliquez sur "Ajouter une question" pour commencer</p>
            </div>
          ) : (
            <div className="space-y-6">
              {survey.questions.map((question, index) => (
                <Card key={question.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteQuestion(question.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Texte de la question *</Label>
                      <Input
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                        placeholder="Entrez votre question"
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Type de question</Label>
                        <Select
                          value={question.type}
                          onValueChange={(value) => {
                            updateQuestion(question.id, 'type', value)
                            if (!needsOptions(value)) {
                              updateQuestion(question.id, 'options', [])
                            }
                          }}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {questionTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 mt-6">
                        <Switch
                          checked={question.required}
                          onCheckedChange={(checked) => updateQuestion(question.id, 'required', checked)}
                        />
                        <Label>Question obligatoire</Label>
                      </div>
                    </div>

                    {/* Options for choice questions */}
                    {needsOptions(question.type) && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label>Options de réponse</Label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addOption(question.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Ajouter une option
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteOption(question.id, optionIndex)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={() => navigate('/survey')}>
          Annuler
        </Button>
        <Button onClick={saveSurvey} disabled={loading}>
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Création...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Créer l'enquête
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SurveyCreator

