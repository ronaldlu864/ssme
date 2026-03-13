import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Toaster, toast } from 'sonner';
import { 
  ClipboardList, 
  Users, 
  Search, 
  TrendingUp, 
  Plus,
  Building2,
  CheckCircle2,
  Clock
} from 'lucide-react';
import InquiryList from '@/pages/InquiryList';
import InquiryForm from '@/pages/InquiryForm';
import SupplierList from '@/pages/SupplierList';
import SupplierForm from '@/pages/SupplierForm';
import MatchResults from '@/pages/MatchResults';
import ConfigCheck from '@/components/ConfigCheck';
import type { Inquiry } from '@/types';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleInquiryCreated = () => {
    toast.success('Inquiry created successfully!');
    setRefreshKey(prev => prev + 1);
  };

  const handleSupplierCreated = () => {
    toast.success('Supplier added successfully!');
    setRefreshKey(prev => prev + 1);
  };

  const handleViewMatches = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setActiveTab('matches');
  };

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <ConfigCheck>
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" richColors />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Search className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SSME</h1>
                <p className="text-xs text-gray-500">Smart Supplier Match Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                System Active
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="inquiries" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Inquiries</span>
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Suppliers</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Matches</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                  <ClipboardList className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Suppliers</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">In database</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Matches</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--</div>
                  <p className="text-xs text-muted-foreground">Generated</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">--%</div>
                  <p className="text-xs text-muted-foreground">Order conversion</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks to get started</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4" />
                        Create New Inquiry
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Inquiry</DialogTitle>
                      </DialogHeader>
                      <InquiryForm onSuccess={handleInquiryCreated} />
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        <Plus className="h-4 w-4" />
                        Add Supplier
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Add New Supplier</DialogTitle>
                      </DialogHeader>
                      <SupplierForm onSuccess={handleSupplierCreated} />
                    </DialogContent>
                  </Dialog>

                  <Button 
                    variant="outline" 
                    className="w-full justify-start gap-2"
                    onClick={() => setActiveTab('inquiries')}
                  >
                    <Search className="h-4 w-4" />
                    View Recent Inquiries
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                  <CardDescription>Current system configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Database Connection</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Connected</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm">AI Service</span>
                    </div>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Last Sync</span>
                    </div>
                    <span className="text-sm text-muted-foreground">Just now</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries">
            <InquiryList 
              key={`inquiries-${refreshKey}`}
              onViewMatches={handleViewMatches}
              onInquiryCreated={handleInquiryCreated}
            />
          </TabsContent>

          {/* Suppliers Tab */}
          <TabsContent value="suppliers">
            <SupplierList 
              key={`suppliers-${refreshKey}`}
              onSupplierCreated={handleSupplierCreated}
            />
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches">
            <MatchResults 
              key={`matches-${refreshKey}`}
              inquiry={selectedInquiry}
              onRefresh={triggerRefresh}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
    </ConfigCheck>
  );
}

export default App;
