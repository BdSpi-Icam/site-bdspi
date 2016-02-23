<?php 

function getEvangileDuJourContent($type,$date=null,$lang="FR",$content="GSP"){
  if (empty($date) || !is_numeric($date)) {
    $date = date('Ymd');
  }
  $url = "http://feed.evangelizo.org/v2/reader.php?date=".$date."&type=".$type."&lang=".$lang."&content=GSP";
  $h = fopen($url,"r");
  $str = '';
  while (!feof($h)) {
    $str .= fgets($h);
  }
  return $str;
}

?>

<html lang="fr"><head>
    <meta charset="utf-8">
    <meta content="IE=edge" http-equiv="X-UA-Compatible">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta content="Page de Maintenance du site internet du BdSpi de l'Icam" name="description">
    <meta content="Antoine Giraud 115" name="author">
    <link href="favicon.png" rel="shortcut icon">

    <title>Maintenance site internet BdSpi Icam</title>

    <!-- Bootstrap core CSS -->
    <link rel="stylesheet" href="css/bootstrap.min.css">

    <!-- Custom styles for this template -->
    <link rel="stylesheet" href="css/maintenance.css">

    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
      <script src="https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js"></script>
      <script src="https://oss.maxcdn.com/libs/respond.js/1.4.2/respond.min.js"></script>
    <![endif]-->
  <style id="holderjs-style" type="text/css"></style>
</head>

  <body>

    <div class="site-wrapper">

      <div class="site-wrapper-inner">

        <div class="cover-container">

          <div class="masthead clearfix">
            <div class="inner clearfix text-center">
              <img src="logo_bdspi.png" alt="BdSpi Icam" title="BdSpi Icam" height="140">
            </div>
          </div>

          <div class="inner cover">
            <h1 class="cover-heading">Maintenance du site.</h1>
            <p class="lead">
              Le site du BdSpi est actuellement en création, Il vous sera bientôt présenté.<br>
              Votre équipe du BdSpi de l'Icam Lille, pour tous les BdSpi Icam
            </p>
            <h3>Saint du jour :</h3>
            <p>
              <?= getEvangileDuJourContent('saint') ?>
            </p>
          </div>

          <div class="masthead clearfix">
            <div class="inner clearfix text-center">
              <img src="icam_at_rn_cge_paris_2014.jpg" alt="L'Icam à la RN CGE de Paris 2014" title="L'Icam à la RN CGE de Paris 2014 - Devant Montmartre" height="300">
            </div>
          </div>

          <div class="inner cover">
            <h3>Evangile du jour <small>(<?= getEvangileDuJourContent('liturgic_t') ?>)</small></h3>
            <p>
              <?= getEvangileDuJourContent('all') ?>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Bootstrap core JavaScript
    ================================================== -->
    <!-- Placed at the end of the document so the pages load faster -->
    <script src="js/jquery.js"></script>
    <script src="js/bootstrap.min.js"></script>
</body></html>