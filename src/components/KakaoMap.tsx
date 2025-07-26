import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { PlaceData } from '../services/seoulApi';

const KAKAO_API_KEY = '504f485ba32aedc877afaa80a956af83';

interface KakaoMapProps {
  places?: PlaceData[];
  onMarkerClick?: (place: PlaceData) => void;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ places = [], onMarkerClick }) => {
  const webViewRef = useRef<WebView>(null);

  // 마커 데이터를 JavaScript로 전달하는 함수
  const addMarkers = (markers: PlaceData[]) => {
    const markersScript = `
      // 기존 마커들 제거
      if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
      }
      window.markers = [];
      
      // 새로운 마커들 추가
      ${markers.map((place, index) => `
        var marker${index} = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(${place.latitude}, ${place.longitude})
        });
        
        marker${index}.setMap(map);
        window.markers.push(marker${index});
        
        // 마커 클릭 이벤트
        kakao.maps.event.addListener(marker${index}, 'click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick',
            data: ${JSON.stringify(place)}
          }));
        });
        
        // 인포윈도우 생성
        var infowindow${index} = new kakao.maps.InfoWindow({
          content: '<div style="padding:10px;font-size:12px;"><b>${place.name}</b><br/>${place.address}</div>'
        });
        
        // 마커에 마우스오버 시 인포윈도우 표시
        kakao.maps.event.addListener(marker${index}, 'mouseover', function() {
          infowindow${index}.open(map, marker${index});
        });
        
        // 마커에서 마우스아웃 시 인포윈도우 닫기
        kakao.maps.event.addListener(marker${index}, 'mouseout', function() {
          infowindow${index}.close();
        });
      `).join('')}
    `;
    
    webViewRef.current?.injectJavaScript(markersScript);
  };

  // WebView에서 메시지 수신
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'markerClick' && onMarkerClick) {
        onMarkerClick(data.data);
      }
    } catch (error) {
      console.error('WebView 메시지 파싱 오류:', error);
    }
  };

  // places가 변경될 때마다 마커 업데이트
  useEffect(() => {
    if (places.length > 0) {
      addMarkers(places);
    }
  }, [places]);

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
          level: 1 // 확대 레벨
        };
        var map = new kakao.maps.Map(mapContainer, mapOption);
        
        // 마커 배열 초기화
        window.markers = [];
      </script>
    </body>
    </html>
  `;

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: KAKAO_MAP_HTML }}
      style={{ flex: 1 }}
      onMessage={handleMessage}
    />
  );
};

export default KakaoMap; 