export interface ProductData {
    longDescription: string;
    code: string;
    name: string;
    shortDescription: string;
    imageUrl: string;
    thumbUrl: string;
    price: PriceData
    step: number;

    parentProduct: ProductData;
}

export interface PriceData {
    formattedValue: string;
    value: number;
    type: string
}
