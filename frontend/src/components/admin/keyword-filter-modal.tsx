"use client";

import { useState, useEffect } from "react";
import { Plus, Search, AlertTriangle, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import api from "@/services/api";

// Define interface for keyword
interface Keyword {
  id: string;
  word: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
  updatedAt: string;
}

export function KeywordFilterModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch keywords when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchKeywords();
    }
  }, [isOpen]);

  // Fetch keywords from API
  const fetchKeywords = async () => {
    setIsLoading(true);
    try {
      // Assume API endpoint to get keywords
      const response = await api.admin.getKeywords();
      setKeywords(response.data);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Could not load keyword list",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new keyword
  const addKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a keyword",
      });
      return;
    }

    // Check if keyword already exists
    if (
      keywords.some((k) => k.word.toLowerCase() === newKeyword.toLowerCase())
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "This keyword already exists in the list",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Assume API endpoint to add new keyword
      const response = await api.admin.addKeyword({
        word: newKeyword,
        severity: severity,
      });

      setKeywords([...keywords, response.data]);
      setNewKeyword("");
      toast({
        title: "Success",
        description: "Keyword added to the banned list",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Could not add keyword",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete keyword
  const deleteKeyword = async (id: string) => {
    setIsLoading(true);
    try {
      // Assume API endpoint to delete keyword
      await api.admin.deleteKeyword(id);
      setKeywords(keywords.filter((keyword) => keyword.id !== id));
      toast({
        title: "Success",
        description: "Keyword removed from the banned list",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error.response?.data?.message || "Could not delete keyword",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter keywords by tab and search
  const filteredKeywords = keywords.filter((keyword) => {
    const matchesSearch = keyword.word
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || keyword.severity === activeTab;
    return matchesSearch && matchesTab;
  });

  // Render severity badge
  const renderSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return (
          <Badge variant="destructive" className="ml-2">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className="ml-2 bg-orange-500">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="ml-2">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-orange-500" />
            Inappropriate Keyword Management
          </DialogTitle>
        </DialogHeader>

        <div className="flex items-center space-x-2 my-4">
          <Input
            placeholder="Add new keyword..."
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addKeyword();
              }
            }}
          />
          <div className="flex items-center space-x-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as "low" | "medium" | "high")
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <Button onClick={addKeyword} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="low">Low</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="border rounded-md overflow-y-auto max-h-[300px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-[200px]">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                </div>
              ) : filteredKeywords.length > 0 ? (
                <ul className="divide-y">
                  {filteredKeywords.map((keyword) => (
                    <li
                      key={keyword.id}
                      className="flex items-center justify-between p-3 hover:bg-muted"
                    >
                      <div className="flex items-center">
                        <span className="font-medium">{keyword.word}</span>
                        {renderSeverityBadge(keyword.severity)}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteKeyword(keyword.id)}
                        className="h-8 w-8 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <AlertTriangle className="h-8 w-8 mb-2" />
                  <p>No keywords found</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <div className="text-sm text-muted-foreground">
            Total: {keywords.length} keywords (
            {keywords.filter((k) => k.severity === "high").length} high
            severity)
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
