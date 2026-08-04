import Expense from '../models/Expense.js';

const calculateBalances = async (groupId) => {
  const expenses = await Expense.find({ group: groupId });
  const balances = {};

  for (const expense of expenses) {
    const payerId = expense.paidBy.toString();

    if (!balances[payerId]) balances[payerId] = 0;
    balances[payerId] += expense.amountPaise;

    for (const split of expense.splits) {
      const splitUserId = split.user.toString();
      if (!balances[splitUserId]) balances[splitUserId] = 0;
      balances[splitUserId] -= split.amountPaise;
    }
  }

  return balances;
};

export default calculateBalances;
