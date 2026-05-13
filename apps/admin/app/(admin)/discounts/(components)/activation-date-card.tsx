"use client";
import { Discount } from "@repo/core/models";
import { format, isBefore, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, Input, Label, Button, Popover, PopoverTrigger, PopoverContent, Switch, } from "~/components/ui";
import { Calendar } from "~/components/ui/calendar";
import { Pencil, CalendarIcon, AlertCircle, Check, Clock } from "lucide-react";
import { cn } from "~/lib/utils";
import { updateDiscountAction } from "@repo/actions/discounts";

interface Props {
  discountOrder: Discount;
}

interface ValidationError {
  field: "date_debut" | "date_fin";
  message: string;
}

export const ActivationDateCard: React.FC<Props> = ({ discountOrder }: Props) => {
  const router = useRouter();

  const [dateDebut, setDateDebut] = useState(new Date(discountOrder.date_debut));
  const [dateFin, setDateFin] = useState(discountOrder.date_fin ? new Date(discountOrder.date_fin) : null);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [popovers, setPopovers] = useState({ startDate: false, endDate: false });
  const [endDateEnabled, setEndDateEnabled] = useState(!!discountOrder.date_fin);
  const [touched, setTouched] = useState({ startDate: false, endDate: false });

  const timeRefs = { date_debut: useRef<HTMLInputElement>(null), date_fin: useRef<HTMLInputElement>(null) };

  const getTimeString = (date: Date) =>
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

  const validateDates = useCallback((start: Date, end: Date | null): ValidationError[] => {
    const errs: ValidationError[] = [];
    
    // Removed the validation that prevents selecting past dates for date_debut
    // Only validate that end date is after start date
    if (end && end <= start) {
      errs.push({ field: "date_fin", message: "La date et heure de fin doivent être postérieures à la date et heure de début" });
    }
    return errs;
  }, []);

  const hasChanges = useCallback(() => {
    const origStart = new Date(discountOrder.date_debut).getTime();
    const origEnd = discountOrder.date_fin ? new Date(discountOrder.date_fin).getTime() : null;
    return dateDebut.getTime() !== origStart || (dateFin?.getTime() ?? null) !== origEnd;
  }, [dateDebut, dateFin, discountOrder]);

  useEffect(() => setErrors(validateDates(dateDebut, dateFin)), [dateDebut, dateFin, validateDates]);

  useEffect(() => {
    if (errors.length || !hasChanges() || isUpdating) return;
    if (!touched.startDate && !touched.endDate) return;

    const timer = setTimeout(async () => {
      setIsUpdating(true);
      try {
        await updateDiscountAction({ id: discountOrder.id, date_debut: dateDebut, date_fin: dateFin ?? null });
        router.refresh();
      } catch (err) {
        console.error(err);
      }
      setTouched({ startDate: false, endDate: false });
      setIsUpdating(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [dateDebut, dateFin, errors, touched, router, isUpdating, hasChanges, discountOrder.id]);

  const updateDate = (field: "date_debut" | "date_fin", newDate: Date) => {
    if (field === "date_debut") setDateDebut(newDate);
    else setDateFin(newDate);
    setTouched(prev => ({ ...prev, [field === "date_debut" ? "startDate" : "endDate"]: true }));
  };

  const handleDateChange = (field: "date_debut" | "date_fin") => (date?: Date) => {
    if (!date) return;
    const current = field === "date_debut" ? dateDebut : dateFin;
    if (!current) return;
    const updated = new Date(date);
    updated.setHours(current.getHours(), current.getMinutes(), 0, 0);
    updateDate(field, updated);
    setPopovers(prev => ({ ...prev, [field === "date_debut" ? "startDate" : "endDate"]: false }));
  };

  const handleTimeChange = (field: "date_debut" | "date_fin") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    if (isNaN(hours!) || isNaN(minutes!) || hours! > 23 || minutes! > 59) return;
    const current = field === "date_debut" ? dateDebut : dateFin;
    if (!current) return;
    const updated = new Date(current);
    updated.setHours(hours!, minutes, 0, 0);
    updateDate(field, updated);
  };

  const handleEndDateToggle = (checked: boolean) => {
    setEndDateEnabled(checked);
    if (checked) {
      const newEnd = new Date(dateDebut);
      newEnd.setHours(newEnd.getHours() + 1);
      setDateFin(newEnd);
    } else {
      setDateFin(null);
    }
    setTouched(prev => ({ ...prev, endDate: true }));
  };

  const handleActivateNow = async () => {
    const now = new Date();
    if (dateFin && now >= dateFin) return console.warn("Impossible d'activer : la date de fin est déjà dépassée.");
    
    // Update local state immediately to reflect the change in UI
    setDateDebut(now);
    
    setIsUpdating(true);
    try {
      await updateDiscountAction({ id: discountOrder.id, date_debut: now, date_fin: endDateEnabled ? dateFin : null });
      router.refresh();
    } catch (err) {
      console.error(err);
      // Revert the local state if the update failed
      setDateDebut(new Date(discountOrder.date_debut));
    } finally {
      setIsUpdating(false);
    }
  };

  const DateTimeInput = ({ field, label, date }: { field: "date_debut" | "date_fin"; label: string; date: Date }) => {
    const isStart = field === "date_debut";
    const popKey = isStart ? "startDate" : "endDate";
    const ref = timeRefs[field];

    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700 flex items-center gap-1">{label}<span className="text-red-500">*</span></Label>
        <div className="flex items-start gap-3">
          <div className="flex-1 max-w-[200px]">
            <Popover open={popovers[popKey]} onOpenChange={open => setPopovers(prev => ({ ...prev, [popKey]: open }))}>
            <PopoverTrigger asChild>
              <div className="relative w-full">
                <Input
                  type="text"
                  readOnly
                  placeholder="Sélectionnez une date"
                  className={cn(
                    "bg-neutral-50 p-3 rounded-lg cursor-pointer transition-all hover:bg-neutral-100 focus:ring-2 focus:ring-blue-500 focus:bg-white w-full pr-10",
                    errors.find(e => e.field === field) ? "border-red-300 bg-red-50" : "border-gray-200"
                  )}
                  value={date instanceof Date && !isNaN(date.getTime()) ? format(date, "dd/MM/yyyy", { locale: fr }) : ""}
                  disabled={isUpdating}
                />

                <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>
            </PopoverTrigger>

              <PopoverContent align="start" className="p-0 w-auto">
                <Calendar mode="single" selected={date} onSelect={handleDateChange(field)} initialFocus locale={fr} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex items-center gap-2 max-w-[200px]">
            <div className="relative flex-1 flex items-center">
              <Input
                ref={ref}
                type="time"
                step={60}
                className={cn(
                  "bg-neutral-50 p-2 rounded-lg w-full text-left leading-none transition-all hover:bg-neutral-100 focus:ring-2 focus:ring-blue-500 focus:bg-white",
                  errors.find(e => e.field === field) ? "border-red-300 bg-red-50" : "border-gray-200"
                )}
                value={getTimeString(date)}
                onChange={handleTimeChange(field)}
                disabled={isUpdating}
                style={{ paddingRight: "2.5rem" }}
              />
              <Clock
                size={16}
                className="absolute right-3 text-gray-400 pointer-events-none"
                style={{ top: "50%", transform: "translateY(-50%)" }}
              />
            </div>

            <button
              type="button"
              onClick={() => ref.current?.focus()}
              disabled={isUpdating}
              className="text-gray-500 hover:text-blue-600 transition-colors p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Pencil size={16} />
            </button>
          </div>
        </div>

        {errors.find(e => e.field === field) && touched[isStart ? "startDate" : "endDate"] && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded-md" role="alert">
            <AlertCircle size={16} />
            {errors.find(e => e.field === field)?.message}
          </div>
        )}
      </div>
    );
  };

  const isValid = errors.length === 0;
  const showValidated = isValid && (touched.startDate || touched.endDate) && !isUpdating;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between w-full">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600 shrink-0" />
            <span className="text-lg font-bold text-gray-700">Date d&apos;activation</span>
          </CardTitle>
          {isUpdating && <div className="flex items-center gap-2 text-sm text-gray-500"><div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />Mise à jour...</div>}
          {showValidated && <div className="flex items-center gap-1 text-sm text-green-600"><Check size={16} />Validé</div>}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <DateTimeInput field="date_debut" label="Date de début de réduction" date={dateDebut} />

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Label htmlFor="enableEndDate" className="cursor-pointer select-none text-sm font-medium text-gray-700">Fixer une date de fin ?</Label>
            <Switch id="enableEndDate" checked={endDateEnabled} onCheckedChange={handleEndDateToggle} disabled={isUpdating} />
          </div>
          <p className="text-xs text-gray-500 max-w-xs">{endDateEnabled ? "La réduction se terminera à la date spécifiée" : "La réduction n'aura pas de date de fin"}</p>
        </div>

        {endDateEnabled && dateFin && <div className="animate-in slide-in-from-top-2 duration-300"><DateTimeInput field="date_fin" label="Date de fin de réduction" date={dateFin} /></div>}

        <div className="flex gap-3 pt-4 border-t">
          <Button onClick={handleActivateNow} disabled={isUpdating} className="bg-blue-600 text-white hover:bg-blue-700">Activer maintenant</Button>
        </div>
      </CardContent>
    </Card>
  );
};