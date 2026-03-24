import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Copy, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function Webhooks() {
  const { t } = useLanguage();
  const [isLoading] = useState(false);
  const [copied, setCopied] = useState<number | null>(null);

  // Mock webhooks data
  const webhooks = [
    {
      id: 1,
      name: 'Slack Notifications',
      url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
      events: ['mission.created', 'mission.completed', 'payment.received'],
      active: true,
      lastTriggered: '2026-03-23 14:35:22',
      status: 'success',
    },
    {
      id: 2,
      name: 'Zapier Integration',
      url: 'https://hooks.zapier.com/hooks/catch/12345678/abcdefg/',
      events: ['demand.created', 'mission.created'],
      active: true,
      lastTriggered: '2026-03-23 14:30:15',
      status: 'success',
    },
    {
      id: 3,
      name: 'Discord Alerts',
      url: 'https://discordapp.com/api/webhooks/123456789/abcdefghijklmnopqrst',
      events: ['alert.critical', 'payment.failed'],
      active: false,
      lastTriggered: '2026-03-22 10:15:00',
      status: 'failed',
    },
  ];

  const eventTypes = [
    'demand.created',
    'demand.updated',
    'mission.created',
    'mission.completed',
    'mission.cancelled',
    'payment.received',
    'payment.failed',
    'alert.critical',
    'chauffeur.assigned',
    'review.submitted',
  ];

  const copyToClipboard = (url: string, id: number) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('webhooks.title')}</h1>
            <p className="text-muted-foreground mt-2">{t('webhooks.description')}</p>
          </div>
          <Button size="lg" className="gap-2">
            <Plus className="h-4 w-4" />
            {t('webhooks.new')}
          </Button>
        </div>

        {/* Documentation */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">{t('webhooks.documentation')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              {t('webhooks.docDesc')}
            </p>
            <div className="bg-white p-3 rounded font-mono text-xs overflow-x-auto">
              POST /webhooks/events
            </div>
          </CardContent>
        </Card>

        {/* Event Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('webhooks.availableEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {eventTypes.map((event) => (
                <Badge key={event} variant="outline">
                  {event}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Webhooks List */}
        {!isLoading && webhooks.length > 0 && (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{webhook.name}</h3>
                          <Badge variant={webhook.active ? 'default' : 'secondary'}>
                            {webhook.active ? t('common.active') : t('common.inactive')}
                          </Badge>
                          {webhook.status === 'success' ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              OK
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Error
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={webhook.url}
                            readOnly
                            className="font-mono text-xs flex-1"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(webhook.url, webhook.id)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {t('webhooks.lastTriggered')}: {webhook.lastTriggered}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost">
                          {t('common.edit')}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Events */}
                    <div>
                      <p className="text-sm font-medium mb-2">{t('webhooks.events')}:</p>
                      <div className="flex flex-wrap gap-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && webhooks.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">{t('common.noData')}</h3>
              <p className="text-muted-foreground mt-2">{t('webhooks.noWebhooks')}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
