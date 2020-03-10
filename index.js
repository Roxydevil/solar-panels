//Переменные для формирования запроса на PVcalc
var pMax = null;
var peakpower = 0;
var loss = null;
var usehorizon = 0;
var getSlopeOptimal = 0;
var angle = 0;
var azimut = 0;

window.onload = function () {
    mapInit('mapbox/streets-v11');
    queryBank();
};

//Запрос на query_handler.php
var form = document.querySelector("#urlForm");
var jsonObj;
form.addEventListener("submit", function (e) {
    e.preventDefault();

    var urlData = document.querySelector("#urlField").value;
    console.log(urlData);

    if (urlData != undefined && urlData != '') {
        document.getElementById('urlButtonError').innerHTML = '';
        var request = new XMLHttpRequest();

        request.open("GET", "/query_handler.php?url=" + urlData, true);
        request.setRequestHeader("Content-type", "application/x-www-form-urlencoded; charset=UTF-8");
        request.send(null);

        request.addEventListener("load", function () {
            jsonObj = JSON.parse(request.response);
            console.log(jsonObj);
            panelParametersCreater(jsonObj);
        });
    }
    else {
        document.getElementById('urlButtonError').innerHTML = 'Всавьте ссылку на панель в поле'
    }
});

//Пример ссылки заполнения поля
document.getElementById('primer').addEventListener("click", function () {
    document.getElementById("urlField").value =
        "https://rozetka.com.ua/180937912/p180937912/";
});

//функция заполнения панели параметров
function panelParametersCreater(jsonObj) {
    document.getElementById("panelImg").style.backgroundImage = "url('" + jsonObj.Img + "')";
    document.getElementById("priceField").value = jsonObj.Price;
    if (jsonObj.Currency == "UAH") {
        document.getElementById("uah").selected = "true";
    }
    else if (jsonObj.Currency == "USD") {
        document.getElementById("usd").selected = "true";
    }
    else if (jsonObj.Currency == "EUR") {
        document.getElementById("eur").selected = "true";
    }
    if (jsonObj.PanelType == "PolyCristal") {
        document.getElementById("PolyCristal").selected = "true";
    }
    else if (jsonObj.PanelType == "MonoCristal") {
        document.getElementById("MonoCristal").selected = "true";
    }
    document.getElementById("pMaxField").value = jsonObj.Pmax;
    document.getElementById("efficiencyField").value = jsonObj.Efficiency;
};

//Координаты геолокации
var lat;
var lon;
var marker;

var getLocationError = document.getElementById("getLocationError");
var latField = document.getElementById("latField");
var lonField = document.getElementById("lonField");

//Определение геолокации устройства
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        getLocationError.innerHTML = "Geolocation is not supported by this browser.";
    }
}
function showPosition(position) {
    lat = position.coords.latitude;
    lon = position.coords.longitude;
    console.log(lat, lon);
    getLocationError.innerHTML = "";
    addMarker(lat, lon);
    latField.value = lat;
    lonField.value = lon;
    landHeightQuery(lat, lon);
}
function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            getLocationError.innerHTML = "User denied the request for Geolocation."
            break;
        case error.POSITION_UNAVAILABLE:
            getLocationError.innerHTML = "Location information is unavailable."
            break;
        case error.TIMEOUT:
            getLocationError.innerHTML = "The request to get user location timed out."
            break;
        case error.UNKNOWN_ERROR:
            getLocationError.innerHTML = "An unknown error occurred."
            break;
    }
}

//Инициализация карты LeafLet
var map_type;
var mymap = L.map('mapid').setView([49.25, 31.65], 4);

function mapInit(map_type) {
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: map_type,
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoicm94eWRldmlsIiwiYSI6ImNrNzA5MXRjejA3cGUzbG1wbjZ4dDAzcGoifQ.DqW1Kd4JKzvHktxXtrTEsw'
    }).addTo(mymap);
}

