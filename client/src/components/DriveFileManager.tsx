
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Upload, Trash2, ExternalLink, Loader2, FolderOpen } from 'lucide-react';
import {
  authenticateGoogleDrive,
  createFolder,
  uploadFile,
  listFiles,
  deleteFile,
} from '@/lib/googleDrive';

interface DriveFileManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nationalId: string;
  folderId?: string;
  folderLink?: string;
  onFolderCreated?: (folderId: string, folderLink: string) => void;
}

export function DriveFileManager({
  open,
  onOpenChange,
  nationalId,
  folderId: initialFolderId,
  folderLink: initialFolderLink,
  onFolderCreated,
}: DriveFileManagerProps) {
  const { toast } = useToast();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [folderId, setFolderId] = useState(initialFolderId);
  const [folderLink, setFolderLink] = useState(initialFolderLink);

  useEffect(() => {
    if (open && folderId) {
      loadFiles();
    }
  }, [open, folderId]);

  const handleAuthenticate = async () => {
    setIsAuthenticating(true);
    try {
      // Create folder if doesn't exist
      if (!folderId) {
        const folder = await createFolder(`رقم قومي - ${nationalId}`);
        setFolderId(folder.id);
        setFolderLink(folder.webViewLink);
        onFolderCreated?.(folder.id, folder.webViewLink);
        
        toast({
          title: 'تم إنشاء المجلد بنجاح',
          description: 'يمكنك الآن رفع الملفات',
        });
      }
      
      await loadFiles();
    } catch (error: any) {
      toast({
        title: 'خطأ في إنشاء المجلد',
        description: error.message || 'حدث خطأ أثناء الاتصال بـ Google Drive',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const loadFiles = async () => {
    if (!folderId) return;
    
    setIsLoadingFiles(true);
    try {
      const filesList = await listFiles(folderId);
      setFiles(filesList);
    } catch (error: any) {
      toast({
        title: 'خطأ في تحميل الملفات',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || !folderId) return;

    setIsUploading(true);
    try {
      for (const file of Array.from(selectedFiles)) {
        // Check if PDF
        if (file.type !== 'application/pdf') {
          toast({
            title: 'نوع ملف غير صحيح',
            description: 'يمكنك رفع ملفات PDF فقط',
            variant: 'destructive',
          });
          continue;
        }

        await uploadFile(file, folderId);
      }

      toast({
        title: 'تم رفع الملفات بنجاح',
      });

      await loadFiles();
    } catch (error: any) {
      toast({
        title: 'خطأ في رفع الملفات',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`هل تريد حذف الملف "${fileName}"؟`)) return;

    try {
      await deleteFile(fileId);
      toast({
        title: 'تم حذف الملف بنجاح',
      });
      await loadFiles();
    } catch (error: any) {
      toast({
        title: 'خطأ في حذف الملف',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إدارة ملفات - رقم قومي: {nationalId}</DialogTitle>
        </DialogHeader>

        {!folderId ? (
          <div className="flex flex-col items-center gap-4 py-8">
            <FolderOpen className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              لم يتم إنشاء مجلد لهذا السجل بعد
            </p>
            <Button onClick={handleAuthenticate} disabled={isAuthenticating}>
              {isAuthenticating && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
              إنشاء مجلد ورفع ملفات
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleFileUpload}
                disabled={isUploading}
                id="file-upload"
                className="hidden"
              />
              <Button
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={isUploading}
                className="gap-2"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                رفع ملف PDF
              </Button>
              
              {folderLink && (
                <Button
                  variant="outline"
                  onClick={() => window.open(folderLink, '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  فتح المجلد
                </Button>
              )}
            </div>

            <div className="border rounded-lg">
              <div className="p-4 border-b bg-muted/50">
                <h3 className="font-semibold">الملفات المرفوعة</h3>
              </div>
              
              {isLoadingFiles ? (
                <div className="p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                </div>
              ) : files.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  لا توجد ملفات مرفوعة
                </div>
              ) : (
                <div className="divide-y">
                  {files.map((file) => (
                    <div key={file.id} className="p-3 flex items-center justify-between hover:bg-muted/50">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="text-sm">
                          <div className="font-medium">{file.name}</div>
                          <div className="text-muted-foreground text-xs">
                            {new Date(file.createdTime).toLocaleDateString('ar-EG')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.webViewLink, '_blank')}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
