import { ReturnAll } from "../../types";
import { NotFoundError } from "../../types/error";
import { Admin, NewAdmin, SignUpRequest } from "../../models";
import { IAccessSettingRepository } from "../../repositories";
import { SharedMemory } from "./SharedMemory";

export class MockAccessSettingRepository implements IAccessSettingRepository {
    async readAll(): Promise<ReturnAll<Admin>> {
        const accessSettings = SharedMemory.accessSettings;
        return {
            total: accessSettings.length,
            count: accessSettings.length,
            items: accessSettings
        };
    }

    async readByValidInvitationCode(validInvitationCode: string): Promise<Admin> {
        const accessSetting = SharedMemory.accessSettings.find((accessSetting) => accessSetting.reset_password_code === validInvitationCode);
        if (!accessSetting) {
            throw new NotFoundError("Access setting not found");
        }
        return accessSetting;
    }

    async update(request: Admin): Promise<Admin> {
        SharedMemory.accessSettings = SharedMemory.accessSettings.map((accessSetting) => {
            if (accessSetting.id === request.id) {
                return {...request};
            }
            return accessSetting;
        });
        return request;
    }

    async delete(id: string, email: string): Promise<void> {
        SharedMemory.accessSettings = SharedMemory.accessSettings.filter((accessSetting) => accessSetting.id !== id);
    }

    async create(request: NewAdmin, userToCreate: SignUpRequest): Promise<Admin> {
        throw new Error("Not implemented");
    }

    async updatePassword(userId: string, password: string): Promise<Admin> {
        throw new Error("Not implemented");
    }
}