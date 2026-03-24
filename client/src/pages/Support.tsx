import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, MessageSquare, Clock, CheckCircle, AlertCircle, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

export default function Support() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading] = useState(false);

  // Mock tickets data
  const tickets = [
    {
      id: 1,
      number: 'TKT-2026-001',
      title: 'Problème de paiement',
      description: 'Le paiement n\'a pas été traité correctement',
      status: 'open',
      priority: 'high',
      createdAt: '2026-03-23',
      updatedAt: '2026-03-23',
      responses: 2,
    },
    {
      id: 2,
      number: 'TKT-2026-002',
      title: 'Demande de remboursement',
      description: 'Je souhaite annuler ma mission',
      status: 'in_progress',
      priority: 'medium',
      createdAt: '2026-03-22',
      updatedAt: '2026-03-23',
      responses: 1,
    },
    {
      id: 3,
      number: 'TKT-2026-003',
      title: 'Suggestion de fonctionnalité',
      description: 'Ajouter la possibilité de programmer des missions',
      status: 'resolved',
      priority: 'low',
      createdAt: '2026-03-20',
      updatedAt: '2026-03-22',
      responses: 3,
    },
  ];

  const statuses = [
    { value: 'all', label: t('common.all') },
    { value: 'open', label: t('support.open') },
    { value: 'in_progress', label: t('support.inProgress') },
    { value: 'resolved', label: t('support.resolved') },
  ];

  const filteredTickets = tickets.filter(
    (ticket) => statusFilter === 'all' || ticket.status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('support.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('support.description')}</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('support.newTicket')}
          </Button>
        </div>

        {/* Contact Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('support.email')}</p>
                  <p className="font-semibold">contact@mschauffeur.fr</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('support.phone')}</p>
                  <p className="font-semibold">+33 6 95 61 89 98</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Create Ticket */}
        <Card>
          <CardHeader>
            <CardTitle>{t('support.createTicket')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('support.subject')}</label>
              <Input placeholder={t('support.subjectPlaceholder')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('support.description')}</label>
              <Textarea
                placeholder={t('support.descriptionPlaceholder')}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('support.priority')}</label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">{t('support.low')}</SelectItem>
                    <SelectItem value="medium">{t('support.medium')}</SelectItem>
                    <SelectItem value="high">{t('support.high')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('support.category')}</label>
                <Select defaultValue="general">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t('support.general')}</SelectItem>
                    <SelectItem value="payment">{t('support.payment')}</SelectItem>
                    <SelectItem value="technical">{t('support.technical')}</SelectItem>
                    <SelectItem value="feature">{t('support.feature')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full">{t('support.submit')}</Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('common.filter')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Tickets List */}
        {!isLoading && filteredTickets.length > 0 && (
          <div className="space-y-3">
            {filteredTickets.map((ticket) => (
              <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(ticket.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{ticket.number}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                            {statuses.find((s) => s.value === ticket.status)?.label}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                            {ticket.priority === 'high' ? t('support.high') : ticket.priority === 'medium' ? t('support.medium') : t('support.low')}
                          </span>
                        </div>
                        <p className="font-medium mb-1">{ticket.title}</p>
                        <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {ticket.responses} {t('support.responses')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline">
                      {t('common.view')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredTickets.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('support.noTickets')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
