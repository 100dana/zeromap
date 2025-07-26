import React from 'react';
import { WebView } from 'react-native-webview';

const KAKAO_API_KEY = '504f485ba32aedc877afaa80a956af83';

const KAKAO_MAP_HTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <title>Kakao Map</title>
    <style>html,body,#map {height:100%;margin:0;padding:0;}</style>
    <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
  </head>
  <body>
    <div id="map"></div>
    <script>
      var mapContainer = document.getElementById('map');
      var mapOption = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 서울시청
        level: 1 // 확대 레벨 - 숫자가 커질수록 축소
      };
      var map = new kakao.maps.Map(mapContainer, mapOption);
    </script>
  </body>
  </html>
`;

const KakaoMap = () => {
  return (
    <WebView
      originWhitelist={['*']}
      source={{ html: KAKAO_MAP_HTML }}
      style={{ flex: 1 }}
    />
  );
};

export default KakaoMap; 