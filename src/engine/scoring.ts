// Official Puyo Puyo scoring formula
const CHAIN_POWER = [0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416, 448, 480, 512];
const COLOR_BONUS = [0, 0, 3, 6, 12, 24];
const GROUP_BONUS = [0, 0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10];

export function calculateScore(
  chainCount: number,
  groupSizes: number[],
  colorCount: number
): number {
  const chainPower = CHAIN_POWER[Math.min(chainCount, CHAIN_POWER.length - 1)];
  const colorBonus = COLOR_BONUS[Math.min(colorCount, COLOR_BONUS.length - 1)];
  const groupBonus = groupSizes.reduce((sum, size) => {
    return sum + GROUP_BONUS[Math.min(size, GROUP_BONUS.length - 1)];
  }, 0);

  const totalPuyos = groupSizes.reduce((a, b) => a + b, 0);
  const multiplier = Math.max(1, chainPower + colorBonus + groupBonus);
  return totalPuyos * 10 * multiplier;
}
