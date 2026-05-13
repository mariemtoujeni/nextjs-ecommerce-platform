'use client';
import { ProductPack } from '@repo/core/models';
import React, { useEffect, useState } from 'react';
import { Langs } from '~/app/utils';
import { Button } from '~/components/ui';

interface PackageProductProps {
  lang: Langs;
  pack?: ProductPack[];
}

interface SelectedAttributes {
  [attributeName: string]: number; 
}

const PackageProduct: React.FC<PackageProductProps> = ({ pack, lang }: PackageProductProps) => {
  const [selectedAttributesMap, setSelectedAttributesMap] = useState<Record<number, SelectedAttributes>>({});
  const [dynamicPriceMap, setDynamicPriceMap] = useState<Record<number, number>>({});

  if (!pack || pack.length === 0) {
    return <p className="text-gray-500">No products in this package.</p>;
  }

  const productsByReference: Record<number, ProductPack[]> = {};
  pack.forEach((item) => {
    const refId = item.product?.id;
    if (!refId) return;
    if (!productsByReference[refId]) productsByReference[refId] = [];
    productsByReference[refId].push(item);
  });

  const buildAttributeGroups = (items: ProductPack[]) => {
    const groups: Record<string, { name: string; values: { id: number; name: string }[] }> = {};

    items.forEach((item) => {
      item.modelAttributs?.attributeValues?.forEach((attrVal) => {
        const attrName = attrVal.attribute?.name ?? 'Unknown';

        if (!groups[attrName]) {
          groups[attrName] = { name: attrName, values: [] };
        }

        if (!groups[attrName].values.some((v) => v.id === attrVal.id)) {
          if (typeof attrVal.id === 'number') {
            groups[attrName].values.push({ id: attrVal.id, name: attrVal.name ?? '' });
          }
        }
      });
    });

    return groups;
  };

  useEffect(() => {
    const defaultsMap: Record<number, SelectedAttributes> = {};
    const priceMap: Record<number, number> = {};

    Object.entries(productsByReference).forEach(([refIdStr, items]) => {
      const refId = Number(refIdStr);
      if (!items || items.length === 0) return;

      const attributeGroups = buildAttributeGroups(items);
      const defaultAttrs: SelectedAttributes = {};

      Object.entries(attributeGroups).forEach(([attrName, group]) => {
        if (group.values.length > 0) {
          group.values.sort((a, b) => a.id - b.id);
          const first = group.values[0];
          if (first && typeof first.id === 'number') {
            defaultAttrs[attrName] = first.id;
          }
        }
      });

      const selectedValueIds = Object.values(defaultAttrs);
      const matchingModel = items.find((item) => {
        const modelValueIds = item.modelAttributs?.attributeValues?.map((v) => v.id) ?? [];
        return (
          modelValueIds.length === selectedValueIds.length &&
          selectedValueIds.every((id) => modelValueIds.includes(id))
        );
      });

      defaultsMap[refId] = defaultAttrs;
      const fallbackPrice = items[0]?.modelAttributs?.price ?? 0;
      priceMap[refId] = matchingModel?.modelAttributs?.price ?? fallbackPrice ?? 0;
    });

    setSelectedAttributesMap(defaultsMap);
    setDynamicPriceMap(priceMap);
  }, [pack]);

  const handleSelectAttribute = (refId: number, attrName: string, valId: number) => {
    setSelectedAttributesMap((prev) => {
      const prevForRef = prev[refId] ?? {};
      const updatedMap = {
        ...prev,
        [refId]: { ...prevForRef, [attrName]: valId },
      };

      const items = productsByReference[refId] ?? [];
      const selectedValueIds = Object.values(updatedMap[refId] ?? {});
      const matchingModel = items.find((item) => {
        const modelValueIds = item.modelAttributs?.attributeValues?.map((v) => v.id) ?? [];
        return (
          modelValueIds.length === selectedValueIds.length &&
          selectedValueIds.every((id) => modelValueIds.includes(id))
        );
      });

      if (matchingModel) {
        setDynamicPriceMap((prevPrice) => ({
          ...prevPrice,
          [refId]: matchingModel.modelAttributs?.price ?? prevPrice[refId] ?? 0,
        }));
      }

      return updatedMap;
    });
  };

  return (
    <div className="space-y-6 mt-4">
      <div
        className="overflow-y-auto space-y-4 py-2 scrollbar-hide"
        style={{ maxHeight: '60vh', scrollSnapType: 'y mandatory' }}
      >
        {Object.entries(productsByReference).map(([refIdStr, items]) => {
          const refId = Number(refIdStr);
          if (!items || items.length === 0) return null;
          const product = items[0]?.product;
          if (!product) return null;

          const selectedAttributes = selectedAttributesMap[refId] || {};
          const attributeGroups = buildAttributeGroups(items);

          return (
            <div
              key={refIdStr}
              className="border p-4 shadow-sm bg-white"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Product Header */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 object-contain bg-graylight flex-shrink-0">
                  {product.images?.[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.descriptions?.find(dsc => dsc.lang === `${lang}`)?.title ?? 'Product image'}
                      className="w-full h-full object-cover  mix-blend-multiply"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="">
                  <h3 className="text-lg font-semibold">
                    {product.descriptions?.find(dsc => dsc.lang === `${lang}`)?.title ?? 'Unnamed product'}
                  </h3>
                </div>
              </div>

              {/* Attribute selectors */}
              <div className="mt-4 space-y-2">
                {Object.entries(attributeGroups).map(([attrName, group]) => (
                  <div key={attrName}>
                    <p className="font-bold">{group.name}</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {[...group.values].sort((a, b) => a.id - b.id).map((val) => (
                        <Button
                          key={val.id}
                          onClick={() => handleSelectAttribute(refId, attrName, val.id)}
                          className={selectedAttributes[attrName] === val.id ? 'bg-black text-white' : ''}
                          variant="outline"
                          size="default"
                        >
                          {val.name}
                        </Button>
                      ))}

                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackageProduct;
