import { UserRoles } from "../../../src/models"
import { SharedMemory } from "../../../src/adapters/mock/SharedMemory"
// attributs

export const setup = () => {
    SharedMemory.users = [
        { id: "1", email: "admin@admin.com", user_role: UserRoles.SUPER_ADMIN, first_name: "Admin", last_name: "Admin", password: "admin", is_anonymous: false },
    ];
    
    SharedMemory.attributs = [
        {
            id: 1,
            nom: 'Couleur',
            legende: 'Couleur du produit',
        },
        {
            id: 2,
            nom: 'Taille',
            legende: 'Taille du produit',
        },
        {
            id: 3,
            nom: 'Matière',
            legende: 'Matière du produit',
        },
    ]

    SharedMemory.attribut_valeurs = [
        {
            id: 1,
            id_attribut: 1,
            nom: 'Rouge',
        },
        {
            id: 2,
            id_attribut: 1,
            nom: 'Bleu',
        },
        {
            id: 3,
            id_attribut: 2,
            nom: 'M',
        },
        {
            id: 4,
            id_attribut: 2,
            nom: 'L',
        },
        {
            id: 5,
            id_attribut: 3,
            nom: 'Plastique',
        }
    ]

    SharedMemory.filtres = [
        {
            id: 1,            
            nom: 'Rouge',
            id_attribut: 1,
            couleur: '#FF0000'
        },
        {
            id: 2,
            nom: 'Bleu',
            id_attribut: 1,
            couleur: '#0000FF'
        },
        {
            id: 3,
            nom: 'M',
            id_attribut: 2,
            couleur: 'M'
        },
        {
            id: 4,
            nom: 'L',
            id_attribut: 2,
            couleur: 'L'
        },
        {
            id: 5,
            nom: 'Plastique',
            id_attribut: 3,
            couleur: 'Plastique'
        }
    ]

    SharedMemory.filtres_attributs = [
        {
            id_filtre: 1,
            id_attribut: 1,
        },
        {
            id_filtre: 1,
            id_attribut: 2,
        },
        {
            id_filtre: 2,
            id_attribut: 3,
        }
    ]
}

export const teardown = () => {
    SharedMemory.clear()
}
