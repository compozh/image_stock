'use strict';

let gallery = [];

let btnFileSelect = document.getElementById("btn-file-select");
btnFileSelect.addEventListener("click", function () {
    inpFileSelect.click();
});

let inpFileSelect = document.getElementById("inp-file-select");
inpFileSelect.addEventListener('change', function () {
    let images = checkImage(this);
    addImage(images);
});

let popup = document.getElementById('popup');
let popupImageFrame = document.querySelector('.popup-image-frame');

let popupCommentsCount = document.querySelector('.popup-total-comments span');
let popupCommentsStack = document.querySelector('.popup-comments-stack');

let popupFormName = document.querySelector('form input');
let popupFormText = document.querySelector('form textarea');
let popupFormSubmit = document.getElementById('popup-form-btn');
popupFormSubmit.addEventListener('click', function (event) {
    event.preventDefault();
    sendComment(event.path[3].children[1].firstChild);
});

let btnPopupClose = document.querySelector('.btn-popup-close');
btnPopupClose.addEventListener('click', function () {
    popup.style.display = 'none'; // Скрытие окна
    popupImageFrame.innerHTML = ''; // Удаление картинки
    popupCommentsCount.innerHTML = ''; // Обнуление счета комментариев
    popupCommentsStack.innerHTML = ''; // Чистка списка комментариев
    clearInputField();
});

function checkImage(input) {

    let images = [];
    // Перебор фалов (объекта FileList)
    for (let file of input.files) {
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            alert('Файл ' + file.name + ' не являеться изображением!');
            continue;
        }
        // Запись изображений массив
        images.push(file);
    }
    return images;
}

function addImage(images) {

    for (let img of images) {
        let imgNode = document.createElement('img');
        setAttribute(img, imgNode); // Определение и запись атрибутов
        newImgObj(imgNode); // Запись данных изображения в объект
        thumbnailRender(imgNode); // Вывод изображения в галерею
    }
}

function setAttribute(imgFile, imgNode) {
    // Запись атрибутов id, src, alt
    let reader = new FileReader();
    reader.onload = (function () {
        imgNode.src = reader.result;
    });
    imgNode.id = +gallery.length;
    imgNode.alt = imgFile.name;
    reader.readAsDataURL(imgFile);
}

function newImgObj(imgNode) {
    // Запись данных изображения в объект
    let image = {
        id : imgNode.id,
        likes : 0,
        dislikes : 0,
        comments : []
    };
    // Добавление изображения в глобальный массив
    gallery.push(image);
}

function thumbnailRender(imgNode) {
    // Создание контейнера для изображения
    let figure = document.createElement('figure');
    // Создание блока с информацией
    let figcaption = document.createElement('figcaption');
    figcaption.innerHTML = `<div class="dislikes"><span>${gallery[imgNode.id].dislikes}</span></div>
                            <div class="likes"><span>${gallery[imgNode.id].likes}</span></div>
                            <div class="comments"><span>${gallery[imgNode.id].comments.length}</span></div>`;
    // Запись элементов в контейнер
    figure.appendChild(figcaption);
    // Определение положения контейнера и изображения в нем
    setPositionClass(imgNode, figure);
    // Вывод изображения
    document.getElementById('gallery').insertBefore(figure, document.getElementById('btn-add-image'));
    // Привязка события - открытие PoPup по клику
    openPopup(figure);
}

function setPositionClass(imgNode, container) {
    // Определение высоты и ширины изображения
    imgNode.addEventListener('load', function () {

        let imgHeight = this.naturalHeight;
        let imgWidth = this.naturalWidth;
        let imgScale = imgWidth / imgHeight;
        gallery[imgNode.id].scale = imgScale;

        if (imgScale <= 0.79) {
            container.classList.add('vertical');
            imgNode.style.height = '410px';

        } else if (imgScale <= 1.18) {
            container.classList.add('square');
            imgNode.style.width = '236px';

        } else if (imgScale <= 1.77) {
            container.classList.add('square');
            imgNode.style.height = '200px';

        } else {
            container.classList.add('horizontal');
            imgNode.style.width = '482px';
        }
        container.insertBefore(imgNode, container.firstChild);
    });
}

