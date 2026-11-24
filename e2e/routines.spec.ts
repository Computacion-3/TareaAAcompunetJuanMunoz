import { test, expect } from '@playwright/test'

test('ve la lista de rutinas desde GraphQL', async ({ page }) => {
    await page.goto('/routines')
    await expect(page.getByRole('heading', { name: 'Gestión de Rutinas' })).toBeVisible()
    await expect(page.getByText('Torso Fuerza e Hipertrofia')).toBeVisible()
    await expect(page.getByText('Pierna Completa e Isquios')).toBeVisible()
    await expect(page.getByText('Full Body Funcional')).toBeVisible()
})

test('admin crea una rutina via mutación GraphQL y persiste al recargar', async ({ browser }) => {
    const context = await browser.newContext({ storageState: { cookies: [], origins: [] } })
    const page = await context.newPage()

    await page.goto('/login')
    await page.getByPlaceholder('tu@correo.com').fill('admin@icesi.edu.co')
    await page.getByPlaceholder('********').fill('admin123')
    await page.getByRole('button', { name: 'Iniciar sesión' }).click()
    await expect(page).toHaveURL('/routines')

    const routineName = `Rutina E2E ${Date.now()}`
    await page.getByPlaceholder('Ej. Hipertrofia Tren Superior').fill(routineName)
    await page
        .getByPlaceholder('Ej. Enfocada en pecho y hombros')
        .fill('Rutina creada desde prueba E2E con GraphQL.')
    await page.getByRole('button', { name: 'Guardar Rutina' }).click()

    await expect(page.getByText(routineName)).toBeVisible()

    await page.reload()
    await expect(page.getByText(routineName)).toBeVisible()

    await context.close()
})