//Переключение ПЛАН/СПУТНИК
(function () {
    var mapRadios = document.getElementsByName('plan-satelite');
    for (var i = 0; i < mapRadios.length; i++) {
        mapRadios[i].onclick = function () {
            if (this.value == 'map_satelite') {
                mapInit('mapbox/satellite-v9');
            }
            else {
                mapInit('mapbox/streets-v11');
            }
        }
    }
})();


//Добавление маркера на карту 
function addMarker(lat, lon) {
    getLocationError.innerHTML = "";
    clearMarker();
    marker = L.marker([lat, lon]).addTo(mymap);
    return marker;
};

//Клик по карте
mymap.on('click', onMapClick);
function onMapClick(e) {
    getLocationError.innerHTML = "";
    lat = e.latlng.lat;
    lon = e.latlng.lng;
    addMarker(lat, lon);
    latField.value = lat;
    lonField.value = lon;
    landHeightQuery(lat, lon);
};

//Очистка маркеров
function clearMarker() {
    if (marker != undefined) {
        marker.remove();
        latField.value = "";
        lonField.value = "";
    }
    if (landHeightField.value != undefined) {
        landHeightField.value = '';
    }
};

//Запрос высоты над уровнем моря 
var landHeightField = document.getElementById('landHeightField');
function landHeightQuery(lat, lon) {
    var landHeightxhr = new XMLHttpRequest();
    landHeightxhr.open('GET', 'https://cors-anywhere.herokuapp.com/re.jrc.ec.europa.eu/api/getelevation?lat=' + lat + '&lon=%20' + lon + '&js=1', true);
    landHeightxhr.send();
    var alt;

    landHeightxhr.onreadystatechange = function () {
        if (landHeightxhr.readyState != 4) {
            return;
        }
        if (landHeightxhr.status != 200) {
            console.log(landHeightxhr.status + ': ' + landHeightxhr.statusText);
        }
        else {
            alt = landHeightxhr.responseText;
            landHeightField.value = alt;
            return alt;
        }
    }
};

//Запись переменных для запроса PVcalc из пользовательских полей 
var heightHorizon = document.getElementById('heightHorizon');
var panelsNumberField = document.getElementById('panelsNumberField');
function vars_EU_SCIENCE_HUB() {
    pMax = document.getElementById("pMaxField").value;
    if (pMax != null) {
        if (panelsNumberField.value > 0) {
            peakpower = pMax * panelsNumberField.value / 1000;
        }
        else {
            peakpower = 0;
        }
    }
    loss = document.getElementById("efficiencyField").value;
    if (loss > 1) {
        loss = 18 * ((20 - loss) / 20) + 14; //расчет потерь системы от КПД панели
    }
    lat = latField.value;
    lon = lonField.value;


    if (document.getElementById('slopeOptimal').checked == true) {
        getSlopeOptimal = 1;
    }
    else {
        getSlopeOptimal = 0;
        if (document.getElementById('slopeField').value > 0) {
            angle = document.getElementById('slopeField').value;
        }
    }

    if (document.getElementById('azimutOptimal').checked == true) {
        azimut = 0;
    }
    else {
        azimut = document.getElementById('azimutField').value;
    }

    if (heightHorizon.checked == true) {
        usehorizon = 1;
    }
    else {
        usehorizon = 0;
    }
    console.log(peakpower, lat, lon, loss, usehorizon, getSlopeOptimal);
};
function QUEUE_vars_EU_SCIENCE_HUB() {
    return new Promise(function (resolve) {
        vars_EU_SCIENCE_HUB();
        resolve();
    });
};

