import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { products } from "@/lib/products";
import { Plus, Edit, Trash2 } from "lucide-react";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would check against an env variable
    if (password === 'admin444') {
      setAuthenticated(true);
      toast({
        title: "Welcome to Admin",
        description: "You're now logged in",
      });
    } else {
      toast({
        title: "Incorrect password",
        variant: "destructive",
      });
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center pattern-444">
          <div className="max-w-md w-full mx-4 relative z-10">
            <div className="bg-card border rounded-4 p-8">
              <h1 className="text-3xl font-bold mb-2 text-center">Admin Access</h1>
              <p className="text-muted-foreground text-center mb-8">
                Enter password to continue
              </p>
              
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
                <Button type="submit" className="w-full btn-444">
                  Login
                </Button>
              </form>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Demo password: admin444
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        <div className="container px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Product Management</h1>
              <p className="text-muted-foreground">Manage your Soulfly inventory</p>
            </div>
            <Button onClick={() => setShowAddProduct(!showAddProduct)} className="btn-444">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>

          {showAddProduct && (
            <div className="bg-card border rounded-4 p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
              <form className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" placeholder="e.g. Divine Hoodie" />
                  </div>
                  <div>
                    <Label htmlFor="price">Price (USD)</Label>
                    <Input id="price" type="number" placeholder="95" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" rows={4} placeholder="Product description..." />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tops">Tops</SelectItem>
                        <SelectItem value="bottoms">Bottoms</SelectItem>
                        <SelectItem value="outerwear">Outerwear</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" placeholder="Upload or paste image URL" />
                  </div>
                </div>

                <div>
                  <Label>Sizes & Inventory</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <div key={size}>
                        <Label htmlFor={`size-${size}`} className="text-xs">{size}</Label>
                        <Input id={`size-${size}`} type="number" placeholder="0" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" className="btn-444">Save Product</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-card border rounded-4 overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-4 font-semibold">Product</th>
                  <th className="text-left p-4 font-semibold">Price</th>
                  <th className="text-left p-4 font-semibold">Category</th>
                  <th className="text-left p-4 font-semibold">Stock</th>
                  <th className="text-left p-4 font-semibold">Status</th>
                  <th className="text-right p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const totalStock = Object.values(product.inventory).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={product.id} className="border-b">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded" />
                          <span className="font-medium">{product.name}</span>
                        </div>
                      </td>
                      <td className="p-4">${product.price}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">{totalStock}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded ${product.inStock ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
