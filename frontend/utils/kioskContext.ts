export const KIOSK_PLATE_KEY = 'kiosk_plate_context';

export interface KioskPlateContext {
  id: string;
  name: string;
  code: string;
  company_id: string;
  company_name: string;
  allowed_break_types: string[];
}

export const getPlateContext = (): KioskPlateContext | null => {
  try {
    const stored = localStorage.getItem(KIOSK_PLATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

export const setPlateContext = (context: KioskPlateContext) => {
  localStorage.setItem(KIOSK_PLATE_KEY, JSON.stringify(context));
};

export const clearPlateContext = () => {
  localStorage.removeItem(KIOSK_PLATE_KEY);
  // Optional: Clear other strictly kiosk-related items if needed, but not necessarily user token if we want to keep admin context. 
  // However, for Kiosk mode, it's usually safer to contain it.
};
