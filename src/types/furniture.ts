export interface IFurniture {
    _id: string;
    name: string;
    category: string;
    price?: number;
    warrantyMonths?: number;
    description: string;
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface IFurnitureRequest {
    name: string;
    category: string;
    price: number;
    warrantyMonths: number;
    description: string;
    status: "active" | "inactive";
}

export type FurnitureResponse = IFurniture[];

