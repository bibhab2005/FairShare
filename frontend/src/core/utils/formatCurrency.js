export const formatPaise = (paise) => {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
};

export const rupeeToRoundedPaise = (rupeeString) => {
  const parsed = parseFloat(rupeeString);
  if (isNaN(parsed)) return 0;
  return Math.round(parsed * 100);
};
