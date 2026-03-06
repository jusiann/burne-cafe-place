export interface ProductSize {
    name: string;
    price: number;
}

export interface MilkOption {
    name: string;
    price: number;
}

export interface Extra {
    name: string;
    price: number;
}

export interface Nutrition {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    category: string;
    price: number;
    discount: number;
    isPopular?: boolean;
    isNew?: boolean;
    sizes: ProductSize[];
    milkOptions: MilkOption[];
    extras?: Extra[];
    nutrition: Nutrition;
}
