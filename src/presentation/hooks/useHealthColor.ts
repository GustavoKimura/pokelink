export const useHealthColor = (currentHp: number, maxHp: number): string => {
  const hpPercent = (currentHp / maxHp) * 100;
  if (hpPercent > 50) return "bg-green-500";
  if (hpPercent > 20) return "bg-yellow-500";
  return "bg-red-500";
};
