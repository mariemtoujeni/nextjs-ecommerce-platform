import {
  Heading,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Map,
} from "~/components/ui";
import { LangParams } from "~/app/utils";
import { dictionary, getDictionary } from "~/app/dictionaries";
import {
  MapPin,
  Mail,
  Phone,
  Clock,
  Users,
  Award,
  Zap,
  Heart,
  Trophy,
} from "lucide-react";
import Image from "next/image";

// Fonction utilitaire pour formater le contenu avec des paragraphes
const formatContent = (content: string) => {
  return content.split("\n\n").map((paragraph, index) => (
    <p key={index} className="mb-4 last:mb-0">
      {paragraph}
    </p>
  ));
};

export async function generateMetadata({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { about } = dict;

  return {
    title: about.title,
    description: about.hero.subtitle,
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<LangParams>;
}) {
  const { lang } = await params;
  const dict = await getDictionary(lang);
  const { about } = dict;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-lime to-green-200 py-16">
        <div className="container mx-auto px-4 text-center">
          <Heading heading="1" className="text-black mb-4 font-bebas">
            {about.hero.title}
          </Heading>
          <p className="text-xl text-black/80 max-w-2xl mx-auto">
            {about.hero.subtitle}
          </p>
        </div>
      </div>

      {/* Notre Histoire */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Heading heading="3" className="text-black mb-6">
              {about.story.title}
            </Heading>
            <div className="text-black/80 text-lg leading-relaxed">
              {formatContent(about.story.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Nos Valeurs */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Heading heading="3" className="text-black mb-6">
              {about.values.title}
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {/* Qualité */}
            <Card className="text-center border border-black shadow-md bg-white hover:shadow-lg transition-shadow duration-300 rounded-none">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-lime rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-black text-xl">
                  {about.values.quality.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70">
                  {about.values.quality.description}
                </p>
              </CardContent>
            </Card>

            {/* Service Client */}
            <Card className="text-center border border-black shadow-md bg-white hover:shadow-lg transition-shadow duration-300 rounded-none">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-lime rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-black text-xl">
                  {about.values.service.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70">
                  {about.values.service.description}
                </p>
              </CardContent>
            </Card>

            {/* Innovation */}
            <Card className="text-center border border-black shadow-md bg-white hover:shadow-lg transition-shadow duration-300 rounded-none">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-lime rounded-full flex items-center justify-center mb-4">
                  <Zap className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-black text-xl">
                  {about.values.innovation.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70">
                  {about.values.innovation.description}
                </p>
              </CardContent>
            </Card>

            {/* Passion */}
            <Card className="text-center border border-black shadow-md bg-white hover:shadow-lg transition-shadow duration-300 rounded-none">
              <CardHeader className="pb-4">
                <div className="mx-auto w-16 h-16 bg-lime rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-black" />
                </div>
                <CardTitle className="text-black text-xl">
                  {about.values.passion.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70">
                  {about.values.passion.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* L'Équipe */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Heading heading="3" className="text-black mb-6">
              {about.team.title}
            </Heading>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Nicolas */}
            <Card className="border border-black shadow-md bg-gradient-to-br from-lime to-green-200 hover:shadow-lg transition-shadow duration-300 rounded-none">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                  <Image
                    src="/images/about/nicolas.png"
                    alt="Nicolas - Fondateur de Nataquashop"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-black text-2xl">
                  {about.team.nicolas.name}
                </CardTitle>
                <p className="text-black/80 text-lg font-medium">
                  {about.team.nicolas.role}
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-black/80 text-lg leading-relaxed">
                  {about.team.nicolas.description}
                </p>
              </CardContent>
            </Card>

            {/* Caroline */}
            <Card className="border border-black shadow-md bg-gradient-to-br from-lime to-green-200 hover:shadow-lg transition-shadow duration-300 rounded-none">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg overflow-hidden">
                  <Image
                    src="/images/about/caroline.png"
                    alt="Caroline - Fondatrice de Nataquashop"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-black text-2xl">
                  {about.team.caroline.name}
                </CardTitle>
                <p className="text-black/80 text-lg font-medium">
                  {about.team.caroline.role}
                </p>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-black/80 text-lg leading-relaxed">
                  {about.team.caroline.description}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <Heading heading="3" className="text-black mb-6">
              {about.contact.title}
            </Heading>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Informations de contact */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-lime rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-black font-semibold text-lg mb-1">
                    Adresse
                  </h3>
                  <p className="text-black/70">{about.contact.address}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-lime rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-black font-semibold text-lg mb-1">
                    Email
                  </h3>
                  <p className="text-black/70">{about.contact.email}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-lime rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-black font-semibold text-lg mb-1">
                    Téléphone
                  </h3>
                  <p className="text-black/70">{about.contact.phone}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-lime rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="text-black font-semibold text-lg mb-1">
                    Horaires
                  </h3>
                  <p className="text-black/70">{about.contact.hours}</p>
                </div>
              </div>
            </div>

            {/* Carte dynamique OpenStreetMap */}
            <div className="bg-white rounded-none shadow-md border border-black p-0">
              <div className="h-full w-full">
                <Map
                  address={about.contact.address}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
