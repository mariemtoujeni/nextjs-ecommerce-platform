import { SharedMemory } from "../../../src/adapters/mock/SharedMemory";

export const setup = () => {
    SharedMemory.accessSettings = [
        {
            id: "1",
            prenom: 'Ahmed',
            nom: 'BEN SALAH',
            email: 'ahmed@squaad.io',
            created_at: new Date().toISOString(),
            role: 'admin.super'
        },
        {
            id: "2",
            prenom: 'Sylvin',
            nom: 'Moreau',
            email: 'sylvain@squaad.io',
            created_at: new Date().toISOString(),
            role: 'admin.editor'
        }
    ];
}

export const teardown = () => {
    SharedMemory.clear();
}