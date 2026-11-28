/**
 * Property-based tests for the Wallet value object.
 * Validates: Requirements 4.2, 4.3, 13.3, 13.7
 */
import * as fc from 'fast-check';
import { InsufficientFundsException } from '../exceptions/insufficient-funds.exception';
import { Wallet } from './wallet.vo';

describe('Wallet', () => {
  /**
   * Property 5: Wallet Immutability
   * After deduct or credit, the original Wallet's balance is unchanged.
   * Validates: Requirements 4.2
   */
  it('Property 5: deduct and credit return new Wallet without mutating the original', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1_000_000 }),
        fc.integer({ min: 1, max: 1_000_000 }),
        (initialBalance, amount) => {
          const wallet = new Wallet(initialBalance);
          const deductAmount = Math.min(amount, initialBalance);

          // deduct: original unchanged
          wallet.deduct(deductAmount);
          expect(wallet.getBalance()).toBe(initialBalance);

          // credit: original unchanged
          wallet.credit(amount);
          expect(wallet.getBalance()).toBe(initialBalance);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 6: Wallet Insufficient Funds Guard
   * When amount > balance, deduct throws InsufficientFundsException
   * and the original wallet is unchanged.
   * Validates: Requirements 4.3
   */
  it('Property 6: deduct throws InsufficientFundsException when amount exceeds balance', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999_999 }),
        fc.integer({ min: 1, max: 1_000_000 }),
        (balance, excess) => {
          const amount = balance + excess; // always > balance
          const wallet = new Wallet(balance);

          expect(() => wallet.deduct(amount)).toThrow(
            InsufficientFundsException,
          );
          // original balance unchanged after the failed deduct
          expect(wallet.getBalance()).toBe(balance);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 7: Wallet Balance Conservation
   * For sequences of ≥ 10 credit/deduct operations where no deduct exceeds
   * the available balance, final balance === initial + Σcredits − Σdeducts.
   * Validates: Requirements 13.3, 13.7
   */
  it('Property 7: balance conservation over sequences of valid credit/deduct ops', () => {
    // Each operation: { type: 'credit' | 'deduct', amount }
    const opArb = fc.record({
      type: fc.constantFrom('credit' as const, 'deduct' as const),
      amount: fc.integer({ min: 1, max: 10_000 }),
    });

    fc.assert(
      fc.property(
        fc.integer({ min: 50_000, max: 500_000 }), // generous starting balance
        fc.array(opArb, { minLength: 10, maxLength: 50 }),
        (initialBalance, ops) => {
          let wallet = new Wallet(initialBalance);
          let expectedBalance = initialBalance;

          for (const op of ops) {
            if (op.type === 'credit') {
              wallet = wallet.credit(op.amount);
              expectedBalance += op.amount;
            } else {
              // Skip deducts that would overdraft so every op in the sequence is valid
              if (op.amount <= wallet.getBalance()) {
                wallet = wallet.deduct(op.amount);
                expectedBalance -= op.amount;
              }
            }
          }

          expect(wallet.getBalance()).toBe(expectedBalance);
        },
      ),
      { numRuns: 100 },
    );
  });
});
