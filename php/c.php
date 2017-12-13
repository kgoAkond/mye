 <? 
header('Access-Control-Allow-Origin: *'); 
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

$actual_link = "https://www.ted.com".$_SERVER[REQUEST_URI];
$html = get_html( $actual_link );
$movId = getMovieId( $html );
$id = getId( $html );
$img = getImage( $html );
$obj = (object) array( 'movieId' => $movId, "id" => $id, "img" => $img);
$json = json_encode( (array)$obj );
echo $json;
?>
