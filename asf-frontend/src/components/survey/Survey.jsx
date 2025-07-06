import { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../../App";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Copy,
  ExternalLink,
} from "lucide-react";

const Survey = () => {
  const { user } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showNewSurveyForm, setShowNewSurveyForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Formulaire nouvelle enquête
  const [newSurvey, setNewSurvey] = useState({
    title: "",
    description: "",
    questions: [],
  });

  // Nouvelle question
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    type: "text",
    options: [],
    required: true,
  });

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else {
        setError("Erreur lors du chargement des enquêtes");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const loadSurveyResponses = async (surveyId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/surveys/${surveyId}/responses`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResponses(data);
      } else {
        setError("Erreur lors du chargement des réponses");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    }
  };

  const createSurvey = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!newSurvey.title || newSurvey.questions.length === 0) {
      setError("Veuillez remplir le titre et ajouter au moins une question");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newSurvey),
      });

      if (response.ok) {
        setSuccess("Enquête créée avec succès");
        setNewSurvey({ title: "", description: "", questions: [] });
        setShowNewSurveyForm(false);
        loadSurveys();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la création de l'enquête");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  const updateSurvey = async (surveyId, updates) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/surveys/${surveyId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        setSuccess("Enquête mise à jour avec succès");
        loadSurveys();
      } else {
        setError("Erreur lors de la mise à jour de l'enquête");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    }
  };

  const toggleSurveyStatus = async (surveyId, isCurrentlyActive) => {
    try {
      const endpoint = isCurrentlyActive ? "deactivate" : "activate";
      const response = await fetch(
        `${API_BASE_URL}/api/admin/surveys/${surveyId}/${endpoint}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      if (response.ok) {
        setSuccess(
          `Enquête ${isCurrentlyActive ? "désactivée" : "activée"} avec succès`
        );
        loadSurveys();
      } else {
        setError("Erreur lors de la modification du statut de l'enquête");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    }
  };

  const deleteSurvey = async (surveyId) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette enquête ?")) {
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/surveys/${surveyId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.ok) {
        setSuccess("Enquête supprimée avec succès");
        loadSurveys();
      } else {
        setError("Erreur lors de la suppression de l'enquête");
      }
    } catch (error) {
      setError("Erreur de connexion au serveur");
    }
  };

  const addQuestion = () => {
    if (!newQuestion.text) {
      setError("Veuillez saisir le texte de la question");
      return;
    }

    const question = {
      ...newQuestion,
      id: Date.now(), // ID temporaire
    };

    setNewSurvey({
      ...newSurvey,
      questions: [...newSurvey.questions, question],
    });

    setNewQuestion({
      text: "",
      type: "text",
      options: [],
      required: true,
    });
    setError("");
  };

  const removeQuestion = (questionId) => {
    setNewSurvey({
      ...newSurvey,
      questions: newSurvey.questions.filter((q) => q.id !== questionId),
    });
  };

  const addOption = () => {
    setNewQuestion({
      ...newQuestion,
      options: [...newQuestion.options, ""],
    });
  };

  const updateOption = (index, value) => {
    const updatedOptions = [...newQuestion.options];
    updatedOptions[index] = value;
    setNewQuestion({
      ...newQuestion,
      options: updatedOptions,
    });
  };

  const removeOption = (index) => {
    setNewQuestion({
      ...newQuestion,
      options: newQuestion.options.filter((_, i) => i !== index),
    });
  };

  const getPublicSurveyUrl = (surveyId) => {
    return `${window.location.origin}/survey/${surveyId}/public`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess("Lien copié dans le presse-papiers");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestion des enquêtes</h1>
          <p className="text-gray-600 mt-2">
            Créez et gérez les enquêtes, consultez les statistiques
          </p>
        </div>
        <Button onClick={() => setShowNewSurveyForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle enquête
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

      {/* Formulaire nouvelle enquête */}
      {showNewSurveyForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle enquête</CardTitle>
            <CardDescription>
              Définissez les questions et les options de votre enquête
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={createSurvey} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Titre de l'enquête</Label>
                  <Input
                    id="title"
                    value={newSurvey.title}
                    onChange={(e) =>
                      setNewSurvey({ ...newSurvey, title: e.target.value })
                    }
                    placeholder="Titre de votre enquête"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (optionnelle)</Label>
                <Textarea
                  id="description"
                  value={newSurvey.description}
                  onChange={(e) =>
                    setNewSurvey({ ...newSurvey, description: e.target.value })
                  }
                  placeholder="Description de votre enquête"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Questions existantes */}
              {newSurvey.questions.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Questions ({newSurvey.questions.length})
                  </h3>
                  {newSurvey.questions.map((question, index) => (
                    <Card key={question.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">Question {index + 1}</p>
                          <p className="text-gray-600">{question.text}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline">{question.type}</Badge>
                            {question.required && (
                              <Badge variant="secondary">Obligatoire</Badge>
                            )}
                          </div>
                          {question.options.length > 0 && (
                            <div className="mt-2">
                              <p className="text-sm text-gray-500">Options :</p>
                              <ul className="list-disc list-inside text-sm text-gray-600">
                                {question.options.map((option, i) => (
                                  <li key={i}>{option}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {/* Nouvelle question */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">
                  Ajouter une question
                </h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="questionText">Texte de la question</Label>
                    <Input
                      id="questionText"
                      value={newQuestion.text}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, text: e.target.value })
                      }
                      placeholder="Saisissez votre question"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="questionType">Type de question</Label>
                      <Select
                        value={newQuestion.type}
                        onValueChange={(value) =>
                          setNewQuestion({
                            ...newQuestion,
                            type: value,
                            options:
                              value === "text" ? [] : newQuestion.options,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texte libre</SelectItem>
                          <SelectItem value="radio">Choix unique</SelectItem>
                          <SelectItem value="checkbox">
                            Choix multiple
                          </SelectItem>
                          <SelectItem value="select">
                            Liste déroulante
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="required"
                        checked={newQuestion.required}
                        onChange={(e) =>
                          setNewQuestion({
                            ...newQuestion,
                            required: e.target.checked,
                          })
                        }
                      />
                      <Label htmlFor="required">Question obligatoire</Label>
                    </div>
                  </div>

                  {/* Options pour les questions à choix */}
                  {["radio", "checkbox", "select"].includes(
                    newQuestion.type
                  ) && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Options de réponse</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addOption}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Ajouter une option
                        </Button>
                      </div>
                      {newQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 mb-2"
                        >
                          <Input
                            value={option}
                            onChange={(e) =>
                              updateOption(index, e.target.value)
                            }
                            placeholder={`Option ${index + 1}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button type="button" onClick={addQuestion} variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter cette question
                  </Button>
                </div>
              </Card>

              <div className="flex space-x-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Création..." : "Créer l'enquête"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewSurveyForm(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des enquêtes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <Card key={survey.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{survey.title}</CardTitle>
                  {survey.description && (
                    <CardDescription className="mt-2">
                      {survey.description}
                    </CardDescription>
                  )}
                </div>
                <Badge variant={survey.is_active ? "default" : "secondary"}>
                  {survey.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p>{survey.questions?.length || 0} question(s)</p>
                  <p>{survey.responses_count || 0} réponse(s)</p>
                  <p>Créée le {formatDate(survey.created_at)}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      copyToClipboard(getPublicSurveyUrl(survey.id));
                    }}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copier le lien
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.open(getPublicSurveyUrl(survey.id), "_blank");
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Voir
                  </Button>

                  <Button
                    variant={survey.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() =>
                      toggleSurveyStatus(survey.id, survey.is_active)
                    }
                  >
                    {survey.is_active ? "Désactiver" : "Activer"}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      window.location.href = `/survey/${survey.id}/stats`;
                    }}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Stats
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteSurvey(survey.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
                  <strong>Lien public :</strong>
                  <br />
                  {getPublicSurveyUrl(survey.id)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {surveys.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucune enquête pour le moment.</p>
            <Button className="mt-4" onClick={() => setShowNewSurveyForm(true)}>
              Créer votre première enquête
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Modal statistiques */}
      {currentSurvey && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Statistiques - {currentSurvey.title}</CardTitle>
              <Button variant="outline" onClick={() => setCurrentSurvey(null)}>
                Fermer
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {responses.length}
                  </div>
                  <div className="text-sm text-blue-600">Réponses totales</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {currentSurvey.questions?.length || 0}
                  </div>
                  <div className="text-sm text-green-600">Questions</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {responses.length > 0
                      ? Math.round(
                          (responses.length /
                            (currentSurvey.questions?.length || 1)) *
                            100
                        )
                      : 0}
                    %
                  </div>
                  <div className="text-sm text-purple-600">
                    Taux de completion
                  </div>
                </div>
              </div>

              {responses.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Réponses récentes
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {responses.slice(0, 10).map((response, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-50 rounded text-sm"
                      >
                        <div className="font-medium">Réponse #{index + 1}</div>
                        <div className="text-gray-600">
                          {formatDate(response.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Survey;
