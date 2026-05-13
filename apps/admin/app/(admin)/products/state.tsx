import { ProductStatus } from "@repo/core/models";
import { Badge } from "~/components/ui";


export const ProductStateBadges: Record<ProductStatus, React.ReactNode> = {
    [ProductStatus.DRAFT]: <Badge variant="blue">Brouillon</Badge>,
    [ProductStatus.VALIDATED]: <Badge variant="orange">Validé</Badge>,
    [ProductStatus.PUBLISHED]: <Badge variant="green">Publié</Badge>,
    [ProductStatus.DEACTIVATED]: <Badge variant="red">Désactivé</Badge>,
    [ProductStatus.ARCHIVED]: <Badge variant="gray">Archivé</Badge>,
}