# QA Automation & Software Engineering Portfolio

Добре дошли в моето портфолио! Тук са събрани различни проекти, задачи и практически разработки в областта на софтуерното тестване, автоматизацията и уеб разработката, създадени по време на обучението ми в **Telerik Academy** и като лични практически проекти.

---

## 📂 Структура на хранилището

Проектите са организирани логически по категории и технологичен стек:

### 🔍 1. Web Projects (`01. WEB project`)
* **01. Telerik web project**: Уеб проекти, разработени като част от обучението в Telerik.
* **02. Personal site**: Персонален уебсайт (HTML, CSS, JavaScript).

### 🖥️ 2. UI Automation (`02. UI Testing`)
* **01. Cucumber**: Автоматизирани тестове за потребителски интерфейс, написани с помощта на BDD фреймуърка Cucumber.
* **02. Selenium_PageObject**: Тестове с Selenium WebDriver, реализиращи дизайна **Page Object Model (POM)** за по-лесна поддръжка и преизползваемост на кода.

### 🖼️ 3. Sikuli GUI Automation (`03. Sikuli`)
* **ValentinBogdanov.sikuli**: Скриптове за автоматизация на десктоп приложения, базирани на разпознаване на изображения (Image Recognition) с инструмента Sikuli.

### 🔌 4. API Testing (`04. API Testing`)
Колекции и проекти за автоматизирано тестване на REST API услуги:
* **01. API testing with Postman**: Колекции с тестове и среди за автоматизация в Postman.
* **02. API testing with RestAssured**: Тестови сценарии на Java, използващи библиотеката REST Assured.
* **03. API testing with RestSharp**: Тестване на API на C# чрез библиотеката RestSharp.

### ⚡ 5. Performance & Load Testing (`06. Performance Tests`)
* **01. JMeter**: Тестови планове (JMX) за натоварване и производителност с Apache JMeter.
* **02. K6**: Модерни скриптове за натоварване на JavaScript, изпълнявани с инструмента Grafana k6.

### 🎮 6. JavaScript Applications (`07. JavaScript application`)
* **01. JavaScript Web Games**: Интерактивни уеб игри и приложения, написани на чист JavaScript (Vanilla JS).

### 🎭 7. Playwright Automation (`08.Playwright`)
Проекти с Playwright — един от най-модерните инструменти за UI и API автоматизация:
* **1. FirstProject**: Начални тестови сценарии и запознаване с възможностите на Playwright.
* **2. Api testing**: Автоматизация на API заявки директно през Playwright контекста.
* **3. TS and Playwright project**: Тестови структури, използващи TypeScript и Playwright Test Runner.

---

## 🚀 Основен проект: **Observer (Automation QA Jobs Tracker)**

`Observer` е пълнофункционално уеб приложение (Dashboard), създадено за автоматично проследяване на нови обяви за работа в сферата на **Automation QA** в България.

### 💡 Основни възможности:
* **Мултиплатформено сканиране (Scraping)**:
  * Извлича данни за обяви от **dev.bg**, **LinkedIn** (чрез Playwright с байпас на сесия/бисквитки) и **jobs.bg** (чрез Playwright с байпас на DataDome бот защита).
* **Интелигентно парсване на детайли**:
  * Автоматично извлича информация за заплата, брой дни платен годишен отпуск и изисквани технологии (Tech Stack).
  * Поддържа двата формата на jobs.bg (custom HTML в iframe и стандартни темплейти).
* **База данни**: Записва обявите в SQLite база с автоматична валидация за избягване на дублиране на записи.
* **Филтриране и търсене в реално време (Frontend)**:
  * Търсене по свободен текст (технология, фирма, заглавие).
  * Филтриране по компания и локация (Remote / Hybrid / София).
  * Филтриране по източник (`dev.bg`, `LinkedIn`, `jobs.bg`).
  * Филтриране по допълнителни изисквания (само със заплата, само с упоменат отпуск).
  * **Филтриране по дата**: Бързи бутони за показване на обяви от „Само днес“, „Последните 3 дни“ или „Последните 7 дни“ (базирано на календарни изчисления).
* **Сортиране**: Всички обяви се подреждат автоматично хронологично с най-новите най-отгоре.

### 🛠️ Технологичен стек:
* **Backend**: Python, Flask, Playwright, SQLite, BeautifulSoup (lxml).
* **Frontend**: HTML5, Vanilla CSS (Premium Light Theme, Glassmorphic ефекти), JavaScript (AJAX).

---

## 🛠️ Как да стартирате проекта `Observer` локално:

1. **Клонирайте хранилището**:
   ```bash
   git clone https://github.com/ValBo71/My-Project.git
   cd My-Project/Observer
   ```

2. **Инсталирайте нужните библиотеки**:
   ```bash
   pip install -r requirements.txt
   playwright install chromium
   ```

3. **Конфигурирайте данните за LinkedIn**:
   В директорията `Observer/` създайте файл `linkedin_credentials.json` с Вашия имейл и парола:
   ```json
   {
     "email": "your_email@example.com",
     "password": "your_password"
   }
   ```

4. **Стартирайте приложението**:
   Изпълнете файла `run.bat` или стартирайте директно с:
   ```bash
   python app.py
   ```
   Отворете браузъра си на адрес [http://127.0.0.1:5000](http://127.0.0.1:5000).

---

✉️ **Контакти**:
Ако имате въпроси относно проектите или искате да се свържете с мен, можете да го направите чрез моя GitHub профил [ValBo71](https://github.com/ValBo71).
