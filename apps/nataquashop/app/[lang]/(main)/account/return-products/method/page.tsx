import { Button, Heading, RadioGroup, RadioGroupItem } from "~/components/ui";
import BackButton from "./BackButton";

export default function MethodPage() {
  return (
    <>
      <BackButton />
      <Heading heading="5">EFFECTUER UN RETOUR</Heading>
      <div>
        <p className="text-gray mt-2">
          Sélectionnez le mode de retour souhaité pour vos produits.{" "}
        </p>
        <RadioGroup >
          <div className="flex items-center space-x-2 cursor-pointer gap-2 mt-2 bg-graylight h-[80px] px-4 ">
          
            <RadioGroupItem id="magasin" value="retrait-magasin" />
             <div className="flex flex-col">
            <Heading  heading="6">
              RETOUR PAR VOS SOINS
            </Heading>
            <p> Vous renvoyez le colis vous même et prenez en charge les couts de retour. Vous avez 14 jours pour renvoyer le colis</p>
            </div>
        
          </div>
          <div className="flex items-center space-x-2 cursor-pointer gap-2 mt-2 bg-graylight h-[80px] px-4 ">
            <RadioGroupItem id="point-relais" value="retrait-point-relais" />
            <div className="flex flex-col">
            <Heading  heading="6">
              POINT DE DÉPÔT
            </Heading>
            <span className="">Vous avez 14 jours pour remettre vos produits à n'importe quel point de ce réseau</span>
            <div className="">
              <RadioGroup >
                <RadioGroupItem id="magasin" value="retrait-magasin" />

              </RadioGroup>


            </div>
            </div>
          </div>
        </RadioGroup>
      </div>
    </>
  );
}
