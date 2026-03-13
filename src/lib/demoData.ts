import type { Inquiry, Supplier, MatchResult } from '@/types';

// 演示数据 - 用于在没有配置的情况下展示系统功能

export const demoInquiries: Inquiry[] = [
  {
    id: '1',
    client_name: 'Metro Madrid',
    industry: 'railway',
    product_category: 'brake components',
    product_description: 'Brake Pads for Metro Rolling Stock',
    quantity: 500,
    delivery_time: '8 weeks',
    target_market: 'Spain',
    certification_required: ['EN', 'ISO9001'],
    budget_level: 'mid',
    priority_level: 'high',
    raw_input: 'Client: Metro Madrid\nProduct: Brake Pads for Metro Rolling Stock\nQuantity: 500 sets\nDelivery: 8 weeks\nCertification: EN standard\nTarget market: Spain',
    parsed_data: {
      industry: 'railway',
      product_category: 'brake components',
      product_name: 'metro brake pads',
      technical_specs: ['EN standard'],
      quantity: 500,
      delivery_time: '8 weeks',
      target_market: 'Spain',
      certification_required: ['ISO9001', 'EN'],
      budget_level: 'mid',
      priority_level: 'high',
      alternative_allowed: true
    },
    status: 'new',
    created_at: '2024-03-10T10:00:00Z',
    updated_at: '2024-03-10T10:00:00Z'
  },
  {
    id: '2',
    client_name: 'Berlin Transport',
    industry: 'railway',
    product_category: 'lighting systems',
    product_description: 'LED Interior Lighting for Trams',
    quantity: 1000,
    delivery_time: '12 weeks',
    target_market: 'Germany',
    certification_required: ['CE', 'DIN'],
    budget_level: 'high',
    priority_level: 'mid',
    raw_input: 'Client: Berlin Transport\nProduct: LED Interior Lighting for Trams\nQuantity: 1000 units\nDelivery: 12 weeks\nCertification: CE, DIN\nTarget market: Germany',
    parsed_data: {
      industry: 'railway',
      product_category: 'lighting systems',
      product_name: 'LED interior lighting',
      technical_specs: ['CE', 'DIN'],
      quantity: 1000,
      delivery_time: '12 weeks',
      target_market: 'Germany',
      certification_required: ['CE', 'DIN'],
      budget_level: 'high',
      priority_level: 'mid',
      alternative_allowed: false
    },
    status: 'processing',
    created_at: '2024-03-08T14:30:00Z',
    updated_at: '2024-03-09T09:00:00Z'
  }
];