//Calc_1 Запрос на сервер EU SCIENCE HUB 
var request_EU_SCIENCE_HUB;
function query_EU_SCIENCE_HUB() {
    request_EU_SCIENCE_HUB = undefined;
    var query_EU_SCIENCE_HUB_xhr = new XMLHttpRequest();
    query_EU_SCIENCE_HUB_xhr.open(
        'GET',
        'https://cors-anywhere.herokuapp.com/re.jrc.ec.europa.eu/api/PVcalc?lat=' +
        lat + '&lon=' + lon + '&peakpower=' + peakpower + '&loss=' + loss + '&usehorizon=' +
        usehorizon + '&optimalinclination=' + getSlopeOptimal + '&angle=' + angle + 
        '&aspect=' + azimut + '&outputformat=json', true);
    query_EU_SCIENCE_HUB_xhr.send();
    query_EU_SCIENCE_HUB_xhr.onreadystatechange = function () {
        if (query_EU_SCIENCE_HUB_xhr.readyState != 4) {
            return;
        }
        if (query_EU_SCIENCE_HUB_xhr.status != 200) {
            console.log(query_EU_SCIENCE_HUB_xhr.status + ': ' + query_EU_SCIENCE_HUB_xhr.statusText);
        }
        else {
            request_EU_SCIENCE_HUB = query_EU_SCIENCE_HUB_xhr.responseText;
            request_EU_SCIENCE_HUB = JSON.parse(request_EU_SCIENCE_HUB);
            console.log(request_EU_SCIENCE_HUB);
            return request_EU_SCIENCE_HUB;
        }
    }
};
function QUEUE_query_EU_SCIENCE_HUB() {
    return new Promise(function (resolve) {
        query_EU_SCIENCE_HUB();
        resolve();
    });
};

/*Построение диаграмм*/
var chartMainLabel_1 = 'Среднемесячное производство электроэнергии (кВтч/месяц)';
var chartMainLabel_2 = 'Среднесуточное производство электроэнергии (кВтч/сутки)';
var chartMainLabel_3 = 'Отклонение месячного производства эл.энергии от года к году (кВтч)';
var chartMainLabel_4 = 'Расчетный доход по зеленому тарифу (UAH/месяц)';


function chart_1(chartID, dataChart, chartMainLabel, color) {
    var ctx = document.getElementById(chartID).getContext('2d');
    var chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'bar',

        // The data for our dataset
        data: {
            labels: monthlabelsMassiveMod,
            datasets: [{
                label: chartMainLabel,
                backgroundColor: color,
                borderColor: color,
                data: dataChart
            }]
        },

        // Configuration options go here
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    })
};
function QUEUE_chart_1(chartID, dataChart, chartMainLabel, color) {
    return new Promise(function (resolve) {
        chart_1(chartID, dataChart, chartMainLabel, color);
        resolve();
    });
};

//Переменные функций массивов месяцов
var monthlabelsMassiveMod = [];
var monthNumbersMassiveMod = [];
var date;

//Функция формирования массива названий месяцов от заданного месяца
function monthLabelsCreater() {
    date = document.getElementById('monthField').value;
    if (date != undefined && date != "") {
        var labelsMassive = [
                'Январь', 'Февраль', 'Март', 
                'Апрель', 'Май', 'Июнь', 
                'Июль', 'Август', 'Сентябрь', 
                'Октябрь', 'Ноябрь', 'Декабрь'];
        var month = parseInt(date.substring(5, 7));
        for (var i = 0; i < 12; i++){
            if (labelsMassive[month - 1 + i] != undefined) {
                monthlabelsMassiveMod[i] = labelsMassive[month - 1 + i];
		    }
            else {
                monthlabelsMassiveMod[i] = labelsMassive[Math.abs(12 - month - i + 1)];
		    }
	    }
        document.getElementById("monthError").innerHTML = '';
        return monthlabelsMassiveMod;
	}
    else {
        document.getElementById("monthError").innerHTML = 'Введите дату';
        return;
	}
};
function QUEUE_monthLabelsCreater() {
    return new Promise(function (resolve) {
        monthLabelsCreater();
        resolve();
    });
};

