export interface ProductData {
    code: string;
    name: string;
    shortDescription: string;
    imageUrl: string;
    thumbUrl: string;
    price: PriceData
}

export interface PriceData {
    formattedValue: string;
    value: number
}
