import React from 'react';
import IconTag from '../core/IconTag';
import { BaseTagProps } from '../core/BaseTag';
import { 
  Flower, 
  Droplets, 
  Cookie, 
  Wind,
  TestTube,
  Pill,
  Pipette,
  Cigarette,
  Leaf
} from 'lucide-react';
import '../cannabis-tags.css';

export type ProductType = 
  | 'flower' 
  | 'concentrate' 
  | 'edible' 
  | 'vape' 
  | 'tincture'
  | 'topical'
  | 'pill'
  | 'preroll'
  | 'other';

export type ProductSubtype = {
  flower: 'bud' | 'shake' | 'smalls' | 'premium' | string;
  concentrate: 'wax' | 'shatter' | 'rosin' | 'live resin' | 'budder' | 'crumble' | 'oil' | string;
  edible: 'gummy' | 'chocolate' | 'baked' | 'beverage' | 'candy' | string;
  vape: 'cartridge' | 'disposable' | 'pod' | string;
  tincture: 'full spectrum' | 'isolate' | string;
  topical: 'cream' | 'balm' | 'lotion' | 'oil' | string;
  pill: 'capsule' | 'tablet' | string;
  preroll: 'joint' | 'blunt' | 'infused' | string;
  other: string;
};

export interface ProductTagProps extends Omit<BaseTagProps, 'children' | 'color'> {
  type: ProductType;
  subtype?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ProductTag = React.forwardRef<HTMLDivElement, ProductTagProps>(
  (
    {
      type,
      subtype,
      onClick,
      ...props
    },
    ref
  ) => {
    // Map product types to icons
    const productIcons: Record<ProductType, React.ReactNode> = {
      flower: <Flower size={16} />,
      concentrate: <Droplets size={16} />,
      edible: <Cookie size={16} />,
      vape: <Wind size={16} />,
      tincture: <TestTube size={16} />,
      topical: <Pipette size={16} />,
      pill: <Pill size={16} />,
      preroll: <Cigarette size={16} />,
      other: <Leaf size={16} />
    };

    // Map product types to colors
    const productColors: Record<ProductType, string | undefined> = {
      flower: 'green',
      concentrate: 'yellow',
      edible: 'brown',
      vape: 'blue',
      tincture: 'teal',
      topical: 'purple',
      pill: 'orange',
      preroll: 'green',
      other: undefined
    };

    // Get the icon and color for this product type
    const icon = productIcons[type];
    const color = productColors[type];
    
    // Format the label
    let label = type.charAt(0).toUpperCase() + type.slice(1);
    
    // If subtype is provided, add it to the label
    if (subtype) {
      label = `${label} (${subtype})`;
    }

    return (
      <IconTag
        ref={ref}
        icon={icon}
        label={label}
        color={color}
        onClick={onClick}
        className={`product-tag product-tag-${type}`}
        interactive={!!onClick}
        {...props}
      />
    );
  }
);

ProductTag.displayName = 'ProductTag';

export default ProductTag; 