import { create } from "zustand";

type ActionType = "cart-action" | "subscribe-action" | null;

interface CartItem {
  id: number;
  title: string;
  currency: string;
  original_price: number;
  current_price: number;
  avatar_url: string;
}

interface SubscribedCourse {
  id: number;
  title: string;
  name: string;
  avatar_url: string;
}

interface ActionData {
  cartItems: Array<CartItem>;
  subscribedCourseItems: Array<SubscribedCourse>;
}

interface ActionStore {
  type: ActionType | null;
  data: ActionData;
  onUpdate: (type: ActionType, data?: ActionData) => void;
}

export const useAction = create<ActionStore>((set) => ({
  type: null,
  data: {
    cartItems: [],
    subscribedCourseItems: [],
  },
  onUpdate: (
    type,
    data = {
      cartItems: [],
      subscribedCourseItems: [],
    },
  ) => set({ type, data }),
}));

export const useFinishAttemptBannerUpdate = create<{
  userFinished: boolean;
  setUserFinished: (value: boolean) => void;
  resetUserFinished: () => void;
}>((set) => ({
  userFinished: false,
  setUserFinished: (value: boolean) => set({ userFinished: value }),
  resetUserFinished: () => set({ userFinished: false }),
}));
