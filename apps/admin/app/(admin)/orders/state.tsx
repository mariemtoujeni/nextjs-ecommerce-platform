import { OrderStatus } from "@repo/core/models";
import { Badge } from "~/components/ui";

export const OrderStateBadges: Record<OrderStatus, React.ReactNode> = {
    [OrderStatus.ATTENTE_ACCEPTATION_DEVIS]: <Badge variant="gray">Devis en attente</Badge>,
    [OrderStatus.ATTENTE_PAIMENT]: <Badge variant="gray">Attente paiement</Badge>,
    [OrderStatus.PAIMENT_ACCEPTE]: <Badge variant="blue">Paiement accepté</Badge>,
    [OrderStatus.PREPARATION]: <Badge variant="purple">En préparation</Badge>,
    [OrderStatus.EXPEDIEE_PARTIELLEMENT]: <Badge variant="orange">Expédiée partiellement</Badge>,
    [OrderStatus.EXPEDIEE]: <Badge variant="green">Expédiée</Badge>,
    [OrderStatus.AUTRE_1]: <Badge variant="red">Autre 1</Badge>,
    [OrderStatus.AUTRE_2]: <Badge variant="red">Autre 2</Badge>,
    [OrderStatus.DEVIS_ARCHIVE]: <Badge variant="gray">Devis archivé</Badge>,
}