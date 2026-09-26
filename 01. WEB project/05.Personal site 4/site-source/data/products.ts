export type Product = {
  slug: string;
  name: string;
  category: string;
  version: string;
  image: string;
  imageAlt: string;
  description: string;
  details: string;
  // How it runs / what installing needs (installNote) / what to expect afterwards – one source of truth for card and dialog
  runs: string;
  afterInstall: string;
  features: string[];
  screenshots: { src: string; alt: string; title: string; caption: string }[];
  note?: string;
  // One line shown next to the downloads: what installing does and what it needs
  installNote: string;
  // CSS object-position for the card image, so the crop keeps the part that shows the product working
  imagePosition?: string;
  credentials?: { username: string; password: string };
  downloads: {
    windows: { href: string; size: string };
    macos: { href: string; size: string };
  };
};

// Добавянето на нов продукт става с още един запис в този масив.
export const products: Product[] = [
  {
    slug: 'observer-v2',
    name: 'Observer V2',
    category: 'Автоматизация',
    version: 'Локално, в браузъра',
    image: '/images/observer.png',
    imageAlt: 'Табло на Observer V2 за проследяване на обяви',
    description: 'Събира и подрежда обяви за работа от dev.bg, LinkedIn и jobs.bg в едно локално табло с история и удобни филтри.',
    details: 'Observer V2 автоматизира събирането на обяви и ги пази в локална SQLite база. Таблото показва заплата, отпуск, технологии и източник, а флаговете и статусите помагат да следите кандидатурите си.',
    runs: 'Локален сървър, който се отваря в браузъра.',
    afterInstall: 'Интернет е нужен и при събирането на обяви. LinkedIn може да изисква ваша активна сесия.',
    features: ['Филтри и флагове за проследяване', 'История на обяви и компании', 'Настройваеми адреси за търсене'],
    screenshots: [
      { src: '/images/observer.png', alt: 'Табло с обяви в Observer V2', title: 'Табло с обяви', caption: 'Филтриране по фирма, местоположение, източник и статус на кандидатурата.' },
      { src: '/images/observer-companies.png', alt: 'Регистър на компаниите в Observer V2', title: 'Регистър на компаниите', caption: 'Обединяване на свързани фирми, собствени етикети, флагове и брой намерени обяви.' },
      { src: '/images/observer-settings.png', alt: 'Настройки на източниците в Observer V2', title: 'Настройки на източниците', caption: 'Адресите за dev.bg, jobs.bg и LinkedIn могат да се променят директно от приложението.' },
    ],
    installNote: 'При първата инсталация изтегля Python 3.12, библиотеките и Chromium – нужен е интернет.',
    downloads: {
      windows: { href: '/install/obnserver/ObserverV2-Windows-Setup.exe', size: '774 KB' },
      macos: { href: '/install/obnserver/ObserverV2-macOS-Install.zip', size: '768 KB' },
    },
  },
  {
    slug: 'dictionary',
    name: 'Dictionary',
    category: 'Обучение',
    version: 'Локално, в браузъра',
    image: '/images/dictionary.png',
    imageAlt: 'Екран с настройки за учебна сесия в Dictionary',
    description: 'Интерактивни флаш карти и изпити за учене на думи. Включва осем готови речника и пази личните данни локално.',
    details: 'Dictionary комбинира флаш карти, писмен изпит и личен речник. Поддържа осем готови Excel източника, умни синоними, произношение, гласова практика и архивиране на собствените думи.',
    runs: 'Локално приложение, отваря се в браузъра на 127.0.0.1:18763.',
    afterInstall: 'Речникът и напредъкът се пазят в браузъра на устройството. Гласовите функции може да изискват интернет и микрофон.',
    features: ['3D флаш карти и писмен изпит', 'Произношение и гласово въвеждане', 'Excel импорт, експорт и архив'],
    screenshots: [
      { src: '/images/dictionary.png', alt: 'Настройки за учебна сесия в Dictionary', title: 'Учебна сесия', caption: 'Избор на език, речници, размер на сесията и глас за произношение.' },
      { src: '/images/dictionary-exam.png', alt: 'Настройки за изпит в Dictionary', title: 'Писмен изпит', caption: 'Настройвате езика, броя въпроси и посоката на превода преди изпита.' },
      { src: '/images/dictionary-dictionary.png', alt: 'Личен речник и статистика в Dictionary', title: 'Речник и статистика', caption: 'Търсене и добавяне на думи, статистика по езици и преглед на целия речник.' },
      { src: '/images/dictionary-import.png', alt: 'Импорт на думи от Excel в Dictionary', title: 'Импорт и резервно копие', caption: 'Добавяне на големи списъци от Excel или CSV и управление на резервните копия.' },
    ],
    installNote: 'При първата инсталация изтегля Python – нужен е интернет.',
    downloads: {
      windows: { href: '/install/Dictionary/Dictionary-Windows-Setup.exe', size: '850 KB' },
      macos: { href: '/install/Dictionary/Dictionary-macOS-Install.zip', size: '845 KB' },
    },
  },
  {
    slug: 'spine-creep-calculator',
    name: 'Spine & Creep Calculator',
    category: 'Печат',
    version: 'Локално, в браузъра',
    image: '/images/spine-creep.png',
    imageAlt: 'Калкулатор за гръбче и избутване с триизмерна визуализация',
    description: 'Изчислява дебелината на книжното гръбче и избутването при брошури според хартията, подвързията и обема.',
    details: 'Калкулаторът пресмята гръбчето на книги с мека или твърда корица и creep при печатни коли. Резултатите се обновяват веднага и се показват с динамичен модел на книжното тяло.',
    runs: 'Локален калкулатор, отваря се в браузъра. Без акаунт и без външна база данни.',
    afterInstall: 'След инсталацията работи без интернет.',
    features: ['Точни сметки за гръбче и избутване (creep)', 'Собствена библиотека от хартии', 'Динамична 3D визуализация'],
    screenshots: [
      { src: '/images/spine-creep.png', alt: 'Изчисление за книга с мека корица', title: 'Мека корица', caption: 'Параметри на книжното тяло, резултат за гръбчето и 3D визуализация.' },
      { src: '/images/spine-hardcover.png', alt: 'Изчисление за книга с твърда корица', title: 'Твърда корица', caption: 'Отделни настройки за дебелина на мукава, форма на гърба и шиене.' },
    ],
    installNote: 'При първата инсталация изтегля Python – нужен е интернет.',
    imagePosition: 'right top',
    downloads: {
      windows: { href: '/install/01.Spine%20and%20Creep%20Calculator/SpineCreepCalculator-Windows-Setup.exe', size: '35 KB' },
      macos: { href: '/install/01.Spine%20and%20Creep%20Calculator/SpineCreepCalculator-macOS-Install.zip', size: '30 KB' },
    },
  },
  {
    slug: 'indesign-booklet-creep',
    name: 'InDesign Booklet Creep',
    category: 'Печат',
    version: 'Скрипт за InDesign',
    image: '/images/indesign-placeholder.png',
    imageAlt: 'InDesign Booklet Creep в панела Scripts на Adobe InDesign',
    description: 'ExtendScript за Adobe InDesign, който компенсира избутването в книжни тела чрез прецизно мащабиране спрямо гърба.',
    details: 'Скриптът обработва страниците симетрично спрямо гърба и прилага прогресивна компенсация към вътрешните листове. Временно отключва нужните слоеве и възстановява състоянието им след работа.',
    runs: 'Скрипт, който работи вътре в Adobe InDesign (ExtendScript).',
    afterInstall: 'В InDesign: Window → Utilities → Scripts → User → Printing Tools → InDesignBookletCreep.jsx.',
    features: ['Работи със заключени слоеве и обекти', 'Поддържа различни размери на колата', 'Цялата операция може да се отмени'],
    screenshots: [
      { src: '/images/indesign-placeholder.png', alt: 'InDesign Booklet Creep в панела Scripts на Adobe InDesign', title: 'Скриптът в Adobe InDesign', caption: 'Диалогът задава дебелина на хартията, размер на колата и начална страница преди компенсацията.' },
    ],
    installNote: 'Изисква Adobe InDesign. Инсталаторът само копира скрипта в панела Scripts – без интернет.',
    imagePosition: '40% center',
    downloads: {
      windows: { href: '/install/02.InDesign%20Booklet%20Creep/InDesignBookletCreep-Windows-Setup.exe', size: '22 KB' },
      macos: { href: '/install/02.InDesign%20Booklet%20Creep/InDesignBookletCreep-macOS-Install.zip', size: '8 KB' },
    },
  },
  {
    slug: 'printing-catalog',
    name: 'Printing Catalog',
    category: 'Печат',
    version: 'Локално и в мрежата',
    image: '/images/printing-catalog.png',
    imageAlt: 'Каталог за щанци и клишета с филтри и таблица',
    description: 'Мрежов каталог за щанци, преге клишета и инструменти за топъл печат с роли, търсене и технически файлове.',
    details: 'Printing Catalog организира производствените инструменти по тип, размер, клиент, склад и статус. Поддържа няколко чертежа, PDF визуализации, етикети за стелажи, автоматични кодове и роли за достъп.',
    runs: 'Локален сървър на порт 5050, отваря се в браузъра и е достъпен в локалната мрежа.',
    afterInstall: 'Защитната стена може да поиска разрешение. Данните се пазят отделно от програмата и остават при преинсталация.',
    features: ['Интелигентно филтриране по размер', 'Етикети за стелажи и автоматични кодове', 'CAD файлове, чертежи и потребителски роли'],
    screenshots: [
      { src: '/images/printing-catalog.png', alt: 'Основен екран на Printing Catalog', title: 'Каталог и филтри', caption: 'Търсене по код, име, клиент, размер и статус, плюс отделни категории инструменти.' },
      { src: '/images/printing-catalog-1.png', alt: 'Каталог със щанци в Printing Catalog', title: 'Каталог на щанците', caption: 'Списък с кодове, чертежи, размери, брой гнезда, складова позиция и статус.' },
      { src: '/images/printing-catalog-2.png', alt: 'Каталог с преге клишета в Printing Catalog', title: 'Преге клишета', caption: 'Отделен изглед за преге клишета с клиент, размер, местоположение и действия.' },
      { src: '/images/printing-catalog-3.png', alt: 'Каталог с инструменти за топъл печат', title: 'Инструменти за топъл печат', caption: 'Бързо превключване между категориите и преглед на всички складови записи.' },
      { src: '/images/printing-catalog-4.png', alt: 'Форма за нов инструмент в Printing Catalog', title: 'Добавяне на инструмент', caption: 'Форма за технически данни, няколко чертежа, CAD файл, склад и бележки.' },
      { src: '/images/printing-catalog-5.png', alt: 'Администраторски панел на Printing Catalog', title: 'Потребители и роли', caption: 'Администраторът създава профили и задава права за преглед или редактиране.' },
      { src: '/images/printing-catalog-login.png', alt: 'Екран за вход в Printing Catalog', title: 'Защитен вход', caption: 'Достъпът е защитен с потребителски профили и роли.' },
    ],
    credentials: { username: 'admin', password: 'admin' },
    installNote: 'При първата инсталация изтегля Python и библиотеките – нужен е интернет. Работи на порт 5050 в локалната мрежа.',
    downloads: {
      windows: { href: '/install/03.Printing%20Catalog/PrintingCatalog-Windows-Setup.exe', size: '254 KB' },
      macos: { href: '/install/03.Printing%20Catalog/PrintingCatalog-macOS-Install.zip', size: '187 KB' },
    },
  },
  {
    slug: 'car-maintenance',
    name: 'Car Maintenance',
    category: 'Организация',
    version: 'Локално, в браузъра',
    image: '/images/car-maintenance.png',
    imageAlt: 'Екран за управление на автомобили в Car Maintenance',
    description: 'Личен дневник за автомобилите ви. Следете ремонти, разходи и предстоящи обслужвания по пробег или дата от един ясен екран.',
    details: 'Car Maintenance събира профилите на автомобилите, сервизната история, разходите и документите им. Правилата за поддръжка изчисляват следващото обслужване по дата, километри или комбинация от двете.',
    runs: 'Самостоятелно .NET приложение, отваря се в браузъра на 127.0.0.1:18766. Не е нужен инсталиран .NET.',
    afterInstall: 'След инсталацията работи без интернет, с локална SQLite база.',
    features: ['Сервизна история и разходи', 'Напомняния по дата и километри', 'Снимки и документи към автомобила'],
    screenshots: [
      { src: '/images/car-maintenance.png', alt: 'Управление на автомобилите в Car Maintenance', title: 'Автомобили', caption: 'Профил на автомобила с регистрация, пробег, гориво и бързи действия.' },
      { src: '/images/car-maintenance2.png', alt: 'Табло на автомобил в Car Maintenance', title: 'Табло на автомобила', caption: 'Текущ пробег, годишни разходи, активни сигнали и последни сервизни записи.' },
      { src: '/images/car-maintenance3.png', alt: 'Сервизен дневник в Car Maintenance', title: 'Сервизен дневник', caption: 'Филтрирани ремонти и обслужвания с отделни стойности за части и труд.' },
      { src: '/images/car-maintenance4.png', alt: 'Напомняния за обслужване в Car Maintenance', title: 'Напомняния за обслужване', caption: 'Следващи срокове по километри и дата с ясни цветни статуси за спешност.' },
    ],
    installNote: 'Малкият инсталатор изтегля приложението (около 55 MB) от GitHub и проверява SHA-256 – нужен е интернет.',
    downloads: {
      windows: { href: '/install/Car%20maintenance/CarMaintenance-Windows-Setup.exe', size: '17 KB' },
      macos: { href: '/install/Car%20maintenance/CarMaintenance-macOS-Install.zip', size: '1.5 KB' },
    },
  },
];
