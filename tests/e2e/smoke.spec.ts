import { expect, test } from '@playwright/test'

test('homepage renders booking entry and wizard shell', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Flambé').first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Đặt bàn', exact: true })).toBeVisible()
  await expect(page.getByText('1/4')).toBeVisible()
})

test('unauthenticated admin route redirects to admin login', async ({ page }) => {
  await page.goto('/admin')

  await expect(page).toHaveURL(/\/admin\/login$/)
  await expect(page.getByRole('heading', { name: /đăng nhập để quản lý lịch đặt bàn/i })).toBeVisible()
})

test('admin login page renders staff form and back-to-booking link', async ({ page }) => {
  await page.goto('/admin/login')

  await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Mật khẩu')).toBeVisible()
  await expect(page.getByRole('button', { name: /về trang đặt bàn/i })).toBeVisible()
})
