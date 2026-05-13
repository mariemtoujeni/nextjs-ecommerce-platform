import React from "react";
import Image from "next/image";
import { Calendar } from "lucide-react";
import { Event } from "@repo/core/models";
import { dictionary } from "~/app/dictionaries";
import { Button } from "./ui";

type EventCardProps = React.HTMLAttributes<HTMLDivElement> & {
  event: Event;
  dict: dictionary;  
};
function getPlainTextFromLexical(jsonString: string) {
  try {
    const data = JSON.parse(jsonString);   
    const extractText = (node: any): string => {
      if (node.text) return node.text;
      if (node.children) return node.children.map(extractText).join(" ");
      return "";
    };
    return extractText(data.root) || "";
  } catch (e) {
    return "";
  }
}


export function EventCard({
  className,
  event,
  dict,
 
  ...props
}: EventCardProps) {
  return (
    <div className="border max-w-sm ">
       <div className="aspect-[16/9] w-full overflow-hidden ">
  <img
    src={event.image}
    alt={event.name}    
    className="w-full h-full object-cover"
  />
</div>
      <div className="p-3">
        <h3 className="text-lg font-bold mb-2">{event.name}</h3>
        <p className="text-gray-700 text-sm">{getPlainTextFromLexical(event.description)}</p>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <Calendar className="mr-1" size={16} />
          <span>{new Date(event.startDate).toLocaleDateString()} {dict.home.events.at} {new Date(event.endDate).toLocaleDateString()}</span>
         {/* <Button
          variant="default"
          size="default"          
          className="ml-auto text-sm sm:text-base"
         onClick={() => window.location.href = event.url}
        >
          Y aller -{">"}
        </Button>
        */}
        </div>      
        
      </div>
    </div>
  );
}
