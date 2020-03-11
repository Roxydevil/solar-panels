<?php
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	error_reporting(E_ALL);
	$html = null;
	$safeHtml = null;
	$url = null;

	
	$priceCount;

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
	$panelTypeWord = 'Тип панели';
	$pmaxWord = 'СТУ Максимальная Проектная мощность (Pmax)';
	$kpdWord = 'КПД модуля';
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
			$price = substr($safeHtml, ($pricePosition_2 + 23), 4);
		}
		else {
			$price = 'Цена не обнаружена';
		}
	};
	//поиск валюты товара
	$currencyPosition = strpos($safeHtml, $currencyWord);
	$currency = substr($safeHtml, ($currencyPosition + 17), 3);
	//поиск типа панели
	$panelTypePosition = strpos($safeHtml, $panelTypeWord);
	$panelType = substr($safeHtml, ($panelTypePosition + 19), 22);
	if ($panelType == 'Монокристал') {
		$panelType = 'MonoCristal';
	}
	else if ($panelType == 'Поликристал') {
		$panelType = 'PolyCristal';
	}
	else {
		$panelType = 0;
	};
	//поиск Pmax
	$pmaxPosition = strpos($safeHtml, $pmaxWord);
	if ($pmaxPosition == null) {
		$pmax = 0;
	}
	else {
		$pmax = substr($safeHtml, ($pmaxPosition + 74), 3);
	};
	//поиск КПД
	$kpdPosition = strpos($safeHtml, $kpdWord);
	if ($kpdPosition == null) {
		$kpd = 0;
	}
	else {
		$kpd = substr($safeHtml, ($kpdPosition + 19), 2);
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