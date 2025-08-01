import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export interface CompanySettings {
  id: string
  company_name: string
  company_address: string
  company_email: string
  tax_rate: number
  default_currency: string
  created_at: string
  updated_at: string
}

export async function getCompanySettings(): Promise<CompanySettings | undefined> {
  // Assuming there's only one row for company settings or we fetch by a specific ID
  const [settings] = await sql`
    SELECT id, company_name, company_address, company_email, tax_rate, default_currency, created_at, updated_at
    FROM company_settings
    LIMIT 1;
  `
  return settings as CompanySettings | undefined
}

export async function updateCompanySettings(
  id: string,
  settings: Partial<Omit<CompanySettings, "id" | "created_at" | "updated_at">>,
): Promise<CompanySettings | undefined> {
  const [updatedSettings] = await sql`
    UPDATE company_settings
    SET
      company_name = COALESCE(${settings.company_name}, company_name),
      company_address = COALESCE(${settings.company_address}, company_address),
      company_email = COALESCE(${settings.company_email}, company_email),
      tax_rate = COALESCE(${settings.tax_rate}, tax_rate),
      default_currency = COALESCE(${settings.default_currency}, default_currency),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING id, company_name, company_address, company_email, tax_rate, default_currency, created_at, updated_at;
  `
  return updatedSettings as CompanySettings | undefined
}

export async function createInitialCompanySettings(
  settings: Omit<CompanySettings, "id" | "created_at" | "updated_at">,
): Promise<CompanySettings> {
  const [newSettings] = await sql`
    INSERT INTO company_settings (company_name, company_address, company_email, tax_rate, default_currency)
    VALUES (${settings.company_name}, ${settings.company_address}, ${settings.company_email}, ${settings.tax_rate}, ${settings.default_currency})
    RETURNING id, company_name, company_address, company_email, tax_rate, default_currency, created_at, updated_at;
  `
  return newSettings as CompanySettings
}
