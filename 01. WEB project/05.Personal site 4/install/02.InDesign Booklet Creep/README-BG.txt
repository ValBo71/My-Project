InDesign Booklet Creep — инсталация

За този продукт е необходим Adobe InDesign. Adobe InDesign не е включен.

Windows:
Отворете InDesignBookletCreep-Windows-Setup.exe. Инсталаторът намира съществуващите потребителски профили на InDesign и добавя скрипта в Scripts Panel/Printing Tools. Ако няма профил, скриптът се записва в Documents/Printing Tools и се показва инструкция за ръчно копиране.

macOS:
Разархивирайте InDesignBookletCreep-macOS-Install.zip и отворете Install InDesign Booklet Creep.command. Скриптът се добавя към намерените InDesign профили. Ако няма профил, се записва в ~/Documents/Printing Tools.

При съществуваща различна версия на скрипта се създава резервно копие с разширение .bak. Пакетите са неподписани и системата може да поиска потвърждение. Mac вариантът е проверен синтактично, но не е изпълняван на реален Mac.

След инсталация: InDesign → Window → Utilities → Scripts → User → Printing Tools → InDesignBookletCreep.jsx.

Продуктът няма база данни. Проверено е, че вложеният JSX файл е идентичен с файла от проекта.

Версия 2.1 (26.09.2026): обектите се свиват поотделно около гръбчето (слоевете и редът на наслагване се запазват, завъртени и огледални обекти се свиват правилно), непълна последна кола се разпознава, мастер обектите се откъсват само на свиваните страници, началната страница е поредната в документа, заключенията се възстановяват и при грешка, а отчетът показва свитите и пропуснатите обекти.

Проверено (26.09.2026): вграденият скрипт в EXE и в macOS пакета съвпада байт по байт с версия 2.1 от репото; .command е с право за изпълнение и минава bash -n. Логиката на скрипта е проверена с имитация на InDesign (19 проверки); в истински InDesign и на реален Mac не е изпълнявана.

Сглобяване: build-source/build_installer.py взима скрипта от комитнатата версия (git HEAD), компилира setup.cs с .NET Framework csc.exe и вгражда скрипта като base64 в Install InDesign Booklet Creep.template.command.

Adobe описва потребителската папка Scripts Panel тук:
https://helpx.adobe.com/indesign/desktop/automation-and-scripting/document-automation/automate-workflows-with-scripts.html
