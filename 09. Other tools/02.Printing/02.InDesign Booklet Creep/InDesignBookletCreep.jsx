/**
 * @title InDesign Booklet Creep Script
 * @description Скрипт за автоматично избутване на обекти в коли за шиене (Booklet Creep).
 * @author ValBo
 * @version 1.0
 */

(function() {
    // Проверка за отворен документ
    if (app.documents.length === 0) {
        alert("Внимание: Моля, отворете документ в InDesign, преди да стартирате скрипта.", "Няма отворен документ");
        return;
    }

    var doc = app.activeDocument;

    // 1. Създаване на основния потребителски интерфейс
    var dialog = new Window("dialog", "Калкулатор за Избутване в Коли (Booklet Creep)");
    dialog.alignChildren = "fill";
    dialog.spacing = 15;

    // Информационен панел
    var infoPanel = dialog.add("panel", undefined, "Въведете параметри");
    infoPanel.alignChildren = "left";
    infoPanel.spacing = 10;
    infoPanel.margins = 15;

    // Поле за дебелина на хартията
    var paperGroup = infoPanel.add("group");
    paperGroup.add("statictext", undefined, "Дебелина на хартията (мм):");
    var paperInput = paperGroup.add("edittext", undefined, "0.155");
    paperInput.characters = 10;

    // Падащо меню за размер на колата
    var sigGroup = infoPanel.add("group");
    sigGroup.add("statictext", undefined, "Размер на колата (страници):");
    var sigDropdown = sigGroup.add("dropdownlist", undefined, ["4", "8", "12", "16", "24", "32", "64"]);
    sigDropdown.selection = 3; // 16 страници по подразбиране

    // Поле за начална страница във файла
    var startPageGroup = infoPanel.add("group");
    startPageGroup.add("statictext", undefined, "Начална страница във файла (номер):");
    var startPageInput = startPageGroup.add("edittext", undefined, "1");
    startPageInput.characters = 10;

    // Описание на логиката за избутване
    var descGroup = infoPanel.add("group");
    var descText = descGroup.add("statictext", undefined, "Скриптът премества обектите към гръбчето на книгата според вложеността на листите в колата за шиене.", {multiline: true});
    descText.preferredSize.width = 320;

    // Група за бутони
    var buttonsGroup = dialog.add("group");
    buttonsGroup.alignment = "right";
    var cancelBtn = buttonsGroup.add("button", undefined, "Отказ", {name: "cancel"});
    var okBtn = buttonsGroup.add("button", undefined, "Изпълни", {name: "ok"});

    // Дефиниране на поведение при натискане на ОК
    okBtn.onClick = function() {
        // Валидация на дебелината на хартията
        var thick = parseFloat(paperInput.text.replace(",", "."));
        if (isNaN(thick) || thick <= 0) {
            alert("Моля, въведете валидно число за дебелина на хартията (например: 0.155).");
            return;
        }

        // Валидация на началната страница
        var startPg = parseInt(startPageInput.text, 10);
        if (isNaN(startPg) || startPg <= 0) {
            alert("Моля, въведете валидно число за начална страница (например: 1).");
            return;
        }

        dialog.close(1);
    };

    cancelBtn.onClick = function() {
        dialog.close(0);
    };

    // Показване на диалоговия прозорец
    if (dialog.show() !== 1) {
        return; // Потребителят е отказал операцията
    }

    // Извличане на параметрите след одобрение
    var paperThickness = parseFloat(paperInput.text.replace(",", "."));
    var signatureSize = parseInt(sigDropdown.selection.text, 10);
    var startPageNumber = parseInt(startPageInput.text, 10);

    // Намиране на началната страница в колекцията на InDesign (0-индексирана)
    var startIndex = -1;
    for (var p = 0; p < doc.pages.length; p++) {
        // Сравняваме името (номерацията) на страницата
        if (doc.pages[p].name == startPageNumber.toString()) {
            startIndex = p;
            break;
        }
    }

    if (startIndex === -1) {
        alert("Грешка: Не е намерена страница с номер '" + startPageNumber + "' в документа.");
        return;
    }

    // 2. Сканиране за заключени обекти на таргетираните страници
    var lockedItemsByPage = {};
    var hasLockedItems = false;

    for (var i = startIndex; i < doc.pages.length; i++) {
        var page = doc.pages[i];
        var items = page.pageItems;
        
        for (var j = 0; j < items.length; j++) {
            var item = items[j];
            // Проверяваме дали е обект на най-горно ниво на страницата (не в група)
            var isTopLevel = (item.parent instanceof Page || item.parent.constructor.name === "Page");
            
            if (isTopLevel && item.locked) {
                var pName = page.name;
                if (!lockedItemsByPage[pName]) {
                    lockedItemsByPage[pName] = 0;
                }
                lockedItemsByPage[pName]++;
                hasLockedItems = true;
            }
        }
    }

    var lockedAction = "skip"; // По подразбиране пропуска заключените

    // Ако има заключени обекти, показваме диалогов прозорец за избор на действие
    if (hasLockedItems) {
        var lockedMsg = "Внимание: Намерени бяха заключени обекти на следните страници:\n\n";
        for (var pName in lockedItemsByPage) {
            lockedMsg += "- Страница " + pName + " (" + lockedItemsByPage[pName] + " заключени обекта)\n";
        }
        lockedMsg += "\nИзберете как скриптът да се справи с тях:";

        var lockedDialog = new Window("dialog", "Заключени обекти в документа");
        lockedDialog.alignChildren = "fill";
        lockedDialog.spacing = 15;

        var textLabel = lockedDialog.add("statictext", undefined, lockedMsg, {multiline: true});
        textLabel.preferredSize.width = 420;

        var actionGroup = lockedDialog.add("group");
        actionGroup.alignment = "center";
        actionGroup.spacing = 10;
        
        var unlockBtn = actionGroup.add("button", undefined, "Отключи и премести");
        var skipBtn = actionGroup.add("button", undefined, "Пропусни ги");
        var abortBtn = actionGroup.add("button", undefined, "Откажи операцията");

        unlockBtn.onClick = function() {
            lockedAction = "unlock";
            lockedDialog.close(1);
        };

        skipBtn.onClick = function() {
            lockedAction = "skip";
            lockedDialog.close(1);
        };

        abortBtn.onClick = function() {
            lockedAction = "cancel";
            lockedDialog.close(0);
        };

        if (lockedDialog.show() !== 1 || lockedAction === "cancel") {
            return; // Отмяна на операцията
        }
    }

    // 3. Основна функция за преместване
    function runCreepCalculation() {
        var originalXUnits = doc.viewPreferences.horizontalMeasurementUnits;
        // Задаваме мерните единици временно на милиметри за прецизно местене
        doc.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.MILLIMETERS;

        var shiftedCount = 0;
        var skippedCount = 0;

        try {
            for (var i = startIndex; i < doc.pages.length; i++) {
                var page = doc.pages[i];
                var relIndex = i - startIndex;
                
                // Намиране на позицията на страницата в текущата кола (1-индексирана от 1 до signatureSize)
                var pageInSig = (relIndex % signatureSize) + 1;
                
                // Пресмятане на индекса на листа в колата (0-индексиран отвън навътре)
                var sheetIdx = 0;
                var halfSig = signatureSize / 2;
                if (pageInSig <= halfSig) {
                    sheetIdx = Math.floor((pageInSig - 1) / 2);
                } else {
                    sheetIdx = Math.floor((signatureSize - pageInSig) / 2);
                }

                // Преместване (избутване) = индекс на листа * дебелина на хартията
                var displacement = sheetIdx * paperThickness;
                if (displacement === 0) {
                    continue; // Най-външният лист не се измества
                }

                // Посока на изместване към гръбчето (spine):
                // Лява страница (LEFT_HAND) -> измества се надясно (+dX)
                // Дясна страница (RIGHT_HAND) -> измества се наляво (-dX)
                var dX = 0;
                if (page.side === PageSideOptions.LEFT_HAND) {
                    dX = displacement;
                } else if (page.side === PageSideOptions.RIGHT_HAND) {
                    dX = -displacement;
                } else {
                    // Ако документът не е на разтвори (facing pages), определяме спрямо четност на страницата в колата
                    if (pageInSig % 2 === 0) {
                        dX = displacement; // Лява
                    } else {
                        dX = -displacement; // Дясна
                    }
                }

                // Преместване на обектите
                var items = page.pageItems;
                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    var isTopLevel = (item.parent instanceof Page || item.parent.constructor.name === "Page");

                    if (isTopLevel) {
                        if (item.locked) {
                            if (lockedAction === "unlock") {
                                item.locked = false;
                                item.move(undefined, [dX, 0]);
                                item.locked = true; // Заключва се обратно
                                shiftedCount++;
                            } else {
                                skippedCount++;
                            }
                        } else {
                            item.move(undefined, [dX, 0]);
                            shiftedCount++;
                        }
                    }
                }
            }

            // Връщане на оригиналните мерни единици
            doc.viewPreferences.horizontalMeasurementUnits = originalXUnits;

            // Извеждане на съобщение за край
            var msg = "Успешно приключване на избутването!\n\n" +
                      "- Преместени обекти: " + shiftedCount + "\n";
            if (skippedCount > 0) {
                msg += "- Пропуснати заключени обекти: " + skippedCount + "\n";
            }
            alert(msg, "Успешно изпълнение");

        } catch (err) {
            // Връщане на оригиналните мерни единици при грешка
            doc.viewPreferences.horizontalMeasurementUnits = originalXUnits;
            alert("Грешка при преместването: " + err.message, "Грешка");
        }
    }

    // 4. Изпълнение на кода в Undo транзакция за лесно отменяне (Ctrl+Z)
    app.doScript(runCreepCalculation, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Booklet Creep Shifting");

})();
