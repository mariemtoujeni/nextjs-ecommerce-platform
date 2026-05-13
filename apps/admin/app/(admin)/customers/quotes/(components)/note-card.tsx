'use client';

import { Card, CardHeader, CardContent } from "~/components/ui";
import { Textarea } from "~/components/ui/textarea";

interface NoteCardProps {
  note: string;
  onNoteChange: (note: string) => void;
  isEditable: boolean;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onNoteChange, isEditable }) => {
  return (
    <Card>
      <CardHeader className="text-gray-700 font-bold">Notes</CardHeader>
      <CardContent className="space-y-4">
        <Textarea 
          placeholder="Ajouter un commentaire..." 
          className="bg-muted focus:bg-white"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          disabled={!isEditable}
        />
      </CardContent>
    </Card>
  );
};