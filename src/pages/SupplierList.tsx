import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Eye, 
  Trash2, 
  Building2,
  Star,
  Loader2,
  Globe,
  Award
} from 'lucide-react';
import { getSuppliers, deleteSupplier } from '@/lib/supabase';
import SupplierForm from './SupplierForm';
import SupplierDetail from './SupplierDetail';
import type { Supplier } from '@/types';

interface SupplierListProps {
  onSupplierCreated: () => void;
}

export default function SupplierList({ onSupplierCreated }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    const { data, error } = await getSuppliers();
    if (error) {
      toast.error('Failed to load suppliers: ' + error);
    } else {
      setSuppliers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return;
    
    setDeletingId(id);
    const { error } = await deleteSupplier(id);
    if (error) {
      toast.error('Failed to delete: ' + error);
    } else {
      toast.success('Supplier deleted');
      setSuppliers(prev => prev.filter(s => s.id !== id));
    }
    setDeletingId(null);
  };

  const handleViewDetail = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setShowDetail(true);
  };

  const getTrustBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800"><Star className="h-3 w-3 mr-1 fill-current" />{score}</Badge>;
    if (score >= 60) return <Badge variant="secondary">{score}</Badge>;
    return <Badge variant="outline">{score}</Badge>;
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.supplier_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.country?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.product_categories?.some(cat => cat.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Suppliers</h2>
          <p className="text-muted-foreground">Manage your supplier database</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Supplier</DialogTitle>
            </DialogHeader>
            <SupplierForm onSuccess={() => {
              onSupplierCreated();
              loadSuppliers();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Suppliers</CardTitle>
              <CardDescription>{filteredSuppliers.length} suppliers in database</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No suppliers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Add your first supplier to get started'}
              </p>
              {!searchTerm && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Add Supplier</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Supplier</DialogTitle>
                    </DialogHeader>
                    <SupplierForm onSuccess={() => {
                      onSupplierCreated();
                      loadSuppliers();
                    }} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Trust Score</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div className="font-medium">{supplier.supplier_name}</div>
                        {supplier.email && (
                          <div className="text-xs text-muted-foreground">{supplier.email}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3 text-muted-foreground" />
                          {supplier.country || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {supplier.product_categories?.slice(0, 2).map((cat, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{cat}</Badge>
                          ))}
                          {supplier.product_categories?.length > 2 && (
                            <Badge variant="outline" className="text-xs">+{supplier.product_categories.length - 2}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getTrustBadge(supplier.trust_score || 50)}</TableCell>
                      <TableCell>
                        {supplier.is_internal ? (
                          <Badge variant="secondary" className="gap-1">
                            <Award className="h-3 w-3" />
                            Internal
                          </Badge>
                        ) : (
                          <Badge variant="outline">External</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(supplier)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(supplier.id)}
                              className="text-red-600"
                              disabled={deletingId === supplier.id}
                            >
                              {deletingId === supplier.id ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4 mr-2" />
                              )}
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Supplier Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Supplier Details</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <SupplierDetail supplier={selectedSupplier} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
