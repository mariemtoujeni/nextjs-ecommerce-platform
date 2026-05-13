'use client';
import { Client, OrderStatus, QuotationStatus } from "@repo/core/models";
import { format } from "date-fns";
import { FileText, Package } from "lucide-react";
import { useState } from "react";
import { Card, CardHeader, CardContent, Select, SelectContent, SelectItem, SelectScrollDownButton, SelectScrollUpButton, SelectTrigger, SelectValue, CardTitle, Heading } from "~/components/ui";
import { Badge } from "~/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "~/components/ui/table";

interface PrimaryCardProps {
  client: Client;
}

const ITEMS_PER_PAGE = 5;

export const PrimaryCard: React.FC<PrimaryCardProps> = ({ client }: PrimaryCardProps) => {
  const [quotationPage, setQuotationPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);

  const getQuotationStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case QuotationStatus.EN_ATTENTE:
        return <Badge variant="gray" size="sm">En attente</Badge>;
      case QuotationStatus.VALIDE:
        return <Badge variant="green" size="sm">Validé</Badge>;
      case QuotationStatus.ARCHIVE:
        return <Badge variant="red" size="sm">Archivé</Badge>;
      default:
        return <Badge variant="orange" size="sm">Inconnu</Badge>;
    }
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.ATTENTE_ACCEPTATION_DEVIS:
        return <Badge variant="orange" size="sm">Attente acceptation</Badge>;
      case OrderStatus.ATTENTE_PAIMENT:
        return <Badge variant="orange" size="sm">Attente paiement</Badge>;
      case OrderStatus.PAIMENT_ACCEPTE:
        return <Badge variant="blue" size="sm">Paiement accepté</Badge>;
      case OrderStatus.PREPARATION:
        return <Badge variant="blue" size="sm">Préparation</Badge>;
      case OrderStatus.EXPEDIEE_PARTIELLEMENT:
        return <Badge variant="blue" size="sm">Expédiée partiellement</Badge>;
      case OrderStatus.EXPEDIEE:
        return <Badge variant="green" size="sm">Expédiée</Badge>;
      case OrderStatus.AUTRE_1:
      case OrderStatus.AUTRE_2:
        return <Badge variant="gray" size="sm">Autre</Badge>;
      case OrderStatus.DEVIS_ARCHIVE:
        return <Badge variant="gray" size="sm">Devis archivé</Badge>;
      default:
        return <Badge variant="orange" size="sm">Inconnu</Badge>;
    }
  };

  const quotationTotalPages = Math.ceil((client.quotation?.length ?? 0) / ITEMS_PER_PAGE);
  const orderTotalPages = Math.ceil((client.order?.length ?? 0) / ITEMS_PER_PAGE);

  const paginatedQuotations = client.quotation?.slice(
    (quotationPage - 1) * ITEMS_PER_PAGE,
    quotationPage * ITEMS_PER_PAGE
  ) ?? [];

  const paginatedOrders = client.order?.slice(
    (orderPage - 1) * ITEMS_PER_PAGE,
    orderPage * ITEMS_PER_PAGE
  ) ?? [];

  return (
    <Card>
      {/* Quotations */}
      <CardHeader className="font-bold">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText size={24} className="text-blue-500" />
            <Heading heading="3" className="m-0 text-gray-700 font-bold">
              Devis
            </Heading>
          </CardTitle>

          {quotationTotalPages > 1 && (
            <Select value={quotationPage.toString()} onValueChange={(val) => setQuotationPage(Number(val))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectScrollUpButton />
                {Array.from({ length: quotationTotalPages }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
                <SelectScrollDownButton />
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg">
          <Table>
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead className="w-1/4">Référence</TableHead>
                <TableHead className="w-1/4">Date</TableHead>
                <TableHead className="w-1/4">Statut</TableHead>
                <TableHead className="w-1/4 text-right pr-4">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuotations.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>{q.id}</TableCell>
                  <TableCell>{format(new Date(q.createdAt), "MM/dd/yyyy")}</TableCell>
                  <TableCell>{getQuotationStatusBadge(q.status)}</TableCell>
                  <TableCell className="text-right pr-4">{q.totalAmount} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Orders */}
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package size={24} className="text-blue-500" />
            <Heading heading="3" className="m-0 text-gray-700 font-bold">
              Commandes
            </Heading>
          </CardTitle>


          {orderTotalPages > 1 && (
            <Select value={orderPage.toString()} onValueChange={(val) => setOrderPage(Number(val))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectScrollUpButton />
                {Array.from({ length: orderTotalPages }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {i + 1}
                  </SelectItem>
                ))}
                <SelectScrollDownButton />
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg">      
          <Table>
            <TableHeader className="bg-neutral-100">
              <TableRow>
                <TableHead className="w-1/4">Référence</TableHead>
                <TableHead className="w-1/4">Date</TableHead>
                <TableHead className="w-1/4">Statut</TableHead>
                <TableHead className="w-1/4 text-right pr-4">Montant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{format(new Date(order.createdAt), "MM/dd/yyyy")}</TableCell>
                  <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right pr-4">{order.amount} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
