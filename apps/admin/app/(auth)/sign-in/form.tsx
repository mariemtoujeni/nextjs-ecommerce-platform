'use client'

import { Button, Input } from "~/components/ui";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Message, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInAction } from "@repo/actions/auth";
import { SignInRequest, signInSchema } from "@repo/core/models";
import { useToast } from "~/hooks/use-toast";
import { useRouter } from "next/navigation";

export const SignInForm = (props: { message?: string  }) => {
    const { toast } = useToast();
    const router = useRouter();
    const form = useForm<SignInRequest>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
          email: '',
          password: ''
        }
    })
    
    const onSubmit = async (data: SignInRequest) => {
        const res = await signInAction(data);
        if (res.success) {
            router.push("/dashboard");
        } else {
            toast({
                title: "Erreur",
                description: "Email ou mot de passe incorrect",
                variant: "destructive"
            });
        }
    }


    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="leon.marchand@nataquashop.com" />
                    </FormControl>
                  </FormItem>
                )}
              />
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
              {props.message && <div className="my-3 text-red-500 text-sm">{props.message}</div>}
              <FormItem className="mt-4">
                
                <Button type="submit" className="w-full" size="lg">Connexion</Button>
              </FormItem>
            </form>
          </Form>
    )
}