//Функция формирования массива номеров месяцов от заданного месяца 
function monthNumbersCreater() {
    date = document.getElementById('monthField').value;
    if (date != undefined && date != "") {
        var monthNumbersMassive = [
                0, 1, 2, 
                3, 4, 5, 
                6, 7, 8, 
                9, 10, 11];
        var month = parseInt(date.substring(5, 7));
        for (var i = 0; i < 12; i++){
            if (monthNumbersMassive[month - 1 + i] != undefined) {
                monthNumbersMassiveMod[i] = monthNumbersMassive[month - 1 + i];
		    }
            else {
                monthNumbersMassiveMod[i] = monthNumbersMassive[Math.abs(12 - month - i + 1)];
		    }
	    }
        console.log(monthNumbersMassiveMod);
        document.getElementById("monthError").innerHTML = '';
        return monthNumbersMassiveMod;
	}
    else {
        document.getElementById("monthError").innerHTML = 'Введите дату';
        return;
	}
};
function QUEUE_monthNumbersCreater() {
    return new Promise(function (resolve) {
        monthNumbersCreater();
        resolve();
    });
};

//Запись переменных для построения диаграммы 
var dataChart_1 = [];
var dataChart_2 = [];
var dataChart_3 = [];
function dataCreater(path, monthNumbersMassiveMod, chartParam, dataChart) {
    console.log(path);
    var mass;
    for (var i = 0; i < 12; i++) {
        mass = path[monthNumbersMassiveMod[i]];
        dataChart[i] = mass[chartParam];
    }
    console.log(dataChart);
    return dataChart;
};
function QUEUE_dataCreater(path, monthNumbersMassiveMod, chartParam, dataChart) {
    return new Promise(function (resolve) {
        dataCreater(path, monthNumbersMassiveMod, chartParam, dataChart);
        resolve();
    });
};

// Постоение результатов на основе ответа сервера EU_SCIENCE_HUB
function result() {
    document.getElementById('resultError').innerHTML = '';

    if (document.getElementById("priceField").value != '' &&
        document.getElementById("panelTypeField").value != '' &&
        document.getElementById("pMaxField").value != '' &&
        document.getElementById("efficiencyField").value != '' &&
        document.getElementById("panelsNumberField").value > 0 &&
        document.getElementById("latField").value != '' &&
        document.getElementById("lonField").value != '' &&
        document.getElementById("monthField").value != '' &&
        document.getElementById("greenTarifField").value != '' &&
        document.getElementById("onlineCurField").value != '' &&
        document.getElementById("inverterField").value != '') {

        document.getElementById('results').style.display = 'flex';

        QUEUE_vars_EU_SCIENCE_HUB().
            then(QUEUE_query_EU_SCIENCE_HUB()).
            then(QUEUE_monthLabelsCreater()).
            then(QUEUE_monthNumbersCreater());

        var counter = 0;
        var timer = setInterval(function () {
            console.log("turn no" + counter);
            if (request_EU_SCIENCE_HUB != undefined) {
                QUEUE_dataCreater(request_EU_SCIENCE_HUB.outputs.monthly.fixed, monthNumbersMassiveMod, 'E_m', dataChart_1).
                    then(QUEUE_chart_1('chart_1', dataChart_1, chartMainLabel_1, '#4d94ff')).
                    then(QUEUE_dataCreater(request_EU_SCIENCE_HUB.outputs.monthly.fixed, monthNumbersMassiveMod, 'E_d', dataChart_2)).
                    then(QUEUE_chart_1('chart_2', dataChart_2, chartMainLabel_2, 'blue')).
                    then(QUEUE_dataCreater(request_EU_SCIENCE_HUB.outputs.monthly.fixed, monthNumbersMassiveMod, 'SD_m', dataChart_3)).
                    then(QUEUE_chart_1('chart_3', dataChart_3, chartMainLabel_3, 'green')).
                    then(QUEUE_finChartFunction(dataChart_1, greenTarif, document.getElementById('onlineCurField').value)).
                    then(QUEUE_chart_1('chart_4', finChartData, chartMainLabel_4, '#ff9900')).
                    then(QUEUE_finalResultsFunction()).
                    then(QUEUE_tableCreater(monthlabelsMassiveMod, dataChart_1, '1')).
                    then(QUEUE_tableCreater(monthlabelsMassiveMod, dataChart_2, '2')).
                    then(QUEUE_tableCreater(monthlabelsMassiveMod, dataChart_3, '3')).
                    then(QUEUE_tableCreater(monthlabelsMassiveMod, finChartData, '4'));

                console.log('Есть ответ сервера');
            }
            if (counter > 6 || request_EU_SCIENCE_HUB != undefined) {
                clearInterval(timer);
            }
            if (counter > 6 && request_EU_SCIENCE_HUB == undefined) {
                console.log('Нет ответа сервера');
                document.getElementById('resultError').innerHTML = 'Нет ответа сервера';
            }
            counter++;
        }, 2000);
    }
    else {
        document.getElementById('resultError').innerHTML = 'Заполните все поля';
    }
};

