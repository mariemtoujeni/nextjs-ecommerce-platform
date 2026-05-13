'use client';
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { Heading } from "~/components/ui/heading";
import { Card } from "~/components/ui";

interface HeadingComponentProps {
  onSubmit: () => void;
  isEditMode?: boolean;
};

export const HeadingComponent: React.FC<HeadingComponentProps> = ({onSubmit, isEditMode}: HeadingComponentProps) => {
  const router = useRouter();

  return (
<div className="flex items-center gap-4 mb-4">
  <div className="flex flex-row gap-3 items-center h-[26px]">              
      <Card className="flex justify-center p-2 items-center bg-gray-100 cursor-pointer" onClick={() => router.push("/customers")}>                        
        <ArrowLeft size={16}/>
      </Card>                    
    <Heading key='page-title' heading={"2"} className="text-gray-700 mt-3">{isEditMode ? 'Modifier les données client' : 'Nouveau(-elle) client(e)'}</Heading>
  </div>

  <div className="ml-auto flex gap-4">
    <Button variant="outline" size="lg" onClick={() => router.push("/customers")}>
      Annuler
    </Button>
    <Button variant="default" size="lg" onClick={onSubmit}>
      Enregistrer
    </Button>
  </div>
</div>

  );
};
