'use client'

import { useState, useEffect } from "react";
import { Admin, UpdateAdminRequest } from "@repo/core/models";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "~/components/ui/table";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, Card, Heading, CardHeader, CardContent, Button } from "~/components/ui";
import { useToast } from "~/hooks/use-toast";
import { format } from "date-fns"; // Import the format function from date-fns

import { Trash, X } from "lucide-react";
import { listUsersAccessAction, updateAdminRoleAction, deleteAdminAction } from "@repo/actions/access-manager";
import { ReturnAll } from "@repo/core/types";
import { Spinner } from "~/components/Spinner";

export interface AdminListProps {
    id: string;
}

export const AdminList: React.FunctionComponent<AdminListProps> = ({ id }) => {
    const { toast } = useToast();    
    const [formattedDates, setFormattedDates] = useState<{ [key: string]: string }>({});
    const [admins, setAdmins] = useState<ReturnAll<Admin>>({ total: 0, items: [], count: 0 });
    const [loading, setLoading] = useState(true);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await listUsersAccessAction();
            setAdmins(data);
        } catch (error) {
            toast({
                title: 'Erreur',
                description: "Une erreur s'est produite lors du chargement des administrateurs : " + (error as Error).message,
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, [id]);

    useEffect(() => {
        const dates: { [key: string]: string } = {};
        admins.items.forEach(admin => {
            dates[admin.id] = format(new Date(admin.created_at), "dd/MM/yyyy HH:mm");
        });
        setFormattedDates(dates);
    }, [admins]);


    return <Card className="flex flex-col gap-2 mt-8">
        <CardHeader>
            <Heading key='sub-page-title' heading={"3"} className="text-gray-700 font-semibold">Collaborateurs</Heading>
        </CardHeader>
        <CardContent>
            {
            loading ? (
                <div className="flex justify-center items-center">
                    <div className="flex flex-col items-center gap-2">
                        <Spinner variant="circle" size={32} />
                        <p className="text-sm text-gray-500">Chargement des administrateurs...</p>
                    </div>
                </div>
            ) : (
                <div className="container mx-auto">
                    <div className="border border-neutral-200 rounded-lg">
                        <Table>
                            <TableHeader className="bg-neutral-100">
                                <TableRow>
                                    <TableHead className="w-3/5">Collaborateurs</TableHead>
                                    <TableHead className="w-1/10">Créé le</TableHead>
                                    <TableHead className="w-1/10">Rôle</TableHead>
                                    <TableHead></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                            {
                                admins.items.map((admin, index) => (
                                    <TableRow key={index}>
                                        <TableCell className="w-3/5">
                                            <div className="flex flex-row gap-2 items-center">
                                                <div className="bg-blue-600 rounded-lg flex justify-center items-center text-white font-semibold p-3">
                                                {admin.prenom && admin.prenom.length > 0 ? admin.prenom.charAt(0).toUpperCase() : ''}{admin.nom && admin.nom.length > 0 ? admin.nom.charAt(0).toUpperCase() : ''}
                                                </div>
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-semibold">{admin.prenom} {admin.nom}</div>
                                                    <div className="text-xs text-neutral-500">{admin.email}</div>
                                                </div>                                
                                            </div>
                                        </TableCell>
                                        <TableCell className="w-1/10">
                                            {formattedDates[admin.id] || ''}
                                        </TableCell>
                                        <TableCell className="w-1/10">
                                            <Select 
                                                value={admin.role} 
                                                onValueChange={
                                                    async (value) => {
                                                        try {
                                                            const adminUpdate : UpdateAdminRequest = {
                                                                ...admin,
                                                                role: value === 'admin.super' ? 'admin.super' : 'admin.editor'   
                                                            }
                                                            await updateAdminRoleAction(adminUpdate);
                                                            // update the state
                                                            fetchAdmins()

                                                            toast({
                                                                title: 'Succès',
                                                                description: "Le rôle de l'administrateur a été mis à jour"
                                                            })
                                                        } catch (error) {
                                                            toast({
                                                                title: 'Erreur',
                                                                description: "Une erreur s'est produite lors de la mise à jour du rôle de l'administrateur"
                                                            })
                                                        }
                                                    }
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Rôle utilisateur" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="admin.super">Administrateur</SelectItem>
                                                    <SelectItem value="admin.editor">Collaborateur</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex justify-end">
                                                <Button variant="outline" size="icon" className="hover:bg-red-100  rounded-lg" onClick={
                                                        async () =>{ 
                                                            try {
                                                                await deleteAdminAction(admin.id, admin.email);
                                                                // update the state
                                                                fetchAdmins();

                                                                toast({
                                                                    title: 'Succès',
                                                                    description: "L'administrateur a été supprimé"
                                                                })
                                                            } catch (error) {
                                                                toast({
                                                                    title: 'Erreur',
                                                                    description: "Une erreur s'est produite lors de la suppression de l'administrateur",
                                                                    variant: "destructive"
                                                                })
                                                            }
                                                        }
                                                    }>
                                                        <Trash className="text-red-500" size={20} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }                
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </CardContent>
    </Card>
}
