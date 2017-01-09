<?php
include_once 'filesaver.php';
define('ROOT', dirname(__FILE__));

if (isset($_POST['src']))
{
    $img = $_POST['src'];
    $extension = '.jpeg';
    $path = ROOT.'/photos/';
    $filename = ImageSaver::getRandomFileName($path, $extension);
    $filepathJson = 'photos/'.$filename.$extension;
    $img = str_replace('data:image/jpeg;base64,', '', $img);
    $img = str_replace(' ', '+', $img);
    $result = file_put_contents($path.$filename.$extension, base64_decode($img));
}

if (isset($_POST['filter']))
{
    $filter = $_POST['filter'];
}


$string = file_get_contents("data/pictures.json");
$json_a = json_decode($string, true);
$likes = rand(0,100);
$comments = rand(0,100);
$date = rand(10,16);
$json_a[] = ['likes' => $likes, 'comments' => $comments, 'url' => $filepathJson , 'filter' => $filter,'date' => '20'.$date.'-09-15'];

$json_enc = json_encode($json_a, true);
$fo = fopen('data/pictures.json', 'w');
fwrite($fo, $json_enc);
fclose($fo);


