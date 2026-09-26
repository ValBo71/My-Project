from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, PageBreak, KeepTogether

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT.parent / "output" / "pdf"
PUBLIC = ROOT / "public" / "manuals"
IMAGES = ROOT / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

font_dir = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Valbo", str(font_dir / "arial.ttf")))
pdfmetrics.registerFont(TTFont("ValboBold", str(font_dir / "arialbd.ttf")))

PRODUCTS = [
  dict(slug="observer-v2", name="Observer V2", version="Web desktop", images=["observer.png","observer-companies.png","observer-settings.png"],
    bg=dict(tag="Автоматизация", intro="Локално уеб приложение, което събира и подрежда обяви за работа от dev.bg, LinkedIn и jobs.bg. Таблото пази история, фирми, флагове и етапите на кандидатстване.",
      install=["Изтеглете инсталатора за Windows или macOS от продуктовата страница.","Стартирайте файла. При първата инсталация е нужен интернет за Python пакетите и Chromium.","Приложението отваря браузър на http://127.0.0.1:5001."],
      use=["Отворете Настройки и въведете адресите за търсене в dev.bg, jobs.bg и LinkedIn. Празен адрес изключва съответния източник.","Стартирайте обновяване, за да бъдат събрани новите обяви.","На основното табло търсете по фирма, позиция или технологии и комбинирайте филтрите за източник, място, дата и заплата.","Използвайте трите икони за CV, интервю и резултат. Всяка сменя състояние и го пази в локалната база.","Във Фирми обединявайте различни изписвания, добавяйте етикети и цветни флагове."],
      notes=["LinkedIn може да изисква активна сесия.","Изчистване на базата премахва обявите и фирмите, но запазва настроените адреси."]),
    en=dict(tag="Automation", intro="A local web app that gathers and organizes job listings from dev.bg, LinkedIn, and jobs.bg. Its dashboard keeps history, companies, flags, and application stages.",
      install=["Download the Windows or macOS installer from the product page.","Run the installer. The first setup needs internet access for Python packages and Chromium.","The app opens in your browser at http://127.0.0.1:5001."],
      use=["Open Settings and enter search URLs for dev.bg, jobs.bg, and LinkedIn. Leave a field empty to skip that source.","Start a refresh to collect new listings.","Use the dashboard to search by company, role, or technology and combine source, location, date, and salary filters.","Use the CV, interview, and result icons to track each application. Every state is saved locally.","Use Companies to merge spelling variants and add labels or color flags."],
      notes=["LinkedIn may require an active signed-in session.","Clear database removes listings and companies while keeping the configured URLs."])),
  dict(slug="dictionary", name="Dictionary", version="Web desktop", images=["dictionary.png","dictionary-exam.png","dictionary-dictionary.png","dictionary-import.png"],
    bg=dict(tag="Обучение", intro="Локално приложение за учене на думи с 3D флаш карти, писмен изпит, произношение, гласово упражнение и личен речник.",
      install=["Инсталирайте версията за Windows или macOS и стартирайте Dictionary.","За най-добро произношение и гласово разпознаване използвайте актуален Chrome или Edge и интернет връзка.","Речникът и прогресът се пазят локално в браузъра."],
      use=["В Импорт & Резервно копие изберете език и заредете включен Excel/CSV речник.","В Учене изберете един или няколко източника, размер на сесията и посока на превода.","Обърнете картата, после отбележете Знам я или Не я знам. Използвайте произношението при нужда.","В Изпит задайте език, брой въпроси и посока. Въведете преводите и прегледайте отчета с грешките.","В Речник добавяйте, търсете и редактирайте думи. Правете JSON или Excel резервно копие."],
      notes=["Разрешете достъп до микрофона за упражнението Кажи думата.","Данните са отделни за всеки браузър и адрес, затова пазете резервно копие."]),
    en=dict(tag="Learning", intro="A local vocabulary learning app with 3D flash cards, written exams, pronunciation, voice practice, and a personal dictionary.",
      install=["Install the Windows or macOS edition and launch Dictionary.","For the best speech and voice recognition, use a current Chrome or Edge browser with internet access.","Your vocabulary and progress are stored locally in the browser."],
      use=["In Import & Backup, select a language and load one of the included Excel/CSV dictionaries.","In Learn, choose one or more sources, session size, and translation direction.","Flip each card, then mark it Known or Unknown. Play pronunciation when needed.","In Exam, select language, question count, and direction. Enter translations and review the error report.","Use Dictionary to add, find, and edit words. Export a JSON or Excel backup regularly."],
      notes=["Allow microphone access for the Say the word exercise.","Data is separate for each browser and address, so keep a backup."])),
  dict(slug="spine-creep-calculator", name="Spine & Creep Calculator", version="Calculator", images=["spine-creep.png","spine-hardcover.png"],
    bg=dict(tag="Печат", intro="Калкулатор за дебелина на книжно гръбче и избутване при печатни коли. Поддържа мека и твърда корица и показва динамичен модел.",
      install=["Изтеглете и стартирайте инсталатора за вашата система.","Приложението работи локално и не изисква акаунт или база данни."],
      use=["Изберете вида на изчислението: гръбче или creep.","За гръбче изберете мека или твърда корица, въведете брой страници и хартия. При твърда корица задайте и параметрите на мукавата и гърба.","За creep въведете дебелина на хартията и размер на колата.","Прочетете изчисления резултат и проверете визуализацията преди да подготвите файла за печат.","При нужда добавете собствена хартия в библиотеката."],
      notes=["Проверете мерните единици и реалната дебелина от спецификацията на хартията."]),
    en=dict(tag="Printing", intro="A calculator for book spine width and signature creep. It supports softcover and hardcover books and includes a live visual model.",
      install=["Download and run the installer for your operating system.","The app works locally and requires no account or external database."],
      use=["Choose the calculation: spine width or creep.","For a spine, select softcover or hardcover, then enter page count and paper. For hardcover, also set board and spine parameters.","For creep, enter paper thickness and signature size.","Read the calculated value and inspect the visual model before preparing the print file.","Add a custom paper stock to the library when needed."],
      notes=["Confirm the units and actual caliper in the paper specification."])),
  dict(slug="indesign-booklet-creep", name="InDesign Booklet Creep", version="InDesign script", images=["indesign-placeholder.png"],
    bg=dict(tag="Печат", intro="Скрипт за Adobe InDesign, който компенсира избутването в брошури чрез прогресивно мащабиране на страниците спрямо гърба.",
      install=["Инсталирайте пакета за Windows или macOS.","Инсталаторът копира скрипта в потребителската папка Scripts Panel на InDesign.","Отворете InDesign и панела Window > Utilities > Scripts."],
      use=["Отворете готовия документ и запазете резервно копие.","В Scripts стартирайте InDesign Booklet Creep.","Въведете дебелина на хартията, размер на колата и начална страница.","Потвърдете операцията и прегледайте вътрешните и външните страници.","При нежелан резултат използвайте Undo и коригирайте параметрите."],
      notes=["Необходим е инсталиран Adobe InDesign.","Скриптът временно отключва нужните слоеве и възстановява състоянието им."]),
    en=dict(tag="Printing", intro="An Adobe InDesign script that compensates booklet creep by progressively scaling pages relative to the spine.",
      install=["Install the Windows or macOS package.","The installer copies the script to the current user's InDesign Scripts Panel folder.","Open InDesign and choose Window > Utilities > Scripts."],
      use=["Open the finished document and save a backup copy.","Run InDesign Booklet Creep from the Scripts panel.","Enter paper thickness, signature size, and starting page.","Confirm the operation and inspect inner and outer pages.","If the result is unsuitable, use Undo and adjust the values."],
      notes=["Adobe InDesign must be installed.","The script temporarily unlocks required layers and restores their state."])),
  dict(slug="printing-catalog", name="Printing Catalog", version="Network app", images=["printing-catalog-login.png","printing-catalog.png","printing-catalog-4.png","printing-catalog-5.png"], credentials=("admin","admin"),
    bg=dict(tag="Печат", intro="Мрежов каталог за щанци, преге клишета и инструменти за топъл печат с търсене, технически файлове, складови етикети и потребителски роли.",
      install=["Инсталирайте версията за Windows или macOS и стартирайте приложението.","Браузърът се отваря на http://localhost:5050. За достъп от друг компютър използвайте IP адреса на машината и порт 5050.","При първия Windows старт разрешете достъпа през защитната стена, ако ще се работи в локална мрежа."],
      use=["Влезте с първоначалния администраторски акаунт и сменете паролата веднага.","Изберете Щанци, Преге или Топъл печат. Търсете по код, име, клиент, размер, склад или статус.","С Добави въведете техническите данни, размерите, складовата позиция и приложете чертежи или CAD файл.","Превключвайте между карти и таблица. Отваряйте изображенията в преглед и отпечатвайте етикет 80 x 50 mm.","В Админ създавайте потребители и задавайте роли: администратор, редактиране или само преглед."],
      notes=["Данните се пазят отделно от програмата и остават при преинсталиране.","Бутонът за изход на администратора спира сървъра за всички потребители."]),
    en=dict(tag="Printing", intro="A network catalog for dies, embossing plates, and hot foil tools with search, technical files, shelf labels, and user roles.",
      install=["Install the Windows or macOS edition and launch the application.","The browser opens at http://localhost:5050. From another computer, use the host machine's IP address and port 5050.","On the first Windows run, allow firewall access if the catalog will be used on the local network."],
      use=["Sign in with the initial administrator account and change its password immediately.","Choose Dies, Embossing, or Hot foil. Search by code, name, client, size, storage location, or status.","Select Add to enter technical data, dimensions, storage position, drawings, and a CAD file.","Switch between cards and table view. Open drawings in the viewer and print 80 x 50 mm shelf labels.","Use Admin to create users and assign administrator, edit, or view-only roles."],
      notes=["Data is stored separately from the program and survives reinstallation.","The administrator power button stops the server for every connected user."])),
  dict(slug="car-maintenance", name="Car Maintenance", version="Desktop", images=["car-maintenance.png","car-maintenance2.png","car-maintenance3.png","car-maintenance4.png"],
    bg=dict(tag="Организация", intro="Личен автомобилен дневник за профили на автомобили, сервизни записи, разходи, документи и напомняния по дата или пробег.",
      install=["Изтеглете и стартирайте инсталатора за Windows или macOS.","При първо стартиране приложението създава локалната база автоматично.","Данните и прикачените файлове остават на вашия компютър."],
      use=["В Автомобили добавете профил с марка, модел, регистрация, VIN, гориво и текущ пробег. Прикачете снимка по желание.","Изберете активния автомобил от менюто.","В Сервизен дневник добавете ремонт или обслужване, стойност на части и труд и приложете фактура или снимка.","Създайте правило за поддръжка по километри, месеци или двете. Системата показва по-ранния срок.","Следете таблото: червено е просрочено, жълто наближава, зелено е в срок, а сиво означава недостатъчни данни."],
      notes=["Актуализирайте текущия пробег редовно, за да са точни напомнянията."]),
    en=dict(tag="Organization", intro="A personal vehicle log for car profiles, service records, costs, documents, and reminders based on date or mileage.",
      install=["Download and run the Windows or macOS installer.","On first launch, the app creates its local database automatically.","Your data and attachments remain on your computer."],
      use=["In Cars, add a profile with make, model, registration, VIN, fuel, and current mileage. Add a photo if desired.","Choose the active vehicle from the selector.","In Service log, add a repair or service, parts and labor costs, and attach an invoice or image.","Create a maintenance rule based on mileage, months, or both. The app uses whichever threshold comes first.","Read the dashboard colors: red is overdue, yellow is approaching, green is on time, and gray means more data is needed."],
      notes=["Update current mileage regularly so reminders remain accurate."]))
]

