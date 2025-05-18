"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Search, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import DashboardLayout from "@/layouts/dashboard-layout";
import api from "@/services/api";

interface Keyword {
  id: string;
  word: string;
  createdAt: string;
}

export default function KeywordFilterPage() {
  const { toast } = useToast();
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyword, setNewKeyword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [testContent, setTestContent] = useState("");
  const [testResult, setTestResult] = useState<{
    isValid: boolean;
    invalidWords: string[];
  } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);

  useEffect(() => {
    fetchKeywords();
  }, []);

  const fetchKeywords = async () => {
    try {
      setLoading(true);
      const response = await api.admin.getKeywords();
      setKeywords(response.data.items);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load keyword list. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a keyword.",
      });
      return;
    }

    try {
      const response = await api.admin.addKeyword({
        word: newKeyword,
        severity: "low",
      });
      setKeywords([...keywords, response.data]);
      setNewKeyword("");
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "New keyword has been added.",
      });
    } catch (error) {
      console.error("Error adding keyword:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add keyword. Please try again later.",
      });
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    try {
      await api.admin.deleteKeyword(id);
      setKeywords(keywords.filter((keyword) => keyword.id !== id));
      toast({
        title: "Success",
        description: "Keyword has been deleted.",
      });
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete keyword. Please try again later.",
      });
    }
  };

  const handleTestContent = async () => {
    if (!testContent.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter content to check.",
      });
      return;
    }

    try {
      const response = await api.keywords.checkContent(testContent);
      setTestResult(response.data);
    } catch (error) {
      console.error("Error testing content:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not check content. Please try again later.",
      });
    }
  };

  const filteredKeywords = keywords.filter((keyword) =>
    keyword.word.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <DashboardLayout role="admin">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Inappropriate Keyword Management
          </h1>
          <div className="flex gap-2">
            <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Test Content
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Test Content</DialogTitle>
                  <DialogDescription>
                    Enter content to check if it contains inappropriate
                    keywords.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor="test-content"
                      className="text-sm font-medium"
                    >
                      Content to check
                    </label>
                    <textarea
                      id="test-content"
                      className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Enter content to check..."
                      value={testContent}
                      onChange={(e) => setTestContent(e.target.value)}
                    />
                  </div>
                  {testResult && (
                    <Alert
                      variant={testResult.isValid ? "default" : "destructive"}
                    >
                      <AlertTitle>
                        {testResult.isValid
                          ? "Content is valid"
                          : "Content is invalid"}
                      </AlertTitle>
                      <AlertDescription>
                        {testResult.isValid
                          ? "Content doesn't contain inappropriate keywords."
                          : `Content contains inappropriate keywords: ${testResult.invalidWords.join(
                              ", "
                            )}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsTestDialogOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={handleTestContent}>Check</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Keyword
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Keyword</DialogTitle>
                  <DialogDescription>
                    Add inappropriate keyword to the banned list.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label
                      htmlFor="new-keyword"
                      className="text-sm font-medium"
                    >
                      Keyword
                    </label>
                    <Input
                      id="new-keyword"
                      placeholder="Enter keyword..."
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleAddKeyword}>Add</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Inappropriate Keywords List</CardTitle>
            <CardDescription>
              These keywords will be used to filter inappropriate content in the
              system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search keywords..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} className="h-10 w-full" />
                ))}
              </div>
            ) : filteredKeywords.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500">No keywords found.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKeywords.map((keyword) => (
                    <TableRow key={keyword.id}>
                      <TableCell>
                        <Badge variant="outline">{keyword.word}</Badge>
                      </TableCell>
                      <TableCell>{formatDate(keyword.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteKeyword(keyword.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Scope</CardTitle>
            <CardDescription>
              The list of inappropriate keywords will be applied to the
              following content:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              <li>Topic names, topic content</li>
              <li>Comment content in topics</li>
              <li>Content of company service reviews</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
