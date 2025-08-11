// Firebase 설정이 완료되기 전까지 더미 데이터 사용
// @ts-ignore
import storage from '@react-native-firebase/storage';
import { firestore } from './firebaseConfig';

export interface CampaignData {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  images: string[];
  pdfs: string[];
  date: string;
  region?: string;
  description?: string;
}

export interface FirebaseImageData {
  name: string;
  url: string;
  articleId: string;
}

// 더미 캠페인 데이터 (실제 이미지 URL 포함)
const dummyCampaignData: CampaignData[] = [
  {
    id: '563992',
    title: '서울시 환경뉴스 - 실제 크롤링 데이터',
    subtitle: '게시물 ID: 563992 (실제 데이터)',
    thumbnail: 'https://picsum.photos/300/200?random=seoul1',
    images: [
      'https://picsum.photos/400/300?random=seoul11',
      'https://picsum.photos/400/300?random=seoul12',
      'https://picsum.photos/400/300?random=seoul13',
      'https://picsum.photos/400/300?random=seoul14',
    ],
    pdfs: [], // PDF는 나중에 추가 예정
    date: '2024년 1월 15일',
    region: '서울시',
    description: '서울시 환경뉴스 게시물 563992의 실제 크롤링된 데이터입니다. 환경 보호와 지속가능한 도시 발전에 관한 내용을 담고 있습니다.'
  },
  {
    id: '563944',
    title: '서울시 환경뉴스 2',
    subtitle: '게시물 ID: 563944',
    thumbnail: 'https://picsum.photos/300/200?random=2',
    images: [
      'https://picsum.photos/400/300?random=21',
      'https://picsum.photos/400/300?random=22',
      'https://picsum.photos/400/300?random=23',
      'https://picsum.photos/400/300?random=24',
      'https://picsum.photos/400/300?random=25',
    ],
    pdfs: [],
    date: '2024년 1월 14일',
    region: '서울시',
    description: '서울시 환경뉴스 게시물 563944의 이미지들입니다. 친환경 정책과 시민 참여 프로그램에 관한 내용입니다.'
  },
  {
    id: '563123',
    title: '서울시 환경뉴스 3',
    subtitle: '게시물 ID: 563123',
    thumbnail: 'https://picsum.photos/300/200?random=3',
    images: [
      'https://picsum.photos/400/300?random=31',
      'https://picsum.photos/400/300?random=32',
      'https://picsum.photos/400/300?random=33',
    ],
    pdfs: [
      'https://picsum.photos/200/300?random=pdf2',
      'https://picsum.photos/200/300?random=pdf3',
    ],
    date: '2024년 1월 13일',
    region: '서울시',
    description: '서울시 환경뉴스 게시물 563123의 이미지들입니다. 기후 변화 대응과 녹색 도시 조성에 관한 내용입니다.'
  },
  {
    id: '562456',
    title: '서울시 환경뉴스 4',
    subtitle: '게시물 ID: 562456',
    thumbnail: 'https://picsum.photos/300/200?random=4',
    images: [
      'https://picsum.photos/400/300?random=41',
      'https://picsum.photos/400/300?random=42',
      'https://picsum.photos/400/300?random=43',
      'https://picsum.photos/400/300?random=44',
    ],
    pdfs: [],
    date: '2024년 1월 12일',
    region: '서울시',
    description: '서울시 환경뉴스 게시물 562456의 이미지들입니다. 대기질 개선과 미세먼지 저감 정책에 관한 내용입니다.'
  },
  {
    id: '561789',
    title: '서울시 환경뉴스 5',
    subtitle: '게시물 ID: 561789',
    thumbnail: 'https://picsum.photos/300/200?random=5',
    images: [
      'https://picsum.photos/400/300?random=51',
      'https://picsum.photos/400/300?random=52',
      'https://picsum.photos/400/300?random=53',
      'https://picsum.photos/400/300?random=54',
      'https://picsum.photos/400/300?random=55',
      'https://picsum.photos/400/300?random=56',
      'https://picsum.photos/400/300?random=57',
    ],
    pdfs: [
      'https://picsum.photos/200/300?random=pdf4',
    ],
    date: '2024년 1월 11일',
    region: '서울시',
    description: '서울시 환경뉴스 게시물 561789의 이미지들입니다. 재활용 정책과 순환 경제 활성화에 관한 내용입니다.'
  }
];

// Firebase Storage에서 특정 게시물(articleId)의 이미지 URL들 가져오기
export const getCampaignFromFirebase = async (articleId: string): Promise<string[]> => {
  try {
    const folderRef = storage().ref(`images/${articleId}`);
    const result = await folderRef.listAll();

    const imageUrls = await Promise.all(
      result.items.map(async (itemRef: any) => {
        const url = await itemRef.getDownloadURL();
        return url;
      })
    );

    return imageUrls;
  } catch (error) {
    console.error('Firebase에서 캠페인 이미지 가져오기 실패:', error);
    const fallback = dummyCampaignData.find((c) => c.id === articleId)?.images ?? [];
    return fallback;
  }
};

