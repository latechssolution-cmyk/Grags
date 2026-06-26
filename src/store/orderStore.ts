import { useState, useEffect, useCallback } from "react";

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export interface OrderProduct {
  id: string;
  name: string;
  price: string;
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  house: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  shippingMethod: string;
  paymentMethod: string;
  sameAsBilling: boolean;
  billingHouse: string;
  billingStreet: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  products: OrderProduct[];
  subtotal: number;
  discount: number;
  couponCode: string;
  total: string;
  date: string;
  status: OrderStatus;
}

const STORAGE_KEY = "graggs_orders";

const mockOrders: Order[] = [
  {
    id: "GRG-001",
    customerName: "Ahmed Khan",
    email: "ahmed@example.com",
    phone: "0301-1234567",
    house: "123", street: "Main Boulevard", city: "Lahore", postalCode: "54000", country: "Pakistan",
    shippingMethod: "Standard", paymentMethod: "COD",
    sameAsBilling: true, billingHouse: "", billingStreet: "", billingCity: "", billingPostalCode: "", billingCountry: "",
    products: [{ id: "1", name: "Textured Polo", price: "PKR 3,490", size: "L", quantity: 1 }, { id: "4", name: "Gurkha Pants", price: "PKR 4,490", size: "32", quantity: 1 }],
    subtotal: 7980, discount: 0, couponCode: "",
    total: "PKR 7,980",
    date: "2025-06-01",
    status: "Pending",
  },
  {
    id: "GRG-002",
    customerName: "Usman Ali",
    email: "usman@example.com",
    phone: "0321-9876543",
    house: "45", street: "Gulberg III", city: "Lahore", postalCode: "54660", country: "Pakistan",
    shippingMethod: "Express", paymentMethod: "Bank Transfer",
    sameAsBilling: true, billingHouse: "", billingStreet: "", billingCity: "", billingPostalCode: "", billingCountry: "",
    products: [{ id: "2", name: "Signature Dual-Tone Polo", price: "PKR 3,990", size: "M", quantity: 1 }],
    subtotal: 3990, discount: 0, couponCode: "",
    total: "PKR 3,990",
    date: "2025-06-02",
    status: "Confirmed",
  },
];

function load(): Order[] {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
  return mockOrders;
}

const listeners = new Set<() => void>();
function notify() { listeners.forEach((l) => l()); }

function saveOrders(orders: Order[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>(load);

  useEffect(() => {
    const handler = () => setOrders(load());
    listeners.add(handler);

    // Fetch from MongoDB
    fetch("/.netlify/functions/orders")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          saveOrders(data);
          setOrders(data);
        }
      })
      .catch((err) => console.error("Error fetching orders from MongoDB:", err));

    return () => { listeners.delete(handler); };
  }, []);

  const updateStatus = useCallback((id: string, status: OrderStatus) => {
    const current = load();
    const next = current.map((o) => (o.id === id ? { ...o, status } : o));
    saveOrders(next);
    setOrders(next);
    notify();

    fetch(`/.netlify/functions/orders?id=${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error updating order status in MongoDB:", err));
  }, []);

  const addOrder = useCallback((order: Order) => {
    const current = load();
    const next = [order, ...current];
    saveOrders(next);
    setOrders(next);
    notify();

    fetch("/.netlify/functions/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
      .then((res) => res.json())
      .catch((err) => console.error("Error creating order in MongoDB:", err));
  }, []);

  return { orders, updateStatus, addOrder };
}
