import { useState } from 'react';
import {
  BaseTag,
  IconTag,
  RemovableTag,
  StrainTag,
  ChemicalTag,
  EffectTag,
  ProductTag,
  TerpeneTag
} from '../components/ui/tags';
import { Grid, Check, Leaf } from 'lucide-react';

const TagsShowcasePage = () => {
  const [selectedTags, setSelectedTags] = useState<string[]>(['Relaxed', 'Focused']);
  
  const handleRemoveTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag));
  };
  
  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cannabis Tag System</h1>
      
      {/* Core Tags */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Core Tags</h2>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <BaseTag>Basic Tag</BaseTag>
          <BaseTag variant="outline">Outline Tag</BaseTag>
          <BaseTag variant="subtle">Subtle Tag</BaseTag>
          <BaseTag color="green">Green Tag</BaseTag>
          <BaseTag color="blue">Blue Tag</BaseTag>
          <BaseTag color="purple">Purple Tag</BaseTag>
          <BaseTag interactive onClick={() => alert('Clicked!')}>Clickable Tag</BaseTag>
          <BaseTag selected>Selected Tag</BaseTag>
          <BaseTag disabled>Disabled Tag</BaseTag>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-6">
          <IconTag icon={<Check size={14} />} label="With Icon" />
          <IconTag icon={<Leaf size={14} />} label="Icon Right" iconPosition="right" />
          <IconTag icon={<Grid size={14} />} label="Icon Tag" color="teal" />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <RemovableTag onRemove={() => alert('Removed!')}>Removable Tag</RemovableTag>
          <RemovableTag color="red" onRemove={() => alert('Removed!')}>Danger Tag</RemovableTag>
        </div>
      </section>
      
      {/* Strain Tags */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Strain Tags</h2>
        
        <div className="flex flex-wrap gap-3">
          <StrainTag type="indica" intensity={8} />
          <StrainTag type="sativa" intensity={6} />
          <StrainTag type="hybrid" dominance="indica" intensity={7} />
          <StrainTag type="hybrid" dominance="sativa" intensity={5} />
          <StrainTag type="hybrid" dominance="balanced" intensity={6} />
        </div>
      </section>
      
      {/* Chemical Tags */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Chemical Tags</h2>
        
        <div className="flex flex-wrap gap-3">
          <ChemicalTag compound="THC" percentage={23.5} />
          <ChemicalTag compound="CBD" percentage={0.5} />
          <ChemicalTag compound="CBG" percentage={1.2} />
          <ChemicalTag compound="CBN" percentage={0.3} />
          <ChemicalTag compound="THCV" percentage={0.7} />
          <ChemicalTag compound="CBC" percentage={0.2} />
        </div>
      </section>
      
      {/* Effect Tags */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Effect Tags</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Physical Effects</h3>
          <div className="flex flex-wrap gap-3">
            <EffectTag effect="Relaxed" category="physical" intensity={4} />
            <EffectTag effect="Pain Relief" category="physical" intensity={3} />
            <EffectTag effect="Sleepy" category="physical" intensity={5} />
            <EffectTag effect="Energetic" category="physical" intensity={2} />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Mental Effects</h3>
          <div className="flex flex-wrap gap-3">
            <EffectTag effect="Creative" category="mental" intensity={4} />
            <EffectTag effect="Focused" category="mental" intensity={3} />
            <EffectTag effect="Euphoric" category="mental" intensity={5} />
            <EffectTag effect="Uplifted" category="mental" intensity={4} />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Medicinal Effects</h3>
          <div className="flex flex-wrap gap-3">
            <EffectTag effect="Anti-Anxiety" category="medicinal" intensity={4} />
            <EffectTag effect="Anti-Inflammatory" category="medicinal" intensity={3} />
            <EffectTag effect="Anti-Spasm" category="medicinal" intensity={5} />
            <EffectTag effect="Appetite Stimulant" category="medicinal" intensity={4} />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Negative Effects</h3>
          <div className="flex flex-wrap gap-3">
            <EffectTag effect="Dry Mouth" category="negative" intensity={3} />
            <EffectTag effect="Dry Eyes" category="negative" intensity={2} />
            <EffectTag effect="Paranoia" category="negative" intensity={4} />
            <EffectTag effect="Anxiety" category="negative" intensity={3} />
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Flavors</h3>
          <div className="flex flex-wrap gap-3">
            <EffectTag effect="Earthy" category="flavor" />
            <EffectTag effect="Citrus" category="flavor" />
            <EffectTag effect="Pine" category="flavor" />
            <EffectTag effect="Diesel" category="flavor" />
            <EffectTag effect="Berry" category="flavor" />
            <EffectTag effect="Spicy" category="flavor" />
          </div>
        </div>
      </section>
      
      {/* Product Tags */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Product Tags</h2>
        
        <div className="flex flex-wrap gap-3">
          <ProductTag type="flower" subtype="premium" />
          <ProductTag type="concentrate" subtype="live resin" />
          <ProductTag type="edible" subtype="gummy" />
          <ProductTag type="vape" subtype="cartridge" />
          <ProductTag type="tincture" subtype="full spectrum" />
          <ProductTag type="topical" subtype="cream" />
          <ProductTag type="pill" subtype="capsule" />
          <ProductTag type="preroll" subtype="infused" />
          <ProductTag type="other" subtype="accessory" />
        </div>
      </section>
      
      {/* Terpene Tags */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Terpene Tags</h2>
        
        <div className="flex flex-wrap gap-3">
          <TerpeneTag name="Myrcene" percentage={1.2} />
          <TerpeneTag name="Limonene" percentage={0.8} />
          <TerpeneTag name="Pinene" percentage={0.6} />
          <TerpeneTag name="Caryophyllene" percentage={0.4} />
          <TerpeneTag name="Terpinolene" percentage={0.3} />
          <TerpeneTag name="Humulene" percentage={0.2} />
          <TerpeneTag name="Linalool" percentage={0.5} />
          <TerpeneTag name="Ocimene" percentage={0.1} />
        </div>
      </section>
      
      {/* Interactive Example */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Interactive Example: Effect Selection</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Your Selected Effects:</h3>
          <div className="flex flex-wrap gap-3 p-4 border border-gray-600 rounded-lg min-h-16">
            {selectedTags.map(tag => (
              <EffectTag 
                key={tag} 
                effect={tag} 
                category={tag === 'Dry Mouth' || tag === 'Paranoia' ? 'negative' : 
                           tag === 'Pain Relief' || tag === 'Anti-Anxiety' ? 'medicinal' :
                           tag === 'Relaxed' || tag === 'Sleepy' ? 'physical' : 'mental'}
                intensity={3}
                removable
                onRemove={() => handleRemoveTag(tag)}
              />
            ))}
            {selectedTags.length === 0 && (
              <p className="text-gray-400 italic">No effects selected. Click on effects below to add them.</p>
            )}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Available Effects:</h3>
          <div className="flex flex-wrap gap-3">
            <EffectTag 
              effect="Relaxed" 
              category="physical" 
              intensity={4}
              interactive
              onClick={() => handleAddTag('Relaxed')}
              selected={selectedTags.includes('Relaxed')}
            />
            <EffectTag 
              effect="Creative" 
              category="mental" 
              intensity={3}
              interactive
              onClick={() => handleAddTag('Creative')}
              selected={selectedTags.includes('Creative')}
            />
            <EffectTag 
              effect="Pain Relief" 
              category="medicinal" 
              intensity={5}
              interactive
              onClick={() => handleAddTag('Pain Relief')}
              selected={selectedTags.includes('Pain Relief')}
            />
            <EffectTag 
              effect="Focused" 
              category="mental" 
              intensity={4}
              interactive
              onClick={() => handleAddTag('Focused')}
              selected={selectedTags.includes('Focused')}
            />
            <EffectTag 
              effect="Sleepy" 
              category="physical" 
              intensity={4}
              interactive
              onClick={() => handleAddTag('Sleepy')}
              selected={selectedTags.includes('Sleepy')}
            />
            <EffectTag 
              effect="Dry Mouth" 
              category="negative" 
              intensity={3}
              interactive
              onClick={() => handleAddTag('Dry Mouth')}
              selected={selectedTags.includes('Dry Mouth')}
            />
            <EffectTag 
              effect="Anti-Anxiety" 
              category="medicinal" 
              intensity={4}
              interactive
              onClick={() => handleAddTag('Anti-Anxiety')}
              selected={selectedTags.includes('Anti-Anxiety')}
            />
            <EffectTag 
              effect="Paranoia" 
              category="negative" 
              intensity={3}
              interactive
              onClick={() => handleAddTag('Paranoia')}
              selected={selectedTags.includes('Paranoia')}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default TagsShowcasePage; 