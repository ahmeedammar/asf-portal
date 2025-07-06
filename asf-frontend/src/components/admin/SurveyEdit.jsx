import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';

const SurveyEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    questions: [],
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Load survey data when component mounts
  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}`, {
          credentials: 'include',
        });
        if (!res.ok) throw new Error('Erreur lors du chargement de l’enquête');
        const data = await res.json();
        setSurvey({
          title: data.title,
          description: data.description || '',
          questions: JSON.parse(data.questions_json || '[]'),
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  // Handle input change for title/description
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSurvey({ ...survey, [name]: value });
  };

  // Add a new question
  const addQuestion = () => {
    setSurvey({
      ...survey,
      questions: [
        ...survey.questions,
        {
          text: '',
          type: 'text',
          options: [],
          required: true,
        },
      ],
    });
  };

  // Update question text or type
  const updateQuestion = (index, field, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[index][field] = value;
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  // Add option to a choice-based question
  const addOption = (questionIndex) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].options.push('');
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  // Update an option
  const updateOption = (questionIndex, optionIndex, value) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  // Remove an option
  const removeOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...survey.questions];
    updatedQuestions[questionIndex].options.splice(optionIndex, 1);
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  // Remove a question
  const removeQuestion = (index) => {
    const updatedQuestions = survey.questions.filter((_, i) => i !== index);
    setSurvey({ ...survey, questions: updatedQuestions });
  };

  // Save updated survey
  const saveSurvey = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/surveys/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: survey.title,
          description: survey.description,
          questions: survey.questions,
        }),
      });

      if (response.ok) {
        setSuccess('Enquête mise à jour avec succès !');
        setTimeout(() => navigate('/survey'), 1500); // Redirect after success
      } else {
        const data = await response.json();
        setError(data.error || 'Impossible de sauvegarder les modifications.');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Modifier l'enquête</CardTitle>
          <CardDescription>Modifiez le titre, la description et les questions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Titre de l'enquête</Label>
            <Input
              id="title"
              name="title"
              value={survey.title}
              onChange={handleInputChange}
              placeholder="Titre de l'enquête"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (optionnelle)</Label>
            <Textarea
              id="description"
              name="description"
              value={survey.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Ajoutez une brève description..."
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <h3 className="font-semibold">Questions</h3>
            {survey.questions.map((question, index) => (
              <Card key={index} className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  <Button variant="outline" size="sm" onClick={() => removeQuestion(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label>Texte de la question</Label>
                  <Input
                    value={question.text}
                    onChange={(e) => updateQuestion(index, 'text', e.target.value)}
                    placeholder="Votre question ici"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Type de réponse</Label>
                    <Select
                      value={question.type}
                      onValueChange={(value) =>
                        updateQuestion(index, 'type', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texte libre</SelectItem>
                        <SelectItem value="radio">Choix unique</SelectItem>
                        <SelectItem value="checkbox">Choix multiple</SelectItem>
                        <SelectItem value="select">Liste déroulante</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center pt-6">
                    <input
                      type="checkbox"
                      id={`required-${index}`}
                      checked={question.required}
                      onChange={(e) =>
                        updateQuestion(index, 'required', e.target.checked)
                      }
                    />
                    <Label htmlFor={`required-${index}`} className="ml-2">
                      Obligatoire
                    </Label>
                  </div>
                </div>

                {/* Options for choice-based questions */}
                {['radio', 'checkbox', 'select'].includes(question.type) && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Options</Label>
                      <Button variant="outline" size="sm" onClick={() => addOption(index)}>
                        <Plus className="w-4 h-4 mr-1" /> Ajouter
                      </Button>
                    </div>
                    {question.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(index, optIndex, e.target.value)
                          }
                          placeholder={`Option ${optIndex + 1}`}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeOption(index, optIndex)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}

            <Button variant="outline" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" /> Ajouter une question
            </Button>
          </div>

          {/* Actions */}
          {error && (
            <div className="text-red-500 bg-red-100 p-3 rounded">{error}</div>
          )}
          {success && (
            <div className="text-green-500 bg-green-100 p-3 rounded">{success}</div>
          )}

          <div className="flex space-x-4">
            <Button onClick={saveSurvey} disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Enregistrer'}
            </Button>
            <Button variant="outline" onClick={() => navigate('/survey')}>
              Annuler
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SurveyEdit;