INSERT INTO lyceum_quest.city(name, has_lyceum)
VALUES 
('Москва', TRUE),
('Санкт-Петербург', TRUE),
('Казань', FALSE),
('Элиста', FALSE);

INSERT INTO lyceum_quest.user_role(id, title)
VALUES 
('1', 'admin'),
('2', 'manager');

INSERT INTO lyceum_quest.user_status(id, title)
VALUES 
('1', 'waiting'),
('2', 'enabled'),
('3', 'disabled');

INSERT INTO lyceum_quest.user(id, login, password, first_name, second_name, status_id, role_id)
VALUES 
('1', 'aleksashkin@yandex-team.ru', '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', 'Anton', 'Aleksashkin', '2', '1');

INSERT INTO lyceum_quest.auth_session(id, user_id)
VALUES 
('1', '1');

INSERT INTO lyceum_quest.quest(id, user_id, name, is_available, public_beautiful_name) 
VALUES
('1', '1', 'quest 1', TRUE, 'beautiful quest 1');

INSERT INTO lyceum_quest.character(id, name, profile_picture, full_size_picture) 
VALUES
('1', 'Петя', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82%D1%8B%20(200)/%D0%9F%D0%B5%D1%82%D1%8F%20(%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82)%20(200).jpg', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82%D1%8B%20(800)/%D0%9F%D0%B5%D1%82%D1%8F%20(%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82)%20(800).jpg'),
('2', 'Саша', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82%D1%8B%20(200)/%D0%A1%D0%B0%D1%88%D0%B0%20(%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82)%20(200).jpg', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82%D1%8B%20(800)/%D0%A1%D0%B0%D1%88%D0%B0%20(%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82)%20(800).jpg'),
('3', 'Преподаватель Сергей', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82%D1%8B%20(200)/%D0%A1%D0%B5%D1%80%D0%B3%D0%B5%D0%B8%CC%86%20(%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82)%20(200).jpg', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%9F%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82%D1%8B%20(800)/%D0%A1%D0%B5%D1%80%D0%B3%D0%B5%D0%B8%CC%86%20(%D0%BF%D0%BE%D1%80%D1%82%D1%80%D0%B5%D1%82)%20(800).jpg');

INSERT INTO lyceum_quest.file(id, name, type, extension, size_in_kbytes, url) 
VALUES
('1', 'test name 1', 'image', 'jpg', '20', 'https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%98%D0%BB%D0%BB%D1%8E%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D0%B8%20(410)/%D0%9F%D0%B5%D1%82%D1%8F%20%D0%B8%20%D0%A1%D0%B0%D1%88%D0%B0.jpg'),
('2', 'test name 2', 'image', 'jpg', '20','https://storage.yandexcloud.net/lyceum-cloud/backend/%D0%98%D0%BB%D0%BB%D1%8E%D1%81%D1%82%D1%80%D0%B0%D1%86%D0%B8%D0%B8%20(410)/%D0%A1%D0%B5%D1%80%D0%B3%D0%B5%D0%B8%CC%86.jpg');

INSERT INTO lyceum_quest.quest_task_type(id, type_name) 
VALUES
('1', 'text'),
('2', 'keyboard'),
('3', 'attachment'),
('4', 'city_input'),
('5', 'action_card');