// Firebase Storage의 images/ 하위 폴더 목록을 기반으로 캠페인 리스트 구성
export const getCampaignList = async (): Promise<CampaignData[]> => {
  try {
    const imagesRootRef = storage().ref('images');
    const listResult = await imagesRootRef.listAll();

    // prefixes: 하위 폴더들 (articleId)
    const campaigns = await Promise.all(
      listResult.prefixes.map(async (prefixRef: any) => {
        const articleId = prefixRef.name; // 폴더명 = articleId
        
        // Firestore에서 실제 제목 가져오기
        let actualTitle = `게시물 ${articleId}`;
        try {
          if (firestore && typeof firestore === 'function') {
            console.log(`[newsService] Firestore에서 제목 조회 시도: articleId = ${articleId}`);
            const firestoreInstance = firestore();
            if (firestoreInstance && firestoreInstance.collection) {
              const articleDoc = await firestoreInstance.collection('articles').doc(articleId).get();
              console.log(`[newsService] Firestore 문서 존재 여부: ${articleDoc.exists}`);
              if (articleDoc.exists) {
                const data = articleDoc.data();
                console.log(`[newsService] Firestore 문서 데이터:`, data);
                actualTitle = data?.title || `게시물 ${articleId}`;
                console.log(`[newsService] 최종 제목: ${actualTitle}`);
              } else {
                console.log(`[newsService] Firestore 문서가 존재하지 않음: ${articleId}`);
              }
            } else {
              console.log(`[newsService] Firestore 인스턴스가 올바르지 않음`);
            }
          } else {
            console.log(`[newsService] Firestore가 초기화되지 않음`);
          }
        } catch (error) {
          console.log(`[newsService] Firestore에서 제목 가져오기 실패 (${articleId}):`, error);
          // 권한 문제 시 임시로 더미 제목 사용
          actualTitle = `서울시 환경뉴스 - ${articleId}`;
        }
        
        const items = await prefixRef.listAll();
        let thumbnail = '';
        if (items.items.length > 0) {
          try {
            thumbnail = await items.items[0].getDownloadURL();
          } catch (_) {
            thumbnail = '';
          }
        }
        const fallbackThumb = `https://picsum.photos/300/200?random=${encodeURIComponent(articleId)}`;
        return {
          id: articleId,
          title: actualTitle,
          subtitle: `제목: ${actualTitle}`,
          thumbnail: thumbnail || fallbackThumb,
          images: [],
          pdfs: [],
          date: '',
          region: '서울시',
          description: '',
        } as CampaignData;
      })
    );

    if (campaigns.length > 0) return campaigns;
    return dummyCampaignData;
  } catch (error) {
    console.error('Firebase에서 캠페인 리스트 가져오기 실패:', error);
    return dummyCampaignData;
  }
};

/*
// PDF 데이터도 가져오기
export const getPDFDataFromFirebase = async (): Promise<{ [key: string]: string[] }> => {
  try {
    console.log('Firebase Storage에서 PDF 데이터를 가져오는 중...');
    
    const storageRef = storage().ref();
    const pdfsRef = storageRef.child('pdfs');
    
    const result = await pdfsRef.listAll();
    console.log('Firebase에서 가져온 PDF 파일 수:', result.items.length);
    
    const articleGroups: { [key: string]: string[] } = {};
    
    for (const itemRef of result.items) {
      try {
        const url = await itemRef.getDownloadURL();
        const path = itemRef.fullPath;
        
        const pathParts = path.split('/');
        if (pathParts.length >= 3) {
          const articleId = pathParts[1];
          const filename = pathParts[2];
          
          // PDF 파일인지 확인
          const isPDF = /\.pdf$/i.test(filename);
          
          if (isPDF) {
            if (!articleGroups[articleId]) {
              articleGroups[articleId] = [];
            }
            articleGroups[articleId].push(url);
            console.log(`게시물 ${articleId}에 PDF 추가:`, url);
          } else {
            console.log(`PDF가 아닌 파일 스킵:`, filename);
          }
        }
      } catch (itemError) {
        console.log('PDF 파일 처리 중 오류:', itemError);
        continue;
      }
    }
    
    console.log('PDF가 포함된 게시물 수:', Object.keys(articleGroups).length);
    return articleGroups;
  } catch (error) {
    console.error('Firebase에서 PDF 데이터 가져오기 실패:', error);
    return {};
  }
};

// 이미지와 PDF를 결합한 완전한 캠페인 데이터 가져오기
export const getCompleteCampaignData = async (): Promise<CampaignData[]> => {
  try {
    // 현재는 이미지만 가져오기 (PDF는 나중에 추가)
    const campaignData = await getCampaignDataFromFirebase();
    
    // PDF 데이터는 임시로 빈 배열로 설정
    return campaignData.map(campaign => ({
      ...campaign,
      pdfs: [] // PDF는 나중에 추가 예정
    }));
  } catch (error) {
    console.error('완전한 캠페인 데이터 가져오기 실패:', error);
    return dummyCampaignData; // 에러 시에도 더미 데이터 반환
  }
}; */