'use client'

import { Country, Shipment, ShipmentConf } from "@repo/core/models";
import React, { useState, useEffect } from "react";
import { Button, Heading, Input, Label } from "~/components/ui";
import { ChevronsUpDown, Plus, Trash2, X } from 'lucide-react';
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "~/components/ui/card"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "~/components/ui/command";
import { deleteCountryFromZoneAction, addCountryToZoneOfCarrierAction, getCountriesWithoutZoneAction, updateTrancheAction, deleteTrancheAction, addTrancheAction } from "@repo/actions/shipping-manager";
import { InternalServerError } from "@repo/core/types";
import { useToast } from "~/hooks/use-toast";

export interface ShipmentProps {
    expediteur: Shipment,
    providerName: string,
    countriesWithoutZone: Country[]
}

export interface TrancheProps {
    tranche: ShipmentConf,
    onTrancheChange: (tranche: ShipmentConf) => void,
    onDeleteTranche: () => void
}

export type StructuredTranche = {
  oldTranche: ShipmentConf,
  newTranche: ShipmentConf,
  index: number
}

export const ModalAddCountry: React.FunctionComponent<{ countries: Country[], onCountrySet: (code: string) => void }> = ({ countries, onCountrySet }) => {
  const [openPopover, setOpenPopover] = useState(false);
  const [valuePopover, setValuePopover] = React.useState<Country | null>(null);
  return <DialogContent className="w-[500px] fixed top-[300px]">
    <DialogHeader>
        <DialogTitle>Ajouter un pays</DialogTitle>                            
    </DialogHeader>
    <div className="flex flex-col gap-8 pt-9">
      <div className="flex fex-row gap-5 items-center">
        <Label htmlFor="country" className="text-right">
            Pays
        </Label>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
              <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={openPopover ? true : false}
                  className="w-full justify-between p-4 border-neutral-200 text-neutral-900 hover:bg-neutral-200 data-[placeholder]:text-neutral-500"
              >
                  {valuePopover ? valuePopover.name : "Sélectionner un pays..."}
                  <ChevronsUpDown className="opacity-50" />
              </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 max-h-[200px] overflow-y-auto">
            <Command>
                <CommandInput placeholder="Rechercher un pays..." className="h-9" />
                <CommandEmpty>Aucun pays trouvé ou tous les pays sont affectés déjà à des zones.</CommandEmpty>
                <CommandGroup>
                  {countries.map((country) => (
                    <CommandItem key={country.code} onSelect={() => {
                      setValuePopover(country);
                      setOpenPopover(false);
                    }}>
                      {country.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>      
      <DialogFooter className="mt-5">
        <Button variant="default" size="lg" onClick={async () => { 
              onCountrySet(valuePopover?.code || '')
        }}>
            Ajouter
        </Button>
    </DialogFooter>
    </div>
  </DialogContent>
}

export const Tranche: React.FunctionComponent<TrancheProps> = ({
  tranche, onTrancheChange, onDeleteTranche
}) => {
  const [trancheState, setTranche] = useState<ShipmentConf>(tranche)
  return <>
    <div>
      <Input className="w-full bg-gray-100" value={trancheState.poids_min} onChange={(e) => {
        setTranche({
          ...trancheState,
          poids_min: isNaN(parseFloat(e.target.value)) ? trancheState.poids_min : parseFloat(e.target.value)
        })
        onTrancheChange({
          ...trancheState,
          poids_min: isNaN(parseFloat(e.target.value)) ? trancheState.poids_min : parseFloat(e.target.value)
        })
      }}/>
    </div>
    <div>
      <Input className="w-full bg-gray-100" value={trancheState.poids_max} onChange={(e) => {
        setTranche({
          ...trancheState,
          poids_max: isNaN(parseFloat(e.target.value)) ? trancheState.poids_max : parseFloat(e.target.value)
        })
        onTrancheChange({
          ...trancheState,
          poids_max: isNaN(parseFloat(e.target.value)) ? trancheState.poids_max : parseFloat(e.target.value)
        })
      }}/>
    </div>  
    <div>
      <Input className="w-full bg-gray-100" value={trancheState.prix} onChange={(e) => {
        setTranche({
          ...trancheState,
          prix: isNaN(parseFloat(e.target.value)) ? trancheState.prix : parseFloat(e.target.value)
        })
        onTrancheChange({
          ...trancheState,
          prix: isNaN(parseFloat(e.target.value)) ? trancheState.prix : parseFloat(e.target.value)
        })
      }}/>
    </div>
    <div className="flex justify-center items-center" onClick={() => {
      onDeleteTranche()
    }}>
      <Trash2 className="text-gray-400 hover:text-red-500" />
    </div>
  </>
}

export const Zone: React.FunctionComponent<ShipmentProps> = ({
  expediteur, providerName, countriesWithoutZone
}) => {
  const [tranches, setTranches] = useState<ShipmentConf[]>(expediteur.tranches)
  const [countriesOfZone, setCountriesOfZone] = useState<string[]>(expediteur.countries)
  const [countriesWithoutZoneState, setCountriesWithoutZoneState] = useState<Country[]>(countriesWithoutZone)
  const [openDialog, setOpenDialog] = useState(false)
  const [trancheToUpdate, setTrancheToUpdate] = useState<StructuredTranche>()
  const { toast } = useToast()

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if(trancheToUpdate) {
          await updateTrancheAction(trancheToUpdate.oldTranche, trancheToUpdate.newTranche);
          toast({
            title: "Succès",
            description: "La tranche a été mise à jour"
          });
          const updatedTranches = [...tranches];
          updatedTranches[trancheToUpdate.index] = trancheToUpdate.newTranche;
          setTranches(updatedTranches);
        }
      } catch (error: any) {
        toast({
          title: "Erreur", 
          description: error.message
        });
      }
    }, 500);
    return () => {if(timer) clearTimeout(timer);}
  }, [trancheToUpdate])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row justify-between w-100">
          <CardTitle className="text-lg font-semibold">{expediteur.zone}</CardTitle>
          <div className="flex flex-row gap-1 cursor-pointer" onClick={async () => {
            try {
              const tranche = await addTrancheAction({
                mode_livraison: providerName,
                zone: expediteur.zone,
                poids_min: tranches.length > 0 ? tranches[tranches.length-1]?.poids_max || 0 : 0,
                poids_max: tranches.length > 0 ? (tranches[tranches.length-1]?.poids_max || 0) + ((tranches[tranches.length-1]?.poids_max || 0) - (tranches[tranches.length-1]?.poids_min || 0)) : 1,
                prix: 0
              })
              setTranches([...tranches, {
                ...tranche,
                livraison_zones_pays: []
              }])
            } catch (error: any) {
              toast({
                title: "Erreur",
                description: error.message
              })
            }            
          }}>
            <Plus className="text-blue-500" />
            <span className="text-blue-500 underline underline-offset-8">Nouvelle tranche</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[3fr_3fr_3fr_1fr] gap-4 p-4 w-full">
          <div>
            <span>Poids min (inclu)</span>
          </div>
          <div>
            <span>Poids max (exclu)</span>
          </div>
          <div>
            <span>Prix (TTC)</span>
          </div>
          <div>
            <span></span>
          </div>
          {tranches.map((tranche, index) => (
            <Tranche 
              key={index} 
              tranche={tranche} 
              onTrancheChange={async (newTranche: ShipmentConf) => {
                setTrancheToUpdate({
                  oldTranche: tranche,
                  newTranche: newTranche,
                  index: index
                })
              }} 
              onDeleteTranche={async () => {
                try {
                  await deleteTrancheAction(tranche);
                  setTranches(tranches.filter((_, i) => i !== index))
                  toast({
                    title: "Succès",
                    description: "La tranche a été supprimée"
                  })
                } catch(error: any) {
                  toast({
                    title: "Erreur",
                    description: error.message
                  })
                }                
              }}
            />
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex flex-col w-full gap-3">
          {/* En-tête avec titre et bouton */}
          <div className="flex flex-row justify-between w-full p-2">
            <Heading heading={"5"} className="font-semibold">
              Pays concernés
            </Heading>
            <Dialog open={openDialog} onOpenChange={(e) => {setOpenDialog(e)}}>              
              <DialogTrigger>
                <div className="flex flex-row gap-1 cursor-pointer" onClick={() => {}}>
                  <Plus className="text-blue-500" />
                  <span className="text-blue-500 underline underline-offset-4">
                    Ajouter
                  </span>
                </div>
              </DialogTrigger>
              <ModalAddCountry 
                countries={countriesWithoutZoneState} 
                onCountrySet={(code: string) => {
                  try {
                    const country = countriesWithoutZoneState.find((c) => {
                      return c.code === code
                    })
                    if(!country) 
                      throw new InternalServerError("Pays non trouvé")
                    addCountryToZoneOfCarrierAction(expediteur.zone, country.name, providerName)
                    setCountriesWithoutZoneState(countriesWithoutZoneState.filter((country) => country.code !== code))
                    setCountriesOfZone([...countriesOfZone, country.name])
                    toast({
                      title: "Succès",
                      description: "Le pays a été ajouté à la zone"
                    })
                  } catch (error: any) {
                    toast({
                      title: "Erreur",
                      description: error.message
                    })
                  }
                  setOpenDialog(false)
                }}
              />
            </Dialog>          
          </div>

          {/* Liste des pays avec flex-wrap */}
          <div className="flex flex-wrap gap-1">
            {countriesOfZone.map((country, index) => (
              <span key={index} className="bg-gray-100 rounded-full px-2 py-0.5 text-xs inline-flex items-center gap-1" onClick={() => {
                
              }}>
                {country}
                <X className="w-3 h-3 text-gray-400 hover:text-red-500 cursor-pointer" onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const countries = await deleteCountryFromZoneAction(expediteur.zone, country, providerName)
                    setCountriesWithoutZoneState(await getCountriesWithoutZoneAction(providerName))

                    // update expediteur.countries                    
                    setCountriesOfZone(countriesOfZone.filter((c) => c !== country))
                    toast({
                      title: "Succès",
                      description: "Le pays a été supprimé de la zone"
                    })
                  } catch (error: any) {
                    toast({
                      title: "Erreur",
                      description: error.message
                    })
                  }
                }}/>
              </span>
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}