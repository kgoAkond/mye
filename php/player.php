 <? 
function get_html($url)
{
	  $useragent = 'User-Agent	Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; Trident/6.0)';
	 // $useragent =   'Googlebot/2.1 (+http://www.googlebot.com/bot.html)';


	  $ch = curl_init($url);
	  // Don't return HTTP headers. Do return the contents of the call
	  curl_setopt( $ch, CURLOPT_USERAGENT, $useragent );
	  curl_setopt( $ch, CURLOPT_REFERER, $url );
	  curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
	  curl_setopt( $ch, CURLOPT_FOLLOWLOCATION, 1);
	  curl_setopt($ch, CURLOPT_HEADER, 1);
	  $resp = curl_exec($ch);
	  return $resp;
}
function getMovieId( $html ) {
			$pattern = "#https://download.ted.com/talks/(?<id>.*?).mp4#";
			if(preg_match($pattern, $html, $matches))
			{
				$id = $matches['id']; 
				$ind = strrpos($id, "-");
				if( $ind > 0 ) {
					$id = substr( $id, 0, $ind ); 
				}
				return $id;				
			}
}
function getId( $html ) {
			$pattern = "#\"talk_id\":(?<id>\d*)#";
			if(preg_match($pattern, $html, $matches))
			{
				$id = $matches['id']; 
				return $id;				
			}
}
function getImage( $html ) {
			$pattern = "#\"og:image\"\s*?content=\"(?<img>.*?)\.jpg#";
			if(preg_match($pattern, $html, $matches))
			{
				$img = $matches['img']; 
				return $img;				
			}
}
function getScript() {
    $actual_link = "https://www.ted.com".$_SERVER[REQUEST_URI];
    $html = get_html( $actual_link );
    $movId = getMovieId( $html );
    $id = getId( $html );
    $img = getImage( $html );
    $obj = (object) array( 'movieId' => $movId, "id" => $id, "img" => $img);
    $json = json_encode( (array)$obj );
    echo $json;
}
?>
<html>
    <head>
        <link rel="stylesheet" href="http://achimov.com/mye/app/common/main.css" type="text/css"/>
        <link rel="stylesheet" href="http://achimov.com/mye/app/player/player.css" type="text/css"/>
        <title>Move your english</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>    
    <script>
        var tedTalk = <?=getScript()?>
    </script>
    <body ng-app="MYE" ng-controller="playerCtr">
        <audio style="position: fixed; top: -1000px" id="vPlayer" width="0" height="0" controls></audio>
        <div class="player-container">
            <div class="player-item" ng-repeat="item in vttEN" ng-click="selectItem( $index, item )" ng-class="{'player-item-backlight': selectedItem === item }"> 
                <div class="player-subitem-2"> {{item.textTR}}</div> 
                <div class="player-subitem-1" ng-class="{'player-show-text-src' : item.isTextSrcVisible,  'player-hide-text' : !item.isTextSrcVisible }"> {{item.text}} </div> 
                <div ng-if="selectedItem === item" id="progressBar" class="player-progress"></div>
                <div ng-if="selectedItem !== item" class="player-progress-hide"></div>
            </div> 
            <div style="height: 10vh"></div>
        </div>
        <div class="player-btn player-btn-back" ng-click="back()"> <img src="resources/icons/back-arrow.svg" width="100%"> </div>
    </body>
    <script src="http://achimov.com/mye/libs/jquery/jquery.min.js"></script>
    <script src="http://achimov.com/mye/libs/angular/1.6.3/angular.min.js"></script>
    <script src="http://achimov.com/mye/libs/angular/1.6.3/angular-animate.min.js"></script>
    <script src="http://achimov.com/mye/libs/angular/1.6.3/angular-aria.min.js"></script>
    <script src="http://achimov.com/mye/libs/angular/1.6.3/angular-messages.min.js"></script>
    <script src="http://achimov.com/mye/libs/angular/angular-material.min.js"></script>
    <!-- commonents -->
    <script src="http://achimov.com/mye/app/common/main.js"></script>
    <script src="http://achimov.com/mye/app/utils/utils.js"></script>
    <script src="http://achimov.com/mye/js/myeEditor/synchText.js"></script>
    <script src="http://achimov.com/mye/app/player/playerCtr.js"></script>      
</html>
