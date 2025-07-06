import { useAuth } from '../App'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { MessageSquare, Users, BarChart3, Settings, ExternalLink } from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const quickActions = [
    {
      title: 'Centre d\'aide',
      description: 'Posez vos questions et consultez les réponses de la communauté',
      icon: MessageSquare,
      link: '/forum',
      color: 'bg-blue-500'
    },
    {
      title: 'Enquête publique',
      description: 'Participez à notre enquête de satisfaction',
      icon: ExternalLink,
      link: '/survey/public',
      color: 'bg-green-500'
    }
  ]

  const adminActions = [
    {
      title: 'Administration',
      description: 'Gérez les utilisateurs et modérez le contenu',
      icon: Settings,
      link: '/admin',
      color: 'bg-purple-500'
    },
    {
      title: 'Gestion des enquêtes',
      description: 'Créez et gérez les enquêtes, consultez les statistiques',
      icon: BarChart3,
      link: '/survey',
      color: 'bg-orange-500'
    }
  ]

  return (
    <div className="space-y-8">
      {/* En-tête de bienvenue */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Bienvenue, {user?.username} !
        </h1>
        <p className="text-blue-100 text-lg">
          Portail client ASF Consulting - Votre espace de collaboration et d'assistance
        </p>
        {user?.company && (
          <p className="text-blue-200 mt-2">
            Entreprise : {user.company}
          </p>
        )}
      </div>

      {/* À propos d'ASF Consulting */}
      <Card>
        <CardHeader>
          <CardTitle>À propos d'ASF Consulting</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 leading-relaxed">
            ASF Consulting est une société de conseil tunisienne spécialisée dans les sauvegardes 
            environnementales et sociales, basée en Tunisie. Nous offrons des services de conseil 
            en environnement, genre, inclusion sociale, et santé et sécurité en Tunisie et à 
            l'international. Notre vaste expérience comprend plus de 100 projets d'infrastructure 
            majeurs dans des secteurs tels que l'énergie, le transport, l'industrie, l'urbanisme, 
            l'eau et l'agriculture.
          </p>
          <p className="text-gray-600 leading-relaxed mt-4">
            Nos opérations s'étendent sur plusieurs régions : la région MENA, l'Afrique de l'Ouest, 
            l'Afrique centrale, l'Afrique de l'Est, l'Afrique australe, et l'Asie. Nous avons 
            également fourni des services au Mexique.
          </p>
        </CardContent>
      </Card>

      {/* Actions rapides */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                  </div>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={action.link}>
                  <Button className="w-full">
                    Accéder
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Actions administrateur */}
      {user?.is_admin && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminActions.map((action, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={action.link}>
                    <Button variant="outline" className="w-full">
                      Gérer
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Informations de contact */}
      <Card>
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Si vous avez des questions ou besoin d'assistance, n'hésitez pas à :
          </p>
          <ul className="space-y-2 text-gray-600">
            <li>• Consulter notre centre d'aide pour voir les questions fréquentes</li>
            <li>• Poser une nouvelle question dans le forum</li>
            <li>• Contacter notre équipe support à : support@asfconsulting.tn</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard

