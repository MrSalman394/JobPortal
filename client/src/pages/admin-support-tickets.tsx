import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Search, MoreVertical, MessageSquare, Trash2, Eye } from "lucide-react";
import type { Review } from "@shared/schema";
import { format } from "date-fns";

interface ContactMessage extends Review {
  feedback: string;
  userName: string | null;
}

export default function AdminSupportTickets() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: messages, isLoading } = useQuery<ContactMessage[]>({
    queryKey: ["/api/admin/reviews"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/admin/feedback/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete feedback");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/reviews"] });
      toast({ title: "Message Deleted" });
      setDeleteId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredMessages = messages?.filter(msg => {
    const matchesSearch = !search || 
      msg.feedback?.toLowerCase().includes(search.toLowerCase()) ||
      msg.userName?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || msg.userRole === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case "admin": return "bg-red-500/10 text-red-600";
      case "employer": return "bg-purple-500/10 text-purple-600";
      case "employee": return "bg-blue-500/10 text-blue-600";
      default: return "bg-gray-500/10 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Support Tickets</h1>
        <p className="text-muted-foreground">
          View and manage user support messages from Help page
        </p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by message or name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="employer">Employer</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          ) : filteredMessages && filteredMessages.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>From</TableHead>
                    <TableHead>Message Preview</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {msg.userName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{msg.userName || 'Anonymous'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {msg.feedback?.substring(0, 50)}...
                      </TableCell>
                      <TableCell>
                        <Badge className={`capitalize ${getRoleColor(msg.userRole)}`}>
                          {msg.userRole || 'unknown'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => setSelectedMessage(msg)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Full
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive font-bold"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to delete this feedback?")) {
                                  deleteMutation.mutate(msg.id);
                                }
                              }}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              {deleteMutation.isPending && deleteId === msg.id ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {search || roleFilter !== "all" 
                  ? "No support messages match your search criteria"
                  : "No support messages yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Support Message Details</DialogTitle>
            <DialogDescription>
              Message from {selectedMessage?.userName || 'Anonymous'}
            </DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">From</label>
                <p className="text-muted-foreground">{selectedMessage.userName || 'Anonymous'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Badge className={`capitalize ${getRoleColor(selectedMessage.userRole)}`}>
                  {selectedMessage.userRole || 'unknown'}
                </Badge>
              </div>
              <div>
                <label className="text-sm font-medium">Date Submitted</label>
                <p className="text-muted-foreground">
                  {selectedMessage.createdAt ? format(new Date(selectedMessage.createdAt), 'PPpp') : '—'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Message</label>
                <div className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">
                  {selectedMessage.feedback}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
