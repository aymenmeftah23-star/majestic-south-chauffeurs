import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Receipt, Search, Download, Euro, CheckCircle, Clock, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const GOLD = "#C9A84C";

export default function Invoices() {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: missions = [], isLoading } = trpc.missions.getAll.useQuery();
  const { data: clients = [] } = trpc.clients.getAll.useQuery();

  // Generer les factures a partir des missions terminees
  const invoices = missions
    .filter((m: any) => m.status === 'completed' || m.price > 0)
    .map((m: any) => {
      const client = clients.find((c: any) => c.id === m.clientId);
      return {
        id: m.id,
        number: `FAC-${String(m.id).padStart(4, '0')}`,
        missionNumber: m.number || `M-${m.id}`,
        clientName: client ? `${client.firstName} ${client.lastName}` : 'Client',
        origin: m.pickupAddress || m.origin || '',
        destination: m.dropoffAddress || m.destination || '',
        date: m.date,
        amount: m.price || 0,
        status: m.status === 'completed' ? 'payee' : 'en_attente',
      };
    });

  const filtered = invoices.filter((inv: any) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      inv.number.toLowerCase().includes(q) ||
      inv.clientName.toLowerCase().includes(q) ||
      inv.origin.toLowerCase().includes(q) ||
      inv.destination.toLowerCase().includes(q)
    );
  });

  const totalAmount = invoices.reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const paidAmount = invoices.filter((inv: any) => inv.status === 'payee').reduce((sum: number, inv: any) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter((inv: any) => inv.status === 'en_attente').reduce((sum: number, inv: any) => sum + inv.amount, 0);

  const handleDownloadPDF = async (clientId: number) => {
    try {
      const response = await fetch(`/api/pdf/invoice/${clientId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facture-${clientId}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error('Erreur telechargement PDF:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Factures</h1>
          <p className="text-gray-400 mt-1">{filtered.length} factures</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <Euro size={20} style={{ color: GOLD }} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total facture</p>
                  <p className="text-xl font-bold text-white">{totalAmount.toFixed(2)} EUR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-900/30 flex items-center justify-center">
                  <CheckCircle size={20} className="text-green-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Payees</p>
                  <p className="text-xl font-bold text-green-400">{paidAmount.toFixed(2)} EUR</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-900/30 flex items-center justify-center">
                  <Clock size={20} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">En attente</p>
                  <p className="text-xl font-bold text-orange-400">{pendingAmount.toFixed(2)} EUR</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-gray-900 border-gray-800 text-white pl-10"
            placeholder="Rechercher une facture..."
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-gray-600 border-t-amber-400 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-12 text-center">
              <Receipt size={48} className="mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400 text-lg">Aucune facture</p>
              <p className="text-gray-500 text-sm mt-2">Les factures sont generees automatiquement a partir des missions terminees</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map((inv: any) => (
              <Card key={inv.id} className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shrink-0">
                        <FileText size={18} style={{ color: GOLD }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-white font-medium">{inv.number}</p>
                          <span className="text-gray-600 text-sm">({inv.missionNumber})</span>
                        </div>
                        <p className="text-gray-400 text-sm truncate">
                          {inv.clientName} -- {inv.origin} vers {inv.destination}
                        </p>
                        <p className="text-gray-600 text-xs mt-0.5">
                          {inv.date ? new Date(inv.date).toLocaleDateString('fr-FR') : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <p className="text-white font-bold text-lg">{inv.amount.toFixed(2)} EUR</p>
                      <Badge
                        variant="outline"
                        className={inv.status === 'payee' ? 'border-green-600 text-green-400' : 'border-orange-600 text-orange-400'}
                      >
                        {inv.status === 'payee' ? 'Payee' : 'En attente'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-700 text-gray-300"
                        onClick={() => handleDownloadPDF(inv.id)}
                      >
                        <Download size={14} className="mr-1" /> PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
