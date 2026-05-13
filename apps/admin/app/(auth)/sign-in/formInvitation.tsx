'use client'

import { Button, Input } from "~/components/ui";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";
import { ValidateInvitationSchema } from "@repo/core/models";
import { ValidateInvitationInput } from "@repo/core/models";
import { validateInvitationAction } from "@repo/actions/auth";

export type InvitationFormProps = {
    code: string;
}

export const InvitationForm = (props: InvitationFormProps) => {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<ValidateInvitationInput>({
        resolver: zodResolver(ValidateInvitationSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
            code: props.code,
        },
    });

    const onSubmit = async (data: ValidateInvitationInput) => {
        const res = await validateInvitationAction(data);
        if (res.success) {
            toast({
                title: "Invitation validée",
                description: "Vous pouvez maintenant vous connecter",
                variant: "default"
            });
            router.push("/dashboard");
        } else {
            toast({
                title: "Erreur",
                description: res.error,
                variant: "destructive"
            });
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Mot de passe</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" placeholder="********" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmation de mot de passe</FormLabel>
                            <FormControl>
                                <Input {...field} type="password" placeholder="********" />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <FormItem className="mt-4">
                    <Button type="submit" className="w-full" size="lg">Valider</Button>
                </FormItem>
            </form>
        </Form>
    )
}