function openPopup(container) {
    // Открытие PoPup по клику на картинку
    container.addEventListener('click', function () {
        popup.style.display = 'block';
        popupDataFilling(this);
    });
}

function popupDataFilling(container) {
    // Определение картинки по которой был клик
    let img = container.querySelector('img');
    // Вывод изображения с лайками и дизлайками
    imageToPopup(img);
    // Вывод счета комментариев
    updCommentCount(img);
    // Вывод комментариев
    readImageComments(img);
}

function imageToPopup(img) {
    // Определение размеров изображения в окне
    let scale = gallery[img.id].scale;
    let width, height;
    if (scale >= 1) {
        height = 100 + '%';
        width = 'auto';
    } else {
        width = 100 + '%';
        height = 'auto';
    }
    // Вывод изображения
    popupImageFrame.innerHTML = `<img id='${img.id}' src='${img.src}' width='${width}' height='${height}'>
                                 <figcaption>
                                     <div class="btn-popup-dislikes"><span>${gallery[img.id].dislikes}</span></div>
                                     <div class="btn-popup-likes"><span>${gallery[img.id].likes}</span></div>
                                 </figcaption>`;
    // Установка обработчика кликов
    setLikesDislikesButtons(img);
}

function setLikesDislikesButtons(img) {

    let popupBtnDislikes = document.querySelector('.btn-popup-dislikes');
    popupBtnDislikes.addEventListener('click', function () {
        // Увеличение счета дизлайков по клику
        let dislikes = ++gallery[img.id].dislikes;
        // Изменение количества на кнопке
        popupBtnDislikes.childNodes[0].innerHTML = dislikes;
        // Изменение количества в иконке на миниатюре
        let span = document.getElementById(img.id).nextElementSibling.children[0].firstChild;
        span.innerHTML = dislikes;
    });

    let popupBtnLikes = document.querySelector('.btn-popup-likes');
    popupBtnLikes.addEventListener('click', function () {
        // Увеличение счета лайков по клику
        let likes = ++gallery[img.id].likes;
        // Изменение количества на кнопке
        popupBtnLikes.firstChild.innerHTML = likes;
        // Изменение количества в иконке на миниатюре
        let span = document.getElementById(img.id).nextElementSibling.children[1].firstChild;
        span.innerHTML = likes;
    });
}

function updCommentCount(img) {
    let comments = gallery[img.id].comments.length;
    // Изменение количества в шапке
    popupCommentsCount.innerHTML = comments;
    // Изменение количества в иконке на миниатюре
    let span = document.getElementById(img.id).nextElementSibling.children[2].firstChild;
    span.innerHTML = comments;
}

function readImageComments(img) {
    for (let post of gallery[img.id].comments) {
        popupCommentsStack.appendChild(post);
    }
}

function sendComment(img) {
    // Чтение данных полей ввода
    let nickName = popupFormName.value;
    let commentText = popupFormText.value;
    // Проверка введения имени и текста сообщения
    if (nickName && commentText) {
        let newPost = createComment(nickName, commentText);
        popupCommentsStack.appendChild(newPost);
        gallery[img.id].comments.unshift(newPost);
    } else {
        alert('Не указано имя и/или текст сообщения!');
    }
    clearInputField();
    updCommentCount(img);
}

function createComment(nickName, commentText) {
    let newPost = document.createElement('div');
    newPost.className = 'comment';
    let dateTime = new Date().toLocaleString("en-US", {weekday: "short", hour: "numeric", minute: "numeric",});
    newPost.innerHTML = `<span class="comment-by">${nickName}</span>
                         <span class="comment-date-time">${dateTime}</span>
                         <p class="comment-text">${commentText}</p>`;
    return newPost;
}

function clearInputField() {
    popupFormName.value = ''; // Очистка поля с именем
    popupFormText.value = ''; // Очистка поля с текстом
}