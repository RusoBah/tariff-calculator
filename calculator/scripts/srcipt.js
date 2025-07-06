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
  const fuelTabsContainer = document.querySelector('.calculator__fuel-tabs');

  // --- Данные по брендам для каждого типа топлива ---
  const brandsByFuel = {
    petrol: [
      { name: 'Роснефть', icon: 'icons/rosneft-polygon64.svg' },
      { name: 'Татнефть', icon: 'icons/tatneft-path2870.svg' },
      { name: 'Лукойл', icon: 'icons/lukoil-rect2493.svg' },
    ],
    gas: [
      { name: 'Shell', icon: 'icons/shell-logo.svg' },
      { name: 'Газпром', icon: 'icons/gazprom-path40.svg' },
      { name: 'Башнефть', icon: 'icons/insurance-vector.svg' },
    ],
    dt: [
      { name: 'Татнефть', icon: 'icons/tatneft-path2870.svg' },
      { name: 'Лукойл', icon: 'icons/lukoil-rect2493.svg' },
    ],
  };

  let selectedBrand = null;
  let selectedFuel = 'petrol';

  // --- Данные по опциям ---
  const optionGroups = [
    [
      { name: 'Штраф', icon: 'icons/option-1.svg', bg: 'bg-blue' },
      { name: 'Парковки', icon: 'icons/option-2.svg', bg: 'bg-blue' },
      { name: 'ЭДО', icon: 'icons/option-3.svg', bg: 'bg-blue' },
    ],
    [
      { name: 'Мойка', icon: 'icons/option-4.svg', bg: 'bg-lightblue' },
      { name: 'Отсрочка', icon: 'icons/option-5.svg', bg: 'bg-lightblue' },
      { name: 'Телематика', icon: 'icons/option-6.svg', bg: 'bg-lightblue' },
    ],
    [
      { name: 'PPRPAY', icon: 'icons/option-7.svg', bg: 'bg-green' },
      { name: 'СМС', icon: 'icons/option-8.svg', bg: 'bg-green' },
      { name: 'Страховка', icon: 'icons/option-9.svg', bg: 'bg-green' },
    ]
  ];
  let selectedOptions = [];

  // --- Данные по тарифам и промо ---
  const tariffs = {
    favorite: {
      name: 'Избранный',
      discount: 0.05,
      promos: [0.05, 0.20],
    },
    econom: {
      name: 'Эконом',
      discount: 0.03,
      promos: [0.02, 0.05],
    },
    premium: {
      name: 'Премиум',
      discount: 0.07,
      promos: [0.20, 0.50],
    },
  };
  let selectedTariff = 'favorite';
  let selectedPromo = 0.20;

  // --- Данные по промо-акциям для Избранного тарифа (пример) ---
  const promoIcons = [
    {
      value: 0.50,
      icon: 'icons/50%.svg',
      label: 'Экономии\nна штрафах',
      percent: '50%',
    },
    {
      value: 0.20,
      icon: 'icons/20%.svg',
      label: 'Скидка\nна мойку',
      percent: '20%',
    },
    {
      value: 0.05,
      icon: 'icons/5%.svg',
      label: 'Скидка\nна топливо',
      percent: '5%',
    },
    {
      value: 0.02,
      icon: 'icons/2%.svg',
      label: 'Возврат\nНДС',
      percent: '2%',
    }
  ];

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
    if (fuelType === 'petrol') {
      fuelPrice.textContent = '500 200';
    } else if (fuelType === 'gas') {
      fuelPrice.textContent = '200 100';
    } else if (fuelType === 'dt') {
      fuelPrice.textContent = '320 700';
    }
  }

  function setActiveFuelTab(tab) {
    fuelTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    updateFuelPrice();
    // Здесь будет вызов функции для фильтрации брендов
  }

  function renderBrands(fuelType) {
    const container = document.getElementById('brandContainer');
    container.innerHTML = '';
    brandsByFuel[fuelType].forEach((brand, idx) => {
      const div = document.createElement('div');
      div.className = 'calculator__brand-item' + (selectedBrand === brand.name ? ' selected' : '');
      div.innerHTML = `<div class="calculator__brand-icon"><img src="${brand.icon}" alt="${brand.name}"></div><span>${brand.name}</span>`;
      div.onclick = () => {
        selectedBrand = brand.name;
        renderBrands(fuelType);
      };
      container.appendChild(div);
    });
  }

  function renderOptions() {
    [1,2,3].forEach((groupIdx) => {
      const container = document.getElementById('optionGroup'+groupIdx);
      container.innerHTML = '';
      optionGroups[groupIdx-1].forEach(option => {
        const isSelected = selectedOptions.includes(option.name);
        const div = document.createElement('div');
        div.className = 'calculator__option-item' + (isSelected ? ' selected' : '');
        div.innerHTML = `<div class="calculator__option-icon ${option.bg}"><img src="${option.icon}" alt="${option.name}"></div><span>${option.name}</span>`;
        div.onclick = () => {
          if (isSelected) {
            selectedOptions = selectedOptions.filter(name => name !== option.name);
          } else {
            selectedOptions.push(option.name);
          }
          renderOptions();
        };
        container.appendChild(div);
      });
    });
  }

  // --- Логика переключения типа топлива ---
  function setFuelType(fuelType) {
    selectedFuel = fuelType;
    selectedBrand = null;
    renderBrands(fuelType);
    // Меняем цену
    const priceMap = {
      petrol: '500 200',
      gas: '200 100',
      dt: '320 700',
    };
    document.getElementById('fuelPrice').textContent = priceMap[fuelType];
  }

  function renderPromoIcons() {
    const wrap = document.getElementById('promoIcons');
    wrap.innerHTML = '';
    promoIcons.forEach(promo => {
      const isSelected = selectedPromo === promo.value;
      const div = document.createElement('div');
      div.className = 'promo-icon' + (isSelected ? ' selected' : '');
      div.onclick = () => {
        selectedPromo = promo.value;
        renderPromoIcons();
        updateTariffEconomy();
      };
      div.innerHTML =
        (isSelected
          ? `<div class="promo-icon__circle-wrap">
                <div class="promo-icon__circle"></div>
                <div class="promo-icon__percent">${promo.percent}</div>
                <img src="icons/Chek.svg" class="promo-icon__check">
             </div>`
          : `<div class="promo-icon__circle-wrap">
                <div class="promo-icon__percent">${promo.percent}</div>
             </div>`)
        + `<div class="promo-icon__label">${promo.label.replace(/\n/g,'<br>')}</div>`;
      wrap.appendChild(div);
    });
  }

  function updateTariffEconomy() {
    // Получаем цену топлива и объем из калькулятора
    const priceMap = {
      petrol: 500200,
      gas: 200100,
      dt: 320700,
    };
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
    // Обновить кнопку
    document.getElementById('tariffName').textContent = tariffs[selectedTariff].name;
  }

  range.addEventListener('input', function() {
    setRangeBg(this);
    updateVolumeValue(this.value);
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
  });

  fuelPetrol.addEventListener('change', updateFuelPrice);
  fuelGas.addEventListener('change', updateFuelPrice);
  fuelDT.addEventListener('change', updateFuelPrice);

  fuelTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      fuelTabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      setFuelType(this.dataset.fuel);
    });
  });

  // Пересчет при изменении топлива или объема
  document.getElementById('volumeRange').addEventListener('input', updateTariffEconomy);
  document.querySelectorAll('.calculator__fuel-tab').forEach(tab => {
    tab.addEventListener('click', updateTariffEconomy);
  });

  // Инициализация
  setRangeBg(range);
  updateVolumeValue(range.value);
  updateVolumeMidlle(range.max);
  updateFuelPrice();
  setActiveFuelTab(fuelTabs[0]);

  // Инициализация брендов и табов топлива
  renderBrands(selectedFuel);
  // По умолчанию активный таб
  document.getElementById('fuelPetrol').classList.add('active');

  renderOptions();
  renderPromoIcons();
});