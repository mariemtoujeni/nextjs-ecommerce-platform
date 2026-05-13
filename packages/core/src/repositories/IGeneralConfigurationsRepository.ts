import { Settings } from "../models";

export interface IGeneralConfigurationsRepository {
    read(): Promise<Settings>
    update(request: Settings): Promise<Settings>;
}