INSERT INTO lyceum_quest.quest_task(id, quest_id, is_first, quest_task_type_id, data, character_id, author, order_id)
VALUES
('1_1', '1', TRUE, '3', '{"next_task_id": "2"}', '1', 'bot', '1'),
('1_2', '1', FALSE, '1', '{"text" : "Да, крутая тема. Как туда попасть?", "next_task_id": "3"}', '1', 'bot', '1'),
('1_3', '1', FALSE, '1', '{"text" : "Выбираешь курс, проходишь тестирование и всё!", "next_task_id": "4"}', '2', 'bot', '1'),
('1_4', '1', FALSE, '1', '{"text" : "Cупер, надо попробовать!", "next_task_id": "5"}', '1', 'bot', '1'),
('1_5', '1', FALSE, '2', '{"keyboard": [
[
    {
        "button_id": "1",
        "text": "А о чем речь?",
        "placeholder": "А о чем речь?",
        "next_task_id" : "6"
    }
]
]}', null, 'user', '1'),
('1_6', '1', FALSE, '1', '{"text" : "О, привет. Сейчас всё расскажу! Но для начала мне нужно немного больше о тебе узнать.", "next_task_id": "7"}', '2', 'bot', '1'),
('1_7', '1', FALSE, '1', '{"text" : "В каком классе ты учишься?", "next_task_id": "8"}', '2', 'bot', '1'),
('1_8', '1', FALSE, '2', '{"keyboard": [
[
    {
        "button_id": "1",
        "text": "5-7",
        "placeholder": "5-7",
        "next_task_id" : "8-1"
    },
    {
        "button_id": "2",
        "text": "8",
        "placeholder": "8",
        "next_task_id" : "9"
    }
],
[
    {
        "button_id": "3",
        "text": "9",
        "placeholder": "9",
        "next_task_id" : "9"
    },
    {
        "button_id": "4",
        "text": "10",
        "placeholder": "10",
        "next_task_id" : "9"
    },
    {
        "button_id": "5",
        "text": "11",
        "placeholder": "11",
        "next_task_id" : "9"
    }
],
[
    {
        "button_id": "6",
        "text": "Учусь в колледже",
        "placeholder": "Учусь в колледже",
        "next_task_id" : "9"
    }
],
[
    {
        "button_id": "7",
        "text": "Я сильно старше",
        "placeholder": "Я сильно старше",
        "next_task_id" : "8-2"
    }
]
]}', null, 'user', '1'),
('1_8-1', '1', FALSE, '1', '{"text" : "Тебе ещё рано поступать в Яндекс Лицей. Но если хочешь, я расскажу тебе подробности.", "next_task_id": "8-3"}', '2', 'bot', '1'),
('1_8-2', '1', FALSE, '1', '{"text" : "Тебе уже поздно поступать в Яндекс Лицей. Но если хочешь, я расскажу тебе подробности.", "next_task_id": "8-3"}', '2', 'bot', '1'),
('1_8-3', '1', FALSE, '2', '{"keyboard": [
[
    {
        "button_id": "1",
        "text": "Да, расскажите подробнее",
        "placeholder": "Да, расскажите подробнее",
        "next_task_id" : "9"
    },
    {
        "button_id": "2",
        "text": "Спасибо, не нужно",
        "placeholder": "Спасибо, не нужно",
        "next_task_id" : "8-4"
    }
]
]}', null, 'user', '1'),
('1_8-4', '1', FALSE, '1', '{"text" : "Поняла. Если у тебя вдруг возникнут вопросы, то ты можешь вернуться ко мне с ними или зайти на сайт Яндекс Лицея (вшитая ссылка: https://lyceum.yandex.ru). Удачи!"}', '2', 'bot', '1'),
('1_9', '1', FALSE, '1', '{"text" : "Отлично! Из какого ты города?", "next_task_id": "10"}', '2', 'bot', '1'),
('1_10', '1', FALSE, '4', '{"has_lyceum_next_id": "11", "no_lyceum_next_id": "12"}', '2', 'user', '1'),
('1_11', '1', FALSE, '1', '{"text" : "Отлично, в твоём городе есть наша площадка! Если хочешь, давай прямо сейчас поговорим с кем-нибудь из наших преподавателей и учеников, чтобы ты мог задать им вопросы!", "next_task_id": "11-1"}', '2', 'bot', '1'),
('1_11-1', '1', FALSE, '1', '{"text" : "У них для тебя тоже будут вопросы! Твои ответы помогут подобрать подходящий курс.", "next_task_id": "11-2"}', '2', 'bot', '1'),
('1_11-2', '1', FALSE, '2', '{"keyboard": [
[
    {
        "button_id": "1",
        "text": "Ого, было бы здорово!",
        "placeholder": "Ого, было бы здорово!",
        "next_task_id" : "13"
    }
]
]}', null, 'user', '1'),
('1_12', '1', FALSE, '1', '{"text" : "Эх, в твоём городе пока нет нашей площадки, но это не страшно, ведь у нас есть и онлайн-курсы.", "next_task_id": "12-1"}', '2', 'bot', '1'),
('1_12-1', '1', FALSE, '1', '{"text" : "Если хочешь, давай прямо сейчас созвонимся с кем-нибудь из наших преподавателей и учеников, чтобы ты мог задать им вопросы!", "next_task_id": "11-1"}', '2', 'bot', '1'),
('1_13', '1', FALSE, '3', '{"next_task_id": "14"}', '3', 'bot', '1'),
('1_14', '1', FALSE, '1', '{"text" : "Привет! Меня зовут Сергей. Я преподаватель Я.Лицея. Прекрасно, что ты задумываешься о том, чтобы сделать первые шаги в IT вместе с нами! У нас есть курсы для начинающих.", "next_task_id": "15"}', '3', 'bot', '1'),
('1_15', '1', FALSE, '5', 
'{
    "title": "Основы программирования на Python.",
    "text": "Годовой курс по разработке на Python для тех, кто хочет разобраться в основах языка, научиться делать прогнозы, строить графики, проводить аналитику и кодить простые программы", 
    "action_button": {
        "action_url": "https://lyceum.yandex.ru/python", 
        "placeholder": "Перейти на страницу курса"
    },
    "next_task_button": {
        "placeholder": "Дальше"
    }, 
    "next_task_id": "16"
}', '3', 'bot', '1'),
('1_16', '1', FALSE, '1', '{"text" : "Расскажи, какой у тебя уровень программирования?"}', '3', 'bot', '1');

INSERT INTO lyceum_quest.quest_task_x_files(file_id, quest_task_id) 
VALUES
('1', '1_1'),
('2', '1_13'),
('2', '1_15');