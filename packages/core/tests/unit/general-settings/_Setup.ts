import { SharedMemory } from "../../../src/adapters/mock/SharedMemory"
import { UserRoles } from "../../../src/models";

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ]

    SharedMemory.config = {
        duree_validite_avoir: 10,
        type_duree_validitee_avoir: 'JOUR',
        duree_validite_cheque_cadeau: 10,
        type_duree_validite_cheque_cadeau: 'MOIS',
        duree_validite_cashback: 10,
        type_duree_validite_cashback: 'MOIS',
        duree_validite_email_relance: 10,
        type_duree_validite_email_relance: 'JOUR',
    };
}

export const teardown = () => {
    SharedMemory.clear();
}