import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../../config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '../../App'
import { Plus, MessageSquare, User, Calendar, Search, Edit, Trash2 } from 'lucide-react'

const Forum = () => {
  const { user } = useAuth()
  const [questions, setQuestions] = useState([])
  const [selectedQuestion, setSelectedQuestion] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showNewQuestionForm, setShowNewQuestionForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Formulaires
  const [newQuestion, setNewQuestion] = useState({ title: '', content: '' })
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    loadQuestions()
  }, [currentPage, searchTerm])

  const loadQuestions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions?page=${currentPage}&per_page=10`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setQuestions(data.questions)
        setTotalPages(data.pages)
      } else {
        setError('Erreur lors du chargement des questions')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const loadQuestionDetails = async (questionId) => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSelectedQuestion(data)
        setComments(data.comments || [])
      } else {
        setError('Erreur lors du chargement de la question')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const createQuestion = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!newQuestion.title || !newQuestion.content) {
      setError('Veuillez remplir tous les champs')
      setLoading(false)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newQuestion),
      })

      if (response.ok) {
        setSuccess('Question créée avec succès')
        setNewQuestion({ title: '', content: '' })
        setShowNewQuestionForm(false)
        loadQuestions()
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de la création de la question')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const createComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim() || !selectedQuestion) return

    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${selectedQuestion.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        setNewComment('')
        loadQuestionDetails(selectedQuestion.id)
        setSuccess('Commentaire ajouté avec succès')
      } else {
        const data = await response.json()
        setError(data.error || 'Erreur lors de l\'ajout du commentaire')
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

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (selectedQuestion) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => setSelectedQuestion(null)}
          >
            ← Retour aux questions
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Question détaillée */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-2xl">{selectedQuestion.title}</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>{selectedQuestion.author?.username}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(selectedQuestion.created_at)}</span>
                  </div>
                  <Badge variant="secondary">
                    {comments.length} commentaire{comments.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="whitespace-pre-wrap">{selectedQuestion.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Commentaires */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">
            Commentaires ({comments.length})
          </h3>

          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{comment.author?.username}</span>
                    <span>•</span>
                    <span>{formatDate(comment.created_at)}</span>
                  </div>
                </div>
                <p className="whitespace-pre-wrap">{comment.content}</p>
              </CardContent>
            </Card>
          ))}

          {/* Formulaire nouveau commentaire */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ajouter un commentaire</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={createComment} className="space-y-4">
                <div>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Écrivez votre commentaire..."
                    rows={4}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" disabled={loading || !newComment.trim()}>
                  {loading ? 'Ajout...' : 'Ajouter le commentaire'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Centre d'aide</h1>
          <p className="text-gray-600 mt-2">
            Posez vos questions et consultez les réponses de la communauté
          </p>
        </div>
        <Button onClick={() => setShowNewQuestionForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle question
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Barre de recherche */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher dans les questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Formulaire nouvelle question */}
      {showNewQuestionForm && (
        <Card>
          <CardHeader>
            <CardTitle>Poser une nouvelle question</CardTitle>
            <CardDescription>
              Décrivez votre problème ou votre question de manière claire et détaillée
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createQuestion} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre de la question</Label>
                <Input
                  id="title"
                  value={newQuestion.title}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                  placeholder="Résumez votre question en quelques mots"
                  disabled={loading}
                />
              </div>
              <div>
                <Label htmlFor="content">Description détaillée</Label>
                <Textarea
                  id="content"
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                  placeholder="Décrivez votre problème ou question en détail..."
                  rows={6}
                  disabled={loading}
                />
              </div>
              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Publication...' : 'Publier la question'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewQuestionForm(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des questions */}
      <div className="space-y-4">
        {loading && questions.length === 0 ? (
          <div className="text-center py-8">
            <p>Chargement des questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searchTerm ? 'Aucune question trouvée pour votre recherche.' : 'Aucune question pour le moment.'}
              </p>
              {!searchTerm && (
                <Button 
                  className="mt-4" 
                  onClick={() => setShowNewQuestionForm(true)}
                >
                  Poser la première question
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredQuestions.map((question) => (
            <Card 
              key={question.id} 
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => loadQuestionDetails(question.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg hover:text-blue-600">
                      {question.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{question.author?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(question.created_at)}</span>
                      </div>
                      <Badge variant="secondary">
                        {question.comments_count} commentaire{question.comments_count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-2">
                  {question.content.substring(0, 200)}
                  {question.content.length > 200 ? '...' : ''}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <span className="flex items-center px-4">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  )
}

export default Forum

