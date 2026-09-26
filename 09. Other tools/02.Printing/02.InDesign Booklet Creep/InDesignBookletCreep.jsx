/**
 * @title InDesign Booklet Creep Script (Scale-based)
 * @description Скрипт за автоматично хоризонтално скалиране (свиване) на обекти в коли за шиене (Booklet Creep).
 * @author ValBo
 * @version 2.1
 */

(function() {
    // Проверка за отворен документ
    if (app.documents.length === 0) {
        alert("Внимание: Моля, отворете документ в InDesign, преди да стартирате скрипта.", "Няма отворен документ");
        return;
    }

    var doc = app.activeDocument;

    // 1. Създаване на основния потребителски интерфейс
    var dialog = new Window("dialog", "Калкулатор за Избутване в Коли (Скалиране)");
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

    // Падащо меню за размер на колата (генерираме всички възможни делими на 4 размера до 128)
    var sigGroup = infoPanel.add("group");
    sigGroup.add("statictext", undefined, "Размер на колата (страници):");
    var sigSizes = [];
    for (var s = 4; s <= 64; s += 4) {
        sigSizes.push(s.toString());
    }
    var sigDropdown = sigGroup.add("dropdownlist", undefined, sigSizes);
    sigDropdown.selection = 3; // 16 страници по подразбиране

    // Поле за начална страница във файла (поредна позиция, не номерацията на секцията)
    var startPageGroup = infoPanel.add("group");
    startPageGroup.add("statictext", undefined, "Начална страница (поредна в документа):");
    var startPageInput = startPageGroup.add("edittext", undefined, "1");
    startPageInput.characters = 10;

    // Описание на логиката за скалиране
    var descGroup = infoPanel.add("group");
    var descText = descGroup.add("statictext", undefined, "Скриптът скалира хоризонтално обектите спрямо гръбчето (spine), за да се запази еднакъв размерът на външните полета (фаши) в крайното обрязано изделие. Началната страница е поредната ѝ позиция в документа (1 = първата страница), независимо от номерацията на секциите. Заключените обекти и слоеве се отключват временно и се заключват обратно.", {multiline: true});
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
        if (isNaN(startPg) || startPg <= 0 || startPg > doc.pages.length) {
            alert("Моля, въведете поредна страница от 1 до " + doc.pages.length + ".");
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

    // Началната страница е поредна позиция в документа (1 = първата страница), а не
    // page.name - то следва номерацията на секцията (римски цифри, рестартирана номерация и т.н.).
    var startIndex = startPageNumber - 1;
    var pageCount = doc.pages.length - startIndex;

    // Броят страници трябва да запълва цели коли. Ако последната кола е по-малка
    // (например 36 страници = 2 x 16 + 4), тя се обработва като отделна по-малка кола.
    var lastSigSize = pageCount % signatureSize;
    if (lastSigSize !== 0) {
        if (lastSigSize % 4 !== 0) {
            alert("Грешка: " + pageCount + " страници от страница " + startPageNumber + " нататък не могат да се разделят на коли от " +
                  signatureSize + " страници - остават " + lastSigSize + ", а една кола трябва да е кратна на 4.\n\n" +
                  "Проверете началната страница и броя страници в документа.", "Непълна кола");
            return;
        }
        if (!confirm(pageCount + " страници не се делят на коли от " + signatureSize + " страници.\n\n" +
                     "Последната кола ще бъде обработена като отделна кола от " + lastSigSize + " страници. Да продължа ли?",
                     false, "Непълна последна кола")) {
            return;
        }
    }

    var POINTS_PER_MM = 72 / 25.4;
    var stats = { pages: 0, items: 0, skipped: 0, masterFailed: 0 };
    var modified = false;
    var failure = null;

    // Позиция на страницата в нейната кола и размерът на тази кола
    function signatureInfo(relIndex) {
        var fullSigPages = pageCount - lastSigSize;
        if (relIndex < fullSigPages) {
            return { size: signatureSize, pageInSig: (relIndex % signatureSize) + 1 };
        }
        return { size: lastSigSize, pageInSig: (relIndex - fullSigPages) + 1 };
    }

    // 3. Основна функция за скалиране
    function runCreepScaling() {
        var layersToRelock = [];
        var itemsToRelock = [];

        function unlockLayer(layer) {
            for (var n = 0; n < layersToRelock.length; n++) {
                if (layersToRelock[n] === layer) {
                    return;
                }
            }
            layer.locked = false;
            layersToRelock.push(layer);
        }

        try {
            for (var i = startIndex; i < doc.pages.length; i++) {
                var page = doc.pages[i];
                var sig = signatureInfo(i - startIndex);

                // Индекс на листа в колата (0-индексиран отвън навътре)
                var sheetIdx;
                if (sig.pageInSig <= sig.size / 2) {
                    sheetIdx = Math.floor((sig.pageInSig - 1) / 2);
                } else {
                    sheetIdx = Math.floor((sig.size - sig.pageInSig) / 2);
                }

                // Пресмятане на дебелината на избутване (D = sheetIdx * paperThickness)
                var displacement = sheetIdx * paperThickness;
                if (displacement === 0) {
                    continue; // Най-външният лист не се променя - и мастер обектите му не се откъсват
                }

                // Гръбчето (spine) е ръбът на страницата, а не ръбът на обектите:
                // Лява страница (LEFT_HAND) -> гръбчето е отдясно
                // Дясна страница (RIGHT_HAND) -> гръбчето е отляво
                var spineOnRight;
                if (page.side === PageSideOptions.LEFT_HAND) {
                    spineOnRight = true;
                } else if (page.side === PageSideOptions.RIGHT_HAND) {
                    spineOnRight = false;
                } else {
                    // Ако не е в режим разтвори (facing pages): четните страници са леви
                    spineOnRight = (sig.pageInSig % 2 === 0);
                }

                // Координатите на страницата в pasteboard пространството (в пунктове)
                var topLeft = page.resolve(AnchorPoint.TOP_LEFT_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES)[0];
                var bottomRight = page.resolve(AnchorPoint.BOTTOM_RIGHT_ANCHOR, CoordinateSpaces.PASTEBOARD_COORDINATES)[0];
                var pageWidth = bottomRight[0] - topLeft[0];
                var spinePoint = [spineOnRight ? bottomRight[0] : topLeft[0], (topLeft[1] + bottomRight[1]) / 2];

                // Коефициент на хоризонтално свиване: външният ръб на страницата се прибира с D
                var scaleX = (pageWidth - displacement * POINTS_PER_MM) / pageWidth;
                if (!(scaleX > 0)) {
                    throw new Error("Избутването (" + displacement.toFixed(3) + " мм) е по-голямо от ширината на страница " + page.name + ".");
                }

                // Откъсване (override) само на мастер обектите, които се виждат на тази страница
                // (page.masterPageItems - от правилната лява/дясна мастер страница), за да могат да се скалират.
                var masterItems = page.masterPageItems;
                for (var m = 0; m < masterItems.length; m++) {
                    try {
                        if (masterItems[m].itemLayer.locked) {
                            unlockLayer(masterItems[m].itemLayer);
                        }
                        masterItems[m].override(page);
                        modified = true;
                    } catch (errOverride) {
                        stats.masterFailed++;
                    }
                }

                // Събиране на обектите на страницата (само тези от най-горно ниво)
                var items = page.pageItems.everyItem().getElements();
                var matrix = null;
                var pageScaled = false;

                for (var j = 0; j < items.length; j++) {
                    var item = items[j];
                    var isTopLevel = (item.parent instanceof Page || item.parent.constructor.name === "Page" ||
                                      item.parent instanceof Spread || item.parent.constructor.name === "Spread");
                    if (!isTopLevel) {
                        continue;
                    }

                    // Заключените слоеве и обекти се отключват временно и се заключват обратно накрая
                    if (item.itemLayer.locked) {
                        unlockLayer(item.itemLayer);
                    }
                    if (item.locked) {
                        item.locked = false;
                        itemsToRelock.push(item);
                    }

                    // Всеки обект се трансформира поотделно (без временна група, която би сменила
                    // слоя и реда на наслагване) с една и съща матрица около точката на гръбчето в
                    // pasteboard координати - независимо от завъртане/огледалност на обекта.
                    // Съдържанието (картинки, текст) се скалира заедно с рамката, както при група.
                    if (matrix === null) {
                        matrix = app.transformationMatrices.add({ horizontalScaleFactor: scaleX });
                    }
                    try {
                        item.transform(CoordinateSpaces.PASTEBOARD_COORDINATES, spinePoint, matrix);
                        modified = true;
                        pageScaled = true;
                        stats.items++;
                    } catch (errItem) {
                        stats.skipped++;
                    }
                }

                if (pageScaled) {
                    stats.pages++;
                }
            }
        } catch (err) {
            failure = err;
        } finally {
            // Заключенията се възстановяват винаги, и при грешка
            for (var r = 0; r < itemsToRelock.length; r++) {
                try { itemsToRelock[r].locked = true; } catch (e1) {}
            }
            for (var l = 0; l < layersToRelock.length; l++) {
                try { layersToRelock[l].locked = true; } catch (e2) {}
            }
        }
    }

    // 4. Изпълнение на кода в Undo транзакция за лесно отменяне (Ctrl+Z)
    app.doScript(runCreepScaling, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Booklet Creep Scaling");

    var summary = "- Обработени страници (от " + startPageNumber + " до " + doc.pages.length + "): " + pageCount + "\n" +
                  "- Свити страници: " + stats.pages + "\n" +
                  "- Свити обекти: " + stats.items + "\n" +
                  "- Пропуснати обекти (не могат да се трансформират): " + stats.skipped + "\n" +
                  "- Мастер обекти, които не могат да се откъснат (остават несвити): " + stats.masterFailed;

    if (failure !== null) {
        var undoNow = modified && confirm("Грешка при скалирането: " + failure.message + "\n\n" +
                                          "Част от страниците вече са променени. Да отменя ли всички промени на скрипта?",
                                          false, "Грешка");
        if (undoNow) {
            doc.undo(); // Цялото изпълнение е една Undo стъпка (UndoModes.ENTIRE_SCRIPT)
        } else if (modified) {
            alert("Промените остават частични. Можете да ги отмените изцяло с Ctrl+Z (Cmd+Z).\n\n" + summary, "Грешка");
        } else {
            alert("Грешка при скалирането: " + failure.message + "\n\nДокументът не е променен.", "Грешка");
        }
        return;
    }

    alert("Успешно приключване на хоризонталното скалиране!\n\n" + summary, "Успешно изпълнение");

})();
