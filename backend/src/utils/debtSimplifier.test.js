import simplifyDebts from './debtSimplifier.js';

describe('debtSimplifier', () => {
  it('handles single debtor and single creditor', () => {
    const balances = {
      'Alice': 100,
      'Bob': -100,
    };
    
    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(1);
    expect(transactions).toContainEqual({
      from: 'Bob',
      to: 'Alice',
      amountPaise: 100,
    });
  });

  it('handles uneven splits', () => {
    const balances = {
      'Alice': 150,
      'Bob': -100,
      'Charlie': -50,
    };
    
    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(2);
    // order might vary depending on sorting, but Bob and Charlie both pay Alice
    // Actually the code sorts by amount descending, so Alice (150) is creditor[0].
    // Bob (-100 => 100) and Charlie (-50 => 50) are debtors. 
    // They are sorted descending: Bob (100) then Charlie (50).
    // So Bob pays Alice 100 first, then Charlie pays Alice 50.
    expect(transactions).toEqual([
      { from: 'Bob', to: 'Alice', amountPaise: 100 },
      { from: 'Charlie', to: 'Alice', amountPaise: 50 },
    ]);
  });

  it('handles balanced circular debt (A owes B, B owes C, C owes A)', () => {
    // If A owes B 100, B owes C 100, C owes A 100, their net balances are 0.
    const balances = {
      'A': 0,
      'B': 0,
      'C': 0,
    };
    
    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(0);
  });

  it('handles already-settled group', () => {
    const balances = {
      'User1': 0,
      'User2': 0,
    };
    
    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(0);
  });

  it('handles negative/zero edge cases (e.g. empty balances, all zeros)', () => {
    expect(simplifyDebts({})).toHaveLength(0);
    
    const balancesWithZero = {
      'A': 100,
      'B': -100,
      'C': 0,
    };
    const transactions = simplifyDebts(balancesWithZero);
    expect(transactions).toHaveLength(1);
    expect(transactions).toContainEqual({
      from: 'B',
      to: 'A',
      amountPaise: 100,
    });
  });

  it('handles complex multiple debtors and creditors', () => {
    const balances = {
      'A': 50,
      'B': 40,
      'C': -30,
      'D': -60,
    };
    // Creditors: A (50), B (40). Sorted: A, B.
    // Debtors: D (60), C (30). Sorted: D, C.
    // 1. D pays A min(50, 60) = 50. A is settled. D has 10 left.
    // 2. D pays B min(40, 10) = 10. D is settled. B has 30 left.
    // 3. C pays B min(30, 30) = 30. C is settled. B is settled.
    
    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(3);
    expect(transactions).toEqual([
      { from: 'D', to: 'A', amountPaise: 50 },
      { from: 'D', to: 'B', amountPaise: 10 },
      { from: 'C', to: 'B', amountPaise: 30 },
    ]);
  });

  it('throws an error if a non-integer balance is provided', () => {
    const balances = {
      'User1': 100.5,
      'User2': -100.5,
    };
    
    expect(() => simplifyDebts(balances)).toThrow(/Invariant violated: non-integer balance detected for user User1/);
  });

  it('handles a single-user group', () => {
    const balances = {
      'SoloUser': 0,
    };
    
    const transactions = simplifyDebts(balances);
    
    expect(transactions).toHaveLength(0);
  });
});
