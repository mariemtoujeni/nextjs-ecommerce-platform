import { Settings } from "../../models";
import { IGeneralConfigurationsRepository } from "../../repositories";
import { SharedMemory } from "./SharedMemory";

export class MockGeneralConfigurationsRepository implements IGeneralConfigurationsRepository {
    async read(): Promise<Settings> {
        const generalConf = SharedMemory.config;
        return generalConf;
    }

    async update(request: Settings): Promise<Settings> {
        SharedMemory.config = {...request};
        return request;
    }
}