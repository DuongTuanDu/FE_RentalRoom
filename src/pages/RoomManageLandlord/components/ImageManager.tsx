import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Trash2, 
  Plus,
  Eye,
  Loader2
} from "lucide-react";
import { useAddRoomImagesMutation, useRemoveRoomImagesMutation } from "@/services/room/room.service";
import { toast } from "sonner";

interface ImageManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomNumber: string;
  existingImages: string[];
  onImagesUpdated: (images: string[]) => void;
}

export const ImageManager = ({
  open,
  onOpenChange,
  roomId,
  roomNumber,
  existingImages,
  onImagesUpdated,
}: ImageManagerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const [addImages] = useAddRoomImagesMutation();
  const [removeImages] = useRemoveRoomImagesMutation();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const markImageForRemoval = (imageUrl: string) => {
    setImagesToRemove(prev => [...prev, imageUrl]);
  };

  const unmarkImageForRemoval = (imageUrl: string) => {
    setImagesToRemove(prev => prev.filter(url => url !== imageUrl));
  };

  const handleAddImages = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh");
      return;
    }

    try {
      setIsUploading(true);
      const result = await addImages({
        id: roomId,
        images: selectedFiles,
      }).unwrap();
      
      onImagesUpdated(result.images);
      setSelectedFiles([]);
      toast.success(`Đã thêm ${selectedFiles.length} ảnh thành công`);
    } catch (error: any) {
      toast.error("Thêm ảnh thất bại");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImages = async () => {
    if (imagesToRemove.length === 0) {
      toast.error("Vui lòng chọn ít nhất một ảnh để xóa");
      return;
    }

    try {
      setIsUploading(true);
      const result = await removeImages({
        id: roomId,
        urls: imagesToRemove,
      }).unwrap();
      
      onImagesUpdated(result.images);
      setImagesToRemove([]);
      toast.success(`Đã xóa ${imagesToRemove.length} ảnh thành công`);
    } catch (error: any) {
      toast.error("Xóa ảnh thất bại");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setImagesToRemove([]);
    onOpenChange(false);
  };

  const currentImages = existingImages.filter(img => !imagesToRemove.includes(img));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Quản lý hình ảnh phòng {roomNumber}
          </DialogTitle>
          <DialogDescription>
            Thêm, xóa và quản lý hình ảnh cho phòng
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Images */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Ảnh hiện tại ({currentImages.length})</h3>
            {currentImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {currentImages.map((imageUrl, index) => (
                  <Card key={index} className="relative group">
                    <CardContent className="p-2">
                      <div className="aspect-square relative overflow-hidden rounded-md">
                        <img
                          src={imageUrl}
                          alt={`Room image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() => window.open(imageUrl, '_blank')}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => markImageForRemoval(imageUrl)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                <p>Chưa có ảnh nào</p>
              </div>
            )}
          </div>

          {/* Images to Remove */}
          {imagesToRemove.length > 0 && (
            <div className="space-y-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-destructive">
                  Ảnh sẽ bị xóa ({imagesToRemove.length})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setImagesToRemove([])}
                >
                  Hủy bỏ
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {imagesToRemove.map((imageUrl, index) => (
                  <Card key={index} className="relative opacity-60">
                    <CardContent className="p-2">
                      <div className="aspect-square relative overflow-hidden rounded-md">
                        <img
                          src={imageUrl}
                          alt={`To remove ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-8 w-8 p-0"
                            onClick={() => unmarkImageForRemoval(imageUrl)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemoveImages}
                disabled={isUploading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa {imagesToRemove.length} ảnh
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Add New Images */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Thêm ảnh mới</h3>
            
            {/* File Upload */}
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="image-upload-manager"
                disabled={isUploading}
              />
              <label
                htmlFor="image-upload-manager"
                className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
              >
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground text-center">
                  <p>Nhấp để chọn ảnh hoặc kéo thả vào đây</p>
                  <p className="text-xs">Hỗ trợ: JPG, PNG, WEBP (tối đa 10MB mỗi ảnh)</p>
                </div>
              </label>
            </div>

            {/* Selected Files Preview */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Ảnh đã chọn ({selectedFiles.length})</label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFiles([])}
                  >
                    Xóa tất cả
                  </Button>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {selectedFiles.map((file, index) => (
                    <Card key={index} className="relative group">
                      <CardContent className="p-2">
                        <div className="aspect-square relative overflow-hidden rounded-md">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeSelectedFile(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {file.name}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                <Button
                  onClick={handleAddImages}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tải lên...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm {selectedFiles.length} ảnh
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
