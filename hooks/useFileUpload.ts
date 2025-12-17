import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'mindo-assets';

interface UseFileUploadReturn {
    uploadFile: (file: File, folder: string) => Promise<string | null>;
    isUploading: boolean;
    error: string | null;
    progress: number;
}

/**
 * useFileUpload - Hook for uploading files to Supabase Storage
 * 
 * Handles file upload to the 'mindo-assets' bucket with:
 * - Filename sanitization
 * - Progress tracking
 * - Error handling
 * - Public URL retrieval
 */
export function useFileUpload(): UseFileUploadReturn {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const sanitizeFilename = (filename: string): string => {
        // Remove special characters, keep extension
        const ext = filename.split('.').pop() || '';
        const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
        const sanitized = name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-') // Replace non-alphanumeric with dash
            .replace(/-+/g, '-') // Collapse multiple dashes
            .replace(/^-|-$/g, ''); // Remove leading/trailing dashes

        // Add timestamp to ensure uniqueness
        const timestamp = Date.now();
        return `${sanitized}-${timestamp}.${ext}`;
    };

    const uploadFile = useCallback(async (file: File, folder: string): Promise<string | null> => {
        setIsUploading(true);
        setError(null);
        setProgress(0);

        try {
            const sanitizedName = sanitizeFilename(file.name);
            const filePath = `${folder}/${sanitizedName}`;

            // Upload file to Supabase Storage
            const { data, error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw new Error(uploadError.message);
            }

            setProgress(100);

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (!urlData?.publicUrl) {
                throw new Error('Failed to get public URL');
            }

            return urlData.publicUrl;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            setError(message);
            console.error('File upload error:', err);
            return null;
        } finally {
            setIsUploading(false);
        }
    }, []);

    return {
        uploadFile,
        isUploading,
        error,
        progress
    };
}

/**
 * Helper: Get accepted MIME types for each node type
 */
export const FILE_ACCEPT_TYPES: Record<string, string> = {
    video: 'video/*',
    image: 'image/*',
    pdf: 'application/pdf'
};

/**
 * Helper: Get the storage folder for each node type
 */
export const STORAGE_FOLDERS: Record<string, string> = {
    video: 'videos',
    image: 'images',
    pdf: 'documents'
};
