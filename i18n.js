/* i18n.js — shared language layer for index.html, details.html, dl.html
   • Default language = Telegram user's language_code (if supported), otherwise English.
   • The user can override it from the globe button in the header; the choice is saved
     in localStorage and shared by all three pages.
   • Keys are the English strings themselves. Translation order: ar, ru, fa, hi, es, fr, it, zh.
   • Any string missing from a language falls back to English automatically.
   • Pages use  tr('English text', {vars})  and listen to the 'langchange' event to re-render. */
(function () {
  'use strict';

  var LANGS = [['ar', 'العربية'], ['en', 'English'], ['ru', 'Русский'], ['fa', 'فارسی'], ['hi', 'हिन्दी'],
               ['es', 'Español'], ['fr', 'Français'], ['it', 'Italiano'], ['zh', '中文']];
  var ORDER = ['ar', 'ru', 'fa', 'hi', 'es', 'fr', 'it', 'zh'];
  var RTL = { ar: 1, fa: 1 };
  var KEY = 'ui_lang';

  var S = {
    /* ── navigation / header / feed ── */
    'Courses': ['الدورات', 'Курсы', 'دوره‌ها', 'कोर्स', 'Cursos', 'Cours', 'Corsi', '课程'],
    'Earn': ['اربح', 'Заработок', 'کسب امتیاز', 'कमाएँ', 'Ganar', 'Gagner', 'Guadagna', '赚积分'],
    'Board': ['الترتيب', 'Рейтинг', 'رتبه‌بندی', 'रैंकिंग', 'Ranking', 'Classement', 'Classifica', '排行榜'],
    'Me': ['حسابي', 'Профиль', 'پروفایل', 'मेरा', 'Yo', 'Moi', 'Io', '我的'],
    'Search free courses': ['ابحث في الدورات المجانية', 'Поиск бесплатных курсов', 'جستجوی دوره‌های رایگان', 'मुफ़्त कोर्स खोजें', 'Buscar cursos gratis', 'Rechercher des cours gratuits', 'Cerca corsi gratuiti', '搜索免费课程'],
    'Fresh free courses, every day': ['دورات مجانية جديدة كل يوم', 'Новые бесплатные курсы каждый день', 'هر روز دوره‌های رایگان تازه', 'हर दिन नए मुफ़्त कोर्स', 'Cursos gratis nuevos cada día', 'De nouveaux cours gratuits chaque jour', 'Nuovi corsi gratuiti ogni giorno', '每天更新免费课程'],
    'Hi, {name}': ['أهلاً، {name}', 'Привет, {name}', 'سلام، {name}', 'नमस्ते, {name}', 'Hola, {name}', 'Salut, {name}', 'Ciao, {name}', '你好，{name}'],
    '{n} free courses live right now': ['{n} دورة مجانية متاحة الآن', 'Сейчас доступно бесплатных курсов: {n}', '{n} دوره رایگان در حال حاضر فعال است', 'अभी {n} मुफ़्त कोर्स उपलब्ध', '{n} cursos gratis disponibles ahora', '{n} cours gratuits disponibles', '{n} corsi gratuiti disponibili ora', '当前有 {n} 门免费课程'],
    'Loading courses…': ['جارٍ تحميل الدورات…', 'Загрузка курсов…', 'در حال بارگذاری دوره‌ها…', 'कोर्स लोड हो रहे हैं…', 'Cargando cursos…', 'Chargement des cours…', 'Caricamento corsi…', '正在加载课程…'],
    'Could not load courses': ['تعذّر تحميل الدورات', 'Не удалось загрузить курсы', 'بارگذاری دوره‌ها ممکن نشد', 'कोर्स लोड नहीं हो सके', 'No se pudieron cargar los cursos', 'Impossible de charger les cours', 'Impossibile caricare i corsi', '无法加载课程'],
    'Retry': ['إعادة المحاولة', 'Повторить', 'تلاش دوباره', 'फिर कोशिश करें', 'Reintentar', 'Réessayer', 'Riprova', '重试'],
    'No matches': ['لا توجد نتائج', 'Ничего не найдено', 'نتیجه‌ای یافت نشد', 'कोई परिणाम नहीं', 'Sin resultados', 'Aucun résultat', 'Nessun risultato', '无匹配结果'],
    'FREE': ['مجاني', 'БЕСПЛАТНО', 'رایگان', 'मुफ़्त', 'GRATIS', 'GRATUIT', 'GRATIS', '免费'],
    '{n} left': ['متبقي {n}', 'осталось {n}', '{n} باقی‌مانده', '{n} शेष', 'quedan {n}', '{n} restants', '{n} rimasti', '剩余 {n}'],
    '{n} learners': ['{n} متعلم', '{n} учеников', '{n} دانشجو', '{n} शिक्षार्थी', '{n} estudiantes', '{n} apprenants', '{n} studenti', '{n} 名学员'],
    'All': ['الكل', 'Все', 'همه', 'सभी', 'Todo', 'Tout', 'Tutti', '全部'],
    'Programming': ['البرمجة', 'Программирование', 'برنامه‌نویسی', 'प्रोग्रामिंग', 'Programación', 'Programmation', 'Programmazione', '编程'],
    'AI & ML': ['الذكاء الاصطناعي', 'ИИ и МО', 'هوش مصنوعی', 'एआई और एमएल', 'IA y AA', 'IA et ML', 'IA e ML', '人工智能'],
    'Data & Analytics': ['البيانات والتحليل', 'Данные и аналитика', 'داده و تحلیل', 'डेटा और एनालिटिक्स', 'Datos y análisis', 'Données et analyse', 'Dati e analisi', '数据分析'],
    'Web Development': ['تطوير الويب', 'Веб-разработка', 'توسعه وب', 'वेब डेवलपमेंट', 'Desarrollo web', 'Développement web', 'Sviluppo web', '网页开发'],
    'Business & Marketing': ['الأعمال والتسويق', 'Бизнес и маркетинг', 'کسب‌وکار و بازاریابی', 'बिज़नेस और मार्केटिंग', 'Negocios y marketing', 'Business et marketing', 'Business e marketing', '商业与营销'],
    'Design': ['التصميم', 'Дизайн', 'طراحی', 'डिज़ाइन', 'Diseño', 'Design', 'Design', '设计'],
    'IT & Software': ['تقنية المعلومات والبرمجيات', 'IT и софт', 'فناوری اطلاعات و نرم‌افزار', 'आईटी और सॉफ़्टवेयर', 'TI y software', 'Informatique et logiciels', 'IT e software', 'IT 与软件'],
    'Personal Development': ['التطوير الشخصي', 'Саморазвитие', 'توسعه فردی', 'व्यक्तिगत विकास', 'Desarrollo personal', 'Développement personnel', 'Sviluppo personale', '个人成长'],
    'Other': ['أخرى', 'Другое', 'سایر', 'अन्य', 'Otros', 'Autres', 'Altro', '其他'],
    'of {g} pts to the paid channel': ['من {g} نقطة للقناة المدفوعة', 'из {g} баллов до платного канала', 'از {g} امتیاز تا کانال ویژه', 'प्रीमियम चैनल के लिए {g} अंकों में से', 'de {g} pts para el canal de pago', 'sur {g} pts pour le canal payant', 'su {g} pt per il canale a pagamento', '距付费频道 {g} 积分'],
    'Your wallet': ['محفظتك', 'Ваш кошелёк', 'کیف پول شما', 'आपका वॉलेट', 'Tu cartera', 'Votre portefeuille', 'Il tuo portafoglio', '我的钱包'],
    'Leaderboard': ['لوحة المتصدرين', 'Таблица лидеров', 'جدول برترین‌ها', 'लीडरबोर्ड', 'Clasificación', 'Classement', 'Classifica', '排行榜'],
    'Saved courses': ['الدورات المحفوظة', 'Сохранённые курсы', 'دوره‌های ذخیره‌شده', 'सहेजे गए कोर्स', 'Cursos guardados', 'Cours enregistrés', 'Corsi salvati', '已收藏课程'],
    'Contact the owner': ['تواصل مع المالك', 'Связаться с владельцем', 'تماس با مالک', 'मालिक से संपर्क करें', 'Contactar al propietario', 'Contacter le propriétaire', 'Contatta il proprietario', '联系所有者'],
    'Invite friends': ['ادعُ أصدقاءك', 'Пригласить друзей', 'دعوت از دوستان', 'दोस्तों को आमंत्रित करें', 'Invita a amigos', 'Inviter des amis', 'Invita amici', '邀请好友'],
    'Watch ads': ['شاهد الإعلانات', 'Смотреть рекламу', 'تماشای تبلیغ', 'विज्ञापन देखें', 'Ver anuncios', 'Regarder des pubs', 'Guarda annunci', '观看广告'],
    'Daily challenge': ['التحدي اليومي', 'Задание дня', 'چالش روزانه', 'दैनिक चुनौती', 'Reto diario', 'Défi du jour', 'Sfida giornaliera', '每日挑战'],
    'Points': ['النقاط', 'Баллы', 'امتیاز', 'अंक', 'Puntos', 'Points', 'Punti', '积分'],
    'Rank': ['الترتيب', 'Место', 'رتبه', 'रैंक', 'Puesto', 'Rang', 'Posizione', '排名'],
    'Saved': ['المحفوظ', 'Сохранено', 'ذخیره‌شده', 'सहेजे गए', 'Guardados', 'Enregistrés', 'Salvati', '收藏'],
    'pts': ['نقطة', 'балл.', 'امتیاز', 'अंक', 'pts', 'pts', 'pt', '分'],
    'You': ['أنت', 'Вы', 'شما', 'आप', 'Tú', 'Vous', 'Tu', '你'],
    '❤️ Saved to your library': ['❤️ تم الحفظ في مكتبتك', '❤️ Сохранено в библиотеке', '❤️ در کتابخانه شما ذخیره شد', '❤️ आपकी लाइब्रेरी में सहेजा गया', '❤️ Guardado en tu biblioteca', '❤️ Enregistré dans votre bibliothèque', '❤️ Salvato nella tua libreria', '❤️ 已保存到你的收藏'],
    'Removed from saved': ['تمت الإزالة من المحفوظات', 'Удалено из сохранённых', 'از ذخیره‌شده‌ها حذف شد', 'सहेजे गए से हटाया गया', 'Eliminado de guardados', 'Retiré des enregistrés', 'Rimosso dai salvati', '已取消收藏'],
    'Language': ['اللغة', 'Язык', 'زبان', 'भाषा', 'Idioma', 'Langue', 'Lingua', '语言'],

    /* ── details.html / dl.html ── */
    'Course Details': ['تفاصيل الدورة', 'О курсе', 'جزئیات دوره', 'कोर्स विवरण', 'Detalles del curso', 'Détails du cours', 'Dettagli del corso', '课程详情'],
    'File Download': ['تنزيل الملف', 'Скачивание файла', 'دانلود فایل', 'फ़ाइल डाउनलोड', 'Descarga de archivo', 'Téléchargement du fichier', 'Download del file', '文件下载'],
    '100% free with coupon': ['مجاني 100% بالكوبون', '100% бесплатно по купону', '۱۰۰٪ رایگان با کوپن', 'कूपन से 100% मुफ़्त', '100 % gratis con cupón', '100 % gratuit avec coupon', '100% gratis con coupon', '使用优惠券 100% 免费'],
    '100% free download': ['تنزيل مجاني 100%', '100% бесплатная загрузка', 'دانلود ۱۰۰٪ رایگان', '100% मुफ़्त डाउनलोड', 'Descarga 100 % gratis', 'Téléchargement 100 % gratuit', 'Download 100% gratuito', '100% 免费下载'],
    '100% FREE': ['مجاني 100%', '100% БЕСПЛАТНО', '۱۰۰٪ رایگان', '100% मुफ़्त', '100 % GRATIS', '100 % GRATUIT', '100% GRATIS', '100% 免费'],
    'Your balance': ['رصيدك', 'Ваш баланс', 'موجودی شما', 'आपका बैलेंस', 'Tu saldo', 'Votre solde', 'Il tuo saldo', '我的余额'],
    'of {g} pts': ['من {g} نقطة', 'из {g} баллов', 'از {g} امتیاز', '{g} अंकों में से', 'de {g} pts', 'sur {g} pts', 'su {g} pt', '共 {g} 积分'],
    'Watch Ad {n}': ['شاهد الإعلان {n}', 'Смотреть рекламу {n}', 'تماشای تبلیغ {n}', 'विज्ञापन {n} देखें', 'Ver anuncio {n}', 'Voir la pub {n}', 'Guarda annuncio {n}', '观看广告 {n}'],
    'Ad {n}': ['الإعلان {n}', 'Реклама {n}', 'تبلیغ {n}', 'विज्ञापन {n}', 'Anuncio {n}', 'Pub {n}', 'Annuncio {n}', '广告 {n}'],
    'Loading ad…': ['جارٍ تحميل الإعلان…', 'Загрузка рекламы…', 'در حال بارگذاری تبلیغ…', 'विज्ञापन लोड हो रहा है…', 'Cargando anuncio…', 'Chargement de la pub…', 'Caricamento annuncio…', '广告加载中…'],
    'please wait': ['يرجى الانتظار', 'подождите', 'لطفاً صبر کنید', 'कृपया प्रतीक्षा करें', 'espera', 'patientez', 'attendi', '请稍候'],
    'Ad {n} done': ['تم الإعلان {n}', 'Реклама {n} просмотрена', 'تبلیغ {n} انجام شد', 'विज्ञापन {n} पूरा', 'Anuncio {n} listo', 'Pub {n} terminée', 'Annuncio {n} fatto', '广告 {n} 完成'],
    'Retry Ad {n}': ['أعد الإعلان {n}', 'Повторить рекламу {n}', 'تلاش مجدد تبلیغ {n}', 'विज्ञापन {n} फिर आज़माएँ', 'Reintentar anuncio {n}', 'Réessayer la pub {n}', 'Riprova annuncio {n}', '重试广告 {n}'],
    'ad unavailable': ['الإعلان غير متاح', 'реклама недоступна', 'تبلیغ در دسترس نیست', 'विज्ञापन उपलब्ध नहीं', 'anuncio no disponible', 'pub indisponible', 'annuncio non disponibile', '广告不可用'],
    '+{n} pts': ['+{n} نقطة', '+{n} балл.', '+{n} امتیاز', '+{n} अंक', '+{n} pts', '+{n} pts', '+{n} pt', '+{n} 积分'],
    '+{n} pts earned': ['+{n} نقطة مكتسبة', '+{n} баллов получено', '+{n} امتیاز کسب شد', '+{n} अंक मिले', '+{n} pts ganados', '+{n} pts gagnés', '+{n} pt guadagnati', '已获得 +{n} 积分'],
    '+{n} pts available': ['+{n} نقطة متاحة', 'доступно +{n} баллов', '+{n} امتیاز قابل کسب', '+{n} अंक उपलब्ध', '+{n} pts disponibles', '+{n} pts disponibles', '+{n} pt disponibili', '可得 +{n} 积分'],
    'Finish Ad 1 first': ['أكمل الإعلان 1 أولاً', 'Сначала досмотрите рекламу 1', 'ابتدا تبلیغ ۱ را تمام کنید', 'पहले विज्ञापन 1 पूरा करें', 'Termina primero el anuncio 1', 'Terminez d’abord la pub 1', 'Prima completa l’annuncio 1', '请先完成广告 1'],
    'Complete Step 1 first': ['أكمل الخطوة 1 أولاً', 'Сначала выполните шаг 1', 'ابتدا مرحله ۱ را کامل کنید', 'पहले चरण 1 पूरा करें', 'Completa primero el paso 1', 'Terminez d’abord l’étape 1', 'Prima completa il passo 1', '请先完成第 1 步'],
    'Unlocks after both ads': ['يُفتح بعد الإعلانين', 'Откроется после двух реклам', 'پس از هر دو تبلیغ باز می‌شود', 'दोनों विज्ञापनों के बाद खुलेगा', 'Se desbloquea tras ambos anuncios', 'Se débloque après les deux pubs', 'Si sblocca dopo entrambi gli annunci', '看完两个广告后解锁'],
    'Tap “Watch Ad {n}” below': ['اضغط «شاهد الإعلان {n}» بالأسفل', 'Нажмите «Смотреть рекламу {n}» ниже', 'روی «تماشای تبلیغ {n}» در پایین بزنید', 'नीचे “विज्ञापन {n} देखें” दबाएँ', 'Toca «Ver anuncio {n}» abajo', 'Appuyez sur « Voir la pub {n} » ci-dessous', 'Tocca «Guarda annuncio {n}» qui sotto', '点击下方“观看广告 {n}”'],
    'Step 1 of 2 · watch Ad 1': ['الخطوة 1 من 2 · شاهد الإعلان 1', 'Шаг 1 из 2 · реклама 1', 'مرحله ۱ از ۲ · تبلیغ ۱', 'चरण 1/2 · विज्ञापन 1 देखें', 'Paso 1 de 2 · ver anuncio 1', 'Étape 1 sur 2 · pub 1', 'Passo 1 di 2 · annuncio 1', '第 1/2 步 · 观看广告 1'],
    'Step 2 of 2 · watch Ad 2': ['الخطوة 2 من 2 · شاهد الإعلان 2', 'Шаг 2 из 2 · реклама 2', 'مرحله ۲ از ۲ · تبلیغ ۲', 'चरण 2/2 · विज्ञापन 2 देखें', 'Paso 2 de 2 · ver anuncio 2', 'Étape 2 sur 2 · pub 2', 'Passo 2 di 2 · annuncio 2', '第 2/2 步 · 观看广告 2'],
    '✓ Both ads completed': ['✓ اكتمل الإعلانان', '✓ Обе рекламы просмотрены', '✓ هر دو تبلیغ تمام شد', '✓ दोनों विज्ञापन पूरे', '✓ Ambos anuncios completados', '✓ Les deux pubs sont terminées', '✓ Entrambi gli annunci completati', '✓ 两个广告均已完成'],
    'Enroll on Udemy': ['سجّل في Udemy', 'Записаться на Udemy', 'ثبت‌نام در Udemy', 'Udemy पर नामांकन करें', 'Inscríbete en Udemy', 'S’inscrire sur Udemy', 'Iscriviti su Udemy', '在 Udemy 报名'],
    'Download your file': ['نزّل ملفك', 'Скачайте файл', 'فایل خود را دانلود کنید', 'अपनी फ़ाइल डाउनलोड करें', 'Descarga tu archivo', 'Téléchargez votre fichier', 'Scarica il tuo file', '下载你的文件'],
    'Unlock your free enrollment': ['افتح تسجيلك المجاني', 'Откройте бесплатную запись', 'ثبت‌نام رایگان خود را باز کنید', 'अपना मुफ़्त नामांकन अनलॉक करें', 'Desbloquea tu inscripción gratis', 'Débloquez votre inscription gratuite', 'Sblocca l’iscrizione gratuita', '解锁免费报名'],
    'Unlock your free download': ['افتح تنزيلك المجاني', 'Откройте бесплатную загрузку', 'دانلود رایگان خود را باز کنید', 'अपना मुफ़्त डाउनलोड अनलॉक करें', 'Desbloquea tu descarga gratis', 'Débloquez votre téléchargement gratuit', 'Sblocca il download gratuito', '解锁免费下载'],
    'Watch two short ads, then continue to Udemy. The ad buttons stay pinned at the bottom while you read the details.': ['شاهد إعلانين قصيرين ثم تابع إلى Udemy. تبقى أزرار الإعلانات مثبتة بالأسفل أثناء قراءتك للتفاصيل.', 'Посмотрите две короткие рекламы и переходите на Udemy. Кнопки рекламы закреплены внизу, пока вы читаете.', 'دو تبلیغ کوتاه ببینید و سپس به Udemy بروید. دکمه‌های تبلیغ هنگام مطالعه در پایین ثابت می‌مانند.', 'दो छोटे विज्ञापन देखें, फिर Udemy पर जाएँ। विवरण पढ़ते समय विज्ञापन बटन नीचे टिके रहते हैं।', 'Mira dos anuncios cortos y continúa a Udemy. Los botones quedan fijos abajo mientras lees.', 'Regardez deux courtes pubs puis passez à Udemy. Les boutons restent épinglés en bas pendant la lecture.', 'Guarda due brevi annunci e continua su Udemy. I pulsanti restano fissi in basso mentre leggi.', '观看两个短广告后前往 Udemy。阅读详情时，广告按钮会固定在底部。'],
    'Watch two short ads, then download the file instantly. The ad buttons stay pinned at the bottom while you read.': ['شاهد إعلانين قصيرين ثم نزّل الملف فوراً. تبقى أزرار الإعلانات مثبتة بالأسفل أثناء القراءة.', 'Посмотрите две короткие рекламы и сразу скачайте файл. Кнопки рекламы закреплены внизу, пока вы читаете.', 'دو تبلیغ کوتاه ببینید و فوراً فایل را دانلود کنید. دکمه‌های تبلیغ هنگام مطالعه در پایین ثابت می‌مانند.', 'दो छोटे विज्ञापन देखें, फिर फ़ाइल तुरंत डाउनलोड करें। पढ़ते समय विज्ञापन बटन नीचे टिके रहते हैं।', 'Mira dos anuncios cortos y descarga el archivo al instante. Los botones quedan fijos abajo mientras lees.', 'Regardez deux courtes pubs puis téléchargez le fichier instantanément. Les boutons restent épinglés en bas.', 'Guarda due brevi annunci e scarica subito il file. I pulsanti restano fissi in basso mentre leggi.', '观看两个短广告后即可立即下载文件。阅读时，广告按钮会固定在底部。'],
    '🚀 Enroll Free Now': ['🚀 سجّل مجاناً الآن', '🚀 Записаться бесплатно', '🚀 همین حالا رایگان ثبت‌نام کنید', '🚀 अभी मुफ़्त नामांकन करें', '🚀 Inscríbete gratis ya', '🚀 S’inscrire gratuitement', '🚀 Iscriviti gratis ora', '🚀 立即免费报名'],
    '📥 Download File Free': ['📥 نزّل الملف مجاناً', '📥 Скачать файл бесплатно', '📥 دانلود رایگان فایل', '📥 फ़ाइल मुफ़्त डाउनलोड करें', '📥 Descargar archivo gratis', '📥 Télécharger gratuitement', '📥 Scarica il file gratis', '📥 免费下载文件'],
    'Tap “Enroll Free Now” below': ['اضغط «سجّل مجاناً الآن» بالأسفل', 'Нажмите «Записаться бесплатно» ниже', 'روی «همین حالا رایگان ثبت‌نام کنید» بزنید', 'नीचे “अभी मुफ़्त नामांकन करें” दबाएँ', 'Toca «Inscríbete gratis ya» abajo', 'Appuyez sur « S’inscrire gratuitement »', 'Tocca «Iscriviti gratis ora» qui sotto', '点击下方“立即免费报名”'],
    'Tap “Download File Free” below': ['اضغط «نزّل الملف مجاناً» بالأسفل', 'Нажмите «Скачать файл бесплатно» ниже', 'روی «دانلود رایگان فایل» بزنید', 'नीचे “फ़ाइल मुफ़्त डाउनलोड करें” दबाएँ', 'Toca «Descargar archivo gratis» abajo', 'Appuyez sur « Télécharger gratuitement »', 'Tocca «Scarica il file gratis» qui sotto', '点击下方“免费下载文件”'],
    '🎉 You\'re all set! Tap “Enroll Free Now” below.': ['🎉 كل شيء جاهز! اضغط «سجّل مجاناً الآن» بالأسفل.', '🎉 Всё готово! Нажмите «Записаться бесплатно» ниже.', '🎉 همه‌چیز آماده است! روی «همین حالا رایگان ثبت‌نام کنید» بزنید.', '🎉 सब तैयार है! नीचे “अभी मुफ़्त नामांकन करें” दबाएँ।', '🎉 ¡Todo listo! Toca «Inscríbete gratis ya» abajo.', '🎉 Tout est prêt ! Appuyez sur « S’inscrire gratuitement ».', '🎉 Tutto pronto! Tocca «Iscriviti gratis ora» qui sotto.', '🎉 全部完成！点击下方“立即免费报名”。'],
    '🎉 You\'re all set! Tap “Download File Free” below.': ['🎉 كل شيء جاهز! اضغط «نزّل الملف مجاناً» بالأسفل.', '🎉 Всё готово! Нажмите «Скачать файл бесплатно» ниже.', '🎉 همه‌چیز آماده است! روی «دانلود رایگان فایل» بزنید.', '🎉 सब तैयार है! नीचे “फ़ाइल मुफ़्त डाउनलोड करें” दबाएँ।', '🎉 ¡Todo listo! Toca «Descargar archivo gratis» abajo.', '🎉 Tout est prêt ! Appuyez sur « Télécharger gratuitement ».', '🎉 Tutto pronto! Tocca «Scarica il file gratis» qui sotto.', '🎉 全部完成！点击下方“免费下载文件”。'],
    '🎯 Related Courses': ['🎯 دورات ذات صلة', '🎯 Похожие курсы', '🎯 دوره‌های مرتبط', '🎯 संबंधित कोर्स', '🎯 Cursos relacionados', '🎯 Cours similaires', '🎯 Corsi correlati', '🎯 相关课程'],
    '🆕 Latest Courses': ['🆕 أحدث الدورات', '🆕 Новые курсы', '🆕 جدیدترین دوره‌ها', '🆕 नवीनतम कोर्स', '🆕 Últimos cursos', '🆕 Derniers cours', '🆕 Ultimi corsi', '🆕 最新课程'],
    '📲 Join Our WhatsApp Channel': ['📲 انضم إلى قناتنا على واتساب', '📲 Подписаться на наш канал WhatsApp', '📲 به کانال واتساپ ما بپیوندید', '📲 हमारे WhatsApp चैनल से जुड़ें', '📲 Únete a nuestro canal de WhatsApp', '📲 Rejoignez notre chaîne WhatsApp', '📲 Unisciti al nostro canale WhatsApp', '📲 加入我们的 WhatsApp 频道'],
    '📢 Join Pixel Channel': ['📢 انضم إلى قناة Pixel', '📢 Подписаться на канал Pixel', '📢 به کانال Pixel بپیوندید', '📢 Pixel चैनल से जुड़ें', '📢 Únete al canal Pixel', '📢 Rejoignez la chaîne Pixel', '📢 Unisciti al canale Pixel', '📢 加入 Pixel 频道']
  };

  /* ── Part 2: remaining UI strings (earn / board / profile / toasts / notes) ── */
  Object.assign(S, {
    'Open this app inside Telegram to save courses.': ['افتح التطبيق داخل تيليجرام لحفظ الدورات.', 'Откройте приложение в Telegram, чтобы сохранять курсы.', 'برای ذخیره دوره‌ها برنامه را داخل تلگرام باز کنید.', 'कोर्स सहेजने के लिए ऐप को टेलीग्राम में खोलें।', 'Abre la app dentro de Telegram para guardar cursos.', 'Ouvrez l’app dans Telegram pour enregistrer des cours.', 'Apri l’app in Telegram per salvare i corsi.', '请在 Telegram 内打开应用以收藏课程。'],
    'Open this page inside Telegram to save courses.': ['افتح الصفحة داخل تيليجرام لحفظ الدورات.', 'Откройте страницу в Telegram, чтобы сохранять курсы.', 'برای ذخیره دوره‌ها صفحه را داخل تلگرام باز کنید.', 'कोर्स सहेजने के लिए पेज को टेलीग्राम में खोलें।', 'Abre la página dentro de Telegram para guardar cursos.', 'Ouvrez la page dans Telegram pour enregistrer des cours.', 'Apri la pagina in Telegram per salvare i corsi.', '请在 Telegram 内打开页面以收藏课程。'],
    'This course can’t be saved.': ['لا يمكن حفظ هذه الدورة.', 'Этот курс нельзя сохранить.', 'این دوره قابل ذخیره نیست.', 'यह कोर्स सहेजा नहीं जा सकता।', 'Este curso no se puede guardar.', 'Ce cours ne peut pas être enregistré.', 'Questo corso non può essere salvato.', '无法收藏此课程。'],
    'Loading… try again in a moment.': ['جارٍ التحميل… حاول بعد لحظات.', 'Загрузка… попробуйте через мгновение.', 'در حال بارگذاری… چند لحظه بعد تلاش کنید.', 'लोड हो रहा है… थोड़ी देर में फिर कोशिश करें।', 'Cargando… inténtalo en un momento.', 'Chargement… réessayez dans un instant.', 'Caricamento… riprova tra un momento.', '加载中…请稍后再试。'],
    'Could not update saved courses. Try again.': ['تعذّر تحديث الدورات المحفوظة. حاول مرة أخرى.', 'Не удалось обновить сохранённые курсы. Попробуйте ещё раз.', 'به‌روزرسانی دوره‌های ذخیره‌شده ممکن نشد. دوباره تلاش کنید.', 'सहेजे गए कोर्स अपडेट नहीं हो सके। फिर कोशिश करें।', 'No se pudieron actualizar los guardados. Inténtalo de nuevo.', 'Impossible de mettre à jour les enregistrés. Réessayez.', 'Impossibile aggiornare i salvati. Riprova.', '无法更新收藏，请重试。'],
    'Open this app inside Telegram to earn points.': ['افتح التطبيق داخل تيليجرام لكسب النقاط.', 'Откройте приложение в Telegram, чтобы зарабатывать баллы.', 'برای کسب امتیاز برنامه را داخل تلگرام باز کنید.', 'अंक कमाने के लिए ऐप को टेलीग्राम में खोलें।', 'Abre la app dentro de Telegram para ganar puntos.', 'Ouvrez l’app dans Telegram pour gagner des points.', 'Apri l’app in Telegram per guadagnare punti.', '请在 Telegram 内打开应用以赚取积分。'],
    '🏆 10,000 reached! Check your chat with the bot for your invite.': ['🏆 وصلت إلى 10,000! تحقق من محادثتك مع البوت للحصول على الدعوة.', '🏆 10 000 набрано! Ищите приглашение в чате с ботом.', '🏆 به ۱۰٬۰۰۰ رسیدید! دعوت‌نامه را در چت با ربات ببینید.', '🏆 10,000 पूरे! अपना आमंत्रण बॉट की चैट में देखें।', '🏆 ¡Llegaste a 10 000! Revisa tu chat con el bot para ver tu invitación.', '🏆 10 000 atteints ! Consultez votre chat avec le bot pour l’invitation.', '🏆 Raggiunti 10.000! Controlla la chat con il bot per l’invito.', '🏆 已达 10,000！请在与机器人的聊天中查看邀请。'],
    '+{n} points added': ['تمت إضافة {n} نقطة', 'Добавлено баллов: {n}', '{n} امتیاز اضافه شد', '{n} अंक जुड़े', 'Se añadieron {n} puntos', '{n} points ajoutés', 'Aggiunti {n} punti', '已添加 {n} 积分'],
    'Daily ad limit reached ({a}/{c}). Come back tomorrow!': ['بلغت حد الإعلانات اليومي ({a}/{c}). عُد غداً!', 'Дневной лимит рекламы исчерпан ({a}/{c}). Возвращайтесь завтра!', 'به سقف روزانه تبلیغ رسیدید ({a}/{c}). فردا برگردید!', 'दैनिक विज्ञापन सीमा पूरी ({a}/{c})। कल फिर आएँ!', 'Límite diario de anuncios alcanzado ({a}/{c}). ¡Vuelve mañana!', 'Limite quotidienne de pubs atteinte ({a}/{c}). Revenez demain !', 'Limite giornaliero annunci raggiunto ({a}/{c}). Torna domani!', '今日广告次数已达上限（{a}/{c}），明天再来！'],
    'Daily ad limit reached. Come back tomorrow!': ['بلغت حد الإعلانات اليومي. عُد غداً!', 'Дневной лимит рекламы исчерпан. Возвращайтесь завтра!', 'به سقف روزانه تبلیغ رسیدید. فردا برگردید!', 'दैनिक विज्ञापन सीमा पूरी। कल फिर आएँ!', 'Límite diario de anuncios alcanzado. ¡Vuelve mañana!', 'Limite quotidienne de pubs atteinte. Revenez demain !', 'Limite giornaliero annunci raggiunto. Torna domani!', '今日广告次数已达上限，明天再来！'],
    'Almost there — wait {s}s before the next ad.': ['اقتربت — انتظر {s} ثانية قبل الإعلان التالي.', 'Почти готово — подождите {s} с до следующей рекламы.', 'تقریباً رسیدید — {s} ثانیه تا تبلیغ بعدی صبر کنید.', 'लगभग हो गया — अगले विज्ञापन से पहले {s} सेकंड रुकें।', 'Casi — espera {s} s antes del siguiente anuncio.', 'Presque — attendez {s} s avant la prochaine pub.', 'Quasi fatto — attendi {s} s prima del prossimo annuncio.', '快好了——请等待 {s} 秒再看下一个广告。'],
    'Could not add points. Reopen the app from the bot.': ['تعذّرت إضافة النقاط. أعد فتح التطبيق من البوت.', 'Не удалось начислить баллы. Откройте приложение заново из бота.', 'افزودن امتیاز ممکن نشد. برنامه را دوباره از ربات باز کنید.', 'अंक नहीं जुड़ सके। ऐप को बॉट से फिर खोलें।', 'No se pudieron añadir los puntos. Reabre la app desde el bot.', 'Impossible d’ajouter les points. Rouvrez l’app depuis le bot.', 'Impossibile aggiungere i punti. Riapri l’app dal bot.', '无法添加积分，请从机器人重新打开应用。'],
    'Rewards are not available right now.': ['المكافآت غير متاحة حالياً.', 'Награды сейчас недоступны.', 'جوایز در حال حاضر در دسترس نیست.', 'अभी रिवॉर्ड उपलब्ध नहीं हैं।', 'Las recompensas no están disponibles ahora.', 'Les récompenses sont indisponibles pour le moment.', 'I premi non sono disponibili al momento.', '奖励暂不可用。'],
    'Ads are unavailable right now. Try again in a moment.': ['الإعلانات غير متاحة حالياً. حاول بعد قليل.', 'Реклама сейчас недоступна. Попробуйте чуть позже.', 'تبلیغ‌ها در حال حاضر در دسترس نیستند. کمی بعد تلاش کنید.', 'अभी विज्ञापन उपलब्ध नहीं हैं। थोड़ी देर में फिर कोशिश करें।', 'Los anuncios no están disponibles ahora. Inténtalo en un momento.', 'Les pubs sont indisponibles. Réessayez dans un instant.', 'Gli annunci non sono disponibili. Riprova tra poco.', '广告暂不可用，请稍后再试。'],
    'No ad available right now — try again shortly.': ['لا يوجد إعلان متاح الآن — حاول بعد قليل.', 'Сейчас нет доступной рекламы — попробуйте позже.', 'اکنون تبلیغی موجود نیست — کمی بعد تلاش کنید.', 'अभी कोई विज्ञापन उपलब्ध नहीं — थोड़ी देर में फिर कोशिश करें।', 'No hay anuncios disponibles — inténtalo pronto.', 'Aucune pub disponible — réessayez bientôt.', 'Nessun annuncio disponibile — riprova a breve.', '暂无可用广告——请稍后再试。'],
    'Open this app inside Telegram to get your link.': ['افتح التطبيق داخل تيليجرام للحصول على رابطك.', 'Откройте приложение в Telegram, чтобы получить ссылку.', 'برای دریافت پیوند خود برنامه را داخل تلگرام باز کنید.', 'अपना लिंक पाने के लिए ऐप को टेलीग्राम में खोलें।', 'Abre la app dentro de Telegram para obtener tu enlace.', 'Ouvrez l’app dans Telegram pour obtenir votre lien.', 'Apri l’app in Telegram per ottenere il tuo link.', '请在 Telegram 内打开应用以获取你的链接。'],
    'Invite link copied': ['تم نسخ رابط الدعوة', 'Ссылка-приглашение скопирована', 'پیوند دعوت کپی شد', 'आमंत्रण लिंक कॉपी हुआ', 'Enlace de invitación copiado', 'Lien d’invitation copié', 'Link d’invito copiato', '邀请链接已复制'],
    '🎓 Free Udemy courses every day — join me and earn rewards!': ['🎓 دورات Udemy مجانية كل يوم — انضم إليّ واكسب المكافآت!', '🎓 Бесплатные курсы Udemy каждый день — присоединяйтесь и получайте награды!', '🎓 هر روز دوره‌های رایگان Udemy — به من بپیوندید و جایزه بگیرید!', '🎓 हर दिन मुफ़्त Udemy कोर्स — मेरे साथ जुड़ें और इनाम पाएँ!', '🎓 Cursos gratis de Udemy cada día — ¡únete y gana recompensas!', '🎓 Des cours Udemy gratuits chaque jour — rejoignez-moi et gagnez des récompenses !', '🎓 Corsi Udemy gratuiti ogni giorno — unisciti a me e vinci premi!', '🎓 每天免费 Udemy 课程——和我一起加入赢奖励！'],
    '🔥 Day {n} streak! +{b} bonus points': ['🔥 سلسلة اليوم {n}! +{b} نقطة مكافأة', '🔥 Серия: день {n}! +{b} бонусных баллов', '🔥 روز {n} پیاپی! +{b} امتیاز جایزه', '🔥 दिन {n} की स्ट्रीक! +{b} बोनस अंक', '🔥 ¡Racha de {n} días! +{b} puntos extra', '🔥 Série de {n} jours ! +{b} points bonus', '🔥 Serie di {n} giorni! +{b} punti bonus', '🔥 连续 {n} 天！+{b} 奖励积分'],
    '🔥 Streak started — come back tomorrow for +{b} points': ['🔥 بدأت سلسلتك — عُد غداً لتحصل على +{b} نقطة', '🔥 Серия началась — вернитесь завтра за +{b} баллов', '🔥 رشته شروع شد — فردا برای +{b} امتیاز برگردید', '🔥 स्ट्रीक शुरू — कल +{b} अंकों के लिए आएँ', '🔥 Racha iniciada — vuelve mañana por +{b} puntos', '🔥 Série lancée — revenez demain pour +{b} points', '🔥 Serie iniziata — torna domani per +{b} punti', '🔥 连续签到开始——明天再来领 +{b} 积分'],
    '🔥 {n}-day streak · come back tomorrow for +{b} points': ['🔥 سلسلة {n} يوماً · عُد غداً لتحصل على +{b} نقطة', '🔥 Серия {n} дн. · завтра +{b} баллов', '🔥 رشتهٔ {n} روزه · فردا +{b} امتیاز', '🔥 {n} दिन की स्ट्रीक · कल +{b} अंक पाएँ', '🔥 Racha de {n} días · mañana +{b} puntos', '🔥 Série de {n} jours · demain +{b} points', '🔥 Serie di {n} giorni · domani +{b} punti', '🔥 连续 {n} 天 · 明天可得 +{b} 积分'],
    'Best streak: {n} days': ['أفضل سلسلة: {n} يوماً', 'Лучшая серия: {n} дн.', 'بهترین رشته: {n} روز', 'सर्वश्रेष्ठ स्ट्रीक: {n} दिन', 'Mejor racha: {n} días', 'Meilleure série : {n} jours', 'Serie migliore: {n} giorni', '最长连续：{n} 天'],
    'Try a different keyword.': ['جرّب كلمة مختلفة.', 'Попробуйте другое слово.', 'کلمهٔ دیگری امتحان کنید.', 'कोई दूसरा शब्द आज़माएँ।', 'Prueba otra palabra.', 'Essayez un autre mot-clé.', 'Prova un’altra parola.', '换个关键词试试。'],
    'Try another category, or pick "All" for the full list.': ['جرّب تصنيفاً آخر أو اختر «الكل» لعرض القائمة كاملة.', 'Выберите другую категорию или «Все», чтобы увидеть весь список.', 'دسته‌بندی دیگری را امتحان کنید یا «همه» را برای فهرست کامل بزنید.', 'दूसरी श्रेणी आज़माएँ या पूरी सूची के लिए “सभी” चुनें।', 'Prueba otra categoría o elige «Todo» para ver la lista completa.', 'Essayez une autre catégorie ou choisissez « Tout » pour la liste complète.', 'Prova un’altra categoria o scegli «Tutti» per l’elenco completo.', '试试其他分类，或选择“全部”查看完整列表。'],
    'No courses in this category yet': ['لا توجد دورات في هذا التصنيف بعد', 'В этой категории пока нет курсов', 'هنوز دوره‌ای در این دسته نیست', 'इस श्रेणी में अभी कोई कोर्स नहीं', 'Aún no hay cursos en esta categoría', 'Aucun cours dans cette catégorie pour l’instant', 'Ancora nessun corso in questa categoria', '该分类暂无课程'],
    'No courses right now': ['لا توجد دورات حالياً', 'Сейчас нет курсов', 'در حال حاضر دوره‌ای نیست', 'अभी कोई कोर्स नहीं', 'No hay cursos ahora', 'Aucun cours pour le moment', 'Nessun corso al momento', '暂无课程'],
    'New free courses are added throughout the day — check back soon.': ['تُضاف دورات مجانية جديدة على مدار اليوم — عُد قريباً.', 'Новые бесплатные курсы добавляются в течение дня — загляните позже.', 'دوره‌های رایگان جدید در طول روز اضافه می‌شوند — بعداً سر بزنید.', 'दिन भर नए मुफ़्त कोर्स जुड़ते रहते हैं — जल्द फिर देखें।', 'Se añaden cursos gratis durante todo el día — vuelve pronto.', 'De nouveaux cours gratuits arrivent toute la journée — revenez vite.', 'Nuovi corsi gratuiti arrivano durante il giorno — torna presto.', '全天都有新的免费课程上线——稍后再来看看。'],
    'Check your connection and try again.': ['تحقق من اتصالك وحاول مرة أخرى.', 'Проверьте подключение и попробуйте снова.', 'اتصال خود را بررسی و دوباره تلاش کنید.', 'अपना कनेक्शन जाँचें और फिर कोशिश करें।', 'Revisa tu conexión e inténtalo de nuevo.', 'Vérifiez votre connexion et réessayez.', 'Controlla la connessione e riprova.', '请检查网络后重试。'],
    'Save course': ['حفظ الدورة', 'Сохранить курс', 'ذخیره دوره', 'कोर्स सहेजें', 'Guardar curso', 'Enregistrer le cours', 'Salva corso', '收藏课程'],
    'Paid channel pass': ['تصريح القناة المدفوعة', 'Пропуск в платный канал', 'مجوز کانال ویژه', 'प्रीमियम चैनल पास', 'Pase al canal de pago', 'Pass du canal payant', 'Pass del canale a pagamento', '付费频道通行证'],
    'Unlocked — enjoy the paid channel': ['تم الفتح — استمتع بالقناة المدفوعة', 'Открыто — наслаждайтесь платным каналом', 'باز شد — از کانال ویژه لذت ببرید', 'अनलॉक — प्रीमियम चैनल का आनंद लें', 'Desbloqueado — disfruta del canal de pago', 'Débloqué — profitez du canal payant', 'Sbloccato — goditi il canale a pagamento', '已解锁——尽情享受付费频道'],
    '{g} points unlock it free': ['{g} نقطة تفتحه مجاناً', '{g} баллов — и он бесплатно ваш', '{g} امتیاز آن را رایگان باز می‌کند', '{g} अंक इसे मुफ़्त अनलॉक करते हैं', '{g} puntos lo desbloquean gratis', '{g} points le débloquent gratuitement', '{g} punti lo sbloccano gratis', '{g} 积分免费解锁'],
    'Your invite link was sent to your chat with the bot.': ['أُرسل رابط دعوتك إلى محادثتك مع البوت.', 'Ссылка-приглашение отправлена в ваш чат с ботом.', 'پیوند دعوت شما در چت با ربات ارسال شد.', 'आपका आमंत्रण लिंक बॉट की चैट में भेज दिया गया है।', 'Tu enlace de invitación se envió a tu chat con el bot.', 'Votre lien d’invitation a été envoyé dans votre chat avec le bot.', 'Il tuo link d’invito è stato inviato nella chat con il bot.', '邀请链接已发送到你与机器人的聊天中。'],
    '<b>{n} points to go.</b> Learning worth up to $10,000, on us.': ['<b>متبقي {n} نقطة.</b> تعلّم بقيمة تصل إلى 10,000$ على حسابنا.', '<b>Осталось {n} баллов.</b> Обучение на сумму до $10 000 — за наш счёт.', '<b>{n} امتیاز دیگر.</b> یادگیری تا ۱۰٬۰۰۰ دلار، از طرف ما.', '<b>{n} अंक बाकी।</b> $10,000 तक की सीख, हमारी ओर से।', '<b>Faltan {n} puntos.</b> Aprendizaje por hasta 10 000 $, cortesía nuestra.', '<b>Encore {n} points.</b> Jusqu’à 10 000 $ de formation, offerts.', '<b>Mancano {n} punti.</b> Formazione fino a 10.000 $, offerta da noi.', '<b>还差 {n} 积分。</b>价值高达 $10,000 的学习，由我们买单。'],
    'of {g}': ['من {g}', 'из {g}', 'از {g}', '{g} में से', 'de {g}', 'sur {g}', 'su {g}', '共 {g}'],
    'Open my chat with the bot': ['افتح محادثتي مع البوت', 'Открыть мой чат с ботом', 'باز کردن چت من با ربات', 'बॉट के साथ मेरी चैट खोलें', 'Abrir mi chat con el bot', 'Ouvrir mon chat avec le bot', 'Apri la mia chat con il bot', '打开我与机器人的聊天'],
    'From ads': ['من الإعلانات', 'За рекламу', 'از تبلیغ‌ها', 'विज्ञापनों से', 'Por anuncios', 'Via les pubs', 'Dagli annunci', '来自广告'],
    'From invites': ['من الدعوات', 'За приглашения', 'از دعوت‌ها', 'आमंत्रणों से', 'Por invitaciones', 'Via les invitations', 'Dagli inviti', '来自邀请'],
    'From quizzes': ['من الاختبارات', 'За викторины', 'از آزمون‌ها', 'क्विज़ से', 'Por cuestionarios', 'Via les quiz', 'Dai quiz', '来自测验'],
    'Three ways to earn. Reach {g} points for a free paid-channel membership.': ['ثلاث طرق للربح. اجمع {g} نقطة لتحصل على عضوية القناة المدفوعة مجاناً.', 'Три способа заработать. Наберите {g} баллов — и получите бесплатный доступ к платному каналу.', 'سه راه برای کسب امتیاز. با رسیدن به {g} امتیاز، عضویت رایگان کانال ویژه را بگیرید.', 'कमाने के तीन तरीके। {g} अंक पर प्रीमियम चैनल की मुफ़्त सदस्यता पाएँ।', 'Tres formas de ganar. Alcanza {g} puntos y obtén gratis el canal de pago.', 'Trois façons de gagner. Atteignez {g} points pour un accès gratuit au canal payant.', 'Tre modi per guadagnare. Raggiungi {g} punti per l’accesso gratuito al canale a pagamento.', '三种赚取方式。达到 {g} 积分即可免费加入付费频道。'],
    'You are browsing outside Telegram. Open this app from <b>@{bot}</b> to collect and track your points.': ['أنت تتصفح خارج تيليجرام. افتح التطبيق من <b>@{bot}</b> لجمع نقاطك ومتابعتها.', 'Вы вне Telegram. Откройте приложение из <b>@{bot}</b>, чтобы копить и отслеживать баллы.', 'شما بیرون از تلگرام هستید. برای جمع و پیگیری امتیازها برنامه را از <b>@{bot}</b> باز کنید.', 'आप टेलीग्राम के बाहर हैं। अंक जमा और ट्रैक करने के लिए ऐप को <b>@{bot}</b> से खोलें।', 'Estás fuera de Telegram. Abre la app desde <b>@{bot}</b> para acumular y seguir tus puntos.', 'Vous êtes hors de Telegram. Ouvrez l’app depuis <b>@{bot}</b> pour cumuler et suivre vos points.', 'Sei fuori da Telegram. Apri l’app da <b>@{bot}</b> per raccogliere e seguire i tuoi punti.', '你当前不在 Telegram 中。请从 <b>@{bot}</b> 打开应用以累积并查看积分。'],
    'Rewards are warming up. Pull this page again in a moment — your points are safe.': ['المكافآت قيد التجهيز. أعد تحميل الصفحة بعد قليل — نقاطك بأمان.', 'Награды загружаются. Обновите страницу чуть позже — ваши баллы в безопасности.', 'جوایز در حال آماده‌سازی است. کمی بعد صفحه را دوباره بارگذاری کنید — امتیازهایتان امن است.', 'रिवॉर्ड तैयार हो रहे हैं। थोड़ी देर में पेज फिर लोड करें — आपके अंक सुरक्षित हैं।', 'Las recompensas se están preparando. Recarga en un momento — tus puntos están a salvo.', 'Les récompenses se préparent. Actualisez dans un instant — vos points sont en sécurité.', 'I premi si stanno preparando. Ricarica tra poco — i tuoi punti sono al sicuro.', '奖励正在准备中，请稍后刷新页面——你的积分是安全的。'],
    'Correct today — +{n} earned': ['إجابة صحيحة اليوم — كسبت +{n}', 'Сегодня верно — получено +{n}', 'امروز درست بود — +{n} کسب شد', 'आज सही — +{n} मिले', 'Correcto hoy — ganaste +{n}', 'Bonne réponse aujourd’hui — +{n} gagnés', 'Corretto oggi — guadagnati +{n}', '今日答对——获得 +{n}'],
    'Answered today — new quiz tomorrow': ['أجبت اليوم — اختبار جديد غداً', 'Сегодня отвечено — новая викторина завтра', 'امروز پاسخ دادید — آزمون جدید فردا', 'आज जवाब दिया — कल नया क्विज़', 'Respondido hoy — nuevo cuestionario mañana', 'Répondu aujourd’hui — nouveau quiz demain', 'Risposto oggi — nuovo quiz domani', '今日已答——明天有新测验'],
    "Play today's quiz": ['العب اختبار اليوم', 'Пройти викторину дня', 'آزمون امروز را انجام دهید', 'आज का क्विज़ खेलें', 'Juega el cuestionario de hoy', 'Jouer au quiz du jour', 'Gioca il quiz di oggi', '参加今日测验'],
    'Each completed ad adds points': ['كل إعلان مكتمل يضيف نقاطاً', 'Каждая просмотренная реклама приносит баллы', 'هر تبلیغ کامل امتیاز اضافه می‌کند', 'हर पूरा विज्ञापन अंक जोड़ता है', 'Cada anuncio completo suma puntos', 'Chaque pub terminée ajoute des points', 'Ogni annuncio completato aggiunge punti', '每看完一个广告即得积分'],
    '<b>{u}/{c}</b> today · resets at midnight UTC': ['<b>{u}/{c}</b> اليوم · يُعاد الضبط منتصف الليل UTC', '<b>{u}/{c}</b> сегодня · сброс в полночь UTC', '<b>{u}/{c}</b> امروز · بازنشانی نیمه‌شب UTC', '<b>{u}/{c}</b> आज · UTC आधी रात को रीसेट', '<b>{u}/{c}</b> hoy · se reinicia a medianoche UTC', '<b>{u}/{c}</b> aujourd’hui · réinitialisé à minuit UTC', '<b>{u}/{c}</b> oggi · si azzera a mezzanotte UTC', '今日 <b>{u}/{c}</b> · 每日 UTC 午夜重置'],
    'Come back tomorrow': ['عُد غداً', 'Возвращайтесь завтра', 'فردا برگردید', 'कल फिर आएँ', 'Vuelve mañana', 'Revenez demain', 'Torna domani', '明天再来'],
    'Watch ad · +{n}': ['شاهد إعلاناً · +{n}', 'Смотреть рекламу · +{n}', 'تماشای تبلیغ · +{n}', 'विज्ञापन देखें · +{n}', 'Ver anuncio · +{n}', 'Voir une pub · +{n}', 'Guarda annuncio · +{n}', '观看广告 · +{n}'],
    '{n} joined through your link': ['انضم {n} عبر رابطك', 'По вашей ссылке пришло: {n}', '{n} نفر از طریق پیوند شما پیوستند', 'आपके लिंक से {n} जुड़े', '{n} se unieron con tu enlace', '{n} inscrits via votre lien', '{n} iscritti col tuo link', '{n} 人通过你的链接加入'],
    'For every new person who joins': ['عن كل شخص جديد ينضم', 'За каждого нового участника', 'برای هر نفر جدیدی که می‌پیوندد', 'हर नए सदस्य के लिए', 'Por cada persona nueva que se une', 'Pour chaque nouvelle personne', 'Per ogni nuova persona che si unisce', '每有一位新用户加入'],
    'Share link': ['مشاركة الرابط', 'Поделиться ссылкой', 'اشتراک‌گذاری پیوند', 'लिंक शेयर करें', 'Compartir enlace', 'Partager le lien', 'Condividi link', '分享链接'],
    'Copy': ['نسخ', 'Копировать', 'کپی', 'कॉपी', 'Copiar', 'Copier', 'Copia', '复制'],
    'Only brand-new users count, and each friend is credited once.': ['يُحتسب المستخدمون الجدد فقط، ويُحتسب كل صديق مرة واحدة.', 'Учитываются только новые пользователи, каждый друг — один раз.', 'فقط کاربران کاملاً جدید حساب می‌شوند و هر دوست یک بار.', 'केवल नए उपयोगकर्ता गिने जाते हैं, और हर दोस्त एक बार।', 'Solo cuentan usuarios nuevos, y cada amigo se acredita una vez.', 'Seuls les nouveaux utilisateurs comptent, une seule fois par ami.', 'Contano solo i nuovi utenti, e ogni amico una sola volta.', '仅限全新用户，每位好友仅计一次。'],
    'One question a day, answered in the bot': ['سؤال واحد يومياً تجيب عنه في البوت', 'Один вопрос в день — отвечайте в боте', 'روزی یک سؤال، پاسخ در ربات', 'रोज़ एक सवाल, जवाब बॉट में', 'Una pregunta al día, se responde en el bot', 'Une question par jour, dans le bot', 'Una domanda al giorno, nel bot', '每天一题，在机器人中作答'],
    'Courses always unlock for free — points are a bonus on top.': ['الدورات تُفتح مجاناً دائماً — والنقاط مجرد مكافأة إضافية.', 'Курсы всегда открываются бесплатно — баллы лишь бонус.', 'دوره‌ها همیشه رایگان باز می‌شوند — امتیاز یک جایزهٔ اضافه است.', 'कोर्स हमेशा मुफ़्त खुलते हैं — अंक अतिरिक्त बोनस हैं।', 'Los cursos siempre se desbloquean gratis — los puntos son un extra.', 'Les cours se débloquent toujours gratuitement — les points sont un bonus.', 'I corsi si sbloccano sempre gratis — i punti sono un bonus.', '课程始终免费解锁——积分只是额外奖励。'],
    'Leaderboard is warming up': ['لوحة المتصدرين قيد التجهيز', 'Таблица лидеров загружается', 'جدول برترین‌ها در حال آماده‌سازی است', 'लीडरबोर्ड तैयार हो रहा है', 'La clasificación se está preparando', 'Le classement se prépare', 'La classifica si sta preparando', '排行榜准备中'],
    'Check back in a moment.': ['عُد بعد قليل.', 'Загляните через минуту.', 'کمی بعد سر بزنید.', 'थोड़ी देर में फिर देखें।', 'Vuelve en un momento.', 'Revenez dans un instant.', 'Torna tra un momento.', '请稍后再来。'],
    'No one is on the board yet': ['لا أحد في اللوحة بعد', 'В таблице пока никого нет', 'هنوز کسی در جدول نیست', 'अभी बोर्ड पर कोई नहीं', 'Aún no hay nadie en la clasificación', 'Personne au classement pour l’instant', 'Nessuno in classifica per ora', '榜单上还没有人'],
    'Watch an ad, invite a friend or play the daily quiz to take the first spot.': ['شاهد إعلاناً أو ادعُ صديقاً أو العب الاختبار اليومي لتتصدّر.', 'Посмотрите рекламу, пригласите друга или пройдите викторину, чтобы занять первое место.', 'یک تبلیغ ببینید، دوستی دعوت کنید یا آزمون روزانه بدهید تا اول شوید.', 'विज्ञापन देखें, दोस्त को बुलाएँ या दैनिक क्विज़ खेलें और पहला स्थान पाएँ।', 'Mira un anuncio, invita a un amigo o juega el reto diario para ser el primero.', 'Regardez une pub, invitez un ami ou jouez au quiz du jour pour prendre la première place.', 'Guarda un annuncio, invita un amico o gioca il quiz giornaliero per il primo posto.', '观看广告、邀请好友或参加每日测验，抢占第一名。'],
    'Start earning': ['ابدأ الربح', 'Начать зарабатывать', 'شروع کسب امتیاز', 'कमाना शुरू करें', 'Empezar a ganar', 'Commencer à gagner', 'Inizia a guadagnare', '开始赚积分'],
    'Earn your first points to join the board.': ['اكسب أولى نقاطك لتنضم إلى اللوحة.', 'Заработайте первые баллы, чтобы попасть в таблицу.', 'اولین امتیازهایتان را کسب کنید تا وارد جدول شوید.', 'बोर्ड में आने के लिए पहले अंक कमाएँ।', 'Gana tus primeros puntos para entrar en la clasificación.', 'Gagnez vos premiers points pour rejoindre le classement.', 'Guadagna i primi punti per entrare in classifica.', '赚取第一笔积分即可上榜。'],
    '{n} learners are collecting points.': ['{n} متعلماً يجمعون النقاط.', 'Баллы копят {n} учеников.', '{n} دانشجو در حال جمع‌آوری امتیاز هستند.', '{n} शिक्षार्थी अंक जुटा रहे हैं।', '{n} estudiantes están acumulando puntos.', '{n} apprenants cumulent des points.', '{n} studenti stanno raccogliendo punti.', '{n} 位学员正在累积积分。'],
    'Top learners and their points.': ['أفضل المتعلمين ونقاطهم.', 'Лучшие ученики и их баллы.', 'برترین دانشجویان و امتیازهایشان.', 'शीर्ष शिक्षार्थी और उनके अंक।', 'Los mejores estudiantes y sus puntos.', 'Les meilleurs apprenants et leurs points.', 'I migliori studenti e i loro punti.', '顶尖学员及其积分。'],
    '{g} points = free paid-channel membership': ['{g} نقطة = عضوية مجانية في القناة المدفوعة', '{g} баллов = бесплатный доступ к платному каналу', '{g} امتیاز = عضویت رایگان در کانال ویژه', '{g} अंक = प्रीमियम चैनल की मुफ़्त सदस्यता', '{g} puntos = acceso gratis al canal de pago', '{g} points = accès gratuit au canal payant', '{g} punti = accesso gratuito al canale a pagamento', '{g} 积分 = 免费加入付费频道'],
    'Everyone who reaches it gets the invite automatically in their chat with the bot. Up to $10,000 of learning, on us.': ['كل من يصل إليها يتلقى الدعوة تلقائياً في محادثته مع البوت. تعلّم بقيمة تصل إلى 10,000$ على حسابنا.', 'Каждый, кто дойдёт до цели, автоматически получит приглашение в чате с ботом. Обучение до $10 000 — за наш счёт.', 'هر کس به آن برسد دعوت‌نامه را خودکار در چت با ربات دریافت می‌کند. یادگیری تا ۱۰٬۰۰۰ دلار، از طرف ما.', 'जो भी इस तक पहुँचता है उसे आमंत्रण अपने आप बॉट की चैट में मिल जाता है। $10,000 तक की सीख, हमारी ओर से।', 'Quien lo alcance recibe la invitación automáticamente en su chat con el bot. Hasta 10 000 $ de aprendizaje, cortesía nuestra.', 'Quiconque l’atteint reçoit l’invitation automatiquement dans son chat avec le bot. Jusqu’à 10 000 $ de formation, offerts.', 'Chi lo raggiunge riceve l’invito automaticamente nella chat con il bot. Fino a 10.000 $ di formazione, offerti da noi.', '达到目标的人会自动在与机器人的聊天中收到邀请。价值高达 $10,000 的学习，由我们买单。'],
    'Telegram learner': ['متعلم تيليجرام', 'Ученик Telegram', 'دانشجوی تلگرام', 'टेलीग्राम शिक्षार्थी', 'Estudiante de Telegram', 'Apprenant Telegram', 'Studente Telegram', 'Telegram 学员'],
    'Not signed in': ['غير مسجّل الدخول', 'Вы не вошли', 'وارد نشده‌اید', 'साइन इन नहीं', 'Sin iniciar sesión', 'Non connecté', 'Non connesso', '未登录'],
    'Paid channel unlocked': ['تم فتح القناة المدفوعة', 'Платный канал открыт', 'کانال ویژه باز شد', 'प्रीमियम चैनल अनलॉक', 'Canal de pago desbloqueado', 'Canal payant débloqué', 'Canale a pagamento sbloccato', '付费频道已解锁'],
    '{n} points to the paid channel': ['{n} نقطة للقناة المدفوعة', '{n} баллов до платного канала', '{n} امتیاز تا کانال ویژه', 'प्रीमियम चैनल तक {n} अंक', '{n} puntos para el canal de pago', '{n} points pour le canal payant', '{n} punti per il canale a pagamento', '距付费频道 {n} 积分'],
    '{a}/{c} ads today · {i} friends invited': ['{a}/{c} إعلانات اليوم · {i} أصدقاء مدعوون', '{a}/{c} реклам сегодня · приглашено друзей: {i}', '{a}/{c} تبلیغ امروز · {i} دوست دعوت‌شده', 'आज {a}/{c} विज्ञापन · {i} दोस्त आमंत्रित', '{a}/{c} anuncios hoy · {i} amigos invitados', '{a}/{c} pubs aujourd’hui · {i} amis invités', '{a}/{c} annunci oggi · {i} amici invitati', '今日广告 {a}/{c} · 已邀请 {i} 位好友'],
    'Open inside Telegram to track progress': ['افتح داخل تيليجرام لمتابعة تقدمك', 'Откройте в Telegram, чтобы отслеживать прогресс', 'برای پیگیری پیشرفت داخل تلگرام باز کنید', 'प्रगति देखने के लिए टेलीग्राम में खोलें', 'Abre en Telegram para seguir tu progreso', 'Ouvrez dans Telegram pour suivre vos progrès', 'Apri in Telegram per seguire i progressi', '请在 Telegram 内打开以查看进度'],
    'Help & community': ['المساعدة والمجتمع', 'Помощь и сообщество', 'راهنما و جامعه', 'सहायता और समुदाय', 'Ayuda y comunidad', 'Aide et communauté', 'Aiuto e community', '帮助与社区'],
    'Questions, ideas or problems — we reply in the bot': ['أسئلة أو أفكار أو مشاكل — نرد عليك في البوت', 'Вопросы, идеи или проблемы — ответим в боте', 'سؤال، ایده یا مشکل — در ربات پاسخ می‌دهیم', 'सवाल, सुझाव या समस्याएँ — हम बॉट में जवाब देंगे', 'Preguntas, ideas o problemas — respondemos en el bot', 'Questions, idées ou problèmes — nous répondons dans le bot', 'Domande, idee o problemi — rispondiamo nel bot', '问题、建议或故障——我们会在机器人中回复'],
    '+50 points for each new learner': ['+50 نقطة لكل متعلم جديد', '+50 баллов за каждого нового ученика', '+۵۰ امتیاز برای هر دانشجوی جدید', 'हर नए शिक्षार्थी पर +50 अंक', '+50 puntos por cada estudiante nuevo', '+50 points par nouvel apprenant', '+50 punti per ogni nuovo studente', '每位新学员 +50 积分'],
    'Rewards in the bot': ['المكافآت في البوت', 'Награды в боте', 'جوایز در ربات', 'बॉट में रिवॉर्ड', 'Recompensas en el bot', 'Récompenses dans le bot', 'Premi nel bot', '机器人中的奖励'],
    'Balance, rank and daily quiz': ['الرصيد والترتيب والاختبار اليومي', 'Баланс, место и викторина дня', 'موجودی، رتبه و آزمون روزانه', 'बैलेंस, रैंक और दैनिक क्विज़', 'Saldo, puesto y reto diario', 'Solde, rang et quiz du jour', 'Saldo, posizione e quiz giornaliero', '余额、排名与每日测验'],
    'Telegram channel': ['قناة تيليجرام', 'Канал в Telegram', 'کانال تلگرام', 'टेलीग्राम चैनल', 'Canal de Telegram', 'Chaîne Telegram', 'Canale Telegram', 'Telegram 频道'],
    'New free courses the moment they drop': ['دورات مجانية جديدة لحظة صدورها', 'Новые бесплатные курсы — сразу после выхода', 'دوره‌های رایگان جدید همان لحظه انتشار', 'नए मुफ़्त कोर्स आते ही', 'Cursos gratis nuevos en cuanto salen', 'Les nouveaux cours gratuits dès leur sortie', 'Nuovi corsi gratuiti appena escono', '新免费课程第一时间推送'],
    'WhatsApp channel': ['قناة واتساب', 'Канал в WhatsApp', 'کانال واتساپ', 'WhatsApp चैनल', 'Canal de WhatsApp', 'Chaîne WhatsApp', 'Canale WhatsApp', 'WhatsApp 频道'],
    'Prefer WhatsApp? Follow along there': ['تفضّل واتساب؟ تابعنا هناك', 'Предпочитаете WhatsApp? Следите там', 'واتساپ را ترجیح می‌دهید؟ آنجا دنبال کنید', 'WhatsApp पसंद है? वहीं जुड़ें', '¿Prefieres WhatsApp? Síguenos allí', 'Vous préférez WhatsApp ? Suivez-nous là-bas', 'Preferisci WhatsApp? Seguici lì', '更喜欢 WhatsApp？在那里关注我们'],
    'Tap the heart on any course to keep it here.': ['اضغط على القلب في أي دورة لحفظها هنا.', 'Нажмите на сердечко у курса, чтобы сохранить его здесь.', 'روی قلب هر دوره بزنید تا اینجا ذخیره شود.', 'किसी भी कोर्स पर दिल दबाएँ ताकि वह यहाँ रहे।', 'Toca el corazón de un curso para guardarlo aquí.', 'Touchez le cœur d’un cours pour le garder ici.', 'Tocca il cuore su un corso per tenerlo qui.', '点击课程上的心形即可收藏到这里。'],
    'Saved courses no longer listed: {n}': ['دورات محفوظة لم تعد متاحة: {n}', 'Сохранённых курсов, которых больше нет: {n}', 'دوره‌های ذخیره‌شدهٔ حذف‌شده: {n}', 'सहेजे गए कोर्स जो अब सूची में नहीं: {n}', 'Cursos guardados que ya no están: {n}', 'Cours enregistrés qui ne sont plus listés : {n}', 'Corsi salvati non più disponibili: {n}', '已下架的收藏课程：{n}'],
    'Offer ended': ['انتهى العرض', 'Предложение закончилось', 'پیشنهاد تمام شد', 'ऑफ़र समाप्त', 'Oferta finalizada', 'Offre terminée', 'Offerta terminata', '优惠已结束'],
    'Free course': ['دورة مجانية', 'Бесплатный курс', 'دورهٔ رایگان', 'मुफ़्त कोर्स', 'Curso gratis', 'Cours gratuit', 'Corso gratuito', '免费课程'],

    /* details.html / dl.html — status texts */
    '+{n} pts added to your balance': ['أُضيفت {n} نقطة إلى رصيدك', '{n} баллов добавлено на баланс', '{n} امتیاز به موجودی شما اضافه شد', '{n} अंक आपके बैलेंस में जुड़े', 'Se añadieron {n} pts a tu saldo', '{n} pts ajoutés à votre solde', '{n} pt aggiunti al tuo saldo', '{n} 积分已计入余额'],
    'Adding your points…': ['جارٍ إضافة نقاطك…', 'Начисляем баллы…', 'در حال افزودن امتیاز شما…', 'आपके अंक जोड़े जा रहे हैं…', 'Añadiendo tus puntos…', 'Ajout de vos points…', 'Aggiunta dei punti…', '正在添加积分…'],
    'No ad available — unlocked (no points)': ['لا يوجد إعلان — تم الفتح (بدون نقاط)', 'Рекламы нет — открыто (без баллов)', 'تبلیغی نبود — باز شد (بدون امتیاز)', 'विज्ञापन उपलब्ध नहीं — अनलॉक (बिना अंक)', 'Sin anuncio — desbloqueado (sin puntos)', 'Pas de pub — débloqué (sans points)', 'Nessun annuncio — sbloccato (senza punti)', '无可用广告——已解锁（无积分）'],
    'Daily points limit reached': ['بلغت حد النقاط اليومي', 'Дневной лимит баллов исчерпан', 'به سقف روزانهٔ امتیاز رسیدید', 'दैनिक अंक सीमा पूरी', 'Límite diario de puntos alcanzado', 'Limite quotidienne de points atteinte', 'Limite giornaliero di punti raggiunto', '已达每日积分上限'],
    'Open inside Telegram to earn points': ['افتح داخل تيليجرام لكسب النقاط', 'Откройте в Telegram, чтобы получать баллы', 'برای کسب امتیاز داخل تلگرام باز کنید', 'अंक कमाने के लिए टेलीग्राम में खोलें', 'Abre en Telegram para ganar puntos', 'Ouvrez dans Telegram pour gagner des points', 'Apri in Telegram per guadagnare punti', '请在 Telegram 内打开以赚取积分'],
    'Points could not be added': ['تعذّرت إضافة النقاط', 'Не удалось начислить баллы', 'افزودن امتیاز ممکن نشد', 'अंक नहीं जुड़ सके', 'No se pudieron añadir los puntos', 'Impossible d’ajouter les points', 'Impossibile aggiungere i punti', '无法添加积分'],
    'Done': ['تم', 'Готово', 'انجام شد', 'पूर्ण', 'Hecho', 'Terminé', 'Fatto', '完成'],
    'adding points…': ['جارٍ إضافة النقاط…', 'начисляем баллы…', 'در حال افزودن امتیاز…', 'अंक जुड़ रहे हैं…', 'añadiendo puntos…', 'ajout des points…', 'aggiunta punti…', '正在添加积分…'],
    'unlocked': ['تم الفتح', 'открыто', 'باز شد', 'अनलॉक', 'desbloqueado', 'débloqué', 'sbloccato', '已解锁'],
    'daily cap reached': ['بلغت الحد اليومي', 'дневной лимит', 'سقف روزانه پر شد', 'दैनिक सीमा पूरी', 'límite diario alcanzado', 'limite quotidienne atteinte', 'limite giornaliero raggiunto', '已达每日上限'],
    'sign in via Telegram': ['سجّل الدخول عبر تيليجرام', 'войдите через Telegram', 'از طریق تلگرام وارد شوید', 'टेलीग्राम से साइन इन करें', 'inicia sesión con Telegram', 'connectez-vous via Telegram', 'accedi tramite Telegram', '请通过 Telegram 登录'],
    'points not added': ['لم تُضف النقاط', 'баллы не начислены', 'امتیاز اضافه نشد', 'अंक नहीं जुड़े', 'puntos no añadidos', 'points non ajoutés', 'punti non aggiunti', '积分未添加'],
    'completed': ['اكتمل', 'завершено', 'تکمیل شد', 'पूर्ण', 'completado', 'terminé', 'completato', '已完成'],
    'Points cap reached': ['بلغت حد النقاط', 'Достигнут лимит баллов', 'به سقف امتیاز رسیدید', 'अंक सीमा पूरी', 'Límite de puntos alcanzado', 'Plafond de points atteint', 'Limite punti raggiunto', '已达积分上限'],
    'Open this page from <b>@UdemySybot</b> inside Telegram to earn points.': ['افتح هذه الصفحة من <b>@UdemySybot</b> داخل تيليجرام لكسب النقاط.', 'Откройте страницу из <b>@UdemySybot</b> в Telegram, чтобы получать баллы.', 'برای کسب امتیاز این صفحه را از <b>@UdemySybot</b> داخل تلگرام باز کنید.', 'अंक कमाने के लिए इस पेज को टेलीग्राम में <b>@UdemySybot</b> से खोलें।', 'Abre esta página desde <b>@UdemySybot</b> en Telegram para ganar puntos.', 'Ouvrez cette page depuis <b>@UdemySybot</b> dans Telegram pour gagner des points.', 'Apri questa pagina da <b>@UdemySybot</b> in Telegram per guadagnare punti.', '请在 Telegram 中通过 <b>@UdemySybot</b> 打开此页面以赚取积分。'],
    'Your points could not be added yet. Your course is still unlocked.': ['تعذّرت إضافة نقاطك حالياً. دورتك ما زالت مفتوحة.', 'Баллы пока не начислены. Курс всё равно открыт.', 'هنوز امتیاز شما اضافه نشد. دوره همچنان باز است.', 'आपके अंक अभी नहीं जुड़े। कोर्स फिर भी अनलॉक है।', 'Aún no se añadieron tus puntos. Tu curso sigue desbloqueado.', 'Vos points n’ont pas encore été ajoutés. Votre cours reste débloqué.', 'Punti non ancora aggiunti. Il corso resta sbloccato.', '积分暂未添加，课程仍已解锁。'],
    'Your points could not be added yet. Your download is still unlocked.': ['تعذّرت إضافة نقاطك حالياً. تنزيلك ما زال مفتوحاً.', 'Баллы пока не начислены. Загрузка всё равно открыта.', 'هنوز امتیاز شما اضافه نشد. دانلود همچنان باز است.', 'आपके अंक अभी नहीं जुड़े। डाउनलोड फिर भी अनलॉक है।', 'Aún no se añadieron tus puntos. Tu descarga sigue desbloqueada.', 'Vos points n’ont pas encore été ajoutés. Votre téléchargement reste débloqué.', 'Punti non ancora aggiunti. Il download resta sbloccato.', '积分暂未添加，下载仍已解锁。'],
    '<b>+{n} points</b> added from this course 🎉': ['أُضيفت <b>+{n} نقطة</b> من هذه الدورة 🎉', '<b>+{n} баллов</b> за этот курс 🎉', '<b>+{n} امتیاز</b> از این دوره اضافه شد 🎉', 'इस कोर्स से <b>+{n} अंक</b> जुड़े 🎉', 'Se añadieron <b>+{n} puntos</b> de este curso 🎉', '<b>+{n} points</b> ajoutés grâce à ce cours 🎉', 'Aggiunti <b>+{n} punti</b> da questo corso 🎉', '本课程已添加 <b>+{n} 积分</b> 🎉'],
    '<b>+{n} points</b> added from this download 🎉': ['أُضيفت <b>+{n} نقطة</b> من هذا التنزيل 🎉', '<b>+{n} баллов</b> за эту загрузку 🎉', '<b>+{n} امتیاز</b> از این دانلود اضافه شد 🎉', 'इस डाउनलोड से <b>+{n} अंक</b> जुड़े 🎉', 'Se añadieron <b>+{n} puntos</b> de esta descarga 🎉', '<b>+{n} points</b> ajoutés grâce à ce téléchargement 🎉', 'Aggiunti <b>+{n} punti</b> da questo download 🎉', '本次下载已添加 <b>+{n} 积分</b> 🎉'],
    'Daily points limit reached — you can still unlock this course.': ['بلغت حد النقاط اليومي — ما زال بإمكانك فتح هذه الدورة.', 'Дневной лимит баллов исчерпан — курс всё равно можно открыть.', 'به سقف امتیاز روزانه رسیدید — همچنان می‌توانید این دوره را باز کنید.', 'दैनिक अंक सीमा पूरी — आप फिर भी यह कोर्स अनलॉक कर सकते हैं।', 'Límite diario de puntos alcanzado — aún puedes desbloquear este curso.', 'Limite quotidienne de points atteinte — vous pouvez encore débloquer ce cours.', 'Limite giornaliero di punti raggiunto — puoi comunque sbloccare questo corso.', '已达每日积分上限——仍可解锁本课程。'],
    'Daily points limit reached — you can still unlock this file.': ['بلغت حد النقاط اليومي — ما زال بإمكانك فتح هذا الملف.', 'Дневной лимит баллов исчерпан — файл всё равно можно открыть.', 'به سقف امتیاز روزانه رسیدید — همچنان می‌توانید این فایل را باز کنید.', 'दैनिक अंक सीमा पूरी — आप फिर भी यह फ़ाइल अनलॉक कर सकते हैं।', 'Límite diario de puntos alcanzado — aún puedes desbloquear este archivo.', 'Limite quotidienne de points atteinte — vous pouvez encore débloquer ce fichier.', 'Limite giornaliero di punti raggiunto — puoi comunque sbloccare questo file.', '已达每日积分上限——仍可解锁此文件。'],
    'Watch both ads to earn <b>+{n} points</b> on this course.': ['شاهد الإعلانين لتكسب <b>+{n} نقطة</b> من هذه الدورة.', 'Посмотрите обе рекламы и получите <b>+{n} баллов</b> за этот курс.', 'هر دو تبلیغ را ببینید تا <b>+{n} امتیاز</b> از این دوره بگیرید.', 'दोनों विज्ञापन देखकर इस कोर्स से <b>+{n} अंक</b> कमाएँ।', 'Mira ambos anuncios para ganar <b>+{n} puntos</b> con este curso.', 'Regardez les deux pubs pour gagner <b>+{n} points</b> avec ce cours.', 'Guarda entrambi gli annunci per guadagnare <b>+{n} punti</b> con questo corso.', '看完两个广告，本课程可得 <b>+{n} 积分</b>。'],
    'Watch both ads to earn <b>+{n} points</b> on this download.': ['شاهد الإعلانين لتكسب <b>+{n} نقطة</b> من هذا التنزيل.', 'Посмотрите обе рекламы и получите <b>+{n} баллов</b> за эту загрузку.', 'هر دو تبلیغ را ببینید تا <b>+{n} امتیاز</b> از این دانلود بگیرید.', 'दोनों विज्ञापन देखकर इस डाउनलोड से <b>+{n} अंक</b> कमाएँ।', 'Mira ambos anuncios para ganar <b>+{n} puntos</b> con esta descarga.', 'Regardez les deux pubs pour gagner <b>+{n} points</b> avec ce téléchargement.', 'Guarda entrambi gli annunci per guadagnare <b>+{n} punti</b> con questo download.', '看完两个广告，本次下载可得 <b>+{n} 积分</b>。'],
    'Retry adding points': ['أعد محاولة إضافة النقاط', 'Повторить начисление баллов', 'تلاش مجدد برای افزودن امتیاز', 'अंक जोड़ना फिर आज़माएँ', 'Reintentar añadir puntos', 'Réessayer d’ajouter les points', 'Riprova ad aggiungere i punti', '重试添加积分'],
    'Ad unavailable right now — tap retry': ['الإعلان غير متاح الآن — اضغط لإعادة المحاولة', 'Реклама сейчас недоступна — нажмите «Повторить»', 'تبلیغ اکنون در دسترس نیست — دوباره بزنید', 'अभी विज्ञापन उपलब्ध नहीं — फिर कोशिश करें', 'Anuncio no disponible — toca para reintentar', 'Pub indisponible — appuyez pour réessayer', 'Annuncio non disponibile — tocca per riprovare', '广告暂不可用——点击重试'],
    ' (last try — unlocks automatically after this)': [' (آخر محاولة — يُفتح تلقائياً بعدها)', ' (последняя попытка — затем откроется автоматически)', ' (آخرین تلاش — پس از آن خودکار باز می‌شود)', ' (आख़िरी कोशिश — इसके बाद अपने आप अनलॉक)', ' (último intento — se desbloquea solo después)', ' (dernier essai — débloqué automatiquement ensuite)', ' (ultimo tentativo — poi si sblocca da solo)', '（最后一次——之后将自动解锁）'],
    'Ad unavailable — tap retry': ['الإعلان غير متاح — اضغط لإعادة المحاولة', 'Реклама недоступна — нажмите «Повторить»', 'تبلیغ در دسترس نیست — دوباره بزنید', 'विज्ञापन उपलब्ध नहीं — फिर कोशिश करें', 'Anuncio no disponible — toca para reintentar', 'Pub indisponible — appuyez pour réessayer', 'Annuncio non disponibile — tocca per riprovare', '广告不可用——点击重试'],
    '→ FREE with coupon': ['← مجاني بالكوبون', '→ БЕСПЛАТНО по купону', '← رایگان با کوپن', '→ कूपन से मुफ़्त', '→ GRATIS con cupón', '→ GRATUIT avec coupon', '→ GRATIS con coupon', '→ 凭券免费'],
    '🆓 FREE with coupon': ['🆓 مجاني بالكوبون', '🆓 БЕСПЛАТНО по купону', '🆓 رایگان با کوپن', '🆓 कूपन से मुफ़्त', '🆓 GRATIS con cupón', '🆓 GRATUIT avec coupon', '🆓 GRATIS con coupon', '🆓 凭券免费'],
    '🕐 Self-paced': ['🕐 وفق وتيرتك', '🕐 В своём темпе', '🕐 با سرعت خودتان', '🕐 अपनी गति से', '🕐 A tu ritmo', '🕐 À votre rythme', '🕐 Al tuo ritmo', '🕐 自定进度'],
    'Udemy Free Course': ['دورة Udemy مجانية', 'Бесплатный курс Udemy', 'دورهٔ رایگان Udemy', 'मुफ़्त Udemy कोर्स', 'Curso gratis de Udemy', 'Cours Udemy gratuit', 'Corso Udemy gratuito', 'Udemy 免费课程'],
    '🎯 Related': ['🎯 ذو صلة', '🎯 Похожий', '🎯 مرتبط', '🎯 संबंधित', '🎯 Relacionado', '🎯 Similaire', '🎯 Correlato', '🎯 相关'],
    'File link unavailable': ['رابط الملف غير متاح', 'Ссылка на файл недоступна', 'پیوند فایل در دسترس نیست', 'फ़ाइल लिंक उपलब्ध नहीं', 'Enlace de archivo no disponible', 'Lien du fichier indisponible', 'Link del file non disponibile', '文件链接不可用'],
    'Invalid or expired file link.': ['رابط الملف غير صالح أو منتهي.', 'Недействительная или устаревшая ссылка на файл.', 'پیوند فایل نامعتبر یا منقضی است.', 'फ़ाइल लिंक अमान्य या समाप्त है।', 'Enlace de archivo no válido o caducado.', 'Lien de fichier invalide ou expiré.', 'Link del file non valido o scaduto.', '文件链接无效或已过期。'],
    'Free File': ['ملف مجاني', 'Бесплатный файл', 'فایل رایگان', 'मुफ़्त फ़ाइल', 'Archivo gratis', 'Fichier gratuit', 'File gratuito', '免费文件'],
    '→ FREE DOWNLOAD': ['← تنزيل مجاني', '→ БЕСПЛАТНАЯ ЗАГРУЗКА', '← دانلود رایگان', '→ मुफ़्त डाउनलोड', '→ DESCARGA GRATIS', '→ TÉLÉCHARGEMENT GRATUIT', '→ DOWNLOAD GRATUITO', '→ 免费下载'],
    '{n} pages': ['{n} صفحة', '{n} стр.', '{n} صفحه', '{n} पृष्ठ', '{n} páginas', '{n} pages', '{n} pagine', '{n} 页'],
    'Unavailable': ['غير متاح', 'Недоступно', 'در دسترس نیست', 'उपलब्ध नहीं', 'No disponible', 'Indisponible', 'Non disponibile', '不可用'],
    'This file link is unavailable': ['رابط هذا الملف غير متاح', 'Эта ссылка на файл недоступна', 'پیوند این فایل در دسترس نیست', 'यह फ़ाइल लिंक उपलब्ध नहीं है', 'Este enlace de archivo no está disponible', 'Ce lien de fichier est indisponible', 'Questo link del file non è disponibile', '此文件链接不可用']
  });

  var tg = window.Telegram && window.Telegram.WebApp;
  function supported(c) { return LANGS.some(function (l) { return l[0] === c; }); }

  function detect() {
    var saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    if (saved && supported(saved)) return saved;
    var u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    var raw = (u && u.language_code) || ((!tg || !tg.initData) ? navigator.language : '') || '';
    var c = String(raw).toLowerCase().split(/[-_]/)[0];
    return supported(c) ? c : 'en';          // anything unsupported → English
  }

  var cur = detect();

  function tr(key, vars) {
    var i = ORDER.indexOf(cur), s = key;
    if (i >= 0 && S[key] && S[key][i]) s = S[key][i];
    if (vars) s = s.replace(/\{(\w+)\}/g, function (m, n) { return vars[n] != null ? vars[n] : m; });
    return s;
  }
  window.tr = tr;
  window.I18N = { lang: function () { return cur; }, set: setLang, rtl: function () { return !!RTL[cur]; } };

  /* ── Static DOM translation (text nodes + aria-label/placeholder/title) ── */
  var TN = new WeakMap(), AT = new WeakMap(), ATTRS = ['aria-label', 'placeholder', 'title'];
  function resolve(orig) {                   // → translated string, or null if not translatable
    var key = orig.trim();
    if (!key) return null;
    if (S[key]) return orig.replace(key, tr(key));
    var m = key.match(/\d+/);                // "Watch Ad 2" → "Watch Ad {n}"
    if (m) { var k2 = key.replace(m[0], '{n}'); if (S[k2]) return orig.replace(key, tr(k2, { n: m[0] })); }
    return null;
  }
  function walk(root) {
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null), n, nodes = [];
    while ((n = w.nextNode())) {
      var p = n.parentNode && n.parentNode.nodeName;
      if (p !== 'SCRIPT' && p !== 'STYLE' && p !== 'TITLE') nodes.push(n);
    }
    nodes.forEach(function (node) {
      var orig = TN.has(node) ? TN.get(node) : node.nodeValue, out = resolve(orig);
      if (out == null) return;
      TN.set(node, orig); if (node.nodeValue !== out) node.nodeValue = out;
    });
    root.querySelectorAll('[aria-label],[placeholder],[title]').forEach(function (el) {
      var saved = AT.get(el) || {};
      ATTRS.forEach(function (a) {
        if (!el.hasAttribute(a)) return;
        var orig = a in saved ? saved[a] : el.getAttribute(a), out = resolve(orig);
        if (out == null) return;
        saved[a] = orig; el.setAttribute(a, out);
      });
      AT.set(el, saved);
    });
  }

  /* ── Fonts, direction, RTL fixes ── */
  var FONT_URL = { ar: 'Noto+Sans+Arabic:wght@400;600;700;800', fa: 'Noto+Sans+Arabic:wght@400;600;700;800',
                   hi: 'Noto+Sans+Devanagari:wght@400;600;700;800', zh: 'Noto+Sans+SC:wght@400;500;700' };
  var FONT_FAM = { ar: "'Noto Sans Arabic'", fa: "'Noto Sans Arabic'", hi: "'Noto Sans Devanagari'", zh: "'Noto Sans SC'" };
  function applyDocument() {
    var root = document.documentElement;
    root.lang = cur; root.dir = RTL[cur] ? 'rtl' : 'ltr';
    if (FONT_URL[cur] && !document.getElementById('i18n-font-' + cur)) {
      var l = document.createElement('link'); l.id = 'i18n-font-' + cur; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=' + FONT_URL[cur] + '&display=swap';
      document.head.appendChild(l);
    }
    if (FONT_FAM[cur]) root.style.setProperty('--font', FONT_FAM[cur] + ",system-ui,-apple-system,'Segoe UI',Roboto,sans-serif");
    else root.style.removeProperty('--font');
    var back = document.getElementById('back-btn');
    if (back) back.textContent = RTL[cur] ? '→' : '←';
  }

  var CSS = '\
[dir=rtl] .course-body{padding-right:0;padding-left:30px}\
[dir=rtl] .course-foot .free,[dir=rtl] .pts,[dir=rtl] .link-row .chev{margin-left:0;margin-right:auto}\
[dir=rtl] .link-row .chev{transform:scaleX(-1)}\
[dir=rtl] .heart{right:auto;left:6px}\
[dir=rtl] .lb-pts small{margin-left:0;margin-right:2px}\
[dir=rtl] .link-row,[dir=rtl] .ad-btn{text-align:right}\
[dir=rtl] .hero-badge{left:auto;right:10px}\
[dir=rtl] .course-price .free{margin-left:0;margin-right:4px}\
[dir=rtl] .tl::before{left:auto;right:17px}\
[dir=rtl] .latest-tag,[dir=rtl] .match-badge{margin-right:0;margin-left:5px}\
[dir=rtl] .dock-progress{left:auto;right:0}\
.lang-btn{flex:0 0 auto;width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:50%;border:1px solid var(--border);background:rgba(255,255,255,.04);color:var(--muted)}\
.lang-btn svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}\
.lang-ov{position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}\
.lang-sheet{width:min(100%,500px);max-height:80vh;overflow:auto;background:var(--surface,#17171b);border-radius:22px 22px 0 0;border:1px solid var(--border);padding:16px 14px calc(16px + env(safe-area-inset-bottom,0px));color:var(--text,#fff)}\
.lang-sheet h3{font-size:15px;font-weight:800;margin:2px 4px 10px}\
.lang-opt{display:flex;align-items:center;justify-content:space-between;width:100%;padding:13px 14px;border-radius:14px;font-size:15px;font-weight:600;text-align:start}\
.lang-opt:active{background:rgba(255,255,255,.06)}\
.lang-opt.on{background:rgba(255,255,255,.07);color:var(--rose,#d96a88)}';

  /* ── Language picker ── */
  function openPicker() {
    if (document.getElementById('lang-ov')) return;
    var ov = document.createElement('div'); ov.className = 'lang-ov'; ov.id = 'lang-ov';
    var html = '<div class="lang-sheet" role="dialog" aria-label="' + tr('Language') + '"><h3>🌐 ' + tr('Language') + '</h3>';
    LANGS.forEach(function (l) {
      html += '<button class="lang-opt' + (l[0] === cur ? ' on' : '') + '" data-lang="' + l[0] + '" lang="' + l[0] + '"><span>' + l[1] + '</span><span>' + (l[0] === cur ? '✓' : '') + '</span></button>';
    });
    ov.innerHTML = html + '</div>';
    ov.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lang]');
      if (b) setLang(b.getAttribute('data-lang'));
      if (b || e.target === ov) ov.remove();
    });
    document.body.appendChild(ov);
  }
  function mountButton() {
    var bar = document.querySelector('.top-bar');
    if (!bar || document.getElementById('lang-btn')) return;
    var b = document.createElement('button'); b.id = 'lang-btn'; b.className = 'lang-btn'; b.type = 'button';
    b.setAttribute('aria-label', 'Language');
    b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.7 3.9 5.7 3.9 9s-1.3 6.3-3.9 9c-2.6-2.7-3.9-5.7-3.9-9S9.4 5.7 12 3z"/></svg>';
    b.addEventListener('click', openPicker);
    bar.appendChild(b);
  }

  function setLang(c) {
    if (!supported(c)) c = 'en';
    cur = c;
    try { localStorage.setItem(KEY, c); } catch (e) {}
    applyDocument(); walk(document.body);
    var btn = document.getElementById('lang-btn'); if (btn) btn.setAttribute('aria-label', tr('Language'));
    document.dispatchEvent(new CustomEvent('langchange', { detail: c }));
  }

  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  applyDocument();                                   // set lang/dir as early as possible (no flash)
  function boot() {
    mountButton(); walk(document.body);
    var btn = document.getElementById('lang-btn'); if (btn) btn.setAttribute('aria-label', tr('Language'));
    applyDocument();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
