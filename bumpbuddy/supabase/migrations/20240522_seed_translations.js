/**
 * Translation seeding utility for pregnancy week translations
 *
 * This script helps generate migration files for seeding translations
 * for pregnancy weeks in French and Spanish.
 *
 * Usage:
 * 1. Place this file in your project
 * 2. Run with Node.js
 * 3. Use the generated SQL to create migration files
 */

// Sample translations for demonstration - in a real implementation,
// you would have professional translations for each field
const frenchSample = {
  fetal_development: "Développement du fœtus pour la semaine {{week}}",
  maternal_changes: "Changements maternels pour la semaine {{week}}",
  tips: "Conseils pour la semaine {{week}}",
  nutrition_advice: "Conseils nutritionnels pour la semaine {{week}}",
  common_symptoms: "Symptômes courants pour la semaine {{week}}",
  medical_checkups: "Examens médicaux pour la semaine {{week}}",
};

const spanishSample = {
  fetal_development: "Desarrollo fetal para la semana {{week}}",
  maternal_changes: "Cambios maternos para la semana {{week}}",
  tips: "Consejos para la semana {{week}}",
  nutrition_advice: "Consejos nutricionales para la semana {{week}}",
  common_symptoms: "Síntomas comunes para la semana {{week}}",
  medical_checkups: "Exámenes médicos para la semana {{week}}",
};

// Function to generate SQL for a language
function generateTranslationSQL(language, template) {
  let sql = `-- Insert ${language} translations\n`;

  // Generate for weeks 1-40
  for (let week = 1; week <= 40; week++) {
    const translations = {
      fetal_development: template.fetal_development.replace("{{week}}", week),
      maternal_changes: template.maternal_changes.replace("{{week}}", week),
      tips: template.tips.replace("{{week}}", week),
      nutrition_advice: template.nutrition_advice.replace("{{week}}", week),
      common_symptoms: template.common_symptoms.replace("{{week}}", week),
      medical_checkups: template.medical_checkups.replace("{{week}}", week),
    };

    sql += `INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  ${week},
  '${language}',
  '${JSON.stringify(translations)}'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '${JSON.stringify(translations)}'::jsonb,
    updated_at = NOW();\n\n`;
  }

  return sql;
}

// Generate SQL for French and Spanish
const frenchSQL = generateTranslationSQL("fr", frenchSample);
const spanishSQL = generateTranslationSQL("es", spanishSample);

// Combined SQL for all languages
const combinedSQL = `-- Migration: Seed translations for pregnancy weeks
${frenchSQL}
${spanishSQL}
`;

// Output to console
console.log("=== GENERATED SQL FOR TRANSLATIONS ===");
console.log(combinedSQL);
console.log("=== END OF GENERATED SQL ===");

// In a real implementation, you might write this to a file
// For example:
// const fs = require('fs');
// fs.writeFileSync('20240522_seed_translations.sql', combinedSQL);

/**
 * INSTRUCTIONS FOR USE:
 *
 * 1. Update the translation templates with professional translations
 * 2. Run this script to generate the SQL
 * 3. Create a migration file with the generated SQL
 * 4. Apply the migration to your database
 *
 * Note: This is a sample implementation. In a production environment,
 * you should use professional translations for all content.
 */
