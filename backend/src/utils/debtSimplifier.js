const simplifyDebts = (balances) => {
  const creditors = [];
  const debtors = [];

  for (const [userId, amount] of Object.entries(balances)) {
    if (amount > 0) {
      creditors.push({ userId, amount });
    } else if (amount < 0) {
      debtors.push({ userId, amount: -amount });
    }
  }

  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];
    const settlementAmount = Math.min(creditor.amount, debtor.amount);

    transactions.push({
      from: debtor.userId,
      to: creditor.userId,
      amountPaise: settlementAmount,
    });

    creditor.amount -= settlementAmount;
    debtor.amount -= settlementAmount;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return transactions;
};

export default simplifyDebts;
