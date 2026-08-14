/**
 * Optional Receipt Storage Service Module
 * Handles file validation and Supabase Storage uploads for transaction receipts.
 */

import { getSupabase } from '../config/supabase.js';

class ReceiptService {
  /**
   * Validate file size and allowed type.
   */
  validateReceiptFile(file) {
    if (!file) return { isValid: true };

    const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    if (file.size > MAX_SIZE_BYTES) {
      return { isValid: false, error: 'Receipt file size must be less than 5MB.' };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Invalid file format. Only JPG, PNG, and PDF files are allowed.' };
    }

    return { isValid: true };
  }

  /**
   * Upload receipt file to Supabase Storage bucket 'receipts'.
   */
  async uploadReceipt(file) {
    try {
      if (!file) return { success: true, url: null };

      const validation = this.validateReceiptFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      const client = getSupabase();
      if (!client) throw new Error('Supabase client unavailable.');

      const user = (await client.auth.getUser())?.data?.user;
      if (!user) throw new Error('User unauthenticated.');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await client.storage
        .from('receipts')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.warn('Receipt upload notice (Bucket may need creation in Supabase Dashboard):', error.message);
        return { success: false, error: 'Receipt upload unavailable. Check Supabase Storage configuration.' };
      }

      const { data: publicUrlData } = client.storage
        .from('receipts')
        .getPublicUrl(data.path);

      return { success: true, url: publicUrlData.publicUrl };
    } catch (err) {
      console.error('Error uploading receipt:', err);
      return { success: false, error: 'Receipt upload failed.' };
    }
  }
}

export const receiptService = new ReceiptService();
