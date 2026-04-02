import { test, expect } from '@playwright/test';

test('login y recorrido del sistema', async ({ page }) => {

  // 1. Ir al login
  await page.goto('http://localhost:3000/login');

  // 2. Llenar formulario
  await page.fill('input[name="email"]', 'admin@test.com');
  await page.fill('input[name="password"]', '123456789');

  // 3. Click en iniciar sesión
  await page.click('button[type="submit"]');

  // 4. Validar que entró (ej: dashboard)
  await expect(page.locator('text=Dashboard')).toBeVisible();

  // 5. Recorrer módulos (ejemplo)
  await page.click('text=Clientes');
  await expect(page).toHaveURL(/clientes/);

  await page.click('text=Compras');
  await expect(page).toHaveURL(/compras/);

  await page.click('text=Ventas');
  await expect(page).toHaveURL(/ventas/);

});