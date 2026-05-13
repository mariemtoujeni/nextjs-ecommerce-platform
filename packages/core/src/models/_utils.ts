export const filterModel = <FromModel extends object, ToModel extends object>(model: FromModel): ToModel => {
    let data: any = {};

    for(const key in model) {
        if(key in ({} as ToModel)) {
            data[key] = model[key];
        }
    }

    return data as ToModel;
}