export const demoSuppliers: Supplier[] = [
  {
    id: '1',
    supplier_name: 'ABC Rail Components Ltd.',
    country: 'China',
    product_categories: ['brake components', 'railway parts', 'friction materials'],
    certifications: ['ISO9001', 'EN', 'IRIS'],
    export_markets: ['EU', 'Asia', 'North America'],
    min_order_quantity: 100,
    lead_time: '6-8 weeks',
    contact_person: 'Mr. Zhang Wei',
    email: 'zhang@abcrail.com',
    phone: '+86 21 1234 5678',
    website: 'https://www.abcrail.com',
    notes: 'Specialized in railway braking systems with 20+ years experience',
    trust_score: 85,
    is_internal: true,
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-03-01T00:00:00Z'
  },
  {
    id: '2',
    supplier_name: 'MetroTech GmbH',
    country: 'Germany',
    product_categories: ['brake components', 'electronic systems', 'lighting'],
    certifications: ['ISO9001', 'EN', 'CE', 'DIN'],
    export_markets: ['EU', 'North America'],
    min_order_quantity: 200,
    lead_time: '4-6 weeks',
    contact_person: 'Dr. Klaus Mueller',
    email: 'klaus@metrotech.de',
    phone: '+49 30 9876 5432',
    website: 'https://www.metrotech.de',
    notes: 'Premium German manufacturer, high quality but higher prices',
    trust_score: 92,
    is_internal: true,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: '3',
    supplier_name: 'RailParts Co.',
    country: 'Turkey',
    product_categories: ['brake components', 'bogie parts', 'couplers'],
    certifications: ['ISO9001', 'EN'],
    export_markets: ['EU', 'Middle East', 'Africa'],
    min_order_quantity: 300,
    lead_time: '8-10 weeks',
    contact_person: 'Ahmet Yilmaz',
    email: 'ahmet@railparts.com.tr',
    phone: '+90 212 555 1234',
    website: 'https://www.railparts.com.tr',
    notes: 'Competitive pricing, good for large volumes',
    trust_score: 72,
    is_internal: true,
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-20T00:00:00Z'
  },
  {
    id: '4',
    supplier_name: 'LED Solutions Inc.',
    country: 'China',
    product_categories: ['lighting systems', 'LED components', 'electronic parts'],
    certifications: ['ISO9001', 'CE', 'RoHS'],
    export_markets: ['Global'],
    min_order_quantity: 500,
    lead_time: '6-10 weeks',
    contact_person: 'Lisa Chen',
    email: 'lisa@ledsolutions.cn',
    phone: '+86 755 8888 9999',
    website: 'https://www.ledsolutions.cn',
    notes: 'Specialized in LED lighting for transportation',
    trust_score: 78,
    is_internal: true,
    created_at: '2024-02-10T00:00:00Z',
    updated_at: '2024-03-05T00:00:00Z'
  },
  {
    id: '5',
    supplier_name: 'EuroLight Systems',
    country: 'Italy',
    product_categories: ['lighting systems', 'interior design', 'LED modules'],
    certifications: ['ISO9001', 'CE', 'EN'],
    export_markets: ['EU', 'North Africa'],
    min_order_quantity: 100,
    lead_time: '5-7 weeks',
    contact_person: 'Marco Rossi',
    email: 'marco@eurolight.it',
    phone: '+39 02 1234 5678',
    website: 'https://www.eurolight.it',
    notes: 'Italian design, high quality interior lighting',
    trust_score: 88,
    is_internal: true,
    created_at: '2024-01-25T00:00:00Z',
    updated_at: '2024-02-28T00:00:00Z'
  }
];

export const demoMatchResults: MatchResult[] = [
  {
    id: '1',
    inquiry_id: '1',
    supplier_id: '2',
    supplier: demoSuppliers[1],
    match_score: 88,
    recommendation_level: 'High',
    reasons: [
      'German manufacturer with EN certification for railway applications',
      'Located in EU, perfect for Spain market requirements',
      'Strong track record with metro systems in Europe',
      'Lead time of 4-6 weeks meets the 8-week requirement'
    ],
    risk_flags: [
      'Higher pricing than Asian competitors'
    ],
    missing_info: [
      'Confirm current production capacity',
      'Verify EN certification scope covers brake pads'
    ],
    suggested_actions: [
      'Send RFQ with detailed specifications',
      'Request references from other metro operators'
    ],
    created_at: '2024-03-10T11:00:00Z'
  },
  {
    id: '2',
    inquiry_id: '1',
    supplier_id: '1',
    supplier: demoSuppliers[0],
    match_score: 82,
    recommendation_level: 'High',
    reasons: [
      'Specialized in brake components with 20+ years experience',
      'Has EN and IRIS certifications',
      'Competitive pricing',
      'Experience exporting to EU market'
    ],
    risk_flags: [
      'Longer lead time from China',
      'May need additional quality inspections'
    ],
    missing_info: [
      'Confirm export experience to Spain specifically',
      'Request sample for quality evaluation'
    ],
    suggested_actions: [
      'Send RFQ with detailed specifications',
      'Request samples before bulk order'
    ],
    created_at: '2024-03-10T11:00:00Z'
  },
  {
    id: '3',
    inquiry_id: '1',
    supplier_id: '3',
    supplier: demoSuppliers[2],
    match_score: 68,
    recommendation_level: 'Medium',
    reasons: [
      'Competitive pricing from Turkey',
      'Has basic EN certification',
      'Good for large volume orders'
    ],
    risk_flags: [
      'MOQ of 300 is below the 500 requirement but close',
      'Lead time of 8-10 weeks is tight for the 8-week requirement',
      'Limited export experience to Western EU'
    ],
    missing_info: [
      'Confirm ability to meet 8-week delivery',
      'Verify product quality standards'
    ],
    suggested_actions: [
      'Contact to confirm capacity and timeline',
      'Consider for future larger orders'
    ],
    created_at: '2024-03-10T11:00:00Z'
  }
];
