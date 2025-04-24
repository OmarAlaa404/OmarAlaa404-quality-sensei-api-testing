import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";

// Endpoints grouped by tag
interface Endpoint {
  method: string;
  path: string;
  description: string;
  expanded?: boolean;
}

interface EndpointGroup {
  name: string;
  description?: string;
  expanded: boolean;
  endpoints: Endpoint[];
}

interface Schema {
  name: string;
  properties: Record<string, string>;
}

const ENDPOINT_COLORS: Record<string, string> = {
  GET: "bg-green-800",
  POST: "bg-blue-800",
  PUT: "bg-amber-700",
  PATCH: "bg-amber-700",
  DELETE: "bg-red-800"
};

export default function SwaggerUI() {
  const [endpointGroups, setEndpointGroups] = useState<EndpointGroup[]>([
    {
      name: "Boards",
      expanded: false,
      endpoints: [
        { method: "GET", path: "/boards", description: "Get all boards" },
        { method: "POST", path: "/boards", description: "Create a new board" },
        { method: "GET", path: "/boards/{id}", description: "Get a single board" },
        { method: "PUT", path: "/boards/{id}", description: "Update a board" },
        { method: "DELETE", path: "/boards/{id}", description: "Delete a board" }
      ]
    },
    {
      name: "Lists",
      expanded: false,
      endpoints: [
        { method: "GET", path: "/boards/{boardId}/lists", description: "Get all lists for a board" },
        { method: "POST", path: "/boards/{boardId}/lists", description: "Create a new list" },
        { method: "PUT", path: "/boards/{boardId}/lists/{listId}", description: "Update a list" },
        { method: "DELETE", path: "/boards/{boardId}/lists/{listId}", description: "Delete a list" }
      ]
    },
    {
      name: "Cards",
      expanded: false,
      endpoints: [
        { method: "GET", path: "/lists/{listId}/cards", description: "Get all cards for a list" },
        { method: "POST", path: "/lists/{listId}/cards", description: "Create a new card" },
        { method: "PATCH", path: "/lists/{listId}/cards/{cardId}", description: "Update a card" },
        { method: "DELETE", path: "/lists/{listId}/cards/{cardId}", description: "Delete a card" }
      ]
    },
    {
      name: "Authentication",
      expanded: false,
      endpoints: [
        { method: "POST", path: "/api/login", description: "Login and get token" },
        { method: "POST", path: "/api/register", description: "Register a new user" },
        { method: "POST", path: "/api/logout", description: "Logout current user" },
        { method: "GET", path: "/api/user", description: "Get current user info" }
      ]
    }
  ]);

  const schemas: Schema[] = [
    {
      name: "Board",
      properties: {
        id: "integer",
        name: "string",
        description: "string"
      }
    },
    {
      name: "List",
      properties: {
        id: "integer",
        title: "string",
        boardId: "integer"
      }
    },
    {
      name: "Card",
      properties: {
        id: "integer",
        title: "string",
        description: "string",
        status: "string",
        dueDate: "string (date)",
        listId: "integer",
        labels: "array of strings",
        attachments: "array of strings",
        isDeleted: "boolean"
      }
    },
    {
      name: "User",
      properties: {
        id: "integer",
        username: "string"
      }
    }
  ];

  const toggleGroupExpand = (index: number) => {
    setEndpointGroups(prev => {
      const newGroups = [...prev];
      newGroups[index].expanded = !newGroups[index].expanded;
      return newGroups;
    });
  };

  return (
    <Card className="bg-gray-800 text-white border-gray-700 shadow-md">
      <CardHeader className="border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-bold text-primary">Quality Sensei API</CardTitle>
            <CardDescription className="text-gray-400">
              API Testing Playground for learning API testing concepts
            </CardDescription>
          </div>
          <span className="px-2 py-0.5 bg-green-900 text-green-100 rounded-md text-xs">v1.0.0</span>
        </div>
      </CardHeader>
      <CardContent className="p-4">

        <div className="space-y-4">
          {endpointGroups.map((group, groupIndex) => (
            <div key={group.name}>
              <div
                className="bg-gray-900 p-3 rounded-md mb-2 cursor-pointer hover:bg-gray-700 transition-colors duration-200"
                onClick={() => toggleGroupExpand(groupIndex)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-white">{group.name}</h3>
                  {group.expanded ? (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {group.expanded && (
                <div className="pl-4 space-y-2">
                  {group.endpoints.map((endpoint, endpointIndex) => (
                    <div
                      key={`${group.name}-${endpointIndex}`}
                      className="flex border border-gray-700 rounded-md overflow-hidden"
                    >
                      <div className={`${ENDPOINT_COLORS[endpoint.method]} text-white px-3 py-2 font-mono text-sm flex items-center w-20 justify-center`}>
                        {endpoint.method}
                      </div>
                      <div className="flex-1 px-3 py-2 bg-gray-900">
                        <code className="text-primary font-mono">{endpoint.path}</code>
                        <span className="text-gray-400 text-sm ml-2">{endpoint.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-white">Schemas</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schemas.map((schema) => (
              <div key={schema.name} className="bg-gray-900 p-4 rounded-md">
                <h4 className="font-medium text-primary mb-2">{schema.name}</h4>
                <ScrollArea className="h-32">
                  <pre className="text-xs font-mono text-gray-300">
                    {`{\n${Object.entries(schema.properties)
                      .map(([key, type]) => `  "${key}": "${type}"`)
                      .join(",\n")}\n}`}
                  </pre>
                </ScrollArea>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
