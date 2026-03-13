import { Database, Brain, CheckCircle2, Info, X, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase';
import { isOpenAIConfigured } from '@/lib/openai';
import { useState } from 'react';

interface ConfigCheckProps {
  children: React.ReactNode;
}

export default function ConfigCheck({ children }: ConfigCheckProps) {
  const [showConfigPanel, setShowConfigPanel] = useState(false);

  // 如果都配置好了，直接显示内容
  if (isSupabaseConfigured && isOpenAIConfigured) {
    return <>{children}</>;
  }

  // 演示模式：显示正常界面 + 配置提示
  const showDemoBanner = !isSupabaseConfigured;

  return (
    <>
      {/* Demo Mode Banner */}
      {showDemoBanner && (
        <div className="bg-blue-600 text-white py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="text-sm">
                <strong>Demo Mode:</strong> Using sample data. Configure your own database to save your data.
              </span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-blue-700"
              onClick={() => setShowConfigPanel(true)}
            >
              <Settings className="h-4 w-4 mr-1" />
              Configure
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {children}

      {/* Configuration Panel Modal */}
      {showConfigPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setShowConfigPanel(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground">
                To use your own data and enable AI features, configure the following services.
              </p>

              {/* Supabase Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Database className="h-6 w-6 text-blue-500" />
                  <div>
                    <p className="font-medium">Supabase Database</p>
                    <p className="text-sm text-muted-foreground">Stores inquiries, suppliers, and match results</p>
                  </div>
                </div>
                {isSupabaseConfigured ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Configured</Badge>
                )}
              </div>

              {/* OpenAI Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-purple-500" />
                  <div>
                    <p className="font-medium">OpenAI API</p>
                    <p className="text-sm text-muted-foreground">Powers AI parsing and supplier scoring</p>
                  </div>
                </div>
                {isOpenAIConfigured ? (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Configured
                  </Badge>
                ) : (
                  <Badge variant="secondary">Not Configured</Badge>
                )}
              </div>

              {/* Setup Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Setup Instructions</h4>
                <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                  <li>
                    <strong>Register Supabase:</strong>{' '}
                    <a 
                      href="https://supabase.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      supabase.com
                    </a>
                    {' '}→ Create project → Copy URL and Anon Key
                  </li>
                  <li>
                    <strong>Register OpenAI:</strong>{' '}
                    <a 
                      href="https://platform.openai.com" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      platform.openai.com
                    </a>
                    {' '}→ Create API key → Add payment method
                  </li>
                  <li>
                    <strong>Configure Environment:</strong> Create <code>.env.local</code> file with your keys
                  </li>
                  <li>
                    <strong>Deploy:</strong> Rebuild and redeploy the application
                  </li>
                </ol>
              </div>

              {/* Environment Variables Example */}
              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-400 mb-2">.env.local</p>
                <pre className="text-sm text-green-400 overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-your-openai-key`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
