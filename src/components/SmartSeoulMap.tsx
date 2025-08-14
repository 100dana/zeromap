import React, { useRef, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { PlaceData } from '../services/seoulApi';

interface SmartSeoulMapProps {
  places?: PlaceData[];
  onMarkerClick?: (place: PlaceData) => void;
  onMapClick?: (coordinates: { latitude: number; longitude: number }) => void;
  initialCenter?: { latitude: number; longitude: number };
  initialZoom?: number;
  opacity?: number; // 투명도 옵션 추가
}

const SmartSeoulMap: React.FC<SmartSeoulMapProps> = ({ 
  places = [], 
  onMarkerClick,
  onMapClick,
  initialCenter = { latitude: 37.5665, longitude: 126.9780 }, // 서울시청
  initialZoom = 2, // KakaoMap과 동일한 확대 배율로 변경
  opacity = 1 // 기본값은 완전 불투명
}) => {
  const webViewRef = useRef<WebView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // 마커 데이터를 JavaScript로 전달하는 함수
  const addMarkers = (markers: PlaceData[]) => {
    if (!isMapReady) return;
    
    const markersScript = `
      window.postMessage(JSON.stringify({
        type: 'addMarkers',
        places: ${JSON.stringify(markers)}
      }), '*');
    `;
    
    webViewRef.current?.injectJavaScript(markersScript);
  };

  // 지도 중심 이동
  const moveToLocation = (latitude: number, longitude: number, zoom: number = 15) => {
    if (!isMapReady) return;
    
    const moveScript = `
      window.postMessage(JSON.stringify({
        type: 'moveToLocation',
        latitude: ${latitude},
        longitude: ${longitude},
        zoom: ${zoom}
      }), '*');
    `;
    
    webViewRef.current?.injectJavaScript(moveScript);
  };

  // WebView에서 메시지 수신
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.type === 'mapReady') {
        setIsMapReady(true);
      } else if (data.type === 'markerClick' && onMarkerClick) {
        onMarkerClick(data.place);
      }
    } catch (error) {
      // 메시지 파싱 오류 무시
    }
  };

  // places가 변경될 때마다 마커 업데이트
  useEffect(() => {
    if (isMapReady && places.length > 0) {
      addMarkers(places);
    }
  }, [places, isMapReady]);

  // 초기 중심점 설정
  useEffect(() => {
    if (isMapReady) {
      moveToLocation(initialCenter.latitude, initialCenter.longitude, initialZoom);
    }
  }, [isMapReady, initialCenter, initialZoom]);

  const MAP_HTML = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>스마트서울맵</title>
        <style>
            body, html {
                margin: 0;
                padding: 0;
                height: 100%;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            #map {
                width: 100%;
                height: 100%;
                opacity: ${opacity}; /* 투명도 적용 */
            }
            .marker-info {
                background: white;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                max-width: 250px;
            }
            .marker-title {
                font-weight: bold;
                margin-bottom: 4px;
                color: #333;
            }
            .marker-address {
                font-size: 12px;
                color: #666;
                margin-bottom: 4px;
            }
            .marker-category {
                font-size: 11px;
                color: #007AFF;
                background: #E3F2FD;
                padding: 2px 6px;
                border-radius: 4px;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div id="map"></div>

        <script>
            let map;
            let markers = [];
            let currentInfoWindow = null;

            // React Native와의 통신을 위한 메시지 전송 함수
            function sendMessageToReactNative(data) {
                if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(data));
                }
            }

            // 지도 초기화
            function initMap() {
                // 서울시청 좌표
                const seoulCenter = { lat: ${initialCenter.latitude}, lng: ${initialCenter.longitude} };
                
                // 기본 지도 생성 (OpenLayers 또는 Leaflet 사용)
                map = L.map('map').setView([seoulCenter.lat, seoulCenter.lng], ${initialZoom});
                
                // OpenStreetMap 타일 레이어 추가
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(map);

                // 지도 클릭 이벤트
                map.on('click', function(e) {
                    sendMessageToReactNative({
                        type: 'mapClick',
                        coordinates: {
                            latitude: e.latlng.lat,
                            longitude: e.latlng.lng
                        }
                    });
                });

                // 지도 초기화 완료
            }

            // 마커 추가 함수
            function addMarkers(places) {
                // 기존 마커들 제거
                clearMarkers();
                
                places.forEach((place, index) => {
                    const marker = L.marker([place.latitude, place.longitude])
                        .addTo(map)
                        .bindPopup(createPopupContent(place));
                    
                    markers.push(marker);
                    
                    // 마커 클릭 이벤트
                    marker.on('click', function() {
                        sendMessageToReactNative({
                            type: 'markerClick',
                            data: place
                        });
                    });
                });
                
                // 마커 추가 완료
            }

            // 마커 제거 함수
            function clearMarkers() {
                markers.forEach(marker => {
                    map.removeLayer(marker);
                });
                markers = [];
            }

            // 팝업 콘텐츠 생성
            function createPopupContent(place) {
                return \`
                    <div class="marker-info">
                        <div class="marker-title">\${place.name}</div>
                        <div class="marker-address">\${place.address}</div>
                        <div class="marker-category">\${place.category}</div>
                    </div>
                \`;
            }

            // 지도 중심 이동
            function moveToLocation(lat, lng, zoom = 15) {
                map.setView([lat, lng], zoom);
            }

            // React Native로부터 메시지 수신
            function handleMessageFromReactNative(message) {
                try {
                    const data = JSON.parse(message);
                    
                    switch (data.type) {
                        case 'addMarkers':
                            addMarkers(data.places);
                            break;
                        case 'moveToLocation':
                            moveToLocation(data.latitude, data.longitude, data.zoom);
                            break;
                        case 'clearMarkers':
                            clearMarkers();
                            break;
                    }
                } catch (error) {
                    // 메시지 처리 오류 무시
                }
            }

            // 페이지 로드 시 초기화
            window.addEventListener('load', function() {
                // Leaflet CSS 로드
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
                document.head.appendChild(link);
                
                // Leaflet JS 로드 후 지도 초기화
                const script = document.createElement('script');
                script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
                script.onload = function() {
                    initMap();
                    
                    // React Native에 준비 완료 메시지 전송
                    sendMessageToReactNative({
                        type: 'mapReady'
                    });
                };
                document.head.appendChild(script);
            });

            // React Native로부터 메시지 수신 설정
            document.addEventListener('message', function(event) {
                handleMessageFromReactNative(event.data);
            });
        </script>
    </body>
    </html>
  `;

  return (
    <WebView
      ref={webViewRef}
      originWhitelist={['*']}
      source={{ html: MAP_HTML }}
      style={{ flex: 1 }}
      onMessage={handleMessage}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={true}
    />
  );
};

export default SmartSeoulMap; 