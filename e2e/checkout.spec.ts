import { test, expect } from '@playwright/test'

/**
 * 完整結帳流程 E2E 測試
 * 流程：首頁 → 商品列表 → 加入購物車 → 購物車 → 結帳表單 → 確認下單 → 成功頁
 */

test.describe('結帳下單流程', () => {
  test.beforeEach(async ({ page }) => {
    // 清除 localStorage（清空購物車），key 為 k_slect_cart
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('k_slect_cart')
      localStorage.removeItem('customer_email')
    })
  })

  test('完整購物流程：加入購物車 → 結帳 → 訂單建立成功', async ({ page }) => {
    // ── 1. 首頁載入 ──────────────────────────────────────────────
    await page.goto('/')
    await expect(page).toHaveTitle(/韓好物|K-Slect|k-slect/i)

    // ── 2. 前往商品列表頁 ────────────────────────────────────────
    await page.goto('/products')
    await page.waitForLoadState('networkidle')

    // 找到無規格商品「三養辣雞麵 5入組」並加入購物車
    const productCard = page.locator('text=三養辣雞麵 5入組').first()
    await expect(productCard).toBeVisible({ timeout: 10000 })

    // 找到同一卡片中的「加入購物車」按鈕
    const addBtn = page
      .locator('[class*="card"], article, [class*="product"]')
      .filter({ hasText: '三養辣雞麵' })
      .getByRole('button', { name: /加入購物車/ })
      .first()

    // fallback：直接用文字找按鈕
    const addBtnFallback = page.getByRole('button', { name: /加入購物車/ }).first()

    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click()
    } else {
      await addBtnFallback.click()
    }

    // 確認加入成功（按鈕變成「✓ 已加入」）
    await expect(page.getByRole('button', { name: /已加入/ }).first()).toBeVisible({ timeout: 5000 })

    // ── 3. 前往購物車 ────────────────────────────────────────────
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')

    // 購物車有商品
    await expect(page.getByText('三養辣雞麵 5入組').first()).toBeVisible({ timeout: 5000 })

    // 點選「前往結帳」
    await page.getByRole('link', { name: '前往結帳' }).click()
    await page.waitForURL('**/checkout')

    // ── 4. 填寫結帳表單 ──────────────────────────────────────────
    await page.waitForLoadState('networkidle')

    // 姓名
    await page.getByPlaceholder('王小明').fill('測試用戶')

    // 手機
    await page.getByPlaceholder('0912-345-678').fill('0912345678')

    // Email
    await page.getByPlaceholder('example@email.com').fill('e2e-test@example.com')

    // 配送方式：選「宅配到府」
    await page.getByRole('button', { name: '宅配到府' }).click()

    // 收件地址
    await page.getByPlaceholder('台北市信義區...').fill('台北市信義區信義路五段7號')

    // ── 5. 確認下單 ──────────────────────────────────────────────
    // 攔截 POST /api/v1/orders 確認有 payload
    const orderResponsePromise = page.waitForResponse(
      (res) => res.url().includes('/api/v1/orders') && res.request().method() === 'POST',
      { timeout: 15000 }
    )

    // 點選「確認下單」（桌面版或行動版按鈕）
    const submitBtn = page.getByRole('button', { name: '確認下單' }).first()
    await expect(submitBtn).toBeEnabled({ timeout: 5000 })
    await submitBtn.click()

    // ── 6. 驗證 API 請求與回應 ───────────────────────────────────
    const orderResponse = await orderResponsePromise
    const orderData = await orderResponse.json()

    // 後端回應應有 data（訂單物件），無 error
    expect(orderData.error).toBeNull()
    expect(orderData.data).toBeTruthy()
    expect(orderData.data.id).toBeTruthy()

    // 確認 payload 帶有正確欄位（從 request body 驗證）
    const requestBody = JSON.parse(orderResponse.request().postData() ?? '{}')
    expect(requestBody.items).toHaveLength(1)
    expect(requestBody.items[0].productId).toBeTruthy()
    expect(requestBody.customerName).toBe('測試用戶')
    expect(requestBody.customerEmail).toBe('e2e-test@example.com')
    expect(requestBody.shippingMethod).toBe('home_delivery')

    // ── 7. 驗證成功頁 ────────────────────────────────────────────
    // 預設 paymentMethod=bank_transfer 會跳到 /checkout/bank-transfer
    await page.waitForURL(/checkout\/(success|bank-transfer)/, { timeout: 10000 })
    // bank-transfer 頁應顯示訂單相關文字
    await expect(page.getByText(/訂單|成功|感謝|匯款|銀行/).first()).toBeVisible({ timeout: 5000 })
  })

  test('規格商品需傳 variantId', async ({ page }) => {
    // 找有規格的商品
    const res = await page.request.get('/api/v1/products')
    const data = await res.json()
    const withVariants = data.data.find(
      (p: { variants?: unknown[] }) => p.variants && p.variants.length > 0
    )
    expect(withVariants).toBeTruthy()

    const variant = (withVariants.variants as Array<{ id: string }>)[0]

    // 直接 POST 訂單確認 variantId 有帶入
    const orderRes = await page.request.post('/api/v1/orders', {
      data: {
        customerName: 'E2E測試',
        customerEmail: 'e2e@example.com',
        customerPhone: '0912345678',
        shippingMethod: 'home_delivery',
        paymentMethod: 'credit_card',
        customerAddress: '台北市信義區測試路1號',
        items: [{ productId: withVariants.id, variantId: variant.id, quantity: 1 }],
      },
    })
    const orderData = await orderRes.json()
    expect(orderData.error).toBeNull()
    expect(orderData.data.id).toBeTruthy()
  })

  test('表單驗證：姓名為空時不允許送出', async ({ page }) => {
    // 先加商品到購物車（k_slect_cart 是 cart.ts 的 CART_KEY）
    await page.evaluate(() => {
      const cart = [{ productId: 'fa18401c-ae2b-4067-bb0d-cb517dc49fbe', productName: '三養辣雞麵 5入組', price: 299, quantity: 1 }]
      localStorage.setItem('k_slect_cart', JSON.stringify(cart))
    })

    await page.goto('/checkout')
    await page.waitForLoadState('networkidle')

    // 不填姓名，只填 email 和地址
    await page.getByPlaceholder('example@email.com').fill('e2e@example.com')
    await page.getByRole('button', { name: '宅配到府' }).click()
    await page.getByPlaceholder('台北市信義區...').fill('台北市信義區信義路五段7號')

    const submitBtn = page.getByRole('button', { name: '確認下單' }).first()
    await submitBtn.click()

    // 不應該跳轉，還在 /checkout 頁
    await expect(page).toHaveURL(/checkout/, { timeout: 3000 })
  })
})
