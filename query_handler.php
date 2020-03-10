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
	var_dump($html);	
	//удаление тега HTML чтобы страница открывалась в браузере как текст
	$safeHtml = strip_tags($html);

	//поиск цены товара
	$priceCount = substr_count($safeHtml, $priceWord);
	if ($priceCount == 1) {
		$pricePosition = strpos($safeHtml, $priceWord);
		$price = substr($safeHtml, ($pricePosition + 9), 7); //работает только с 7 значной ценой
	}
	else {
		$price = 0;
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
	
	var_dump($img);
	//Добавить поиск из описания	
	
	
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
	
	
	
			
	//print $safeHtml;
	//file_put_contents('1.txt', $html);

	//функция curl
	function curl_get($url, $referer = 'http://www.google.com') {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_HEADER, 0);
		curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:38.0) Gecko/20100101 Firefox/38.0");
		curl_setopt($ch, CURLOPT_REFERER, $referer);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
		$data = curl_exec($ch);
		
		curl_close($ch);
		return $data;
	};


?>
