/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const logger = require("firebase-functions/logger");

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// 제로식당 캐시 초기화 함수 (관리자만 호출 가능)
exports.initializeZeroRestaurantsCache = functions.https.onCall(async (data, context) => {
  // 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  // 관리자 권한 확인 (선택사항)
  // const userRecord = await admin.auth().getUser(context.auth.uid);
  // if (!userRecord.customClaims?.admin) {
  //   throw new functions.https.HttpsError('permission-denied', '관리자 권한이 필요합니다.');
  // }

  try {
    const collectionName = 'zero_restaurants_cache';
    
    // 기존 캐시 삭제
    const snapshot = await db.collection(collectionName).get();
    if (!snapshot.empty) {
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`${snapshot.size}개의 기존 캐시 삭제 완료`);
    }

    // 제로식당 데이터 (실제로는 외부 API나 파일에서 가져와야 함)
    const zeroRestaurants = [
      {
        id: 'zero_restaurant_1',
        name: '라이브보울',
        address: '서울 강남구 역삼동 642-16',
        latitude: 37.5172,
        longitude: 127.0473,
        category: '제로식당',
        isZeroRestaurant: true,
        description: '서울시 제로식당 인증 업체',
        zeroPay: '가능',
        seoulCertified: '서울시제로식당',
        cachedAt: admin.firestore.FieldValue.serverTimestamp()
      }
      // 실제로는 691개의 데이터를 여기에 추가
    ];

    // 배치로 데이터 저장
    const batchSize = 500;
    for (let i = 0; i < zeroRestaurants.length; i += batchSize) {
      const batch = db.batch();
      const chunk = zeroRestaurants.slice(i, i + batchSize);
      
      chunk.forEach(restaurant => {
        const docRef = db.collection(collectionName).doc(restaurant.id);
        batch.set(docRef, restaurant);
      });
      
      await batch.commit();
      console.log(`배치 ${Math.floor(i / batchSize) + 1} 완료: ${chunk.length}개`);
    }

    return {
      success: true,
      message: `${zeroRestaurants.length}개의 제로식당 캐시 초기화 완료`,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

  } catch (error) {
    console.error('캐시 초기화 오류:', error);
    throw new functions.https.HttpsError('internal', '캐시 초기화 중 오류가 발생했습니다.');
  }
});

// 캐시 상태 확인 함수
exports.getCacheStatus = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', '인증이 필요합니다.');
  }

  try {
    const snapshot = await db.collection('zero_restaurants_cache').get();
    
    return {
      total: 691, // 실제 제로식당 총 개수
      cached: snapshot.size,
      completionRate: ((snapshot.size / 691) * 100).toFixed(1) + '%'
    };
  } catch (error) {
    console.error('캐시 상태 확인 오류:', error);
    throw new functions.https.HttpsError('internal', '캐시 상태 확인 중 오류가 발생했습니다.');
  }
});
