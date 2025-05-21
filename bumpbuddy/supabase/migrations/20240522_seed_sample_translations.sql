-- Migration to seed sample translations for pregnancy weeks 1, 13, 20, and 40
-- This provides examples for each trimester for testing purposes

-- French translations
INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  1,
  'fr',
  '{
    "fetal_development": "À la première semaine, l''embryon n''est pas encore formé. C''est la semaine de vos dernières règles, qui marque le début officiel de votre grossesse selon le calendrier médical.",
    "maternal_changes": "Vous n''êtes pas encore enceinte, mais votre corps se prépare pour l''ovulation à venir. Cette semaine est comptée comme la première semaine de grossesse selon la méthode de calcul médicale.",
    "tips": "Commencez à prendre des suppléments d''acide folique si vous essayez de concevoir. Évitez l''alcool et le tabac.",
    "nutrition_advice": "Une alimentation équilibrée riche en acide folique est essentielle pour préparer une grossesse. Consommez des légumes à feuilles vertes, des agrumes et des légumineuses.",
    "common_symptoms": "Vous pourriez avoir vos règles normalement, car la conception n''a pas encore eu lieu.",
    "medical_checkups": "Si vous planifiez une grossesse, c''est le moment idéal pour une visite préconceptionnelle avec votre médecin."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "À la première semaine, l''embryon n''est pas encore formé. C''est la semaine de vos dernières règles, qui marque le début officiel de votre grossesse selon le calendrier médical.",
  "maternal_changes": "Vous n''êtes pas encore enceinte, mais votre corps se prépare pour l''ovulation à venir. Cette semaine est comptée comme la première semaine de grossesse selon la méthode de calcul médicale.",
  "tips": "Commencez à prendre des suppléments d''acide folique si vous essayez de concevoir. Évitez l''alcool et le tabac.",
  "nutrition_advice": "Une alimentation équilibrée riche en acide folique est essentielle pour préparer une grossesse. Consommez des légumes à feuilles vertes, des agrumes et des légumineuses.",
  "common_symptoms": "Vous pourriez avoir vos règles normalement, car la conception n''a pas encore eu lieu.",
  "medical_checkups": "Si vous planifiez une grossesse, c''est le moment idéal pour une visite préconceptionnelle avec votre médecin."
}'::jsonb,
    updated_at = NOW();

INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  13,
  'fr',
  '{
    "fetal_development": "Votre bébé mesure environ 7,5 cm et pèse près de 23 grammes. Les organes génitaux sont formés, mais il reste difficile de déterminer le sexe à l''échographie. Le fœtus peut désormais avaler et uriner.",
    "maternal_changes": "La fin du premier trimestre approche ! Vous pouvez commencer à vous sentir moins fatiguée et les nausées matinales peuvent diminuer. Votre utérus est maintenant de la taille d''un pamplemousse.",
    "tips": "C''est le moment idéal pour commencer à planifier l''aménagement de la chambre de bébé et réfléchir aux achats essentiels.",
    "nutrition_advice": "Continuez à manger équilibré. Assurez-vous de consommer suffisamment de calcium pour le développement des os de votre bébé.",
    "common_symptoms": "Les nausées diminuent pour beaucoup de femmes. Vous pourriez remarquer que vos cheveux et vos ongles poussent plus rapidement.",
    "medical_checkups": "Une échographie de routine peut être prévue. Votre médecin pourrait suggérer un test de dépistage pour les anomalies chromosomiques."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "Votre bébé mesure environ 7,5 cm et pèse près de 23 grammes. Les organes génitaux sont formés, mais il reste difficile de déterminer le sexe à l''échographie. Le fœtus peut désormais avaler et uriner.",
  "maternal_changes": "La fin du premier trimestre approche ! Vous pouvez commencer à vous sentir moins fatiguée et les nausées matinales peuvent diminuer. Votre utérus est maintenant de la taille d''un pamplemousse.",
  "tips": "C''est le moment idéal pour commencer à planifier l''aménagement de la chambre de bébé et réfléchir aux achats essentiels.",
  "nutrition_advice": "Continuez à manger équilibré. Assurez-vous de consommer suffisamment de calcium pour le développement des os de votre bébé.",
  "common_symptoms": "Les nausées diminuent pour beaucoup de femmes. Vous pourriez remarquer que vos cheveux et vos ongles poussent plus rapidement.",
  "medical_checkups": "Une échographie de routine peut être prévue. Votre médecin pourrait suggérer un test de dépistage pour les anomalies chromosomiques."
}'::jsonb,
    updated_at = NOW();

INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  20,
  'fr',
  '{
    "fetal_development": "Votre bébé mesure environ 25 cm et pèse 300 grammes. Les cheveux commencent à pousser et le corps est recouvert de vernix, une substance blanchâtre qui protège la peau. Le rythme veille-sommeil commence à s''établir.",
    "maternal_changes": "Vous êtes à mi-parcours ! Votre ventre est maintenant bien visible et vous pouvez ressentir les premiers mouvements du bébé. L''utérus atteint le niveau du nombril.",
    "tips": "C''est une bonne période pour commencer les cours de préparation à l''accouchement. Pensez aussi à faire une séance photo pour immortaliser votre grossesse.",
    "nutrition_advice": "Le fer est essentiel maintenant pour prévenir l''anémie. Consommez des viandes maigres, des légumineuses et des légumes à feuilles vertes.",
    "common_symptoms": "Vous pourriez ressentir des douleurs ligamentaires quand vous changez de position. Les brûlures d''estomac peuvent s''intensifier.",
    "medical_checkups": "L''échographie morphologique est généralement réalisée à cette période pour vérifier l''anatomie du bébé en détail."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "Votre bébé mesure environ 25 cm et pèse 300 grammes. Les cheveux commencent à pousser et le corps est recouvert de vernix, une substance blanchâtre qui protège la peau. Le rythme veille-sommeil commence à s''établir.",
  "maternal_changes": "Vous êtes à mi-parcours ! Votre ventre est maintenant bien visible et vous pouvez ressentir les premiers mouvements du bébé. L''utérus atteint le niveau du nombril.",
  "tips": "C''est une bonne période pour commencer les cours de préparation à l''accouchement. Pensez aussi à faire une séance photo pour immortaliser votre grossesse.",
  "nutrition_advice": "Le fer est essentiel maintenant pour prévenir l''anémie. Consommez des viandes maigres, des légumineuses et des légumes à feuilles vertes.",
  "common_symptoms": "Vous pourriez ressentir des douleurs ligamentaires quand vous changez de position. Les brûlures d''estomac peuvent s''intensifier.",
  "medical_checkups": "L''échographie morphologique est généralement réalisée à cette période pour vérifier l''anatomie du bébé en détail."
}'::jsonb,
    updated_at = NOW();

INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  40,
  'fr',
  '{
    "fetal_development": "Votre bébé est complètement développé ! Il pèse environ 3,4 kg et mesure 50 cm. Ses poumons sont matures et il est prêt à respirer de l''air.",
    "maternal_changes": "Vous êtes arrivée à terme ! Votre ventre peut s''abaisser quand le bébé s''engage dans le bassin. Vous pourriez vous sentir très inconfortable et impatiente de rencontrer votre bébé.",
    "tips": "Restez en contact étroit avec votre équipe médicale. Ayez votre sac pour l''hôpital prêt et votre plan de naissance à portée de main.",
    "nutrition_advice": "Continuez à manger des repas légers et fréquents. L''hydratation reste importante, surtout si vous ressentez des contractions.",
    "common_symptoms": "Vous pourriez ressentir des contractions de Braxton Hicks plus fréquentes. L''insomnie est courante à ce stade. Vous pourriez aussi remarquer la perte du bouchon muqueux.",
    "medical_checkups": "Votre médecin peut suggérer un déclenchement si vous dépassez votre date prévue d''accouchement. Des examens du col et monitoring du bébé sont fréquents à ce stade."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "Votre bébé est complètement développé ! Il pèse environ 3,4 kg et mesure 50 cm. Ses poumons sont matures et il est prêt à respirer de l''air.",
  "maternal_changes": "Vous êtes arrivée à terme ! Votre ventre peut s''abaisser quand le bébé s''engage dans le bassin. Vous pourriez vous sentir très inconfortable et impatiente de rencontrer votre bébé.",
  "tips": "Restez en contact étroit avec votre équipe médicale. Ayez votre sac pour l''hôpital prêt et votre plan de naissance à portée de main.",
  "nutrition_advice": "Continuez à manger des repas légers et fréquents. L''hydratation reste importante, surtout si vous ressentez des contractions.",
  "common_symptoms": "Vous pourriez ressentir des contractions de Braxton Hicks plus fréquentes. L''insomnie est courante à ce stade. Vous pourriez aussi remarquer la perte du bouchon muqueux.",
  "medical_checkups": "Votre médecin peut suggérer un déclenchement si vous dépassez votre date prévue d''accouchement. Des examens du col et monitoring du bébé sont fréquents à ce stade."
}'::jsonb,
    updated_at = NOW();

