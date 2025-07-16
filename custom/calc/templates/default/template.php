<?php if (!defined("B_PROLOG_INCLUDED") || B_PROLOG_INCLUDED !== true) die(); ?>
<?php
$APPLICATION->SetAdditionalCSS($this->GetFolder().'/style.css');
$APPLICATION->AddHeadScript($this->GetFolder().'/script.js');
$APPLICATION->AddHeadScript('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js');
$APPLICATION->SetAdditionalCSS('https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');
CJSCore::Init(['jquery']);
?>
<div class="main-layout d-flex flex-row justify-content-center align-items-start gap-5">
    <div class="calculator-col flex-grow-1">
      <div class="calculator">
        <section class="calculator__region card mb-4 p-4 d-flex flex-row align-items-center">
          <div class="calculator__region-info flex-grow-1">
            <div class="calculator__region-label">Укажите регион передвижения</div>
            <div class="form_select_wrapper">
                <select id="regionSelect" class="calculator__region-value form-select">
                  <option value="1200">Ленинградская область</option>
                  <option value="800">Москва</option>
                  <option value="500">Санкт-Петербург</option>
                </select>
                <img src="/local/components/custom/calc/templates/.default/icons/vector-2.svg" alt="Стрелка" class="calculator__region-arrow ms-3">
            </div>
          </div>
        </section>
  
        
        <section class="calculator__volume card mb-4 p-4">
          <div class="calculator__volume-label mb-1">Прокачка</div>
          <div id="volumeValue" class="calculator__volume-current mb-2">0 тонн</div>
          <div class="calculator__volume-slider-row d-flex align-items-center">
            <input type="range" id="volumeRange" class="calculator__volume-slider form-range flex-grow-1" min="0" max="1200" step="50" value="0">
          </div>
          <div class="calculator__volume-values-row d-flex justify-content-between mt-2">
            <span class="calculator__volume-min">0 тонн</span>
            <span id="volumeMidlle" class="calculator__volume-value">0 тонн</span>
            <span id="volumeMax" class="calculator__volume-max">1200 тонн</span>
          </div>
        </section>
        <!-- Фильтр типа топлива по макету -->
        <section class="calculator__fuel card mb-4 p-4">
          <div class="calculator__fuel-label mb-2">Тип топлива</div>
          <div id="fuelTabsContainer" class="calculator__fuel-tabs d-flex justify-content-between align-items-end mb-3 position-relative">
            <div class="calculator__fuel-tab" id="fuelPetrol" data-fuel="petrol">Бензин<div class="calculator__fuel-tab-underline"></div></div>
            <div class="calculator__fuel-tab" id="fuelGas" data-fuel="gas">Газ<div class="calculator__fuel-tab-underline"></div></div>
            <div class="calculator__fuel-tab" id="fuelDT" data-fuel="dt">ДТ<div class="calculator__fuel-tab-underline"></div></div>
            <div class="calculator__fuel-tabs-underline position-absolute"></div>
          </div>
          <div class="calculator__fuel-price" style="display: none;">Цена: <span id="fuelPrice">500 200</span> р/тонна</div>
        </section>
        <!-- Секция выбора бренда -->
        <section class="calculator__brand card mb-4 p-4">
          <div class="calculator__brand-label mb-2">Укажите любимый бренд</div>
          <div id="brandContainer" class="calculator__brand-list d-flex gap-3"></div>
        </section>
        <!-- Секция выбора опций -->
        <section class="calculator__option card mb-4 p-4">
          <div class="calculator__option-label mb-2">Дополнительные услуги</div>
          <div class="calculator__option-groups d-flex flex-row gap-4">
            <div id="optionGroup1" class="option-group d-flex gap-3"></div>
            <div id="optionGroup2" class="option-group d-flex gap-3"></div>
            <div id="optionGroup3" class="option-group d-flex gap-3"></div>
          </div>
        </section>
        <!-- Здесь будет основная верстка по макету -->
      </div>
    </div>
    <aside class="tariff-card card p-4">
      <div class="tariff-card__tabs mb-3 d-flex gap-2 justify-content-center">
        Подходящий тариф
        <button class="tariff-tab btn-pill active" data-tariff="favorite">Избранный</button>
      </div>
      <img src="/local/components/custom/calc/templates/.default/icons/tariff-card-photo.jpg" alt="Фото карточки" class="tariff-card__photo mb-4" style="width:100%;border-radius:15px;">
      <div class="tariff-card__map mb-4 d-flex align-items-center">
        <img src="/local/components/custom/calc/templates/.default/icons/map.svg" alt="Карта" class="tariff-card__map-icon me-2">
        <span class="tariff-card__map-text">Сеть АЗС на карте</span>
      </div>
      <div class="tariff-card__promo mb-3">
        <div class="tariff-card__promo-label mb-2">Выберите промо-акцию:</div>
        <div id="promoOptions" class="d-flex flex-column gap-2"></div>
      </div>
      <div class="tariff-card__promo-icons d-flex gap-4 mb-3" id="promoIcons"></div>
      <div class="tariff-card__economy mb-3">
        <div>Ваша экономия:</div>
        <div class="tariff-card__economy-values">
          <div class="tariff-card__economy-col">
            <div class="tariff-card__economy-label">Экономия в год</div>
            <div class="tariff-card__economy-row">
              <div class="tariff-card__economy-value" id="economyYear">0</div>
              <div class="tariff-card__economy-currency">₽</div>
            </div>
          </div>
          <div class="tariff-card__economy-col">
            <div class="tariff-card__economy-label">Экономия в месяц</div>
            <div class="tariff-card__economy-row">
              <div class="tariff-card__economy-value" id="economyMonth">0</div>
              <div class="tariff-card__economy-currency">₽</div>
            </div>
          </div>
        </div>
      </div>
      <button id="orderTariffBtn" class="btn btn-warning w-100">Заказать тариф «<span id="tariffName">Избранный</span>» -></button>
    </aside>
  </div>
  <div id="orderModal" class="modal-overlay" style="display:none;">
    <div class="modal-window">
      <button class="modal-close" id="orderModalClose" aria-label="Закрыть">&times;</button>
      <div class="modal-title mb-3">Заказать тариф «Избранный»</div>
      <form id="orderForm" autocomplete="off">
        <div class="mb-4">
        
          <input type="number" placeholder="Номер ИНН" class="form-control" id="orderInn" name="name" required>
        </div>
        <div class="mb-4">
          
          <input type="tel" placeholder="Телефон для связи" class="form-control" id="orderPhone" name="phone" required>
        </div>
        <div class="mb-4">
          
          <input type="email" placeholder="Email для связи" class="form-control" id="orderEmail" name="email" required>
        </div>
        <div class="mb-4">
          <input type="checkbox" class="form-check-input" id="orderAgree" name="agree" required>
          <label for="orderAgree" class="form-check-label" style="margin-left:8px;">Согласен с обработкой персональных данных</label>
        </div>
        <button type="submit" class="btn btn-form btn-warning">Отправить</button>
        <div id="orderFormMessage" class="order-form-message"></div>
      </form>
    </div>
  </div>