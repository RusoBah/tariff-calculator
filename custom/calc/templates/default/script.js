function validateForm() {
    const inn = $('#orderInn').val();
    const phone = $('#orderPhone').val();
    const email = $('#orderEmail').val();
    const consent = $('#orderAgree').is(':checked');
    if (!/^\d{12}$/.test(inn)) {
        $('#orderFormMessage').text('Ошибка: ИНН должен содержать ровно 12 цифр').addClass('error').removeClass('success'); return false; 
    }
    if (!/^\d{11}$/.test(phone)) { 
        $('#orderFormMessage').text('Ошибка: Телефон должен содержать ровно 11 цифр').addClass('error').removeClass('success'); return false; 
    }
    if (!email) { 
        $('#orderFormMessage').text('Ошибка: Email обязателен').addClass('error').removeClass('success'); return false; 
    }
    if (!consent) { 
        $('#orderFormMessage').text('Ошибка: Необходимо согласиться с обработкой данных').addClass('error').removeClass('success'); return false; 
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function() {
    const range = document.getElementById('volumeRange');
    const region = document.getElementById('regionSelect');
    const volumeValue = document.getElementById('volumeValue');
    const volumeMidlle = document.getElementById('volumeMidlle');
    const volumeMax = document.getElementById('volumeMax');
    const volumeCurrent = document.querySelector('.calculator__volume-current');
    const fuelPrice = document.getElementById('fuelPrice');
    const fuelPetrol = document.getElementById('fuelPetrol');
    const fuelGas = document.getElementById('fuelGas');
    const fuelDT = document.getElementById('fuelDT');
    const fuelTabs = document.querySelectorAll('.calculator__fuel-tab');

    const brandsByFuel = {
        petrol: [{ name: 'Роснефть', icon: '/local/components/custom/calc/templates/.default/icons/rosneft-polygon64.svg' },
             { name: 'Татнефть', icon: '/local/components/custom/calc/templates/.default/icons/tatneft-path2870.svg' }, 
             { name: 'Лукойл', icon: '/local/components/custom/calc/templates/.default/icons/lukoil-rect2493.svg' }],
        gas: [{ name: 'Shell', icon: '/local/components/custom/calc/templates/.default/icons/shell-logo.svg' }, 
            { name: 'Газпром', icon: '/local/components/custom/calc/templates/.default/icons/gazprom-path40.svg' }, 
            { name: 'Башнефть', icon: '/local/components/custom/calc/templates/.default/icons/insurance-vector.svg' }],
        dt: [{ name: 'Татнефть', icon: '/local/components/custom/calc/templates/.default/icons/tatneft-path2870.svg' }, 
            { name: 'Лукойл', icon: '/local/components/custom/calc/templates/.default/icons/lukoil-rect2493.svg' }],
    };

    let selectedBrand = null;
    let selectedFuel = 'petrol';
    let selectedOptions = [];
    let selectedTariff = 'favorite';
    let selectedPromo = 0.20;

    const optionGroups = [[
        {name: 'Штраф', icon: '/local/components/custom/calc/templates/.default/icons/option-1.svg', bg: 'bg-blue' },
        { name: 'Парковки', icon: '/local/components/custom/calc/templates/.default/icons/option-2.svg', bg: 'bg-blue' },
        { name: 'ЭДО', icon: '/local/components/custom/calc/templates/.default/icons/option-3.svg', bg: 'bg-blue' }],
        [{ name: 'Мойка', icon: '/local/components/custom/calc/templates/.default/icons/option-4.svg', bg: 'bg-lightblue' },
        { name: 'Отсрочка', icon: '/local/components/custom/calc/templates/.default/icons/option-5.svg', bg: 'bg-lightblue' }, 
        { name: 'Телематика', icon: '/local/components/custom/calc/templates/.default/icons/option-6.svg', bg: 'bg-lightblue' }], 
        [{ name: 'PPRPAY', icon: '/local/components/custom/calc/templates/.default/icons/option-7.svg', bg: 'bg-green' }, 
        { name: 'СМС', icon: '/local/components/custom/calc/templates/.default/icons/option-8.svg', bg: 'bg-green' }, 
        { name: 'Страховка', icon: '/local/components/custom/calc/templates/.default/icons/option-9.svg', bg: 'bg-green' }]];

    const tariffs = { favorite: { name: 'Избранный', discount: 0.05, promos: [0.05, 0.20] }, econom: { name: 'Эконом', discount: 0.03, promos: [0.02, 0.05] }, premium: { name: 'Премиум', discount: 0.07, promos: [0.20, 0.50] } };

    const promoIcons = [{ value: 0.50, icon: '/local/components/custom/calc/templates/.default/icons/50%.svg', label: 'Экономии\nна штрафах', percent: '50%' }, { value: 0.20, icon: '/local/components/custom/calc/templates/.default/icons/20%.svg', label: 'Скидка\nна мойку', percent: '20%' }, { value: 0.05, icon: '/local/templates/.default/components/custom/calc/.default/icons/5%.svg', label: 'Скидка\nна топливо', percent: '5%' }, { value: 0.02, icon: '/local/templates/.default/components/custom/calc/.default/icons/2%.svg', label: 'Возврат\nНДС', percent: '2%' }];

    function setRangeBg(el) {
        const min = +el.min;
        const max = +el.max;
        const val = +el.value;
        const percent = ((val - min) / (max - min)) * 100;
        el.style.background = `linear-gradient(90deg, #FFDD21 ${percent}%, #E0E7E9 ${percent}%)`;
    }

    function updateVolumeValue(val) {
        volumeValue.textContent = val + ' тонн';
        volumeCurrent.textContent = val + ' тонн';
    }

    function updateVolumeMidlle(max) {
        const half = Math.round(max / 2 / 50) * 50;
        volumeMidlle.textContent = half + ' тонн';
    }

    function updateFuelPrice() {
        const activeTab = document.querySelector('.calculator__fuel-tab.active');
        if (!activeTab) return;
        const fuelType = activeTab.dataset.fuel;
        fuelPrice.textContent = { petrol: '500 200', gas: '200 100', dt: '320 700' }[fuelType];
    }

    function setActiveFuelTab(tab) {
        fuelTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        updateFuelPrice();
    }

    function renderBrands(fuelType) {
        const container = document.getElementById('brandContainer');
        container.innerHTML = '';
        brandsByFuel[fuelType].forEach(brand => {
            const div = document.createElement('div');
            div.className = 'calculator__brand-item' + (selectedBrand === brand.name ? ' selected' : '');
            div.innerHTML = `<div class="calculator__brand-icon"><img src="${brand.icon}" alt="${brand.name}"></div><span>${brand.name}</span>`;
            div.onclick = () => { selectedBrand = brand.name; renderBrands(fuelType); };
            container.appendChild(div);
        });
    }

    function renderOptions() {
        [1, 2, 3].forEach(groupIdx => {
            const container = document.getElementById('optionGroup' + groupIdx);
            container.innerHTML = '';
            optionGroups[groupIdx - 1].forEach(option => {
                const isSelected = selectedOptions.includes(option.name);
                const div = document.createElement('div');
                div.className = 'calculator__option-item' + (isSelected ? ' selected' : '');
                div.innerHTML = `<div class="calculator__option-icon ${option.bg}"><img src="${option.icon}" alt="${option.name}"></div><span>${option.name}</span>`;
                div.onclick = () => {
                    selectedOptions = isSelected ? selectedOptions.filter(name => name !== option.name) : [...selectedOptions, option.name];
                    renderOptions();
                };
                container.appendChild(div);
            });
        });
    }

    function setFuelType(fuelType) {
        selectedFuel = fuelType;
        selectedBrand = null;
        renderBrands(fuelType);
        document.getElementById('fuelPrice').textContent = { petrol: '500 200', gas: '200 100', dt: '320 700' }[fuelType];
    }

    function renderPromoIcons() {
        const wrap = document.getElementById('promoIcons');
        wrap.innerHTML = '';
        promoIcons.forEach(promo => {
            const isSelected = selectedPromo === promo.value;
            const div = document.createElement('div');
            div.className = 'promo-icon' + (isSelected ? ' selected' : '');
            div.onclick = () => { selectedPromo = promo.value; renderPromoIcons(); updateTariffEconomy(); };
            div.innerHTML = (isSelected
                ? `<div class="promo-icon__circle-wrap"><div class="promo-icon__circle"></div><div class="promo-icon__percent">${promo.percent}</div><img src="/local/components/custom/calc/templates/.default/icons/Chek.svg" class="promo-icon__check"></div>`
                : `<div class="promo-icon__circle-wrap"><div class="promo-icon__percent">${promo.percent}</div></div>`) + `<div class="promo-icon__label">${promo.label.replace(/\n/g, '<br>')}</div>`;
            wrap.appendChild(div);
        });
    }

    function updateTariffEconomy() {
        const priceMap = { petrol: 500200, gas: 200100, dt: 320700 };
        const fuelType = document.querySelector('.calculator__fuel-tab.active').dataset.fuel;
        const price = priceMap[fuelType] || 0;
        const volume = parseInt(document.getElementById('volumeRange').value, 10) || 0;
        const base = price * volume;
        const tariffDiscount = tariffs[selectedTariff].discount;
        const promoDiscount = selectedPromo;
        const totalDiscount = tariffDiscount + promoDiscount;
        const economyMonth = Math.round(base * totalDiscount);
        const economyYear = economyMonth * 12;
        document.getElementById('economyMonth').textContent = economyMonth.toLocaleString();
        document.getElementById('economyYear').textContent = economyYear.toLocaleString();
        document.getElementById('tariffName').textContent = tariffs[selectedTariff].name;
    }

    function calculate() {
        const data = {
            region: $('#regionSelect').val(),
            tonnage: $('#volumeRange').val(),
            fuelType: $('.calculator__fuel-tab.active').data('fuel'),
            brand: selectedBrand,
            tariff: $('.tariff-tab.active').data('tariff'),
            promo: selectedPromo,
            options: selectedOptions,
            email: $('#email').val(),
            action: 'calculate'
        };
        console.log('Sending calculate:', data);
        BX.ajax({
            url: '/bitrix/services/main/ajax.php?mode=class&c=vendor:component&action=execute',
            data: data,
            method: 'POST',
            dataType: 'json',
            timeout: 30,
            async: true,
            processData: true,
            scriptsRunFirst: false,
            emulateOnload: true,
            start: true,
            cache: false,
            onsuccess: function(data) {
                console.log('Calculate response:', data);
                if (data && data.data && data.data.success) {
                    updateTariffEconomy();
                } else {
                    console.error('Ошибка расчета:', data ? data.data.error : 'Нет данных');
                }
            },
            onfailure: function(error) {
                console.error('Ошибка AJAX:', error);
            }
        });
    }

    $('#sendEmail').click(calculate);

    const orderModal = document.getElementById('orderModal');
    const orderModalClose = document.getElementById('orderModalClose');
    const orderTariffBtn = document.getElementById('orderTariffBtn');
    const orderForm = document.getElementById('orderForm');
    const orderFormMessage = document.getElementById('orderFormMessage');

    if (orderTariffBtn && orderModal && orderForm) {
        orderTariffBtn.addEventListener('click', function(e) {
            e.preventDefault();
            orderModal.style.display = 'block';
            if (orderFormMessage) {
                orderFormMessage.textContent = '';
                orderFormMessage.className = 'order-form-message';
            }
        });

        orderModalClose.addEventListener('click', function() {
            orderModal.style.display = 'none';
        });

        orderModal.addEventListener('click', function(e) {
            if (e.target === orderModal) {
                orderModal.style.display = 'none';
            }
        });

        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm()) return;
            const data = {
                region: $('#regionSelect').val(),
                tonnage: $('#volumeRange').val(),
                fuelType: $('.calculator__fuel-tab.active').data('fuel'),
                brand: selectedBrand,
                tariff: $('.tariff-tab.active').data('tariff'),
                promo: selectedPromo,
                options: selectedOptions,
                inn: $('#orderInn').val(),
                phone: $('#orderPhone').val(),
                email: $('#orderEmail').val(),
                consent: $('#orderConsent').is(':checked'),
                action: 'send_email'
            };
            console.log('Sending form:', data);
            BX.ajax({
                url: '/local/components/custom/calc/send_email.php', 
                data: data,
                method: 'POST',
                dataType: 'json',
                timeout: 30,
                async: true,
                processData: true,
                scriptsRunFirst: false,
                emulateOnload: false,
                start: true,
                cache: false,
                onsuccess: function(response) {
                    if (response.success) {
                        orderForm.reset();
                        orderFormMessage.textContent = 'Спасибо! Успешно отправлено.';
                        orderFormMessage.classList.add('success');
                        orderFormMessage.classList.remove('error');
                        orderModal.style.display = 'none';
                    } else {
                        orderFormMessage.textContent = 'Ошибка: ' + response.error;
                        orderFormMessage.classList.add('error');
                        orderFormMessage.classList.remove('success');
                    }
                },
                onfailure: function(error) {
                    console.error('Ошибка AJAX:', error);
                    orderFormMessage.textContent = 'Ошибка: Не удалось отправить';
                    orderFormMessage.classList.add('error');
                    orderFormMessage.classList.remove('success');
                }
            });
        });
    }

    range.addEventListener('input', function() {
        setRangeBg(this);
        updateVolumeValue(this.value);
        updateTariffEconomy();
    });

    region.addEventListener('change', function() {
        const max = this.value;
        range.max = max;
        const half = Math.round(max / 2 / 50) * 50;
        range.value = half;
        volumeMax.textContent = max + ' тонн';
        updateVolumeValue(half);
        updateVolumeMidlle(max);
        setRangeBg(range);
        updateTariffEconomy();
    });

    fuelTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            fuelTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            setFuelType(this.dataset.fuel);
            updateTariffEconomy();
        });
    });

    $('#regionSelect, #volumeRange, .calculator__fuel-tab, .tariff-tab, .promo-icon').click(calculate);

    setRangeBg(range);
    updateVolumeValue(range.value);
    updateVolumeMidlle(range.max);
    updateFuelPrice();
    setActiveFuelTab(fuelTabs[0]);
    renderBrands(selectedFuel);
    document.getElementById('fuelPetrol').classList.add('active');
    renderOptions();
    renderPromoIcons();
});