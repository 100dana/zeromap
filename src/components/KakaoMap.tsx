import React, { useRef, useEffect, useState } from 'react';
import { WebView } from 'react-native-webview';
import { PlaceData } from '../services/seoulApi';

const KAKAO_API_KEY = '504f485ba32aedc877afaa80a956af83';

interface KakaoMapProps {
  places?: PlaceData[];
  onMarkerClick?: (place: PlaceData) => void;
  opacity?: number;
  centerLat?: number;
  centerLng?: number;
  zoomLevel?: number;
}

const KakaoMap: React.FC<KakaoMapProps> = ({ 
  places = [], 
  onMarkerClick, 
  opacity = 1,
  centerLat = 37.5665,
  centerLng = 126.9780,
  zoomLevel = 7
}) => {
  const webViewRef = useRef<WebView>(null);
  const [webViewLoaded, setWebViewLoaded] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);

  // 마커 데이터를 JavaScript로 전달하는 함수
  const addMarkers = (markers: PlaceData[]) => {
    if (!webViewLoaded || !mapInitialized) {
      return;
    }

    const markersScript = `
      (function() {
        try {
          // 전역 map 객체 확인
          if (typeof window.map === 'undefined' || !window.map) {
            return;
          }
          
          // kakao.maps 객체 확인
          if (typeof kakao === 'undefined' || !kakao.maps) {
            return;
          }
          
          // 모든 마커 데이터를 전역 변수에 저장
          window.allMarkersData = ${JSON.stringify(markers)};
          window.visibleMarkers = [];
          
          // 기존 마커들 제거
          if (window.markers) {
            window.markers.forEach(function(marker) {
              if (marker && typeof marker.setMap === 'function') {
                marker.setMap(null);
              }
            });
          }
          if (window.infowindows) {
            window.infowindows.forEach(function(infowindow) {
              if (infowindow && typeof infowindow.close === 'function') {
                infowindow.close();
              }
            });
          }
          window.markers = [];
          window.infowindows = [];
          
          // 현재 지도 영역의 마커만 표시하는 함수
          function showMarkersInBounds() {
            // 기존 마커들 제거
            window.markers.forEach(function(marker) {
              if (marker && typeof marker.setMap === 'function') {
                marker.setMap(null);
              }
            });
            window.markers = [];
            
            // 현재 지도 영역 가져오기
            var bounds = window.map.getBounds();
            var swLat = bounds.getSouthWest().getLat();
            var swLng = bounds.getSouthWest().getLng();
            var neLat = bounds.getNorthEast().getLat();
            var neLng = bounds.getNorthEast().getLng();
            
            // 영역 내 마커만 필터링하여 표시
            window.allMarkersData.forEach(function(place, index) {
              if (place.latitude >= swLat && place.latitude <= neLat && 
                  place.longitude >= swLng && place.longitude <= neLng) {
                
                try {
                  // 좌표 유효성 검사
                  if (place.latitude === 0 || place.longitude === 0 || 
                      isNaN(place.latitude) || isNaN(place.longitude)) {
                    return;
                  }
                  
                  // 마커 생성
                  var marker = new kakao.maps.Marker({
                    position: new kakao.maps.LatLng(place.latitude, place.longitude),
                    map: window.map
                  });
                  
                  window.markers.push(marker);
                  
                  // 마커 클릭 이벤트
                  kakao.maps.event.addListener(marker, 'click', function() {
                    // 지도 위치와 확대비율 유지
                    var currentCenter = window.map.getCenter();
                    var currentLevel = window.map.getLevel();
                    
                    // 클릭 이벤트 데이터 전송
                    window.ReactNativeWebView.postMessage(JSON.stringify({
                      type: 'markerClick',
                      data: place
                    }));
                    
                    // 지도 위치와 확대비율 복원 (약간의 지연 후)
                    setTimeout(function() {
                      window.map.setCenter(currentCenter);
                      window.map.setLevel(currentLevel);
                    }, 10);
                  });
                } catch (markerError) {
                  // 개별 마커 오류 무시
                }
              }
            });
            
            // 현재 표시된 마커 수 전송
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'markersUpdated',
              count: window.markers.length
            }));
          }
          
          // 지도 영역 변경 이벤트 리스너 추가
          kakao.maps.event.addListener(window.map, 'bounds_changed', function() {
            showMarkersInBounds();
          });
          
          // 초기 마커 표시
          showMarkersInBounds();
          
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerError',
            error: error.message
          }));
        }
      })();
    `;
    
    webViewRef.current?.injectJavaScript(markersScript);
  };

  // WebView에서 메시지 수신
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      switch (data.type) {
        case 'mapInitialized':
          setMapInitialized(true);
          break;
        case 'markerClick':
          if (onMarkerClick) {
            onMarkerClick(data.data);
          }
          break;
        case 'markersAdded':
          break;
        case 'markersUpdated':
          // 현재 영역의 마커 수 업데이트 (필요시 사용)
          break;
        case 'markerError':
          break;
      }
    } catch (error) {
      // 메시지 파싱 오류 무시
    }
  };

  // WebView 로딩 완료 처리
  const handleWebViewLoad = () => {
    setWebViewLoaded(true);
  };

  // places가 변경될 때마다 마커 업데이트
  useEffect(() => {
    if (webViewLoaded && mapInitialized) {
      if (places.length > 0) {
        addMarkers(places);
      } else {
        // 테스트용 기본 마커 추가 (서울시청)
        addMarkers([{
          id: 'test',
          name: '서울시청 (테스트)',
          category: '테스트',
          address: '서울특별시 중구 세종대로 110',
          latitude: 37.5665,
          longitude: 126.9780,
          description: '테스트 마커입니다.'
        }]);
      }
    }
  }, [places, webViewLoaded, mapInitialized]);

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
          opacity: ${opacity};
        }
      </style>
      <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_API_KEY}"></script>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // 전역 변수 초기화
        window.map = null;
        window.markers = [];
        window.infowindows = [];
        window.bounds = null;
        
        // 카카오 지도 SDK 로딩 완료 확인
        function initMap() {
          try {
            // kakao.maps 객체 확인
            if (typeof kakao === 'undefined' || !kakao.maps) {
              throw new Error('Kakao Maps API가 로드되지 않음');
            }
            
            var mapContainer = document.getElementById('map');
            if (!mapContainer) {
              throw new Error('지도 컨테이너를 찾을 수 없음');
            }
            
            var mapOption = {
              center: new kakao.maps.LatLng(${centerLat}, ${centerLng}),
              level: ${zoomLevel}
            };
            
            // 지도 객체 생성 및 전역 변수에 할당
            window.map = new kakao.maps.Map(mapContainer, mapOption);
            
            // 지도 컨트롤 옵션 설정
            var zoomControl = new kakao.maps.ZoomControl();
            var mapTypeControl = new kakao.maps.MapTypeControl();
            
            // 지도 우측 상단에 줌 컨트롤 추가
            window.map.addControl(zoomControl, kakao.maps.ControlPosition.TOPRIGHT);
            
            // 지도 우측 상단에 지도 타입 컨트롤 추가
            window.map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);
            
            // 지도 드래그 활성화
            window.map.setDraggable(true);
            
            // 지도 휠 줌 활성화
            window.map.setZoomable(true);
            
            // 경계 객체 초기화
            window.bounds = new kakao.maps.LatLngBounds();
            
            // React Native에 초기화 완료 알림
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapInitialized'
            }));
            
          } catch (error) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'mapError',
              error: error.message
            }));
          }
        }
        
        // 카카오 지도 SDK 로딩 완료 후 초기화
        if (typeof kakao !== 'undefined' && kakao.maps) {
          initMap();
        } else {
          // SDK 로딩 완료를 기다림
          var checkKakaoSDK = setInterval(function() {
            if (typeof kakao !== 'undefined' && kakao.maps) {
              clearInterval(checkKakaoSDK);
              initMap();
            }
          }, 100);
          
          // 10초 후에도 로딩되지 않으면 오류 처리
          setTimeout(function() {
            if (typeof kakao === 'undefined' || !kakao.maps) {
              clearInterval(checkKakaoSDK);
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'mapError',
                error: '카카오 지도 SDK 로딩 타임아웃'
              }));
            }
          }, 10000);
        }
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
      onLoad={handleWebViewLoad}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
      scalesPageToFit={false}
      allowsInlineMediaPlayback={true}
      mediaPlaybackRequiresUserAction={false}
    />
  );
};

export default KakaoMap; 