LABELS = {
 "bg": dict(manual="КРАТКО РЪКОВОДСТВО", about="За продукта", install="Инсталиране и първо стартиране", use="Как се работи", notes="Полезно да знаете", login="Първоначален вход", user="Потребител", password="Парола", figure="Екран от приложението", footer="ValBo Apps · Ръководство на потребителя"),
 "en": dict(manual="QUICK USER GUIDE", about="About the product", install="Installation and first launch", use="How to use it", notes="Useful notes", login="Initial sign-in", user="Username", password="Password", figure="Application screen", footer="ValBo Apps · User guide")
}

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="VTitle", fontName="ValboBold", fontSize=27, leading=31, textColor=colors.HexColor("#151515"), spaceAfter=8))
styles.add(ParagraphStyle(name="VTag", fontName="ValboBold", fontSize=9, leading=12, textColor=colors.HexColor("#E85D04"), spaceAfter=5))
styles.add(ParagraphStyle(name="VIntro", fontName="Valbo", fontSize=13, leading=19, textColor=colors.HexColor("#3D3D3D"), spaceAfter=12))
styles.add(ParagraphStyle(name="VH2", fontName="ValboBold", fontSize=17, leading=21, textColor=colors.HexColor("#151515"), spaceBefore=8, spaceAfter=7))
styles.add(ParagraphStyle(name="VBody", fontName="Valbo", fontSize=10.5, leading=15, textColor=colors.HexColor("#333333"), spaceAfter=5))
styles.add(ParagraphStyle(name="VBullet", fontName="Valbo", fontSize=10.5, leading=15, leftIndent=14, firstLineIndent=-10, textColor=colors.HexColor("#333333"), spaceAfter=5))
styles.add(ParagraphStyle(name="VCaption", fontName="Valbo", fontSize=8.5, leading=11, textColor=colors.HexColor("#666666"), alignment=TA_CENTER, spaceBefore=4))

