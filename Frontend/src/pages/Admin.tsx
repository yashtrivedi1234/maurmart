import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Image as ImageIcon, ArrowLeft, Loader2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { 
  useGetHeroSlidesQuery, 
  useAddHeroSlideMutation, 
  useDeleteHeroSlideMutation,
  useGetProductsQuery,
  useUpdateProductStatusMutation
} from "@/redux/api";
import { HeroSlide, Product } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";

export default function Admin() {
  const { toast } = useToast();
  
  // Hero Slide State & Hooks
  const { data: slides = [], isLoading: slidesLoading } = useGetHeroSlidesQuery({});
  const [addSlide, { isLoading: isAdding }] = useAddHeroSlideMutation();
  const [deleteSlide] = useDeleteHeroSlideMutation();
  const [newImage, setNewImage] = useState({ image: "", badge: "", heading: "", highlight: "", sub: "" });

  // Product State & Hooks
  const { data: products = [], isLoading: productsLoading } = useGetProductsQuery({});
  const [updateProductStatus] = useUpdateProductStatusMutation();

  const handleAddSlide = async () => {
    if (!newImage.image || !newImage.heading) {
      toast({
        title: "Error",
        description: "Image URL and Heading are mandatory fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await addSlide({
        image: newImage.image,
        badge: newImage.badge || "✨ New",
        heading: newImage.heading,
        highlight: newImage.highlight || "",
        sub: newImage.sub || "Description here"
      }).unwrap();
      
      toast({ title: "Success", description: "Slide added successfully!" });
      setNewImage({ image: "", badge: "", heading: "", highlight: "", sub: "" });
    } catch (error: any) {
      toast({ title: "Error", description: error?.data?.message || "Failed to add slide", variant: "destructive" });
    }
  };

  const handleRemoveSlide = async (id: string) => {
    try {
      await deleteSlide(id).unwrap();
      toast({ title: "Success", description: "Slide removed successfully!" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to remove slide", variant: "destructive" });
    }
  };

  const handleToggleProduct = async (id: string, field: string, currentValue: boolean) => {
    try {
      await updateProductStatus({ id, [field]: !currentValue }).unwrap();
      toast({ title: "Success", description: "Product status updated!" });
    } catch (error: any) {
      toast({ title: "Error", description: "Failed to update product", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-2 text-foreground">
              <ImageIcon className="w-8 h-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Manage your Hero Slider and Product Highlights.</p>
          </div>
        </div>

        <Tabs defaultValue="hero">
          <TabsList className="mb-4">
            <TabsTrigger value="hero">Hero Slider config</TabsTrigger>
            <TabsTrigger value="products">Product Status Configuration</TabsTrigger>
          </TabsList>

          {/* HERO SLIDER TAB */}
          <TabsContent value="hero">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden mb-8">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold mb-1">Add New Slide</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Input placeholder="Image URL *" value={newImage.image} onChange={(e) => setNewImage({...newImage, image: e.target.value})} />
                  <Input placeholder="Heading *" value={newImage.heading} onChange={(e) => setNewImage({...newImage, heading: e.target.value})} />
                  <Input placeholder="Highlight Word" value={newImage.highlight} onChange={(e) => setNewImage({...newImage, highlight: e.target.value})} />
                  <Input placeholder="Badge Text" value={newImage.badge} onChange={(e) => setNewImage({...newImage, badge: e.target.value})} />
                  <Input placeholder="Subtext Description" className="md:col-span-2" value={newImage.sub} onChange={(e) => setNewImage({...newImage, sub: e.target.value})} />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button onClick={handleAddSlide} disabled={isAdding}>
                    {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />} Add Slide
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-semibold mb-4 text-lg">Current Slides</h3>
                {slidesLoading ? (
                  <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
                ) : slides.length === 0 ? (
                  <p className="text-muted-foreground">No slides available.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {slides.map((slide: HeroSlide) => (
                      <div key={slide._id} className="relative rounded-lg overflow-hidden border">
                        <img src={slide.image} alt="Hero Slide" className="w-full h-48 object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                           <Button variant="destructive" size="icon" onClick={() => handleRemoveSlide(slide._id)}>
                             <Trash2 className="w-4 h-4" />
                           </Button>
                        </div>
                        <div className="p-3 bg-card border-t text-sm">
                          <p className="font-bold truncate">{slide.heading} <span className="text-primary">{slide.highlight}</span></p>
                          <p className="text-muted-foreground text-xs truncate">{slide.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* PRODUCTS CONFIG TAB */}
          <TabsContent value="products">
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Manage Product Flags</h2>
                  
                  {productsLoading ? (
                    <div className="flex justify-center p-8"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
                  ) : (
                    <div className="overflow-x-auto">
                       <table className="w-full text-left text-sm whitespace-nowrap">
                         <thead className="border-b bg-muted/50">
                           <tr>
                              <th className="px-4 py-3 font-medium">Product</th>
                              <th className="px-4 py-3 font-medium text-center">Featured</th>
                              <th className="px-4 py-3 font-medium text-center">New Arrival</th>
                              <th className="px-4 py-3 font-medium text-center">Trending</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-border">
                            {products.map((p: Product) => (
                              <tr key={p._id} className="hover:bg-muted/30">
                                 <td className="px-4 py-3 flex items-center gap-3">
                                   <img src={p.image.startsWith('http') ? p.image : `https://placehold.co/40x40?text=${p.image}`} className="w-10 h-10 rounded object-cover" />
                                   <span className="font-medium">{p.name}</span>
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                    <Switch checked={!!p.isFeatured} onCheckedChange={() => handleToggleProduct(p._id, 'isFeatured', !!p.isFeatured)} />
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                    <Switch checked={!!p.isNewArrival} onCheckedChange={() => handleToggleProduct(p._id, 'isNewArrival', !!p.isNewArrival)} />
                                 </td>
                                 <td className="px-4 py-3 text-center">
                                    <Switch checked={!!p.isTrending} onCheckedChange={() => handleToggleProduct(p._id, 'isTrending', !!p.isTrending)} />
                                 </td>
                              </tr>
                            ))}
                         </tbody>
                       </table>
                    </div>
                  )}
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
