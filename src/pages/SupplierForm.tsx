import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { createSupplier } from '@/lib/supabase';

interface SupplierFormProps {
  onSuccess: () => void;
}

export default function SupplierForm({ onSuccess }: SupplierFormProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    supplier_name: '',
    country: '',
    product_categories: '',
    certifications: '',
    export_markets: '',
    min_order_quantity: '',
    lead_time: '',
    contact_person: '',
    email: '',
    phone: '',
    website: '',
    notes: '',
    is_internal: true,
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.supplier_name.trim()) {
      toast.error('Please enter supplier name');
      return;
    }

    setSaving(true);

    const supplierData = {
      supplier_name: formData.supplier_name,
      country: formData.country,
      product_categories: formData.product_categories.split(',').map(s => s.trim()).filter(Boolean),
      certifications: formData.certifications.split(',').map(s => s.trim()).filter(Boolean),
      export_markets: formData.export_markets.split(',').map(s => s.trim()).filter(Boolean),
      min_order_quantity: parseInt(formData.min_order_quantity) || 0,
      lead_time: formData.lead_time,
      contact_person: formData.contact_person,
      email: formData.email,
      phone: formData.phone,
      website: formData.website,
      notes: formData.notes,
      is_internal: formData.is_internal,
      trust_score: 50, // Default trust score
    };

    const { error } = await createSupplier(supplierData);

    if (error) {
      toast.error('Failed to save supplier: ' + error);
    } else {
      toast.success('Supplier added successfully!');
      onSuccess();
      // Reset form
      setFormData({
        supplier_name: '',
        country: '',
        product_categories: '',
        certifications: '',
        export_markets: '',
        min_order_quantity: '',
        lead_time: '',
        contact_person: '',
        email: '',
        phone: '',
        website: '',
        notes: '',
        is_internal: true,
      });
    }

    setSaving(false);
  };

  const handleReset = () => {
    setFormData({
      supplier_name: '',
      country: '',
      product_categories: '',
      certifications: '',
      export_markets: '',
      min_order_quantity: '',
      lead_time: '',
      contact_person: '',
      email: '',
      phone: '',
      website: '',
      notes: '',
      is_internal: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="supplier_name">Supplier Name *</Label>
          <Input
            id="supplier_name"
            placeholder="Enter supplier name"
            value={formData.supplier_name}
            onChange={(e) => handleChange('supplier_name', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="e.g., China, Germany"
              value={formData.country}
              onChange={(e) => handleChange('country', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead_time">Lead Time</Label>
            <Input
              id="lead_time"
              placeholder="e.g., 4-6 weeks"
              value={formData.lead_time}
              onChange={(e) => handleChange('lead_time', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_categories">Product Categories (comma separated)</Label>
          <Input
            id="product_categories"
            placeholder="e.g., Brake Components, Sensors, Electronics"
            value={formData.product_categories}
            onChange={(e) => handleChange('product_categories', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="certifications">Certifications (comma separated)</Label>
            <Input
              id="certifications"
              placeholder="e.g., ISO9001, CE, EN"
              value={formData.certifications}
              onChange={(e) => handleChange('certifications', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="export_markets">Export Markets (comma separated)</Label>
            <Input
              id="export_markets"
              placeholder="e.g., EU, USA, Asia"
              value={formData.export_markets}
              onChange={(e) => handleChange('export_markets', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="min_order_quantity">Minimum Order Quantity</Label>
          <Input
            id="min_order_quantity"
            type="number"
            placeholder="e.g., 100"
            value={formData.min_order_quantity}
            onChange={(e) => handleChange('min_order_quantity', e.target.value)}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Contact Information
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_person">Contact Person</Label>
            <Input
              id="contact_person"
              placeholder="Full name"
              value={formData.contact_person}
              onChange={(e) => handleChange('contact_person', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="+1 234 567 890"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              placeholder="https://example.com"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
          Additional Information
        </h4>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Any additional information about this supplier..."
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_internal"
            checked={formData.is_internal}
            onCheckedChange={(checked) => handleChange('is_internal', checked)}
          />
          <Label htmlFor="is_internal" className="cursor-pointer">
            Internal Supplier (trusted)
          </Label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          onClick={handleSubmit}
          disabled={saving || !formData.supplier_name.trim()}
          className="flex-1 gap-2"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Supplier
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
