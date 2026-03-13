import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Globe, 
  Award, 
  Star, 
  Package, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Link,
  FileText
} from 'lucide-react';
import type { Supplier } from '@/types';

interface SupplierDetailProps {
  supplier: Supplier;
}

export default function SupplierDetail({ supplier }: SupplierDetailProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold">{supplier.supplier_name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{supplier.country || 'Country not specified'}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="gap-1">
            <Star className="h-3 w-3 fill-current" />
            Trust Score: {supplier.trust_score || 50}
          </Badge>
          {supplier.is_internal ? (
            <Badge variant="secondary" className="gap-1">
              <Award className="h-3 w-3" />
              Internal
            </Badge>
          ) : (
            <Badge variant="outline">External</Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Product Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Product Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Product Categories</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {supplier.product_categories?.length > 0 ? (
                  supplier.product_categories.map((cat, i) => (
                    <Badge key={i} variant="secondary">{cat}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">Not specified</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Minimum Order Quantity</span>
              <p className="font-medium">{supplier.min_order_quantity || 'Not specified'}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Lead Time</span>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{supplier.lead_time || 'Not specified'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certifications & Markets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Certifications</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {supplier.certifications?.length > 0 ? (
                  supplier.certifications.map((cert, i) => (
                    <Badge key={i} variant="outline">{cert}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">Not specified</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Export Markets</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {supplier.export_markets?.length > 0 ? (
                  supplier.export_markets.map((market, i) => (
                    <Badge key={i} variant="outline">{market}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-gray-400">Not specified</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-muted-foreground">Contact Person</span>
              <div className="flex items-center gap-2 mt-1">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{supplier.contact_person || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{supplier.email || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Phone</span>
              <div className="flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{supplier.phone || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Website</span>
              <div className="flex items-center gap-2 mt-1">
                <Link className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {supplier.website ? (
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.website}
                    </a>
                  ) : (
                    'Not specified'
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {supplier.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{supplier.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <div className="text-xs text-muted-foreground text-right">
        <p>Created: {new Date(supplier.created_at).toLocaleString()}</p>
        <p>Last Updated: {new Date(supplier.updated_at).toLocaleString()}</p>
      </div>
    </div>
  );
}
