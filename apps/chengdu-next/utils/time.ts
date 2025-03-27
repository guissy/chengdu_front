/**
 * 格式化时间数字(HHMM格式)为字符串
 * @param time 时间数字，例如：1430 表示 14:30
 * @returns 格式化后的时间字符串，例如：14:30
 */
export const formatTime = (time: number): string => {
  const hours = Math.floor(time / 100);
  const minutes = time % 100;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/**
 * 格式化营业时间范围
 * @param businessHours 营业时间数组，包含开始和结束时间
 * @returns 格式化后的时间范围字符串，例如：09:00 - 22:00
 */
export const formatBusinessHours = (businessHours: number[]): string => {
  if (!businessHours || businessHours.length < 2) return '未设置';
  return `${formatTime(businessHours[0])} - ${formatTime(businessHours[1])}`;
}; 