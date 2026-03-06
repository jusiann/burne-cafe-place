export interface Coupon {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrderAmount: number;
    isActive: boolean;
}
