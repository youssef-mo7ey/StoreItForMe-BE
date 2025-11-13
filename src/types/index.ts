export interface OrderInitData {
  collaborators: string[];
  withKit: boolean;
  protectionPlan?: string;
  packingKitQuantity?: number;
  kitShippingDate?: string;
  kitShippingAddressId?: string;
}

export interface AddressInput {
  label: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}
