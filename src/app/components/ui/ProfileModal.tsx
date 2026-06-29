import React, { useState, useRef } from 'react';
import { X, User, Upload, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'progressor' | 'practitioner';
  userId: string;
  userData: {
    id: string;
    name: string;
    age?: number;
    email?: string;
    avatar_url: string | null;
  } | null;
  onUpdate: (newAvatarUrl: string | null) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  role,
  userId,
  userData,
  onUpdate,
}: ProfileModalProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Helper to extract file path from public URL
  const getPathFromUrl = (url: string) => {
    const parts = url.split('/avatars/');
    if (parts.length > 1) {
      // Decode URL encoding (e.g. %20 -> space, %2F -> /)
      return decodeURIComponent(parts[1]);
    }
    return null;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file.');
      return;
    }

    // Validate file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Image size should be less than 5MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop() || 'png';
      const filePath = `${userId}-${Date.now()}.${fileExt}`;

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error('Storage upload failed: ' + uploadError.message);
      }

      // 2. Retrieve public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update the respective database table
      const tableName = role === 'progressor' ? 'progressors' : 'practitioners';
      const { error: dbError } = await supabase
        .from(tableName)
        .update({ avatar_url: publicUrl })
        .eq('id', userId);

      if (dbError) {
        throw new Error('Database update failed: ' + dbError.message);
      }

      // 4. (Optional but recommended) Delete old avatar file from storage to save space
      if (userData?.avatar_url) {
        const oldPath = getPathFromUrl(userData.avatar_url);
        if (oldPath) {
          // Fire and forget delete to keep execution fast
          supabase.storage.from('avatars').remove([oldPath]).catch(err => {
            console.error('Failed to delete old avatar:', err);
          });
        }
      }

      // 5. Update local state in parent and notify success
      onUpdate(publicUrl);
      toast.success('Profile picture updated successfully!');
    } catch (err: any) {
      console.error('Upload avatar error:', err);
      toast.error(err.message || 'An error occurred during avatar upload.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!userData?.avatar_url) return;

    setIsRemoving(true);
    try {
      const tableName = role === 'progressor' ? 'progressors' : 'practitioners';

      // 1. Update database table
      const { error: dbError } = await supabase
        .from(tableName)
        .update({ avatar_url: null })
        .eq('id', userId);

      if (dbError) {
        throw new Error('Database update failed: ' + dbError.message);
      }

      // 2. Delete file from storage
      const oldPath = getPathFromUrl(userData.avatar_url);
      if (oldPath) {
        const { error: removeError } = await supabase.storage
          .from('avatars')
          .remove([oldPath]);

        if (removeError) {
          console.warn('Could not delete file from storage bucket:', removeError.message);
        }
      }

      // 3. Update parent state
      onUpdate(null);
      toast.success('Profile picture removed.');
    } catch (err: any) {
      console.error('Remove avatar error:', err);
      toast.error(err.message || 'An error occurred while removing the avatar.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-6 animate-in fade-in duration-200">
      {/* Modal Card */}
      <div
        className="bg-card/95 dark:bg-card/90 backdrop-blur-2xl border border-border/40 rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 relative text-foreground"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-6 right-6 p-2 hover:bg-secondary/50 rounded-[1rem] hover:scale-110 active:scale-95 transition-all duration-300 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center mt-4">
          <h2 className="text-2xl font-extrabold tracking-tight mb-6">User Profile</h2>

          {/* Large Avatar Preview */}
          <div className="relative group w-28 h-28 mb-6 rounded-full border-4 border-primary/20 overflow-hidden flex items-center justify-center bg-[#FF6347]/10">
            {isUploading ? (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : isRemoving ? (
              <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-10">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : null}

            {userData?.avatar_url ? (
              <img
                src={userData.avatar_url}
                alt={userData.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <User className="w-12 h-12 text-[#FF6347]" />
            )}
          </div>

          {/* Avatar Management Buttons */}
          <div className="flex flex-col items-center gap-3 w-full mb-8">
            <button
              onClick={handleUploadClick}
              disabled={isUploading || isRemoving}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-[1.25rem] bg-primary hover:bg-primary/95 text-primary-foreground font-bold hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none w-full max-w-[200px]"
            >
              <Upload className="w-4 h-4" />
              Upload Photo
            </button>

            {userData?.avatar_url && (
              <button
                onClick={handleRemoveAvatar}
                disabled={isUploading || isRemoving}
                className="flex items-center justify-center gap-2 px-6 py-2 text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors duration-300 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Remove Photo
              </button>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Details Section */}
          <div className="w-full bg-secondary/40 border border-border/40 rounded-[1.5rem] p-6 space-y-4">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">
                Name
              </span>
              <p className="text-base font-bold text-foreground">
                {userData?.name || 'Loading...'}
              </p>
            </div>

            {role === 'progressor' ? (
              <>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">
                    Progressor ID
                  </span>
                  <p className="text-base font-mono font-bold text-foreground">
                    {userId}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">
                    Age
                  </span>
                  <p className="text-base font-bold text-foreground">
                    {userData?.age ?? 'N/A'} years
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">
                    Practitioner ID
                  </span>
                  <p className="text-base font-mono font-bold text-foreground">
                    {userId}
                  </p>
                </div>
                <div>
                  <span className="text-xs uppercase font-extrabold tracking-wider text-muted-foreground block mb-1">
                    Email
                  </span>
                  <p className="text-base font-bold text-foreground break-all">
                    {userData?.email || 'N/A'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
