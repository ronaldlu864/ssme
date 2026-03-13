import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { 
  Users, 
  Search, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Star,
  Building2,
  Globe,
  RefreshCw,
  Send,
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { getSuppliers, getMatchResultsByInquiry, createMatchResults } from '@/lib/supabase';
import { scoreSuppliersBatch, generateExternalSearchSuggestions } from '@/lib/openai';
import type { Inquiry, Supplier, MatchResult } from '@/types';
import type { ExternalSearchSuggestion } from '@/lib/openai';

interface MatchResultsProps {
  inquiry: Inquiry | null;
  onRefresh: () => void;
}

export default function MatchResults({ inquiry, onRefresh }: MatchResultsProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [existingMatches, setExistingMatches] = useState<MatchResult[]>([]);
  const [matching, setMatching] = useState(false);
  const [externalSuggestions, setExternalSuggestions] = useState<ExternalSearchSuggestion | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    if (inquiry) {
      loadExistingMatches(inquiry.id);
    }
  }, [inquiry]);

  const loadSuppliers = async () => {
    const { data, error } = await getSuppliers();
    if (error) {
      toast.error('Failed to load suppliers: ' + error);
    } else {
      setSuppliers(data || []);
    }
  };

  const loadExistingMatches = async (inquiryId: string) => {
    const { data, error } = await getMatchResultsByInquiry(inquiryId);
    if (error) {
      console.error('Failed to load matches:', error);
    } else {
      setExistingMatches(data || []);
    }
  };

  const handleFindMatches = async () => {
    if (!inquiry) {
      toast.error('Please select an inquiry first');
      return;
    }

    if (!inquiry.parsed_data) {
      toast.error('Inquiry has not been parsed yet');
      return;
    }

    if (suppliers.length === 0) {
      toast.error('No suppliers in database. Please add suppliers first.');
      return;
    }

    setMatching(true);
    toast.info('AI is analyzing suppliers... This may take a moment.');

    try {
      // Score all suppliers using AI
      const scoredResults = await scoreSuppliersBatch(inquiry.parsed_data, suppliers);
      
      // Sort by total score
      scoredResults.sort((a, b) => b.scoreDetail.total - a.scoreDetail.total);

      // Take top 10
      const topMatches = scoredResults.slice(0, 10);

      // Save to database
      const matchData = topMatches.map(result => ({
        inquiry_id: inquiry.id,
        supplier_id: result.supplierId,
        match_score: result.scoreDetail.total,
        recommendation_level: result.scoreDetail.total >= 75 ? 'High' : result.scoreDetail.total >= 50 ? 'Medium' : 'Low' as 'High' | 'Medium' | 'Low',
        reasons: result.reasons,
        risk_flags: result.riskFlags,
        missing_info: result.missingInfo,
        suggested_actions: result.suggestedActions,
      }));

      const { error } = await createMatchResults(matchData);
      
      if (error) {
        toast.error('Failed to save matches: ' + error);
      } else {
        toast.success(`Found ${topMatches.length} matching suppliers!`);
        await loadExistingMatches(inquiry.id);
        onRefresh();
      }
    } catch (error) {
      toast.error('Error finding matches: ' + String(error));
    }

    setMatching(false);
  };

  const getRecommendationBadge = (level: string) => {
    switch (level) {
      case 'High':
        return <Badge className="bg-green-100 text-green-800">High Recommendation</Badge>;
      case 'Medium':
        return <Badge variant="secondary">Medium Recommendation</Badge>;
      default:
        return <Badge variant="outline">Low Recommendation</Badge>;
    }
  };

  const handleExternalSearch = async () => {
    if (!inquiry?.parsed_data) {
      toast.error('Inquiry has not been parsed yet');
      return;
    }

    setLoadingSuggestions(true);
    toast.info('AI is generating search suggestions...');

    const { suggestions, error } = await generateExternalSearchSuggestions(inquiry.parsed_data);

    if (error) {
      toast.error('Failed to generate suggestions: ' + error);
    } else if (suggestions) {
      setExternalSuggestions(suggestions);
      toast.success('Search suggestions generated!');
    }

    setLoadingSuggestions(false);
  };

  if (!inquiry) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Match Results</h2>
          <p className="text-muted-foreground">Find and evaluate matching suppliers</p>
        </div>

        <Card className="p-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Inquiry Selected</h3>
          <p className="text-muted-foreground mb-4">
            Select an inquiry from the Inquiries tab to find matching suppliers
          </p>
          <Button onClick={() => {}} variant="outline">
            Go to Inquiries
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold">Match Results</h2>
          <p className="text-muted-foreground">
            Finding matches for: <span className="font-medium">{inquiry.client_name}</span>
          </p>
        </div>
        <Button 
          onClick={handleFindMatches} 
          disabled={matching}
          className="gap-2"
        >
          {matching ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              {existingMatches.length > 0 ? 'Re-run Matching' : 'Find Matches'}
            </>
          )}
        </Button>
      </div>

      {/* Inquiry Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Inquiry Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Product:</span>
              <p className="font-medium">{inquiry.parsed_data?.product_name || inquiry.product_description || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Quantity:</span>
              <p className="font-medium">{inquiry.parsed_data?.quantity || inquiry.quantity || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Delivery:</span>
              <p className="font-medium">{inquiry.parsed_data?.delivery_time || inquiry.delivery_time || '-'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Target Market:</span>
              <p className="font-medium">{inquiry.parsed_data?.target_market || inquiry.target_market || '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Match Results */}
      {existingMatches.length === 0 ? (
        <div className="space-y-6">
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Internal Matches Found</h3>
            <p className="text-muted-foreground mb-6">
              No matching suppliers found in your internal database.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleFindMatches} disabled={matching} variant="outline">
                {matching ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Re-run Matching
                  </>
                )}
              </Button>
              <Button onClick={handleExternalSearch} disabled={loadingSuggestions}>
                {loadingSuggestions ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Search External Suppliers
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* External Search Suggestions */}
          {externalSuggestions && (
            <Card className="border-blue-300 bg-blue-50/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-blue-500" />
                  AI Search Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search Keywords */}
                <div>
                  <h4 className="font-medium mb-2">Recommended Search Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {externalSuggestions.searchKeywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>

                {/* Recommended Platforms */}
                <div>
                  <h4 className="font-medium mb-2">Recommended Platforms</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {externalSuggestions.recommendedPlatforms.map((platform, i) => (
                      <a
                        key={i}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:border-blue-400 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{platform.name}</p>
                          <p className="text-xs text-muted-foreground">{platform.description}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Filter Criteria */}
                <div>
                  <h4 className="font-medium mb-2">Filter Criteria</h4>
                  <ul className="space-y-1">
                    {externalSuggestions.filterCriteria.map((criteria, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        {criteria}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tips */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Search Tips
                  </h4>
                  <ul className="space-y-1">
                    {externalSuggestions.tips.map((tip, i) => (
                      <li key={i} className="text-sm text-yellow-800 flex items-start gap-2">
                        <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI Recommended Suppliers */}
                {externalSuggestions.recommendedSuppliers && externalSuggestions.recommendedSuppliers.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      AI Recommended Suppliers
                      <Badge variant="secondary" className="ml-2">
                        {externalSuggestions.recommendedSuppliers.length} found
                      </Badge>
                    </h4>
                    <div className="space-y-3">
                      {externalSuggestions.recommendedSuppliers.map((supplier, i) => (
                        <Card key={i} className="border-l-4 border-l-blue-400">
                          <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-bold text-lg">{supplier.name}</h5>
                                  <Badge variant="outline">{supplier.country}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">{supplier.description}</p>
                                
                                {/* Certifications */}
                                {supplier.certifications && supplier.certifications.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-2">
                                    {supplier.certifications.map((cert, j) => (
                                      <Badge key={j} variant="secondary" className="text-xs">{cert}</Badge>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Why Recommended */}
                                <div className="bg-green-50 p-2 rounded text-sm">
                                  <span className="font-medium text-green-700">Why recommended:</span>
                                  <span className="text-green-700 ml-1">{supplier.whyRecommended}</span>
                                </div>
                              </div>
                              
                              {/* Actions */}
                              <div className="flex flex-col gap-2">
                                <a
                                  href={supplier.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Button variant="outline" size="sm" className="w-full gap-2">
                                    <ExternalLink className="h-4 w-4" />
                                    Visit Website
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-sm text-muted-foreground text-center">
                  Click "Visit Website" to explore suppliers, then add suitable ones to your database.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Top Recommendations</h3>
            <Badge variant="outline">{existingMatches.length} suppliers found</Badge>
          </div>

          {existingMatches.map((match, index) => (
            <Card key={match.id} className={index === 0 ? 'border-green-300 bg-green-50/30' : ''}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Left: Basic Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-lg font-bold">{match.supplier?.supplier_name}</h4>
                          {index === 0 && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              <Star className="h-3 w-3 mr-1 fill-current" />
                              Top Pick
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Globe className="h-4 w-4" />
                            {match.supplier?.country || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {match.supplier?.is_internal ? 'Internal' : 'External'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">{match.match_score}</div>
                        <div className="text-xs text-muted-foreground">Match Score</div>
                      </div>
                    </div>

                    <Progress 
                      value={match.match_score} 
                      className="h-2 mb-4"
                    />

                    <div className="mb-4">
                      {getRecommendationBadge(match.recommendation_level)}
                    </div>

                    {/* Reasons */}
                    {match.reasons && match.reasons.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          Why Recommended
                        </h5>
                        <ul className="space-y-1">
                          {match.reasons.map((reason, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <ArrowRight className="h-3 w-3 mt-1 flex-shrink-0" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Risk Flags */}
                    {match.risk_flags && match.risk_flags.length > 0 && (
                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          Risk Factors
                        </h5>
                        <ul className="space-y-1">
                          {match.risk_flags.map((risk, i) => (
                            <li key={i} className="text-sm text-yellow-700 flex items-start gap-2">
                              <AlertTriangle className="h-3 w-3 mt-1 flex-shrink-0" />
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Info */}
                    {match.missing_info && match.missing_info.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium mb-2">Missing Information</h5>
                        <div className="flex flex-wrap gap-1">
                          {match.missing_info.map((info, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{info}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="lg:w-48 space-y-2">
                    <Button className="w-full gap-2" size="sm">
                      <Send className="h-4 w-4" />
                      Send RFQ
                    </Button>
                    <Button variant="outline" className="w-full" size="sm">
                      View Profile
                    </Button>
                    <Button variant="ghost" className="w-full" size="sm">
                      Add to Watchlist
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
