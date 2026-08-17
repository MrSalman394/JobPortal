import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cookie, RefreshCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CookieCheck() {
  const [cookies, setCookies] = useState<{ name: string; value: string }[]>([]);

  const getCookies = () => {
    // Direct split without decoding first to catch raw values
    const rawCookies = document.cookie.split(';').filter(c => c.trim() !== '');
    const cookieArray = rawCookies.map(cookie => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      return { name, value };
    });
    console.log("Current document.cookie:", document.cookie);
    setCookies(cookieArray);
  };

  useEffect(() => {
    getCookies();
    
    // Add some test cookies if none exist (or just for testing)
    const testCookies = [
      { name: "test_user_pref", value: "dark_mode" },
      { name: "test_last_visit", value: new Date().toLocaleDateString() },
      { name: "test_session_type", value: "guest" }
    ];

    testCookies.forEach(cookie => {
      if (!document.cookie.includes(cookie.name)) {
        document.cookie = `${cookie.name}=${cookie.value}; path=/; max-age=3600; SameSite=Lax`;
      }
    });
    
    getCookies();
  }, []);

  const clearCookie = (name: string) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    getCookies();
  };

  const setTestCookie = () => {
    const timestamp = new Date().toLocaleTimeString();
    document.cookie = `test_cookie_${Math.floor(Math.random() * 1000)}=Hello_at_${timestamp.replace(/\s/g, '_')}; path=/; max-age=3600`;
    getCookies();
  };

  const [newName, setNewName] = useState("");
  const [newValue, setNewValue] = useState("");

  const addCustomCookie = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    const value = newValue.trim();
    
    if (!name || !value) return;

    // Direct, no-fuss cookie setting for maximum compatibility
    document.cookie = name + "=" + value;
    
    setNewName("");
    setNewValue("");
    
    // Refresh the list immediately
    getCookies();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                <Cookie className="h-10 w-10 text-primary" />
                Cookie Inspector
              </h1>
              <p className="text-muted-foreground font-medium">
                View and manage browser cookies for the current session.
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={setTestCookie} variant="outline" className="font-bold">
                Random Cookie
              </Button>
            </div>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Add New Cookie</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addCustomCookie} className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold">Cookie Name</label>
                  <input 
                    type="text" 
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. user_preference"
                    className="w-full p-2 rounded-md border bg-background"
                    required
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-bold">Cookie Value</label>
                  <input 
                    type="text" 
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="e.g. dark_mode"
                    className="w-full p-2 rounded-md border bg-background"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="w-full bg-primary font-bold">
                    Save Cookie
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
              <CardTitle className="text-2xl font-bold">Active Cookies</CardTitle>
              <Button variant="outline" size="sm" onClick={getCookies} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {cookies.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bold">Name</TableHead>
                      <TableHead className="font-bold">Value</TableHead>
                      <TableHead className="text-right font-bold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cookies.map((cookie) => (
                      <TableRow key={cookie.name}>
                        <TableCell className="font-medium text-primary">{cookie.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate italic">{cookie.value}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => clearCookie(cookie.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
                  <Cookie className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                  <p className="text-muted-foreground font-medium">No cookies found for this domain.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-primary/5 p-6 rounded-xl border border-primary/10">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span className="text-primary text-xl">💡</span>
              Pro Tip: Browser Developer Tools
            </h3>
            <p className="text-sm text-muted-foreground">
              For a more detailed view (including HttpOnly cookies which aren't accessible via JavaScript for security reasons), 
              press <kbd className="px-1.5 py-0.5 rounded border bg-background font-sans text-xs">F12</kbd> or 
              <kbd className="px-1.5 py-0.5 rounded border bg-background font-sans text-xs">Right Click &gt; Inspect</kbd>, 
              then go to the <strong>Application</strong> tab and select <strong>Cookies</strong> in the sidebar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
