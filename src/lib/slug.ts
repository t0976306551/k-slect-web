/**
 * 將商品名稱轉為 SEO-friendly slug（kebab-case，英文/數字/連字號）
 * 中文字元需在呼叫前手動翻譯為英文，此函式不做音譯
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // 移除非 word/space/hyphen 字元（含中文）
    .replace(/[\s_]+/g, '-')  // space/underscore → hyphen
    .replace(/-+/g, '-')      // 合併連續 hyphen
    .replace(/^-|-$/g, '')    // 移除首尾 hyphen
}

/**
 * 判斷字串是否符合 Prisma cuid() 格式
 * cuid 格式：c 開頭 + 20~30 個小寫英數字
 */
export function isCuid(value: string): boolean {
  return /^c[a-z0-9]{20,30}$/.test(value)
}
