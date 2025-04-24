import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Save, Plus, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface Header {
  key: string;
  value: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  time: number;
  data: any;
  headers: Record<string, string>;
}

export default function ApiTester() {
  const [method, setMethod] = useState<string>("GET");
  const [url, setUrl] = useState<string>("");
  const [headers, setHeaders] = useState<Header[]>([
    { key: "Content-Type", value: "application/json" },
    { key: "Authorization", value: "" }
  ]);
  const [body, setBody] = useState<string>("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("headers");
  const [responseTab, setResponseTab] = useState<string>("json");

  const addHeader = () => {
    setHeaders([...headers, { key: "", value: "" }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = [...headers];
    newHeaders.splice(index, 1);
    setHeaders(newHeaders);
  };

  const updateHeaderKey = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index].key = value;
    setHeaders(newHeaders);
  };

  const updateHeaderValue = (index: number, value: string) => {
    const newHeaders = [...headers];
    newHeaders[index].value = value;
    setHeaders(newHeaders);
  };

  const sendRequest = async () => {
    setIsLoading(true);
    try {
      const startTime = Date.now();
      
      // Prepare headers
      const headerObj: Record<string, string> = {};
      headers.forEach(header => {
        if (header.key && header.value) {
          headerObj[header.key] = header.value;
        }
      });

      // Make the request
      const res = await fetch(url, {
        method,
        headers: headerObj,
        body: ["POST", "PUT", "PATCH"].includes(method) && body ? body : undefined,
      });

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Extract headers
      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      // Extract response data
      let responseData;
      try {
        responseData = await res.json();
      } catch (e) {
        try {
          responseData = await res.text();
        } catch (e) {
          responseData = "No response body";
        }
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        time: responseTime,
        data: responseData,
        headers: responseHeaders
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "Failed",
        time: 0,
        data: error instanceof Error ? error.message : "Unknown error",
        headers: {}
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = () => {
    if (!response) return "bg-gray-500";
    if (response.status >= 200 && response.status < 300) return "bg-green-600";
    if (response.status >= 300 && response.status < 400) return "bg-blue-600";
    if (response.status >= 400 && response.status < 500) return "bg-yellow-600";
    return "bg-red-600";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Request Panel */}
      <Card className="bg-gray-800 text-white border-gray-700 shadow-md">
        <CardHeader className="border-b border-gray-700">
          <CardTitle>Request</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Method & URL */}
          <div className="flex">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-28 rounded-r-none bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="Enter request URL" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 rounded-l-none bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
          
          {/* Request Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-gray-700 border-b border-gray-700">
              <TabsTrigger 
                value="headers" 
                className={`data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300`}
              >
                Headers
              </TabsTrigger>
              <TabsTrigger 
                value="params" 
                className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
              >
                Params
              </TabsTrigger>
              <TabsTrigger 
                value="body" 
                className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
              >
                Body
              </TabsTrigger>
              <TabsTrigger 
                value="auth" 
                className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
              >
                Auth
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="headers" className="pt-4">
              <div className="space-y-2">
                {headers.map((header, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Key"
                      value={header.key}
                      onChange={(e) => updateHeaderKey(index, e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-sm"
                    />
                    <Input
                      placeholder="Value"
                      value={header.value}
                      onChange={(e) => updateHeaderValue(index, e.target.value)}
                      className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHeader(index)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="ghost"
                  onClick={addHeader}
                  className="text-primary hover:text-primary-foreground text-sm px-0"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Header
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="params" className="pt-4">
              <div className="text-sm text-gray-400 italic">
                Query parameters can be added directly to the URL.
                <br />
                Example: <code className="text-primary">/api/endpoint?param1=value1&param2=value2</code>
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="pt-4">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-48 bg-gray-700 border border-gray-600 rounded-md text-white p-3 font-mono text-sm resize-none"
                placeholder={`{\n  "key": "value"\n}`}
              ></textarea>
            </TabsContent>
            
            <TabsContent value="auth" className="pt-4">
              <div className="text-sm text-gray-400">
                <p className="mb-2">Authentication is handled via the Authorization header.</p>
                <p>Example: <code className="text-primary">Bearer your-token-here</code></p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Response Panel */}
      <Card className="bg-gray-800 text-white border-gray-700 shadow-md">
        <CardHeader className="border-b border-gray-700 flex flex-row justify-between items-center p-4">
          <CardTitle>Response</CardTitle>
          {response && (
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 ${getStatusColor()} rounded-md text-xs text-white font-medium`}>
                {response.status} {response.statusText}
              </span>
              <span className="text-sm text-gray-400">{response.time} ms</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-end space-x-2 mb-4">
            <Button 
              variant="default" 
              className="bg-green-600 hover:bg-green-700"
              onClick={sendRequest}
              disabled={isLoading || !url}
            >
              <Play className="h-4 w-4 mr-1" /> Send
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-600 text-gray-300"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-1" /> Save
            </Button>
          </div>
          
          {/* Response Content */}
          {response ? (
            <Tabs value={responseTab} onValueChange={setResponseTab}>
              <TabsList className="bg-gray-700 border-b border-gray-700">
                <TabsTrigger 
                  value="json" 
                  className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                >
                  JSON
                </TabsTrigger>
                <TabsTrigger 
                  value="headers" 
                  className="data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300"
                >
                  Headers
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="json">
                <ScrollArea className="h-64 bg-gray-900 rounded-md p-4 mt-4">
                  <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap break-words">
                    {typeof response.data === 'string' 
                      ? response.data 
                      : JSON.stringify(response.data, null, 2)}
                  </pre>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="headers">
                <ScrollArea className="h-64 bg-gray-900 rounded-md p-4 mt-4">
                  <div className="space-y-1">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="text-xs font-mono text-primary mr-2">{key}:</span>
                        <span className="text-xs font-mono text-gray-300">{value}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400 italic">
              Send a request to see the response
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
