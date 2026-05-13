import { SharedMemory } from "../../../src/adapters/mock/SharedMemory"

export const setup = () => {
    SharedMemory.users = [
        {
            email: 'admin@test.com',
            password: 'password',
            id: '1',
            last_name: 'Admin',
            first_name: 'User',
            is_anonymous: false,
            user_role: 'admin',
        },
        {
            email: 'user@test.com',
            password: 'password',
            id: '2',
            last_name: 'User',
            first_name: 'User',
            is_anonymous: false,
            user_role: '',
        }
    ];
    SharedMemory.clients = [];
    SharedMemory.addresses = [];
}

export const teardown = () => {
    SharedMemory.clear();
}