import { expect, test } from '@playwright/test'

function formatDateParts(date: Date) {
  return {
    day: date.getDate(),
    monthIndex: date.getMonth(),
    year: date.getFullYear(),
  }
}

async function selectBookingDate(page: import('@playwright/test').Page, targetDate: Date) {
  const monthsVi = [
    'Tháng 1',
    'Tháng 2',
    'Tháng 3',
    'Tháng 4',
    'Tháng 5',
    'Tháng 6',
    'Tháng 7',
    'Tháng 8',
    'Tháng 9',
    'Tháng 10',
    'Tháng 11',
    'Tháng 12',
  ]

  const monthLabel = page.locator('span').filter({ hasText: /^\s*Tháng \d{1,2} \d{4}\s*$/ }).first()
  await expect(monthLabel).toBeVisible()

  const target = formatDateParts(targetDate)

  for (let i = 0; i < 12; i += 1) {
    const label = (await monthLabel.textContent())?.trim() ?? ''
    const targetLabel = `${monthsVi[target.monthIndex]} ${target.year}`

    if (label === targetLabel) {
      await page.getByRole('button', { name: String(target.day), exact: true }).click()
      return
    }

    await page.getByRole('button').filter({ has: page.locator('svg.lucide-chevron-right') }).first().click()
  }

  throw new Error('Could not navigate booking calendar to target month')
}

async function clickBookingPrimaryAction(page: import('@playwright/test').Page, label: RegExp) {
  const button = page.locator('#reserve button').filter({ hasText: label }).last()
  await expect(button).toBeVisible()
  await button.evaluate((node) => {
    ;(node as HTMLButtonElement).click()
  })
}

test('public booking happy path reaches success state', async ({ page }) => {
  const uniqueSuffix = Date.now().toString().slice(-6)
  const guestName = `PW Test ${uniqueSuffix}`
  const guestPhone = `090${uniqueSuffix.padStart(7, '0').slice(0, 7)}`
  const bookingDate = new Date()
  bookingDate.setDate(bookingDate.getDate() + 1)
  bookingDate.setHours(0, 0, 0, 0)

  await page.goto('/')

  await clickBookingPrimaryAction(page, /tiếp tục/i)
  await expect(page.getByRole('heading', { name: /chọn ngày đặt bàn/i })).toBeVisible()

  await selectBookingDate(page, bookingDate)
  await clickBookingPrimaryAction(page, /tiếp tục/i)
  await expect(page.getByRole('heading', { name: /chọn giờ dùng bữa/i })).toBeVisible()

  await page.getByRole('button', { name: '18:00', exact: true }).click()
  await clickBookingPrimaryAction(page, /tiếp tục/i)
  await expect(page.getByRole('heading', { name: /thông tin đặt bàn & yêu cầu/i })).toBeVisible()

  await page.getByLabel(/họ và tên/i).fill(guestName)
  await page.getByLabel(/số điện thoại/i).fill(guestPhone)
  await clickBookingPrimaryAction(page, /xác nhận đặt bàn/i)

  await expect(page.getByRole('heading', { name: new RegExp(`Cảm ơn bạn, ${guestName.split(' ')[0]}!`) })).toBeVisible()
  await expect(page.getByText(/Yêu cầu đặt bàn của bạn đã được ghi nhận thành công/i)).toBeVisible()
  await expect(page.getByText(guestPhone).first()).toBeVisible()
  await expect(page.getByRole('button', { name: /đặt bàn khác/i })).toBeVisible()
})

test('admin login succeeds and dashboard renders for active staff', async ({ page }) => {
  test.skip(
    !process.env.PLAYWRIGHT_ADMIN_EMAIL || !process.env.PLAYWRIGHT_ADMIN_PASSWORD,
    'Set PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD to run live admin login flow.',
  )

  await page.goto('/admin/login')

  await page.getByLabel('Email').fill(process.env.PLAYWRIGHT_ADMIN_EMAIL!)
  await page.getByLabel('Mật khẩu').fill(process.env.PLAYWRIGHT_ADMIN_PASSWORD!)
  await page.getByRole('button', { name: /đăng nhập/i }).click()

  await expect(page).toHaveURL(/\/admin$/)
  await expect(page.getByRole('heading', { name: /điều phối đặt bàn/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /thêm đặt bàn/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /làm mới/i })).toBeVisible()
})
