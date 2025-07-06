import { useState, useEffect } from 'react'
import { API_BASE_URL } from '../../config/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAuth } from '../../App'
import { Users, MessageSquare, Eye, EyeOff, Trash2, Search, RefreshCw } from 'lucide-react'

const AdminPanel = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [questions, setQuestions] = useState([])
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadUsers()
    loadQuestions()
    loadComments()
  }, [currentPage])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      } else {
        setError('Erreur lors du chargement des utilisateurs')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  const loadQuestions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/questions?page=${currentPage}&per_page=20`, {
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
    }
  }

  const loadComments = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/comments?page=${currentPage}&per_page=20`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments)
      } else {
        setError('Erreur lors du chargement des commentaires')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        setSuccess(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`)
        loadUsers()
      } else {
        setError('Erreur lors de la modification de l\'utilisateur')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const toggleQuestionStatus = async (questionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/questions/${questionId}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess('Statut de la question modifié avec succès')
        loadQuestions()
      } else {
        setError('Erreur lors de la modification de la question')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const toggleCommentStatus = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/comments/${commentId}/toggle`, {
        method: 'PUT',
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess('Statut du commentaire modifié avec succès')
        loadComments()
      } else {
        setError('Erreur lors de la modification du commentaire')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setSuccess('Utilisateur supprimé avec succès')
        loadUsers()
      } else {
        setError('Erreur lors de la suppression de l\'utilisateur')
      }
    } catch (error) {
      setError('Erreur de connexion au serveur')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.company && user.company.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredQuestions = questions.filter(question =>
    question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    question.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredComments = comments.filter(comment =>
    comment.content.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administration</h1>
          <p className="text-gray-600 mt-2">
            Gérez les utilisateurs et modérez le contenu
          </p>
        </div>
        <Button onClick={() => { loadUsers(); loadQuestions(); loadComments(); }}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
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

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.is_active).length} actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions totales</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{questions.length}</div>
            <p className="text-xs text-muted-foreground">
              {questions.filter(q => q.is_active).length} actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commentaires totaux</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{comments.length}</div>
            <p className="text-xs text-muted-foreground">
              {comments.filter(c => c.is_active).length} actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="comments">Commentaires</TabsTrigger>
        </TabsList>

        {/* Gestion des utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <CardDescription>
                Gérez les comptes utilisateurs et leurs permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.company || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_admin ? 'destructive' : 'outline'}>
                          {user.is_admin ? 'Admin' : 'Utilisateur'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.is_active)}
                          >
                            {user.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          {user.id !== user.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des questions */}
        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des questions</CardTitle>
              <CardDescription>
                Modérez les questions du forum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Commentaires</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((question) => (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium max-w-xs truncate">
                        {question.title}
                      </TableCell>
                      <TableCell>{question.author?.username}</TableCell>
                      <TableCell>
                        <Badge variant={question.is_active ? 'default' : 'secondary'}>
                          {question.is_active ? 'Active' : 'Masquée'}
                        </Badge>
                      </TableCell>
                      <TableCell>{question.comments_count}</TableCell>
                      <TableCell>{formatDate(question.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleQuestionStatus(question.id)}
                        >
                          {question.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des commentaires */}
        <TabsContent value="comments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des commentaires</CardTitle>
              <CardDescription>
                Modérez les commentaires du forum
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contenu</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Question</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComments.map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell className="max-w-xs truncate">
                        {comment.content.substring(0, 100)}
                        {comment.content.length > 100 ? '...' : ''}
                      </TableCell>
                      <TableCell>{comment.author?.username}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {comment.question?.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={comment.is_active ? 'default' : 'secondary'}>
                          {comment.is_active ? 'Actif' : 'Masqué'}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(comment.created_at)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleCommentStatus(comment.id)}
                        >
                          {comment.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminPanel

