<?php
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	$html = null;
	$safeHtml = null;
	$url = null;
	
	$priceCount;
	$currencyCount;
	$panelTypeCount;
	$pmaxCount;
	$kpdCount;

	$pricePosition;
	$currencyPosition;
	$panelTypePosition;
	$pmaxPosition;
	$kpdPosition;
	$imgStartPosition;
	$imgEndPosition;

	$priceWord = '"price":';
	$priceWord_2 = ',"productPriceLocal":"';
	$currencyWord = '"priceCurrency":';
	$currencyWord_2 = 'unit:';
	$panelTypeWord = 'Тип панели';
	//$panelTypeWord_2 = 'Тип панели';
	$pmaxWord = 'СТУ Максимальная Проектная мощность (Pmax)';
	$pmaxWord_2 = '(Pmax)';
	$kpdWord = 'КПД модуля';
	$kpdWord_2 = 'КПД модуля';
	$imgStartWord = '"image":"';
	$imgEndWord = '","';

	$price;
	$currency;
	$panelType;
	$pmax;
	$kpd;
	$img;

	$url = $_GET['url'];
	$html = curl_get($url);
		
	//удаление тега HTML чтобы страница открывалась в браузере как текст
	$safeHtml = strip_tags($html);
	
	//поиск цены товара
	$priceCount = substr_count($safeHtml, $priceWord);
	if ($priceCount > 0) {
		$pricePosition = strpos($safeHtml, $priceWord);
		$price = substr($safeHtml, ($pricePosition + 9), 7); //работает только с 7 значной ценой
	}
	else {
		$priceCount = substr_count($safeHtml, $priceWord_2);
		if ($priceCount > 0) {
			$pricePosition = strpos($safeHtml, $priceWord_2);
			$price = substr($safeHtml, ($pricePosition + 22), 4);
		}
		else {
			$price = 'Введите цену вручную';
		}
	};

	//поиск валюты товара
	$currencyCount = substr_count($safeHtml, $currencyWord);
	if ($currencyCount > 0) {
		$currencyPosition = strpos($safeHtml, $currencyWord);
		$currency = substr($safeHtml, ($currencyPosition + 17), 3);
	}
	else {
		$currencyCount = substr_count($safeHtml, $currencyWord_2);
		if ($currencyCount > 0) {
			$currencyPosition = strpos($safeHtml, $currencyWord_2);
			$currency = substr($safeHtml, ($currencyPosition + 7), 6);
		}
		else {
			$currency = 'UAH*';
		}
	};

	//поиск типа панели
	$panelTypeCount = substr_count($safeHtml, $panelTypeWord);
	if ($panelTypeCount > 0) {
		$panelTypePosition = strpos($safeHtml, $panelTypeWord);
		if (substr_count(substr($safeHtml, $panelTypePosition, 60), 'онокристал') > 0) {
			$panelType = 'MonoCristal';
		}
		else if (substr_count(substr($safeHtml, $panelTypePosition, 60), 'оликристал') > 0) {
			$panelType = 'PolyCristal';
		}
		else {
			$panelType = 'Укажите тип вручную';
		}
	}
	else {
		$panelType = 'Не найдено'; //добавить еще вариант поиска по слову_2
	};


	//поиск Pmax
	$pmaxCount = substr_count($safeHtml, $pmaxWord);
	if ($pmaxCount > 0) {
		$pmaxPosition = strpos($safeHtml, $pmaxWord);
		$pmax = substr($safeHtml, ($pmaxPosition + 74), 3);
	}
	else {
		$pmaxCount = substr_count($safeHtml, $pmaxWord_2);
		if ($pmaxCount > 0) {
			$pmaxPosition = strpos($safeHtml, $pmaxWord_2);
			$pmax = substr($safeHtml, ($pmaxPosition + 7), 6);
		}
		else {
			$pmax = 'Не найдено';
		}
	};
	
	//поиск КПД
	$kpdCount = substr_count($safeHtml, $kpdWord);
	echo '<br>' . '$kpdCount' . $kpdCount . '<br>';
	if ($kpdCount > 0) {
		$kpdPosition = strpos($safeHtml, $kpdWord);
		$kpd = substr($safeHtml, ($kpdPosition + 19), 2);
	}
	else {
		$kpdCount = substr_count($safeHtml, $kpdWord_2);
		echo '<br>' . '$kpdCount_2' . $kpdCount . '<br>';
		if ($kpdCount > 0) {
			$kpdPosition = strpos($safeHtml, $kpdWord_2);
			$kpd = substr($safeHtml, ($kpdPosition + 19), 2);
		}
		else {
			$kpd = 'Не найдено';
		}
	};
	
	
	//Поиск адреса картинки
	$imgStartPosition = strpos($safeHtml, $imgStartWord);
	$imgEndPosition = strpos($safeHtml, $imgEndWord, $imgStartPosition);
	$img = substr($safeHtml, $imgStartPosition + strlen($imgStartWord), ($imgEndPosition - $imgStartPosition) - strlen($imgStartWord));
	
	
	//Добавить поиск из описания	
	
	/*
	//формирование JSON пакета
	$responseData = [ 
		'Price' => $price, 
		'Currency' => $currency,
		'PanelType' => $panelType, 
		'Pmax' => $pmax, 
		'Efficiency' => $kpd, 
		'Img' => $img
		];
	header('Content-Type: application/json');
	echo json_encode($responseData);
	*/
	echo '<br> ____________________________________ <br><br>';
	echo 'Что получилось: <br>';
	echo $price; 
	echo '<br>';
	echo $currency;
	echo '<br>';
	echo $panelType;
	echo '<br>';
	echo $pmax;
	echo '<br>';
	echo $kpd;
	echo '<br>';
	echo $img;
	echo 'Вся страница: <br>';
	//echo $html;
	echo $safeHtml;
	//file_put_contents('1.txt', $html);

	//функция curl
	function curl_get($url, $referer = 'http://www.google.com') {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_USERAGENT, "Chrome/59.0.3071.125 Mobile");
		curl_setopt($ch, CURLOPT_REFERER, $referer);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$data = curl_exec($ch);
		curl_close($ch);
		return $data;
	};


?>