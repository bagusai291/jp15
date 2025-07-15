import { useQuery } from '@tanstack/react-query';
import { getVariantsByCategory } from '@/utils/categoryVariants';

export interface VariantOption {
  id: string;
  category: string;
  variant_name: string;
  options: string[];
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export const useVariantOptions = (category?: string) => {
  return useQuery({
    queryKey: ['variant-options', category],
    queryFn: async (): Promise<VariantOption[]> => {
      if (!category) return [];
      
      const variants = getVariantsByCategory(category);
      
      return Object.entries(variants).map(([variantKey, variantData]) => ({
        id: `${category}-${variantKey}`,
        category,
        variant_name: variantData.name,
        options: variantData.options,
        is_required: variantData.required,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    },
    enabled: !!category,
  });
};