'use client'

import { useState } from "react";
import { AddAdminRequest } from "@repo/core/models";
import { Button, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui"
import {
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "~/components/ui/dialog"
  import { useToast } from "~/hooks/use-toast";

import { createAdminAction } from "@repo/actions/access-manager";

interface ModalContentProps {
  onClose: () => void;
  onRefresh: () => void;
}


  export const ModalContent: React.FunctionComponent<ModalContentProps> = ({ onClose, onRefresh }) => {
    const { toast } = useToast();
    const [ user, setUser ] = useState<AddAdminRequest>({
        nom: '',
        prenom: '',
        email: '',
        role: 'admin.editor'
    });
    
    return <DialogContent className="w-[500px] fixed top-[300px]">
      <DialogHeader>
        <DialogTitle>Inviter un collaborateur</DialogTitle>        
      </DialogHeader>
      <div className="flex flex-col gap-8 py-9">
        <div className="flex fex-row gap-5 items-center">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input id="name" className="col-span-3 bg-neutral-100 p-2 rounded-lg" value={user.nom} onChange={(e) => setUser({ ...user, nom: (e.target as HTMLInputElement).value })} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Prenom
            </Label>
            <Input id="username" className="col-span-3 bg-neutral-100 p-2 rounded-lg" value={user.prenom} onChange={(e) => setUser({ ...user, prenom: (e.target as HTMLInputElement).value })} />
          </div>
        </div>          
        <div className="flex flex-col gap-1">
          <div className="flex fex-row gap-5 items-center">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            
              <Input 
                id="email" 
                className="col-span-3 bg-neutral-100 p-2 rounded-lg" 
                value={user.email} 
                onChange={(e) => {
                  const email = (e.target as HTMLInputElement).value;
                  setUser({ ...user, email });
                }} 
              />            
          </div>
        {user.email && !/^[\w-\.]+@(nataquashop\.com|squaad\.io)$/.test(user.email) && (
              <div className="text-red-500 text-sm font-semibold">L'email doit être soit nataquashop.com ou squaad.io après @.</div>
            )}
        </div>            
        <div className="flex fex-row gap-5 items-center">
          <Label htmlFor="role" className="text-right">
            Rôle
          </Label>
          <Select value={user.role} onValueChange={(value) => setUser({ 
              ...user, 
              role: value === "admin.super" ? "admin.super" : "admin.editor"  
              })
            }>
            <SelectTrigger className="bg-neutral-100 p-2 rounded-lg">
                <SelectValue placeholder="Rôle utilisateur" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="admin.super">Administrateur</SelectItem>
                <SelectItem value="admin.editor">Collaborateur</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <Button 
          variant={'outline'} 
          size={'lg'}
          onClick={() => {
            onClose();
          }}
        >Annuler</Button>
        <Button 
          variant={'default'} 
          size={'lg'}
          onClick={async () => {                        
            const result = await createAdminAction(user);
            if (result.error) {
              toast({
                title: "Erreur",
                description: result.error,
                variant: "destructive"
              });
            } else {
              toast({
                title: "Succès",
                description: "L'administrateur a été ajouté avec succès",
              });
              setUser({
                  nom: '',
                  prenom: '',
                  email: '',
                  role: 'admin.editor'
              });              
            }    
            onClose();
            onRefresh();
          }}
          disabled={!/^[\w-\.]+@(nataquashop\.com|squaad\.io)$/.test(user.email)}
        >Ajouter</Button>
      </DialogFooter>
    </DialogContent>
  }