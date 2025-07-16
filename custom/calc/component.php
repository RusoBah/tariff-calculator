<?php
if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die();

CJSCore::Init(['jquery', 'ajax']);
$APPLICATION->AddHeadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');
$APPLICATION->SetAdditionalCSS('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');

if ($_REQUEST["action"] == "calculate") {
    $APPLICATION->RestartBuffer();
    header('Content-Type: application/json');
    file_put_contents($_SERVER["DOCUMENT_ROOT"]."/log_component.txt", "Запрос в component.php: " . print_r($_REQUEST, true) . "\n", FILE_APPEND);
    if (!file_exists(__DIR__ . '/send_email.php')) {
        echo json_encode(['success' => false, 'error' => 'Файл send_email.php не найден']);
        die();
    }
    include 'send_email.php';
    die();
}

$this->includeComponentTemplate();
?>