//Запрос курса евро на bank.gov.ua 
var requestBank;
function queryBank() {
    document.getElementById('onlineCurError').innerHTML = '';
    requestBank = undefined;
    var queryBank_xhr = new XMLHttpRequest();
    queryBank_xhr.open('GET', 'https://cors-anywhere.herokuapp.com/bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json', true);
    queryBank_xhr.send();
    queryBank_xhr.onreadystatechange = function () {
        if (queryBank_xhr.readyState != 4) {
            document.getElementById('onlineCurError').innerHTML = 'Обновите поле или заполните вручную';
            return;
        }
        if (queryBank_xhr.status != 200) {
            console.log(queryBank_xhr.status + ': ' + queryBank_xhr.statusText);
            document.getElementById('onlineCurError').innerHTML = 'Обновите поле или заполните вручную';
        }
        else {
            requestBank = queryBank_xhr.responseText;
            requestBank = JSON.parse(requestBank);
            document.getElementById('onlineCurField').value = requestBank[33].rate;
            document.getElementById('onlineCurError').innerHTML = '';
            return requestBank;
        }
    }
};

//Проверка заполнения поля Дата введения в эксплуатацию
function dataCheckValue() {
    date = document.getElementById('monthField').value;
    if (parseInt(date.substring(0, 4)) > 2016 && parseInt(date.substring(0, 4)) < 2030) {
        document.getElementById('monthError').innerHTML = '';
        greenTarifFunc(date);
        return date;
    }
    else {
        document.getElementById('monthError').innerHTML = 'Введите дату между 2017-2029гг.';
        document.getElementById('greenTarifField').value = '';
        return;
    }
};

//Определение зеленого тарифа 
var greenTarif;
function greenTarifFunc(period) {
    document.getElementById('greenTarifError').innerHTML = '';
    if (period != undefined) {
        if (parseInt(period.substring(0, 4)) > 2016 && parseInt(period.substring(0, 4)) < 2020) {
            greenTarif = 0.163;
            document.getElementById('greenTarifField').value = greenTarif;
            return greenTarif;
        }
        else if (parseInt(period.substring(0, 4)) > 2019 && parseInt(period.substring(0, 4)) < 2025) {
            greenTarif = 0.15;
            document.getElementById('greenTarifField').value = greenTarif;
            return greenTarif;
        }
        else if (parseInt(period.substring(0, 4)) > 2024 && parseInt(period.substring(0, 4)) < 2030) {
            greenTarif = 0.13;
            document.getElementById('greenTarifField').value = greenTarif;
            return greenTarif;
        }
        else {
            greenTarif = undefined;
            document.getElementById('greenTarifError').innerHTML = 'Ошибка определения даты';
            document.getElementById('greenTarifField').value = '';
            return;
        }
    }
    else {
        greenTarif = undefined;
        document.getElementById('greenTarifError').innerHTML = 'Ошибка определения даты';
        document.getElementById('greenTarifField').value = '';
        return;
    }
};

//Обработка инвертера
var inverterPrice;
function inverterFunction() {
    document.getElementById('inverterDescription').innerHTML = '';
    document.getElementById('inverterPhoto').style.backgroundImage = "";
    inverterPrice = undefined;
    if (document.getElementById('inverterField').value == 'inverter_1') {
        console.log('inverter_1');
        inverterPrice = 55360;
        document.getElementById('inverterDescription').innerHTML = '1-фазный инвертер GoodWe (GW5048-EM) 5000 Вт <br> Стоимость: <b>' + inverterPrice + '</b> грн.';
        document.getElementById('inverterPhoto').style.backgroundImage = "url(https://i1.rozetka.ua/goods/11854276/goodwe_gw5000_dt_5cb891fcd48bf_images_11854276680.jpg)";
    }
    else if (document.getElementById('inverterField').value == 'inverter_2') {
        console.log('inverter_2');
        inverterPrice = 66554;
        document.getElementById('inverterDescription').innerHTML = '3-фазный инвертер GoodWe (GW15KN-DT) 15000 Вт <br> Стоимость: <b>' + inverterPrice + '</b> грн.';
        document.getElementById('inverterPhoto').style.backgroundImage = "url(https://i2.rozetka.ua/goods/11854192/goodwe_gw15kn_dt_images_11854192170.jpg)";
    }
    else if (document.getElementById('inverterField').value == 'inverter_3') {
        console.log('inverter_3');
        inverterPrice = 84554;
        document.getElementById('inverterDescription').innerHTML = '3-фазный инвертер GoodWe (GW25K-DT) 25000 Вт <br> Стоимость: <b>' + inverterPrice + '</b> грн.';
        document.getElementById('inverterPhoto').style.backgroundImage = "url(https://i2.rozetka.ua/goods/11854250/goodwe_gw25k_dt_images_11854250862.jpg)";
    }
    else if (document.getElementById('inverterField').value == 'inverter_4') {
        console.log('inverter_4');
        inverterPrice = 24225;
        document.getElementById('inverterDescription').innerHTML = '3-фазный инвертер AFORE (BNT005KTL) 5000 Вт <br> Стоимость: <b>' + inverterPrice + '</b> грн.';
        document.getElementById('inverterPhoto').style.backgroundImage = "url(https://i2.rozetka.ua/goods/14674781/135910711_images_14674781652.jpg)";
    }
    else if (document.getElementById('inverterField').value == 'inverter_5') {
        console.log('inverter_5');
        inverterPrice = 35130;
        document.getElementById('inverterDescription').innerHTML = '3-фазный инвертер Trannergy (TRB010KTL) 10000 Вт <br> Стоимость: <b>' + inverterPrice + '</b> грн.';
        document.getElementById('inverterPhoto').style.backgroundImage = "url(https://i2.rozetka.ua/goods/14668736/135562293_images_14668736620.jpg)";
    }
};

//Дополнительные затраты
var dopCosts;
function dopCostsFunction() {
    dopCosts = 0;
    dopCosts = document.getElementById('additionalExpensesField').value;
    return dopCosts;
};

//Капитальные затраты
var capCosts;
function capCostsFunction(cost_1, n_cost_1, cost_2, cost_3) {
    capCosts = 0;
    capCosts = (cost_1 * n_cost_1) + cost_2 + cost_3;
    console.log(capCosts);
    return capCosts;
};

//Формирование данных для финансовой диаграммы 
var finChartData = [];
function finChartFunction(dataChart, tarif, kurs) {
    for (var i = 0; i < dataChart.length; i++) {
        finChartData[i] = Math.round(dataChart[i] * tarif * kurs);
    }
    console.log(finChartData);
    return finChartData;
}
function QUEUE_finChartFunction(dataChart, tarif, kurs) {
    return new Promise(function (resolve) {
        finChartFunction(dataChart, tarif, kurs);
        resolve();
    });
};

