import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Calendar, Globe, Package, Clock, CheckCircle } from 'lucide-react';
import type { Inquiry } from '@/types';

interface InquiryDetailProps {
  inquiry: Inquiry;
  onFindMatches: () => void;
}

export default function InquiryDetail({ inquiry, onFindMatches }: InquiryDetailProps) {
  const parsed = inquiry.parsed_data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-xl font-bold">{inquiry.client_name}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Created {new Date(inquiry.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={inquiry.status === 'new' ? 'default' : 'outline'}>
            {inquiry.status}
          </Badge>
          {parsed?.priority_level && (
            <Badge variant="outline" className="capitalize">
              {parsed.priority_level} Priority
            </Badge>
          )}
        </div>
      </div>

      <Separator />

      {/* Parsed Information */}
      {parsed ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Product Name</span>
                <p className="font-medium">{parsed.product_name || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Category</span>
                <p className="font-medium">{parsed.product_category || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Industry</span>
                <p className="font-medium">{parsed.industry || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Quantity</span>
                <p className="font-medium">{parsed.quantity || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="text-sm text-muted-foreground">Delivery Time</span>
                <p className="font-medium">{parsed.delivery_time || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Target Market</span>
                <p className="font-medium">{parsed.target_market || '-'}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Budget Level</span>
                <Badge variant="outline" className="capitalize">
                  {parsed.budget_level || '-'}
                </Badge>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Alternatives Allowed</span>
                <p className="font-medium">{parsed.alternative_allowed ? 'Yes' : 'No'}</p>
              </div>
            </CardContent>
          </Card>

          {parsed.technical_specs && parsed.technical_specs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Technical Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsed.technical_specs.map((spec, i) => (
                    <Badge key={i} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {parsed.certification_required && parsed.certification_required.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Required Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {parsed.certification_required.map((cert, i) => (
                    <Badge key={i} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            This inquiry has not been parsed yet. The AI will parse it when finding matches.
          </p>
        </div>
      )}

      {/* Raw Input */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Original Inquiry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm bg-gray-100 p-4 rounded-lg whitespace-pre-wrap">
            {inquiry.raw_input}
          </pre>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Button onClick={onFindMatches} className="w-full gap-2" size="lg">
        <Users className="h-5 w-5" />
        Find Matching Suppliers
      </Button>
    </div>
  );
}
