import { GSTCalculation } from "../types";

export function calculateGST(
  price: number,
  qty: number,
  gstRate: number,
  intraState: boolean = true
): GSTCalculation {
  const base = price * qty;
  const gstAmount = (base * gstRate) / 100;

  if (intraState) {
    return {
      base,
      cgst: gstAmount / 2,
      sgst: gstAmount / 2,
      igst: 0,
      total: base + gstAmount,
    };
  } else {
    return {
      base,
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      total: base + gstAmount,
    };
  }
}
