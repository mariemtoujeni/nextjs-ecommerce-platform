import { ReturnAll } from '../types';
import { Admin, NewAdmin, SignUpRequest } from '../models';

export interface IAccessSettingRepository {
    readAll(): Promise<ReturnAll<Admin>>;
    readByValidInvitationCode(validInvitationCode: string): Promise<Admin>;
    update(request: Admin): Promise<Admin>;
    delete(id: string, email: string): Promise<void>;
    create(request: NewAdmin, userToCreate: SignUpRequest, resetPasswordCode: string): Promise<Admin>;
    updatePassword(userId: string, password: string): Promise<Admin>;
}