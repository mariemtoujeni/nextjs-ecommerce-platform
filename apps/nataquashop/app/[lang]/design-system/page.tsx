import {
  Button,
  Checkbox,
  Heading,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Switch,
} from "~/components/ui";
import {
  Users,
  ShoppingCart,
  Heart,
  ArrowRight,
  User,
  CreditCard,
  Settings,
  Calculator,
  Smile,
  Calendar,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ProductCard } from "~/components/product-card";
import { Badge } from "~/components/ui/badge";
import { redirect } from "next/navigation";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "~/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { SearchBox } from "~/components/search-box";
import { LangParams } from "~/app/utils";
import { ProductStatus } from "@repo/core/models";
import { dictionary, getDictionary } from "~/app/dictionaries";

const buttonVariants = [
  "default",
  "secondary",
  "outline",
  "destructive",
  "ghost",
  "link",
];
const buttonSizes = ["sm", "default", "lg", "icon"];
const buttonIcons = [true, false];
const headings = ["1", "2", "3", "4", "5", "6"];
const colors = [
  ["bg-primary", "bg-secondary", "bg-destructive", "bg-black"],
  ["bg-lime", "bg-green-200", "bg-green-600"],
  ["bg-red-100", "bg-red-600", "bg-red-700", "bg-red-900"],
  ["bg-neutral-100", "bg-neutral-200", "bg-neutral-300", "bg-neutral-500"],
];

const badges = ["blue", "green", "red", "orange", "gray"];
const badgeSizes = ["sm", "md", "lg"];


