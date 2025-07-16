<?php
require($_SERVER["DOCUMENT_ROOT"]."/bitrix/modules/main/include/prolog_before.php");

// Защита от прямого доступа
/* if (empty($_SERVER['HTTP_X_REQUESTED_WITH']) || strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) != 'xmlhttprequest') {
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => 'Доступ запрещён']);
    die();
} */

// Инициализация ответа
$response = ['success' => false, 'error' => 'Неизвестная ошибка'];

// Логирование
writeToLog("Запрос: " . print_r($_POST, true) . "\n");

// Получение данных
$region = $_POST['region'] ?? '';
$tonnage = floatval($_POST['tonnage'] ?? 0);
$fuelType = $_POST['fuelType'] ?? '';
$brand = $_POST['brand'] ?? '';
$tariff = $_POST['tariff'] ?? '';
$promo = floatval($_POST['promo'] ?? 0);
$options = is_array($_POST['options']) ? $_POST['options'] : [];
$inn = $_POST['orderInn'] ?? '';
$phone = $_POST['orderPhone'] ?? '';
$email = $_POST['orderEmail'] ?? '';
$consent = $_POST['consent'] === 'true';

// Валидация
/* if (!preg_match('/^\d{12}$/', $inn)) {
    $response['error'] = 'ИНН должен содержать ровно 12 цифр';
    echo json_encode($response);
    writeToLog("Ошибка: ИНН\n");
    die();
} */
/* if (!preg_match('/^\d{11}$/', $phone)) {
    $response['error'] = 'Телефон должен содержать ровно 11 цифр';
    echo json_encode($response);
    writeToLog("Ошибка: Телефон\n");
    die();
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $response['error'] = 'Неверный формат email';
    echo json_encode($response);
    writeToLog("Ошибка: Email\n");
    die();
}
if (!$consent) {
    $response['error'] = 'Необходимо согласиться с обработкой данных';
    echo json_encode($response);
    writeToLog("Ошибка: Чекбокс\n" . $response);
    die();
} */

// Справочники
$prices = [
    'petrol' => 500200,
    'gas' => 200100,
    'dt' => 320700
];
$tariffDiscounts = [
    'econom' => 3,
    'favorite' => 5,
    'premium' => 7
];
$regionNames = [
    '1200' => 'Ленинградская область',
    '800' => 'Москва',
    '500' => 'Санкт-Петербург'
];

// Валидация справочников
if (!isset($prices[$fuelType])) {
    $response['error'] = 'Неверный тип топлива';
    echo json_encode($response);
    writeToLog("Ошибка: Тип топлива\n");
    die();
}
if (!isset($tariffDiscounts[$tariff])) {
    $response['error'] = 'Неверный тариф';
    echo json_encode($response);
    writeToLog("Ошибка: Тариф\n");
    die();
}
if (!isset($regionNames[$region])) {
    $response['error'] = 'Неверный регион';
    echo json_encode($response);
    writeToLog("Ошибка: Регион\n");
    die();
}

// Вычисления
$baseCost = $prices[$fuelType] * $tonnage;
$tariffDiscount = $tariffDiscounts[$tariff];
$totalDiscount = $tariffDiscount + $promo;
$monthlyCost = $baseCost * (1 - $totalDiscount / 100);
$monthlySavings = $baseCost * ($totalDiscount / 100);
$yearlySavings = $monthlySavings * 12;

// Формирование данных для письма
$formData = [
    'Регион' => $regionNames[$region] ?? 'Не указано',
    'Прокачка' => $tonnage . ' тонн',
    'Тип топлива' => $fuelType == 'petrol' ? 'Бензин' : ($fuelType == 'gas' ? 'Газ' : 'ДТ'),
    'Бренд' => $brand ?: 'Не выбран',
    'Дополнительные услуги' => empty($options) ? 'Нет' : implode(', ', $options),
    'Тариф' => $tariff == 'econom' ? 'Эконом' : ($tariff == 'favorite' ? 'Избранный' : 'Премиум'),
    'Промо-акция' => $promo . '%',
    'Стоимость топлива в месяц' => number_format($monthlyCost, 2) . ' ₽',
    'Суммарная скидка %' => $totalDiscount . '%',
    'Экономия в месяц' => number_format($monthlySavings, 2) . ' ₽',
    'Экономия в год' => number_format($yearlySavings, 2) . ' ₽',
    'ИНН' => $inn,
    'Телефон' => $phone,
    'Email' => $email
];


// Запись данных в файл
$fileName = $_SERVER["DOCUMENT_ROOT"] . '/form_data_' . date('Y-m-d_H-i-s') . '.txt';
$fileContent = "";
foreach ($formData as $key => $value) {
    $fileContent .= "$key: $value\n";
}
if (!file_put_contents($fileName, $fileContent)) {
    $response['error'] = 'Ошибка записи данных в файл';
    echo json_encode($response);
    writeToLog("Ошибка: Не удалось записать данные в файл\n" . $response);
    die();
}

// Отправка письма
/* $to = 'ruso.bah@mail.ru';
$subject = 'Заказ тарифа';
$message = "<html><body><h2>Данные заказа</h2>";
foreach ($formData as $key => $value) {
    $message .= "<p><strong>$key:</strong> " . htmlspecialchars($value) . "</p>";
}
$message .= "</body></html>";
$headers = "From: bakhtey03@mail.ru\r\n"; // Замените на ваш домен
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";

if (!mail($to, $subject, $message, $headers)) {
    $response['error'] = 'Ошибка отправки письма';
    writeToLog("Ошибка: Не удалось отправить письмо\n");
    echo json_encode($response);
    die();
} */

// Отправка события Bitrix
/* if (!defined('SITE_ID')) {
    define('SITE_ID', 's3'); 
}
if (!CEvent::Send("FUEL_CALC_RESULT", SITE_ID, $formData)) {
    $response['error'] = 'Ошибка отправки события Bitrix';
    writeToLog(Ошибка: Событие Bitrix\n");
    echo json_encode($response);
    die();
} */

$response['success'] = true;
$response['error'] = '';
writeToLog("Успех: Письмо и событие отправлены\n");
header('Content-Type: application/json');
echo json_encode($response);


function writeToLog($data, $title = '') {
  $log = "\n------------------------\n";
  $log .= date("Y.m.d G:i:s") . "\n";
  $log .= (strlen($title) > 0 ? $title : 'DEBUG') . "\n";
  $log .= print_r($data, 1);
  $log .= "\n------------------------\n";
  file_put_contents(getcwd() . '/form-data.log', $log, FILE_APPEND);
  return true;
}
?>