//Вставка значений в финальный отчет 
function finalResultsFunction() {
    var reducer_annualPower = (accumulator_annualPower, currentValue_annualPower) =>
        accumulator_annualPower + currentValue_annualPower;
    document.getElementById('FR_annualPower').innerHTML =
        Math.round(dataChart_1.reduce(reducer_annualPower)) + ' кВтч';

    var reducer_annualMoney = (accumulator_annualMoney, currentValue_annualMoney) =>
        accumulator_annualMoney + currentValue_annualMoney;
    document.getElementById('FR_annualMoney').innerHTML =
        finChartData.reduce(reducer_annualMoney) + ' грн';

    var totalCosts = parseInt(document.getElementById("priceField").value) *
        parseInt(panelsNumberField.value) +
        parseInt(document.getElementById('additionalExpensesField').value) +
        parseInt(inverterPrice);
    document.getElementById('FR_allCosts').innerHTML = totalCosts + ' грн';
        
    document.getElementById('FR_investTerm').innerHTML =
        (parseInt(totalCosts) / parseInt(finChartData.reduce(reducer_annualMoney))).toFixed(1) +
        ' год(лет)';

    document.getElementById('FR_panelName').innerHTML = document.querySelector("#urlField").value;
    document.getElementById('FR_panelAmount').innerHTML = panelsNumberField.value;
    document.getElementById('FR_panelPower').innerHTML = peakpower + ' кВт';
    document.getElementById('FR_panelType').innerHTML = document.getElementById("PolyCristal").value;
    document.getElementById('FR_panelKPD').innerHTML = document.getElementById("efficiencyField").value + ' %';
    document.getElementById('FR_panelCost').innerHTML = document.getElementById("priceField").value + ' грн';
    document.getElementById('FR_Lat').innerHTML = lat;
    document.getElementById('FR_Lon').innerHTML = lon;
    document.getElementById('FR_Alt').innerHTML = landHeightField.value;
    document.getElementById('FR_panelAlt').innerHTML = document.getElementById("installHeightField").value;

    if (document.getElementById('slopeOptimal').checked == true) {
        document.getElementById('FR_panelSlope').innerHTML = request_EU_SCIENCE_HUB.inputs.mounting_system.fixed.slope.value;
    }
    else {
        document.getElementById('FR_panelSlope').innerHTML = document.getElementById("slopeField").value;
    }
    if (document.getElementById('azimutOptimal').checked == true) {
        document.getElementById('FR_panelAzimut').innerHTML = '0';
    }
    else {
        document.getElementById('FR_panelAzimut').innerHTML = document.getElementById("azimutField").value;
    }
    document.getElementById('FR_HightHoriz').innerHTML = document.getElementById("heightHorizon").checked;
    document.getElementById('FR_startDate').innerHTML = document.getElementById('monthField').value;
    document.getElementById('FR_GreenTarif').innerHTML = document.getElementById('greenTarifField').value + ' EUR';
    document.getElementById('FR_EURCurrency').innerHTML = document.getElementById('onlineCurField').value + ' грн';
    document.getElementById('FR_Inverter').innerHTML = document.getElementById('inverterDescription').innerHTML;
    document.getElementById('FR_dopCosts').innerHTML = document.getElementById('additionalExpensesField').value + ' грн';
}
function QUEUE_finalResultsFunction() {
    return new Promise(function (resolve) {
        finalResultsFunction();
        resolve();
    });
};

//Заполнение таблиц
function tableCreater(monthArray, dataArray, tableNum) {
    for (i = 0; i < 12; i++) {
        if (document.getElementById('t' + tableNum + '_m' + parseInt(i + 1)) != null) {
            document.getElementById('t' + tableNum + '_m' + parseInt(i + 1)).innerHTML = monthArray[i];
        }
        if (document.getElementById('t' + tableNum + '_d' + parseInt(i + 1)) != null) {
            document.getElementById('t' + tableNum + '_d' + parseInt(i + 1)).innerHTML = dataArray[i];
        }
    }
}
function QUEUE_tableCreater(monthArray, dataArray, tableNum) {
    return new Promise(function (resolve) {
        tableCreater(monthArray, dataArray, tableNum);
        resolve();
    });
};

//Функция Я НЕ ЗНАЮ
function idnFunction(fieldID, idnValue) {
    document.getElementById(fieldID).value = idnValue;
};

//Вставка текущей даты
function currentDateFunction() {
    document.getElementById('monthError').innerHTML = '';
    var currentDate = new Date();
    var currentMonth = currentDate.getMonth() + 1;
    var currentYear = currentDate.getFullYear();
    if (currentMonth < 10) {
        currentMonth = '0' + currentMonth;
    }
    document.getElementById('monthField').value = currentYear + '-' + currentMonth;
    dataCheckValue();
}






