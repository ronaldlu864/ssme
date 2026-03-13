import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Wand2, CheckCircle2 } from 'lucide-react';
import { createInquiry } from '@/lib/supabase';
import { parseInquiry } from '@/lib/openai';
import type { ParsedInquiryData } from '@/types';

interface InquiryFormProps {
  onSuccess: () => void;
}

export default function InquiryForm({ onSuccess }: InquiryFormProps) {
  const [clientName, setClientName] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedInquiryData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleParse = async () => {
    if (!rawInput.trim()) {
      toast.error('Please enter inquiry details');
      return;
    }

    setParsing(true);
    setParseError(null);
    
    const { data, error } = await parseInquiry(rawInput);
    
    if (error) {
      setParseError(error);
      toast.error('Failed to parse inquiry');
    } else if (data) {
      setParsedData(data);
      toast.success('Inquiry parsed successfully!');
    }
    
    setParsing(false);
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      toast.error('Please enter client name');
      return;
    }

    if (!rawInput.trim()) {
      toast.error('Please enter inquiry details');
      return;
    }

    setSaving(true);

    const inquiryData = {
      client_name: clientName,
      raw_input: rawInput,
      parsed_data: parsedData || undefined,
      industry: parsedData?.industry || '',
      product_category: parsedData?.product_category || '',
      product_description: parsedData?.product_name || '',
      quantity: parsedData?.quantity || 0,
      delivery_time: parsedData?.delivery_time || '',
      target_market: parsedData?.target_market || '',
      certification_required: parsedData?.certification_required || [],
      budget_level: parsedData?.budget_level || 'mid',
      priority_level: parsedData?.priority_level || 'mid',
      status: 'new' as const,
    };

    const { error } = await createInquiry(inquiryData);

    if (error) {
      toast.error('Failed to save inquiry: ' + error);
    } else {
      toast.success('Inquiry saved successfully!');
      onSuccess();
      // Reset form
      setClientName('');
      setRawInput('');
      setParsedData(null);
      setParseError(null);
    }

    setSaving(false);
  };

  const handleReset = () => {
    setClientName('');
    setRawInput('');
    setParsedData(null);
    setParseError(null);
  };

  return (
    <div className="space-y-6">
      {/* Client Name */}
      <div className="space-y-2">
        <Label htmlFor="clientName">Client Name *</Label>
        <Input
          id="clientName"
          placeholder="Enter client name (e.g., Metro Madrid)"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>

      {/* Raw Inquiry Input */}
      <div className="space-y-2">
        <Label htmlFor="rawInput">Inquiry Details *</Label>
        <Textarea
          id="rawInput"
          placeholder={`Paste the inquiry here. For example:

Client: Metro Madrid
Product: Brake Pads for Metro Rolling Stock
Quantity: 500 sets
Delivery: 8 weeks
Certification: EN standard
Target market: Spain
Additional notes: prefer EU export experience`}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          rows={8}
        />
        <p className="text-xs text-muted-foreground">
          Paste the complete inquiry text. AI will automatically extract structured information.
        </p>
      </div>

      {/* Parse Button */}
      <Button
        type="button"
        variant="secondary"
        onClick={handleParse}
        disabled={parsing || !rawInput.trim()}
        className="w-full gap-2"
      >
        {parsing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing with AI...
          </>
        ) : (
          <>
            <Wand2 className="h-4 w-4" />
            {parsedData ? 'Re-parse Inquiry' : 'Parse with AI'}
          </>
        )}
      </Button>

      {/* Parsed Data Preview */}
      {parsedData && (
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">AI Parsed Results</span>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Industry:</span>
                <p className="font-medium">{parsedData.industry || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Product Category:</span>
                <p className="font-medium">{parsedData.product_category || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Product Name:</span>
                <p className="font-medium">{parsedData.product_name || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Quantity:</span>
                <p className="font-medium">{parsedData.quantity || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Delivery Time:</span>
                <p className="font-medium">{parsedData.delivery_time || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Target Market:</span>
                <p className="font-medium">{parsedData.target_market || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Budget Level:</span>
                <Badge variant="outline">{parsedData.budget_level || '-'}</Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Priority:</span>
                <Badge variant="outline">{parsedData.priority_level || '-'}</Badge>
              </div>
            </div>

            {parsedData.technical_specs && parsedData.technical_specs.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm">Technical Specs:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.technical_specs.map((spec, i) => (
                    <Badge key={i} variant="secondary">{spec}</Badge>
                  ))}
                </div>
              </div>
            )}

            {parsedData.certification_required && parsedData.certification_required.length > 0 && (
              <div>
                <span className="text-muted-foreground text-sm">Required Certifications:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {parsedData.certification_required.map((cert, i) => (
                    <Badge key={i} variant="secondary">{cert}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {parseError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <p className="font-medium">Parse Error:</p>
          <p>{parseError}</p>
          <p className="mt-2 text-xs">You can still save the inquiry with raw text.</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={saving || !clientName.trim() || !rawInput.trim()}
          className="flex-1 gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Inquiry
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={saving}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
