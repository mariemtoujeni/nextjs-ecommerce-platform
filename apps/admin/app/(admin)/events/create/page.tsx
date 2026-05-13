"use client";

import { useState } from "react";
import { Button, Input, Label, Card, CardHeader, Heading,} from "~/components/ui";
import { WYSIWYG } from "~/components/wysiwyg";
import React, { FC } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, Trash2 } from "lucide-react";
import { EventInput } from "@repo/core/models";
import { addEventAction, uploadEventCoverImageAction,} from "@repo/actions/events";
import { Badge } from "~/components/ui/badge";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { format } from "date-fns";
import { useToast } from "~/hooks/use-toast";
import Image from "next/image";
import { DATE_VALIDATION, MAX_IMAGE_SIZE, SUPPORTED_FORMATS } from "../utils";
import Link from "next/link";


const CreateEventPage: React.FC = () => {
  const router = useRouter();
  const [event, setEvent] = useState<EventInput>({
    name: "",
    image: "",
    description: "",
    startDate: new Date(),
    endDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    url: "",
  });
  const [endOpen, setEndOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const { toast } = useToast();
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);

  const handleAddEvent = async () => {
    if (event.endDate <= event.startDate) {
      toast({title: "Erreur", description: "Impossible d'enregistrer, erreur sur les dates"});
      return;
    }
    try {
      let imgEvent = "";

      if (selectedCoverImage) {
        const uploadedUrl = await uploadEventCoverImageAction(selectedCoverImage);
        imgEvent = `evenements${uploadedUrl.item}`; 
      }

      await addEventAction({
        ...event,
        image: imgEvent,
      });
      router.push("/events");
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de l'enregistrement"});
    }
  };

  const handleDeleteCoverImage = () => {
    setEvent((prev) => ({ ...prev, image: "" }));
    setSelectedCoverImage(null);
  };

  const handleCoverImageAdd = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const coverImageFile = e.target.files?.[0];
    if (!coverImageFile) return;
    const isSupportedFormat = SUPPORTED_FORMATS.includes(coverImageFile.type);
    const isFileTooLarge = coverImageFile.size > MAX_IMAGE_SIZE;

    if (!isSupportedFormat) {
      toast({title: "Erreur", description: "Format non supporté, utilisez .jpg, .png ou .webp"});
      return;
    }

    if (isFileTooLarge) {
      toast({title: "Erreur", description: "Image trop volumineux, max 5MB autorisé"});
      return;
    }
    setSelectedCoverImage(coverImageFile);
    setEvent((prev) => ({...prev,image: URL.createObjectURL(coverImageFile),}));
  };

  return (
    <>
      <div className="flex flex-row items-center gap-4 mb-4">
        <Link href="/events">
          <Button className="text-gray-700" variant="secondary" size="icon"><ArrowLeft /> </Button>
        </Link>
        <div>
          <Heading heading="2">Nouvel évènement</Heading>
          <Heading heading="6">
            Créé par Admin le{" "}{new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
          </Heading>
        </div>
        <div className="ml-auto flex gap-4">
          <Button variant="outline" size="lg" onClick={() => router.push("/events")}>
            Annuler
          </Button>
          <Button variant="default" size="lg" onClick={handleAddEvent}>
            Enregistrer
          </Button>
        </div>
      </div>

      <Card className="w-full p-6">
        <CardHeader className="p-0 mb-4">
          <div className="flex items-center w-full justify-between">
            <Heading heading="3" className="font-bold">
              Informations globales
            </Heading>
            <Badge variant={"gray"}>Brouillon</Badge>
          </div>
        </CardHeader>

        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nom de l&apos;évènement</Label>
            <Input
              id="name"
              className="bg-neutral-100 p-2 rounded-lg"
              value={event.name}
              placeholder="Nom de l'évènement"
              onChange={(e) => setEvent({ ...event, name: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-2">
               <div className="flex gap-2">
            <Label htmlFor="description">Description de l&apos;évènement</Label>
              <button type="button" onClick={() => setIsPreview((prev) => !prev)} className="text-gray-500 hover:text-gray-700">
                <Eye size={16} />
              </button>
              </div>
            <WYSIWYG
              content=""
              onChange={(content) => {
                setEvent({ ...event, description: content });
              }}
              previewMode={isPreview}
            />
          </div>

          <div className="flex gap-20">
            <div className="flex flex-col gap-2" style={{ width: "280px" }}>
              <Label htmlFor="startDate">
                Date de début de l&apos;évènement
              </Label>
              <Popover open={startOpen} onOpenChange={setStartOpen}>
                <PopoverTrigger asChild>
                  <Input
                    id="startDate"
                    type="text"
                    readOnly
                    placeholder={format(event.startDate, "dd/MM/yyyy")}
                    className="bg-neutral-100 p-2 rounded-lg cursor-pointer w-full"
                    value={event.startDate instanceof Date ? format(event.startDate, "dd/MM/yyyy"): ""}
                    onClick={() => setStartOpen(true)}
                  />
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-full">
                  <Calendar
                    mode="single"
                    selected={event.startDate instanceof Date ? event.startDate : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const updatedStart = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                      const rawEnd = event.endDate instanceof Date ? event.endDate : new Date(event.endDate);
                      const end = new Date(Date.UTC(rawEnd.getFullYear(), rawEnd.getMonth(), rawEnd.getDate()));

                      if (updatedStart >= end) {
                        setDateError(DATE_VALIDATION);
                      } else {
                        setDateError(null);
                      }
                    setEvent((prev) => ({ ...prev, startDate: updatedStart }));
                    setStartOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2" style={{ width: "280px" }}>
              <Label htmlFor="endDate">Date de fin de l&apos;évènement</Label>
              <Popover open={endOpen} onOpenChange={setEndOpen}>
                <PopoverTrigger asChild>
                  <Input
                    id="endDate"
                    type="text"
                    readOnly
                    placeholder={format(event.endDate, "dd/MM/yyyy")}
                    className="bg-neutral-100 p-2 rounded-lg cursor-pointer w-full"
                    value={event.endDate instanceof Date ? format(event.endDate, "dd/MM/yyyy") : ""}
                    onClick={() => setEndOpen(true)}
                  />
                </PopoverTrigger>
                <PopoverContent align="start" className="p-0 w-full">
                  <Calendar
                    mode="single"
                    selected={event.endDate instanceof Date ? event.endDate : undefined}
                    onSelect={(date) => {
                      if (!date) return;
                      const updatedEnd = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
                      const rawStart = event.startDate instanceof Date ? event.startDate : new Date(event.startDate);
                      const start = new Date(Date.UTC(rawStart.getFullYear(), rawStart.getMonth(), rawStart.getDate()));

                      if (updatedEnd <= start) {
                        setDateError(DATE_VALIDATION);
                      } else {
                        setDateError(null);
                      }

                      setEvent((prev) => ({ ...prev, endDate: updatedEnd }));
                      setEndOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {dateError && (
            <p className="text-red-500 font-bold -mt-6">{dateError}</p>
          )}
{/*
          <div className="flex flex-col gap-2">
            <Label htmlFor="url">Lien de l&apos;évènement</Label>
            <Input
              id="url"
              className="bg-neutral-100 p-2 rounded-lg"
              value={event.url}
              placeholder="Lien de l'évènement"
              onChange={(e) => setEvent({ ...event, url: e.target.value })}
            />
          </div>*/}

          <div className="flex flex-col gap-2 flex-1">
            <Label>Couverture de l&apos;évènement</Label>
            <div className="flex flex-col items-center justify-center border bg-neutral-100 rounded-lg p-6 text-center text-sm text-gray-500">
              {!event.image && (
                  <div className="mb-4">
                  <p>
                    Accepte uniquement les <code>.jpg</code>, <code>.png</code>,
                    <code>.webp</code> (5MB){" "}
                    <label htmlFor="image-upload" className="w-full">
                      <span className="underline text-blue-600 cursor-pointer">
                        Ajouter une image
                      </span>
                    </label>
                  </p>
                </div>
              )}


              {event.image && (
                <div className="relative w-full max-w-xs h-56 mx-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="absolute top-2 right-2 z-20 bg-red-100 text-white rounded-sm w-8 h-8 flex items-center justify-center text-lg hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Remove image"
                      >
                        <Trash2 size={16} className="text-red-700" />
                      </button>
                    </PopoverTrigger>

                    <PopoverContent className="w-64 p-4">
                      <p className="mb-4 text-sm text-gray-700">
                        Voulez-vous vraiment retirer cette image ?
                      </p>
                      <div className="flex justify-end gap-2">
                        <PopoverClose asChild>
                          <Button variant="outline" size="sm">
                            Annuler
                          </Button>
                        </PopoverClose>
                        <Button variant="destructive" size="sm" onClick={handleDeleteCoverImage}>
                          Supprimer
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Image
                    src={event.image}
                    alt="Preview de l'évènement"
                    fill
                    style={{ objectFit: "contain" }}
                    priority
                  />
                </div>
              )}


              <input
                id="image-upload"
                type="file"
                accept=".jpg,.png,.webp"
                className="hidden"
                onChange={handleCoverImageAdd}
              />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};

export default CreateEventPage;
