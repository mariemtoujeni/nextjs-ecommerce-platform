import { Button, Checkbox, Heading, Input, Label, RadioGroup, RadioGroupItem, Switch } from "~/components/ui";
import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Progress } from "~/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { redirect } from "next/navigation";
import { BarcodeReader } from "~/components/BarcodeReader";
import { TableFilter } from "~/components/TableFilter";
import { TableFilterDesignSystem } from "./tablefilter";
import { WYSIWYG } from "~/components/wysiwyg";


const buttonVariants = ["default","secondary","outline", "destructive","ghost" , "link"];
const buttonSizes = ["sm","default", "lg", "icon"];
const headings = ["1", "2", "3", "4", "5", "6"];
const colors = [ 
    ["bg-primary", "bg-secondary", "bg-destructive"],
    ["bg-blue-50", "bg-blue-100", "bg-blue-600"],
    ["bg-green-200", "bg-green-600"],
    ["bg-lime-400", "bg-lime-500"],
    ["bg-orange-200", "bg-orange-600"],
    ["bg-red-100", "bg-red-600", "bg-red-700","bg-red-900"],
    ["bg-neutral-100", "bg-neutral-200", "bg-neutral-300", "bg-neutral-500"]    
];

const badges = ["blue", "green", "red", "orange", "gray"];
const badgeSizes = ["sm", "md", "lg"];

export default function DesignSystem() {

    if(process.env.NODE_ENV !== "development") {
        redirect("/");
    }

    return <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-2">
            <div>
                <div>
                    <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">Typography</p>
                    {headings.map((heading) => (
                        <Heading key={heading} heading={heading as any}>
                            h{heading} Heading
                        </Heading>
                    ))}
                    <p>Default paragraph</p>
                </div>
                <div>
                    <p className="text-3xl border-b-2 mb-2 mt-2 border-purple-500 font-bold text-purple-500">Colors</p>
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
            </div>
            <div className="col-span-2">
                <div>
                    <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">Buttons</p>
                    <div >
                        {buttonVariants.map((variant) => (<div key={variant} className="grid grid-cols-4 gap-2">
                            {
                            buttonSizes.map((size) => (
                            <div key={`${variant}-${size}`}>
                                <p className="text-sm text-gray-500">{variant} {size}</p>
                                <Button variant={variant as any} size={size as any}>
                                    {'icon' == size ? <Users /> : 'Button'}
                                </Button>
                            </div>
                        ))
                        }
                        </div>
                        ))}
                    </div>
                </div>
                <div>
                    <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">Badges</p>
                    <div>
                        {badges.map((badge) => (
                            <div key={badge} className="grid grid-cols-4 gap-2">
                                    {badgeSizes.map((size) => ( 
                                        <div key={`${badge}-${size}`}>
                                            <p className="text-sm text-gray-500">{badge} {size}</p>
                                            <Badge key={`${badge}-${size}`} variant={badge as any} size={size as any}>{badge}</Badge>
                                        </div>
                                    ))}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">Misc</p>
                    <BarcodeReader tooltip icon />
                    <div>
                        <TableFilterDesignSystem />
                    </div>
                    <div>
                        <WYSIWYG content={'dada'} previewMode={false} />
                    </div>
                </div>
            </div>
            <div>
                <div>
                    <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">Form</p>
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
                                    <Label htmlFor="checkbox">Accept terms and conditions</Label>
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
                    <p className="text-3xl border-b-2 mb-2 border-purple-500 font-bold text-purple-500">Cards</p>
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
            </div>
        </div>
    </div>
  
}
