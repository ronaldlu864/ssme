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
  Users,
  FileText,
  Loader2
} from 'lucide-react';
import { getInquiries, deleteInquiry } from '@/lib/supabase';
import InquiryForm from './InquiryForm';
import InquiryDetail from './InquiryDetail';
import type { Inquiry } from '@/types';

interface InquiryListProps {
  onViewMatches: (inquiry: Inquiry) => void;
  onInquiryCreated: () => void;
}

export default function InquiryList({ onViewMatches, onInquiryCreated }: InquiryListProps) {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    setLoading(true);
    const { data, error } = await getInquiries();
    if (error) {
      toast.error('Failed to load inquiries: ' + error);
    } else {
      setInquiries(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inquiry?')) return;
    
    setDeletingId(id);
    const { error } = await deleteInquiry(id);
    if (error) {
      toast.error('Failed to delete: ' + error);
    } else {
      toast.success('Inquiry deleted');
      setInquiries(prev => prev.filter(i => i.id !== id));
    }
    setDeletingId(null);
  };

  const handleViewDetail = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setShowDetail(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      new: 'default',
      processing: 'secondary',
      completed: 'outline',
      cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredInquiries = inquiries.filter(inquiry =>
    inquiry.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.product_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inquiry.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Inquiries</h2>
          <p className="text-muted-foreground">Manage customer inquiries and find matching suppliers</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Inquiry
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Inquiry</DialogTitle>
            </DialogHeader>
            <InquiryForm onSuccess={() => {
              onInquiryCreated();
              loadInquiries();
            }} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Inquiries</CardTitle>
              <CardDescription>{filteredInquiries.length} inquiries found</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inquiries..."
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
          ) : filteredInquiries.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No inquiries found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? 'Try adjusting your search' : 'Create your first inquiry to get started'}
              </p>
              {!searchTerm && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create Inquiry</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Create New Inquiry</DialogTitle>
                    </DialogHeader>
                    <InquiryForm onSuccess={() => {
                      onInquiryCreated();
                      loadInquiries();
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
                    <TableHead>Client</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Industry</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInquiries.map((inquiry) => (
                    <TableRow key={inquiry.id}>
                      <TableCell className="font-medium">{inquiry.client_name}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={inquiry.product_description}>
                          {inquiry.product_description || inquiry.parsed_data?.product_name || '-'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{inquiry.industry || '-'}</Badge>
                      </TableCell>
                      <TableCell>{inquiry.quantity || '-'}</TableCell>
                      <TableCell>{getStatusBadge(inquiry.status)}</TableCell>
                      <TableCell>
                        {new Date(inquiry.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetail(inquiry)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onViewMatches(inquiry)}>
                              <Users className="h-4 w-4 mr-2" />
                              Find Matches
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(inquiry.id)}
                              className="text-red-600"
                              disabled={deletingId === inquiry.id}
                            >
                              {deletingId === inquiry.id ? (
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

      {/* Inquiry Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
          </DialogHeader>
          {selectedInquiry && (
            <InquiryDetail 
              inquiry={selectedInquiry} 
              onFindMatches={() => {
                setShowDetail(false);
                onViewMatches(selectedInquiry);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
