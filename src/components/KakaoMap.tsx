import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { PlaceData } from '../services/seoulApi';

const KAKAO_API_KEY = '504f485ba32aedc877afaa80a956af83';

interface KakaoMapProps {
  places?: PlaceData[];
  onMarkerClick?: (place: PlaceData) => void;
  opacity?: number; // 투명도 옵션 추가
  centerLat?: number; // 초기 중심 위도
  centerLng?: number; // 초기 중심 경도
  zoomLevel?: number; // 초기 줌 레벨
}

const KakaoMap: React.FC<KakaoMapProps> = ({ 
  places = [], 
  onMarkerClick, 
  opacity = 1,
  centerLat = 37.5665,
  centerLng = 126.9780,
  zoomLevel = 2
}) => {
  const webViewRef = useRef<WebView>(null);

  // 마커 데이터를 JavaScript로 전달하는 함수
  const addMarkers = (markers: PlaceData[]) => {
    const markersScript = `
      // 기존 마커들 제거
      if (window.markers) {
        window.markers.forEach(marker => marker.setMap(null));
      }
      if (window.infowindows) {
        window.infowindows.forEach(infowindow => infowindow.close());
      }
      window.markers = [];
      window.infowindows = [];
      
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
        
        // 인포윈도우 생성 - 개선된 디자인
        var infowindow${index} = new kakao.maps.InfoWindow({
          content: '<div style="padding: 16px; min-width: 280px; font-family: -apple-system, BlinkMacSystemFont, \\'Segoe UI\\', Roboto, sans-serif; border-radius: 12px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); background: white; border: 1px solid #E0E0E0;"><div style="display: flex; align-items: center; margin-bottom: 12px;"><div style="width: 40px; height: 40px; background: #4CAF50; border-radius: 20px; margin-right: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px; font-weight: bold;">📍</div><div style="flex: 1;"><div style="font-size: 16px; font-weight: 600; color: #212121; margin-bottom: 4px; line-height: 1.2;">${place.name}</div><div style="font-size: 12px; color: #4CAF50; font-weight: 500;">${place.category}</div></div></div><div style="font-size: 13px; color: #757575; line-height: 1.4; margin-bottom: 12px; word-break: break-all;">${place.address}</div>${place.description ? '<div style="font-size: 12px; color: #666666; line-height: 1.3; margin-bottom: 8px; padding: 8px; background: #F5F5F5; border-radius: 6px;">' + place.description + '</div>' : ''}<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid #E0E0E0;"><div style="font-size: 11px; color: #999999;">좌표: ${place.latitude.toFixed(6)}, ${place.longitude.toFixed(6)}</div><div style="font-size: 11px; color: #4CAF50; font-weight: 500;">상세보기 ›</div></div></div>',
          removable: true,
          zIndex: 1
        });
        
        window.infowindows.push(infowindow${index});
        
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
      <style>
        html,body {height:100%;margin:0;padding:0;}
        #map {
          height:100%;
          opacity: ${opacity}; /* 투명도 적용 */
        }
      </style>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var mapContainer = document.getElementById('map');
        var mapOption = {
          center: new kakao.maps.LatLng(${centerLat}, ${centerLng}), // 서울시청
          level: ${zoomLevel} // 확대 레벨
        };
        var map = new kakao.maps.Map(mapContainer, mapOption);
        
        // 지도 컨트롤 옵션 설정
        var zoomControl = new kakao.maps.ZoomControl();
        var mapTypeControl = new kakao.maps.MapTypeControl();
        
        // 지도 우측 상단에 줌 컨트롤 추가
        map.addControl(zoomControl, kakao.maps.ControlPosition.TOPRIGHT);
        
        // 지도 우측 상단에 지도 타입 컨트롤 추가
        map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
        
        // 지도 드래그 활성화 (기본값이지만 명시적으로 설정)
        map.setDraggable(true);
        
        // 지도 휠 줌 활성화 (기본값이지만 명시적으로 설정)
        map.setZoomable(true);
        
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