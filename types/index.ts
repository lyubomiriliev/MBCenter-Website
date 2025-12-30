// Shared types for the application

export interface NavItem {
  href: string;
  labelKey: string;
}

export interface ValueProp {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export interface Service {
  key: string;
  icon: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    country: string;
    postalCode: string;
  };
}


