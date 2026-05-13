'use client';

import { deleteDiscountAction, updateDiscountAction } from '@repo/actions/discounts';
import { Discount } from '@repo/core/models';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { Button } from '~/components/ui';
import { Popover, PopoverContent, PopoverTrigger, } from '~/components/ui/popover';

interface DiscountActionsProps {
  discount: Discount;
}

const DiscountActionButtons: React.FC<DiscountActionsProps> = ({ discount }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    await deleteDiscountAction(discount.id);
    setOpen(false);
    router.push('/discounts');
  };

  const handleEdit = async () => {
    router.push('/discounts');
  };

  return (
    <div className="ml-auto flex gap-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="lg" variant="destructive">Supprimer</Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 text-sm text-neutral-700 space-y-4">
          <p>Êtes-vous sûr de vouloir supprimer cette réduction&nbsp;?</p>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>Annuler</Button>
            <Button size="sm" variant="destructive" onClick={handleDelete}>Confirmer</Button>
          </div>
        </PopoverContent>
      </Popover>

      <Button size="lg" variant="default" onClick={handleEdit}>Enregistrer</Button>
    </div>
  );
};

export default DiscountActionButtons;
