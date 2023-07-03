export interface IDynamicObject {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | Date
    | IDynamicObject[]
    | IDynamicObject;
}

export interface IDataTable {
  [key: string]: string | number | boolean | null | undefined | Date;
}