export default async function DesignSystem(props: { params: Promise<LangParams> }) {
  const params = await props.params;

  const translations: dictionary = await getDictionary("fr");

  if (process.env.NODE_ENV !== "development") {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2">
          <div>
            <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
              Typography
            </p>
            {headings.map((heading) => (
              <Heading key={heading} heading={heading as any}>
                h{heading} Heading
              </Heading>
            ))}
            <p>Default paragraph</p>
          </div>
          <div>
            <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
              Buttons
            </p>
            <div>
              {buttonVariants.map((variant) => (
                <div key={variant}>
                  <p className="text-lg mt-3 mb-1 font-medium text-purple-400">
                    {variant}
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {buttonSizes.map((size) =>
                      buttonIcons.map((hasIcon) => (
                        <div key={`${variant}-${size}-${hasIcon}`}>
                          <p className="text-sm text-gray-500">
                            {variant} {size} {hasIcon ? "icon" : ""}
                          </p>
                          {hasIcon ? (
                            <Button
                              variant={variant as any}
                              size={size as any}
                              hasIcon={true}
                              icon={size === "icon" ? Users : ShoppingCart}
                            >
                              {size === "icon" ? "" : "Button"}
                            </Button>
                          ) : (
                            <Button variant={variant as any} size={size as any}>
                              {size === "icon" ? <Users /> : "Button"}
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-span-1">
          <div>
            <p className="text-3xl border-b-2 mb-2 mt-2 border-purple-500 font-bold text-purple-500">
              Colors
            </p>
            <div>
              {colors.map((colors2) => (
                <div key={colors2[0]} className="grid grid-cols-3 gap-2">
                  {colors2.map((color) => (
                    <div key={color}>
                      <p className={`text-sm `}>{color.replace("text-", "")}</p>
                      <div className={`w-10 h-10 ${color} rounded-sm`}></div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
              Badges
            </p>
            <div>
              {badges.map((badge) => (
                <div key={badge} className="grid grid-cols-4 gap-2">
                  {badgeSizes.map((size) => (
                    <div key={`${badge}-${size}`}>
                      <p className="text-sm text-gray-500">
                        {badge} {size}
                      </p>
                      <Badge
                        key={`${badge}-${size}`}
                        variant={badge as any}
                        size={size as any}
                      >
                        {badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
              Form
            </p>
            <div className="flex flex-col gap-2">
              <div>
                <span className="text-gray-500">Input</span>
                <Input placeholder="Placeholder text" />
              </div>
              <div>
                <span className="text-gray-500">Select</span>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Placeholder text" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <span className="text-gray-500">Checkbox</span>
                <div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="checkbox" />
                    <Label htmlFor="checkbox">
                      Accept terms and conditions
                    </Label>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Switch</span>
                <div className="flex items-center gap-2">
                  <Switch id="switch" />
                  <Label htmlFor="switch">Accept terms and conditions</Label>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Radio Group</span>
                <div>
                  <RadioGroup defaultValue="option-one">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-one" id="option-one" />
                      <Label htmlFor="option-one">Option One</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option-two" id="option-two" />
                      <Label htmlFor="option-two">Option Two</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              <div>
                <span className="text-gray-500">Progress Bar</span>
                <Progress value={30} total={100} />
              </div>
            </div>
          </div>
          <div>
            <div>
              <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
                Cards
              </p>
              <div className="">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                  </CardHeader>
                  <CardContent className="">
                    <p>Card Content</p>
                  </CardContent>
                  <CardFooter>
                    <Button>Card Footer</Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            <div>
              <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
                PopOver
              </p>
              <div className="">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">Open popover</Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <h4 className="font-medium leading-none">Dimensions</h4>
                        <p className="text-sm text-muted-foreground">
                          Set the dimensions for the layer.
                        </p>
                      </div>
                      <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="width">Width</Label>
                          <Input
                            id="width"
                            defaultValue="100%"
                            className="col-span-2 h-8"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="maxWidth">Max. width</Label>
                          <Input
                            id="maxWidth"
                            defaultValue="300px"
                            className="col-span-2 h-8"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="height">Height</Label>
                          <Input
                            id="height"
                            defaultValue="25px"
                            className="col-span-2 h-8"
                          />
                        </div>
                        <div className="grid grid-cols-3 items-center gap-4">
                          <Label htmlFor="maxHeight">Max. height</Label>
                          <Input
                            id="maxHeight"
                            defaultValue="none"
                            className="col-span-2 h-8"
                          />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
            Product Card
          </p>
          <div className="">
            <ProductCard
              product={{
                id: 1,
                categoryId: 1,
                category: {
                  id: 1,
                  name: "Category 1",
                  order: 1,
                  active: 1
                },
                subCategoryId: 1,
                images: [
                  {
                    url: "https://placehold.co/600x600?text=Image+1",
                    productId: 1,
                    attributeValueId: 1 
                  },
                  {
                    url: "https://placehold.co/600x600?text=Image+2",
                    productId: 1,
                    attributeValueId: 1 
                  }
                ],
                descriptions: [{
                  lang: "fr",
                  description: "Card Description",
                  title: "Card Title"
                }],
                price: 100,
                //oldPrice: 150,
                status: ProductStatus.PUBLISHED,
                subCategory: {
                  id: 1,
                  name: "Sub Category 1",
                  order: 1,
                  active: 1
                },
                brandId: 1,
                brand: {
                  id: 1,
                  name: "Brand 1"
                },
                isPackage: true,
                vatRate: 0,
                isGiftCard: false,
                giftCardDuration: 0,
                customization: false,
                minStock: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                weight: 0,
              }}
              lang={params.lang}
              translations={translations}
            />
          </div>
        </div>
        <div>
          <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
            Command
          </p>
          <div className="">
            <Command className="border border-black shadow-md">
              <CommandInput placeholder="Type a command or search..." />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem>
                    <Calendar />
                    <span>Calendar</span>
                  </CommandItem>
                  <CommandItem>
                    <Smile />
                    <span>Search Emoji</span>
                  </CommandItem>
                  <CommandItem disabled>
                    <Calculator />
                    <span>Calculator</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem>
                    <User />
                    <span>Profile</span>
                  </CommandItem>
                  <CommandItem>
                    <CreditCard />
                    <span>Billing</span>
                  </CommandItem>
                  <CommandItem>
                    <Settings />
                    <span>Settings</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </div>
        <div>
          <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">
            Search box
          </p>
          <div className="">
            <SearchBox />
          </div>
        </div>
      </div>
    </div>
  );
}