-- Spanish translations
INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  1,
  'es',
  '{
    "fetal_development": "En la primera semana, el embrión aún no se ha formado. Esta es la semana de tu último período menstrual, que marca el inicio oficial de tu embarazo según el calendario médico.",
    "maternal_changes": "Aún no estás embarazada, pero tu cuerpo se está preparando para la ovulación venidera. Esta semana se cuenta como la primera semana de embarazo según el método de cálculo médico.",
    "tips": "Comienza a tomar suplementos de ácido fólico si estás tratando de concebir. Evita el alcohol y el tabaco.",
    "nutrition_advice": "Una dieta equilibrada rica en ácido fólico es esencial para prepararse para el embarazo. Consume vegetales de hoja verde, cítricos y legumbres.",
    "common_symptoms": "Es posible que tengas tu período normal, ya que la concepción aún no ha ocurrido.",
    "medical_checkups": "Si estás planificando un embarazo, este es el momento ideal para una visita preconcepcional con tu médico."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "En la primera semana, el embrión aún no se ha formado. Esta es la semana de tu último período menstrual, que marca el inicio oficial de tu embarazo según el calendario médico.",
  "maternal_changes": "Aún no estás embarazada, pero tu cuerpo se está preparando para la ovulación venidera. Esta semana se cuenta como la primera semana de embarazo según el método de cálculo médico.",
  "tips": "Comienza a tomar suplementos de ácido fólico si estás tratando de concebir. Evita el alcohol y el tabaco.",
  "nutrition_advice": "Una dieta equilibrada rica en ácido fólico es esencial para prepararse para el embarazo. Consume vegetales de hoja verde, cítricos y legumbres.",
  "common_symptoms": "Es posible que tengas tu período normal, ya que la concepción aún no ha ocurrido.",
  "medical_checkups": "Si estás planificando un embarazo, este es el momento ideal para una visita preconcepcional con tu médico."
}'::jsonb,
    updated_at = NOW();

INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  13,
  'es',
  '{
    "fetal_development": "Tu bebé mide aproximadamente 7,5 cm y pesa cerca de 23 gramos. Los órganos genitales están formados, pero sigue siendo difícil determinar el sexo en la ecografía. El feto ahora puede tragar y orinar.",
    "maternal_changes": "¡El final del primer trimestre se acerca! Puedes comenzar a sentirte menos cansada y las náuseas matutinas pueden disminuir. Tu útero ahora tiene el tamaño de una toronja.",
    "tips": "Este es el momento ideal para comenzar a planificar la habitación del bebé y pensar en las compras esenciales.",
    "nutrition_advice": "Continúa comiendo equilibradamente. Asegúrate de consumir suficiente calcio para el desarrollo de los huesos de tu bebé.",
    "common_symptoms": "Las náuseas disminuyen para muchas mujeres. Podrías notar que tu cabello y uñas crecen más rápido.",
    "medical_checkups": "Se puede programar una ecografía de rutina. Tu médico podría sugerir una prueba de detección de anomalías cromosómicas."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "Tu bebé mide aproximadamente 7,5 cm y pesa cerca de 23 gramos. Los órganos genitales están formados, pero sigue siendo difícil determinar el sexo en la ecografía. El feto ahora puede tragar y orinar.",
  "maternal_changes": "¡El final del primer trimestre se acerca! Puedes comenzar a sentirte menos cansada y las náuseas matutinas pueden disminuir. Tu útero ahora tiene el tamaño de una toronja.",
  "tips": "Este es el momento ideal para comenzar a planificar la habitación del bebé y pensar en las compras esenciales.",
  "nutrition_advice": "Continúa comiendo equilibradamente. Asegúrate de consumir suficiente calcio para el desarrollo de los huesos de tu bebé.",
  "common_symptoms": "Las náuseas disminuyen para muchas mujeres. Podrías notar que tu cabello y uñas crecen más rápido.",
  "medical_checkups": "Se puede programar una ecografía de rutina. Tu médico podría sugerir una prueba de detección de anomalías cromosómicas."
}'::jsonb,
    updated_at = NOW();

INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  20,
  'es',
  '{
    "fetal_development": "Tu bebé mide aproximadamente 25 cm y pesa 300 gramos. El cabello comienza a crecer y el cuerpo está cubierto de vérnix, una sustancia blanquecina que protege la piel. El ritmo de vigilia y sueño comienza a establecerse.",
    "maternal_changes": "¡Estás a mitad de camino! Tu vientre ahora es bien visible y puedes sentir los primeros movimientos del bebé. El útero alcanza el nivel del ombligo.",
    "tips": "Este es un buen período para comenzar las clases de preparación para el parto. También considera hacer una sesión de fotos para inmortalizar tu embarazo.",
    "nutrition_advice": "El hierro es esencial ahora para prevenir la anemia. Consume carnes magras, legumbres y vegetales de hoja verde.",
    "common_symptoms": "Podrías sentir dolores ligamentarios cuando cambias de posición. La acidez estomacal puede intensificarse.",
    "medical_checkups": "La ecografía morfológica generalmente se realiza en este período para verificar la anatomía del bebé en detalle."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "Tu bebé mide aproximadamente 25 cm y pesa 300 gramos. El cabello comienza a crecer y el cuerpo está cubierto de vérnix, una sustancia blanquecina que protege la piel. El ritmo de vigilia y sueño comienza a establecerse.",
  "maternal_changes": "¡Estás a mitad de camino! Tu vientre ahora es bien visible y puedes sentir los primeros movimientos del bebé. El útero alcanza el nivel del ombligo.",
  "tips": "Este es un buen período para comenzar las clases de preparación para el parto. También considera hacer una sesión de fotos para inmortalizar tu embarazo.",
  "nutrition_advice": "El hierro es esencial ahora para prevenir la anemia. Consume carnes magras, legumbres y vegetales de hoja verde.",
  "common_symptoms": "Podrías sentir dolores ligamentarios cuando cambias de posición. La acidez estomacal puede intensificarse.",
  "medical_checkups": "La ecografía morfológica generalmente se realiza en este período para verificar la anatomía del bebé en detalle."
}'::jsonb,
    updated_at = NOW();

INSERT INTO public.pregnancy_week_translations (week, language, translations)
VALUES (
  40,
  'es',
  '{
    "fetal_development": "¡Tu bebé está completamente desarrollado! Pesa aproximadamente 3,4 kg y mide 50 cm. Sus pulmones están maduros y está listo para respirar aire.",
    "maternal_changes": "¡Has llegado a término! Tu vientre puede descender cuando el bebé se encaja en la pelvis. Podrías sentirte muy incómoda e impaciente por conocer a tu bebé.",
    "tips": "Mantente en contacto cercano con tu equipo médico. Ten listo tu bolso para el hospital y tu plan de parto a mano.",
    "nutrition_advice": "Continúa comiendo comidas ligeras y frecuentes. La hidratación sigue siendo importante, especialmente si sientes contracciones.",
    "common_symptoms": "Podrías sentir contracciones de Braxton Hicks más frecuentes. El insomnio es común en esta etapa. También podrías notar la pérdida del tapón mucoso.",
    "medical_checkups": "Tu médico puede sugerir una inducción si pasas tu fecha prevista de parto. Los exámenes cervicales y la monitorización del bebé son frecuentes en esta etapa."
  }'::jsonb
) ON CONFLICT (week, language) DO UPDATE
SET translations = '{
  "fetal_development": "¡Tu bebé está completamente desarrollado! Pesa aproximadamente 3,4 kg y mide 50 cm. Sus pulmones están maduros y está listo para respirar aire.",
  "maternal_changes": "¡Has llegado a término! Tu vientre puede descender cuando el bebé se encaja en la pelvis. Podrías sentirte muy incómoda e impaciente por conocer a tu bebé.",
  "tips": "Mantente en contacto cercano con tu equipo médico. Ten listo tu bolso para el hospital y tu plan de parto a mano.",
  "nutrition_advice": "Continúa comiendo comidas ligeras y frecuentes. La hidratación sigue siendo importante, especialmente si sientes contracciones.",
  "common_symptoms": "Podrías sentir contracciones de Braxton Hicks más frecuentes. El insomnio es común en esta etapa. También podrías notar la pérdida del tapón mucoso.",
  "medical_checkups": "Tu médico puede sugerir una inducción si pasas tu fecha prevista de parto. Los exámenes cervicales y la monitorización del bebé son frecuentes en esta etapa."
}'::jsonb,
    updated_at = NOW(); 