def safe(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def page_deco(canvas, doc, label):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#E85D04")); canvas.rect(0, A4[1]-7*mm, A4[0], 7*mm, fill=1, stroke=0)
    canvas.setFont("Valbo", 8); canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawString(18*mm, 10*mm, label)
    canvas.drawRightString(A4[0]-18*mm, 10*mm, str(doc.page))
    canvas.restoreState()

def fit_image(path, max_w=174*mm, max_h=95*mm):
    im = Image(str(path))
    scale = min(max_w/im.imageWidth, max_h/im.imageHeight)
    im.drawWidth = im.imageWidth*scale; im.drawHeight = im.imageHeight*scale
    return im

def build(product, lang):
    text = product[lang]; lab = LABELS[lang]
    filename = f"{product['slug']}-{lang}.pdf"
    out = OUT / filename
    doc = SimpleDocTemplate(str(out), pagesize=A4, rightMargin=18*mm, leftMargin=18*mm, topMargin=18*mm, bottomMargin=18*mm,
                            title=f"{product['name']} - {lab['manual']}", author="ValBo Apps")
    story = [Spacer(1, 10*mm), Paragraph(lab["manual"], styles["VTag"]), Paragraph(safe(product["name"]), styles["VTitle"]),
             Paragraph(f"{safe(text['tag'])} · {safe(product['version'])}", styles["VTag"]), Spacer(1, 4*mm),
             fit_image(IMAGES/product["images"][0], max_h=96*mm), Spacer(1, 5*mm), Paragraph(safe(text["intro"]), styles["VIntro"]),
             PageBreak(), Paragraph(lab["about"], styles["VH2"]), Paragraph(safe(text["intro"]), styles["VBody"]),
             Paragraph(lab["install"], styles["VH2"])]
    story += [Paragraph(f"<b>{i}.</b> {safe(v)}", styles["VBullet"]) for i,v in enumerate(text["install"],1)]
    if product.get("credentials"):
        u,p=product["credentials"]
        story += [Paragraph(lab["login"], styles["VH2"]), Paragraph(f"<b>{lab['user']}:</b> {u}<br/><b>{lab['password']}:</b> {p}", styles["VBody"])]
    story += [Paragraph(lab["use"], styles["VH2"])]
    story += [Paragraph(f"<b>{i}.</b> {safe(v)}", styles["VBullet"]) for i,v in enumerate(text["use"],1)]
    story += [Paragraph(lab["notes"], styles["VH2"])] + [Paragraph(f"• {safe(v)}", styles["VBullet"]) for v in text["notes"]]
    for idx, image_name in enumerate(product["images"][1:] or product["images"][:1],1):
        story += [PageBreak(), KeepTogether([fit_image(IMAGES/image_name, max_h=205*mm), Paragraph(f"{lab['figure']} {idx}", styles["VCaption"])])]
    doc.build(story, onFirstPage=lambda c,d: page_deco(c,d,lab["footer"]), onLaterPages=lambda c,d: page_deco(c,d,lab["footer"]))
    (PUBLIC/filename).write_bytes(out.read_bytes())
    return out

if __name__ == "__main__":
    for product in PRODUCTS:
        for language in ("bg", "en"):
            print(build(product, language))
