import { StickyNote } from "lucide-react";
import { Card, CardHeader, CardContent, CardTitle, Heading } from "~/components/ui";
import { Textarea } from "~/components/ui/textarea";

export const NoteCard: React.FC = () => {

  return (
    <Card>
      <CardHeader className="font-bold">          
        <CardTitle className="flex items-center gap-2">
          <StickyNote size={24} className="text-blue-500" />
          <Heading heading="3" className="m-0 text-gray-700 font-bold">
            Notes
          </Heading>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <Textarea placeholder="Ajouter un commentaire..." className="bg-muted focus:bg-white"/>
      </CardContent>
    </Card>
  );
};
