import supabase from "../config/supabaseConfig";

// Sample translations for a few key pregnancy weeks
const sampleTranslations = {
  // French translations
  fr: [
    {
      week: 1,
      translations: {
        name: "graine de sésame",
        description:
          "Votre bébé est de la taille d'une minuscule graine de sésame.",
      },
    },
    {
      week: 13,
      translations: {
        name: "citron",
        description:
          "Votre bébé est approximativement de la taille d'un citron.",
      },
    },
    {
      week: 20,
      translations: {
        name: "banane",
        description: "Votre bébé est environ de la taille d'une banane.",
      },
    },
    {
      week: 40,
      translations: {
        name: "citrouille",
        description:
          "Votre bébé est environ de la taille d'une petite citrouille.",
      },
    },
  ],
  // Spanish translations
  es: [
    {
      week: 1,
      translations: {
        name: "semilla de sésamo",
        description:
          "Tu bebé tiene el tamaño de una pequeña semilla de sésamo.",
      },
    },
    {
      week: 13,
      translations: {
        name: "limón",
        description: "Tu bebé tiene aproximadamente el tamaño de un limón.",
      },
    },
    {
      week: 20,
      translations: {
        name: "plátano",
        description: "Tu bebé tiene aproximadamente el tamaño de un plátano.",
      },
    },
    {
      week: 40,
      translations: {
        name: "calabaza",
        description:
          "Tu bebé tiene aproximadamente el tamaño de una pequeña calabaza.",
      },
    },
  ],
};

export const seedFetalSizeTranslations = async () => {
  console.log("Starting to seed fetal size translations...");

  try {
    // Insert French translations
    console.log("Inserting French translations...");
    for (const item of sampleTranslations.fr) {
      const { data, error } = await supabase
        .from("fetal_size_translations")
        .upsert({
          week: item.week,
          language: "fr",
          translations: item.translations,
        })
        .select();

      if (error) {
        console.error(
          `Error inserting French translation for week ${item.week}:`,
          error
        );
      } else {
        console.log(`Inserted French translation for week ${item.week}:`, data);
      }
    }

    // Insert Spanish translations
    console.log("Inserting Spanish translations...");
    for (const item of sampleTranslations.es) {
      const { data, error } = await supabase
        .from("fetal_size_translations")
        .upsert({
          week: item.week,
          language: "es",
          translations: item.translations,
        })
        .select();

      if (error) {
        console.error(
          `Error inserting Spanish translation for week ${item.week}:`,
          error
        );
      } else {
        console.log(
          `Inserted Spanish translation for week ${item.week}:`,
          data
        );
      }
    }

    console.log("Fetal size translations seeding completed.");
  } catch (error) {
    console.error("Error seeding fetal size translations:", error);
  }
};

// Run the seeder if this script is executed directly
if (require.main === module) {
  seedFetalSizeTranslations()
    .then(() => console.log("Seeding process completed."))
    .catch((error) => console.error("Seeding process failed:", error));
}
