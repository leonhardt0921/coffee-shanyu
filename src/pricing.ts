import { type Entry, hasSizes, unitPrice } from './data';

/** Second cup half price: coffee only, never desserts. */
export const HALF_PRICE_RATE = 0.5;
/** Threshold offer, checked against the amount after the half-price discount. */
export const THRESHOLD = 5000;
export const THRESHOLD_VALUE = 800;
/** Member rate. Member discount and the threshold offer never stack. */
export const MEMBER_RATE = 0.95;
const MEMBER_PERCENT_OFF = Math.round((1 - MEMBER_RATE) * 100);

export type Plan = 'none' | 'threshold' | 'member';
export type PricedLine = Entry & { unit: number; amount: number; halfCups: number; halfDiscount: number };
export type Quote = {
  lines: PricedLine[];
  subtotal: number;
  bogoDiscount: number;
  afterBogo: number;
  thresholdDiscount: number;
  memberDiscount: number;
  /** Which exclusive offer was applied, always the larger one. */
  plan: Plan;
  exclusiveDiscount: number;
  saved: number;
  total: number;
  coffeeCups: number;
  halfCups: number;
  /** How much more the shopper needs to reach the ¥50 threshold. */
  thresholdGap: number;
};

const half = (cents: number) => Math.round(cents * HALF_PRICE_RATE);
const memberOff = (cents: number) => Math.round(cents * MEMBER_PERCENT_OFF / 100);

/**
 * Recomputes every offer from scratch, so any change to cup size, quantity or
 * items is picked up on the next render without extra bookkeeping.
 *
 * Half price pairing: expand every coffee cup to its own unit price, sort
 * descending, then charge half for the cheaper cup of each pair (index 1, 3, 5…).
 * Sorting first maximises the discount and keeps 3-cup and 4-cup bags correct.
 */
export function quote(entries: Entry[], isMember: boolean): Quote {
  const lines: PricedLine[] = entries.map(entry => {
    const unit = unitPrice(entry.product, entry.size);
    return { ...entry, unit, amount: unit * entry.qty, halfCups: 0, halfDiscount: 0 };
  });

  const cups: { line: number; unit: number }[] = [];
  lines.forEach((line, index) => {
    if (!hasSizes(line.product)) return;
    for (let i = 0; i < line.qty; i += 1) cups.push({ line: index, unit: line.unit });
  });
  cups.sort((a, b) => b.unit - a.unit);

  let bogoDiscount = 0;
  cups.forEach((cup, index) => {
    if (index % 2 !== 1) return;
    const off = half(cup.unit);
    bogoDiscount += off;
    const line = lines[cup.line];
    line.halfCups += 1;
    line.halfDiscount += off;
  });

  const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
  const afterBogo = subtotal - bogoDiscount;
  const thresholdDiscount = afterBogo >= THRESHOLD ? THRESHOLD_VALUE : 0;
  const memberDiscount = isMember ? memberOff(afterBogo) : 0;
  const plan: Plan = !thresholdDiscount && !memberDiscount ? 'none' : memberDiscount > thresholdDiscount ? 'member' : 'threshold';
  const exclusiveDiscount = Math.max(thresholdDiscount, memberDiscount);
  return {
    lines,
    subtotal,
    bogoDiscount,
    afterBogo,
    thresholdDiscount,
    memberDiscount,
    plan,
    exclusiveDiscount,
    saved: bogoDiscount + exclusiveDiscount,
    total: afterBogo - exclusiveDiscount,
    coffeeCups: cups.length,
    halfCups: Math.floor(cups.length / 2),
    thresholdGap: Math.max(0, THRESHOLD - afterBogo),
  };
}
