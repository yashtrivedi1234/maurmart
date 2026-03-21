import { useState } from "react";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useDeleteBrandMutation,
} from "@/store/api/brandApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Plus, ImageIcon, GalleryHorizontal } from "lucide-react";

export default function AdminBrands() {
  const { data: brands = [], isLoading } = useGetBrandsQuery({});
  const [createBrand] = useCreateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("image", imageFile);

      await createBrand(formData).unwrap();
      setImageFile(null);
      setPreview("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error uploading brand: " + (error?.data?.message || error?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBrand(id).unwrap();
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error deleting brand: " + (error?.data?.message || error?.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Brand Library</h1>
          <p className="mt-1 text-muted-foreground">Upload and manage the partner logos shown across the storefront.</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl shadow-sm">
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Brand Logo</DialogTitle>
              <DialogDescription>
                Upload a brand logo to make it available across the storefront and admin tools.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded border"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !imageFile}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Brand"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg">
          <CardContent className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm text-slate-300">Total Logos</p>
              <p className="mt-2 text-3xl font-display font-bold">{brands.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <GalleryHorizontal className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm sm:col-span-1 xl:col-span-2">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-2xl bg-cyan-50 p-3 text-cyan-600">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Brand assets stay lightweight here.</p>
              <p className="text-sm text-muted-foreground">Use consistent transparent PNGs or clean SVG exports for the best storefront result.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {brands.length === 0 ? (
          <Card className="col-span-full rounded-3xl border-dashed">
            <CardContent className="py-12">
              <p className="text-center text-gray-500">No brands added yet</p>
            </CardContent>
          </Card>
        ) : (
          brands.map((brand: any) => (
            <Card key={brand._id} className="overflow-hidden rounded-3xl border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <div className="mb-5 rounded-2xl border bg-slate-50 p-4">
                <img
                  src={brand.image}
                  alt="Brand"
                  className="w-full h-32 object-contain rounded"
                />
                </div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Brand Asset</p>
                    <p className="text-xs text-muted-foreground">ID: {brand._id.slice(-6)}</p>
                  </div>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this brand? This cannot be undone.
                    </AlertDialogDescription>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(brand._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
