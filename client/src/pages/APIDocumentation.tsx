import { useLanguage } from '@/contexts/LanguageContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Copy, Code, BookOpen, Key } from 'lucide-react';
import { useState } from 'react';

export default function APIDocumentation() {
  const { t } = useLanguage();
  const [apiKey] = useState('sk_live_51234567890abcdef');
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/demands',
      description: 'List all demands',
      params: ['limit', 'offset', 'status', 'type'],
    },
    {
      method: 'POST',
      path: '/api/v1/demands',
      description: 'Create a new demand',
      params: ['type', 'origin', 'destination', 'passengers', 'date', 'time'],
    },
    {
      method: 'GET',
      path: '/api/v1/demands/:id',
      description: 'Get demand details',
      params: ['id'],
    },
    {
      method: 'GET',
      path: '/api/v1/missions',
      description: 'List all missions',
      params: ['limit', 'offset', 'status', 'chauffeur_id'],
    },
    {
      method: 'POST',
      path: '/api/v1/missions',
      description: 'Create a new mission',
      params: ['demand_id', 'chauffeur_id', 'vehicle_id', 'price'],
    },
    {
      method: 'GET',
      path: '/api/v1/missions/:id',
      description: 'Get mission details',
      params: ['id'],
    },
    {
      method: 'PATCH',
      path: '/api/v1/missions/:id',
      description: 'Update mission status',
      params: ['id', 'status'],
    },
    {
      method: 'GET',
      path: '/api/v1/chauffeurs',
      description: 'List all chauffeurs',
      params: ['limit', 'offset', 'status'],
    },
    {
      method: 'GET',
      path: '/api/v1/clients',
      description: 'List all clients',
      params: ['limit', 'offset'],
    },
    {
      method: 'POST',
      path: '/api/v1/payments/checkout',
      description: 'Create payment checkout session',
      params: ['amount', 'currency', 'mission_id'],
    },
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PATCH':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('api.title')}</h1>
          <p className="text-muted-foreground mt-2">{t('api.description')}</p>
        </div>

        {/* API Key */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              {t('api.apiKey')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{t('api.apiKeyDesc')}</p>
            <div className="flex gap-2">
              <Input
                value={apiKey}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(apiKey)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">{t('api.copied')}</p>
            )}
          </CardContent>
        </Card>

        {/* Base URL */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('api.baseUrl')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-3 rounded-lg font-mono text-sm">
              https://api.majestic-south.fr/v1
            </div>
          </CardContent>
        </Card>

        {/* Authentication */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('api.authentication')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">{t('api.authDesc')}</p>
            <div className="bg-muted p-4 rounded-lg font-mono text-sm overflow-x-auto">
              <pre>{`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.majestic-south.fr/v1/demands`}</pre>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Code className="h-6 w-6" />
            {t('api.endpoints')}
          </h2>

          <div className="space-y-3">
            {endpoints.map((endpoint, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <code className="flex-1 font-mono text-sm bg-muted px-3 py-1 rounded">
                        {endpoint.path}
                      </code>
                    </div>

                    <p className="text-sm">{endpoint.description}</p>

                    {endpoint.params.length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-2">{t('api.parameters')}:</p>
                        <div className="flex flex-wrap gap-2">
                          {endpoint.params.map((param, i) => (
                            <Badge key={i} variant="outline">
                              {param}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Documentation Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              {t('api.resources')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <BookOpen className="h-4 w-4" />
              {t('api.fullDocs')}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Code className="h-4 w-4" />
              {t('api.codeExamples')}
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <BookOpen className="h-4 w-4" />
              {t('api.webhooks')}
            </Button>
          </CardContent>
        </Card>

        {/* Rate Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t('api.rateLimits')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              <strong>{t('api.requests')}:</strong> 1000 requests per hour
            </p>
            <p className="text-sm">
              <strong>{t('api.burst')}:</strong> 100 requests per minute
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {t('api.rateLimitDesc')}
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
