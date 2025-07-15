import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductVariant } from '@/types';
import { Badge } from '@/components/ui/badge';

interface ProductVariantSelectorProps {
  category: string;
  availableVariants: ProductVariant[]; // Only variants that exist for this product
  selectedVariants: Record<string, string>;
  onVariantChange: (variantKey: string, value: string) => void;
  onValidityChange: (isValid: boolean) => void;
}

const ProductVariantSelector = ({
  category,
  availableVariants,
  selectedVariants,
  onVariantChange,
  onValidityChange
}: ProductVariantSelectorProps) => {
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  console.log('ProductVariantSelector - availableVariants:', availableVariants);
  console.log('ProductVariantSelector - selectedVariants:', selectedVariants);

  // Extract unique variant options from available variants
  const getVariantOptions = () => {
    if (!availableVariants || availableVariants.length === 0) {
      console.log('No available variants to extract options from');
      return {};
    }

    const options: Record<string, Set<string>> = {};
    
    availableVariants.forEach(variant => {
      if (variant.rawSelections) {
        Object.entries(variant.rawSelections).forEach(([key, value]) => {
          if (!options[key]) {
            options[key] = new Set();
          }
          options[key].add(value);
        });
      }
    });

    // Convert Sets to arrays
    const result: Record<string, string[]> = {};
    Object.entries(options).forEach(([key, valueSet]) => {
      result[key] = Array.from(valueSet);
    });

    console.log('ProductVariantSelector - extracted variant options:', result);
    return result;
  };

  // Check if selected variants match available product variants
  const getMatchingVariants = () => {
    if (!availableVariants || availableVariants.length === 0) {
      return [];
    }

    const selectedEntries = Object.entries(selectedVariants).filter(([_, value]) => value);
    if (selectedEntries.length === 0) return [];
    
    return availableVariants.filter(variant => {
      if (!variant.rawSelections) return false;
      
      // Check if all selected variants match this variant's rawSelections
      return selectedEntries.every(([key, value]) => 
        variant.rawSelections && variant.rawSelections[key] === value
      );
    });
  };

  const validateSelection = () => {
    const errors: string[] = [];
    const variantOptions = getVariantOptions();
    const variantKeys = Object.keys(variantOptions);
    
    // Check if we have any variant options to select from
    if (variantKeys.length === 0) {
      console.log('No variant options available, marking as valid');
      setValidationErrors([]);
      onValidityChange(true); // No variants to select, so it's valid
      return;
    }

    // Check if at least one variant option is selected
    const hasAnySelection = variantKeys.some(key => selectedVariants[key]);
    
    if (!hasAnySelection) {
      errors.push('Silakan pilih varian produk');
    } else {
      // Check if selected combination exists in available variants
      const matchingVariants = getMatchingVariants();
      if (matchingVariants.length === 0) {
        errors.push('Kombinasi varian yang dipilih tidak tersedia');
      }
    }

    console.log('Validation result:', { errors, hasAnySelection });
    setValidationErrors(errors);
    onValidityChange(errors.length === 0 && hasAnySelection);
  };

  useEffect(() => {
    validateSelection();
  }, [selectedVariants, availableVariants]);

  const variantOptions = getVariantOptions();
  const variantKeys = Object.keys(variantOptions);

  // Don't render if no variants available for this product
  if (!availableVariants || availableVariants.length === 0) {
    console.log('ProductVariantSelector - No variants available, not rendering');
    return null;
  }

  // Don't render if no variant options extracted
  if (variantKeys.length === 0) {
    console.log('ProductVariantSelector - No variant options extracted, not rendering');
    return null;
  }

  const matchingVariants = getMatchingVariants();
  const selectedVariant = matchingVariants.length === 1 ? matchingVariants[0] : null;

  console.log('ProductVariantSelector - Rendering with variantKeys:', variantKeys);
  console.log('ProductVariantSelector - matchingVariants:', matchingVariants);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pilih Varian Produk</h3>
      
      {/* Available Variants Preview */}
      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
        <Label className="text-sm font-medium text-blue-800 mb-2 block">Varian Tersedia:</Label>
        <div className="flex flex-wrap gap-1">
          {availableVariants.map((variant, idx) => (
            <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-800">
              {variant.name}
            </Badge>
          ))}
        </div>
      </div>
      
      {/* Variant Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variantKeys.map((variantKey) => {
          const options = variantOptions[variantKey];
          const displayName = variantKey.charAt(0).toUpperCase() + variantKey.slice(1).replace(/_/g, ' ');
          
          return (
            <div key={variantKey}>
              <Label className="text-sm font-medium">
                {displayName} *
              </Label>
              <Select
                value={selectedVariants[variantKey] || ''}
                onValueChange={(value) => {
                  console.log('ProductVariantSelector - onVariantChange:', variantKey, '=', value);
                  onVariantChange(variantKey, value);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={`Pilih ${displayName}`} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        })}
      </div>

      {/* Show validation errors */}
      {validationErrors.length > 0 && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          {validationErrors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">
              • {error}
            </p>
          ))}
        </div>
      )}

      {/* Show selected variant info if it matches available variants */}
      {selectedVariant && (
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <Label className="text-sm font-medium text-green-800">Varian Dipilih:</Label>
              <Badge variant="secondary" className="mt-1 bg-green-100 text-green-800">
                {selectedVariant.name}
              </Badge>
            </div>
            <div className="text-right">
              {selectedVariant.price > 0 && (
                <div className="text-sm text-green-700 font-medium">
                  +¥{selectedVariant.price.toLocaleString()}
                </div>
              )}
              <div className="text-sm text-green-700">
                Stok: {selectedVariant.stock}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show out of stock warning */}
      {selectedVariant && selectedVariant.stock === 0 && (
        <div className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-600 font-medium">
            Varian ini sedang tidak tersedia (stok habis)
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductVariantSelector;