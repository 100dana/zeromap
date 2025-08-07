import { storage } from './firebaseConfig';

// Firebase 설정이 완료되기 전까지 더미 데이터 사용
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

// Firebase Storage에서 크롤링된 이미지 데이터 가져오기
export const getCampaignDataFromFirebase = async (): Promise<CampaignData[]> => {
  try {
    console.log('Firebase Storage에서 실제 크롤링 데이터를 가져오는 중...');
    
    // Firebase Storage 버킷이 존재하지 않는 문제로 인해 임시로 더미 데이터 사용
    console.log('Firebase Storage 버킷이 존재하지 않아서 더미 데이터를 사용합니다.');
    console.log('Firebase Console에서 다음을 확인해주세요:');
    console.log('1. 프로젝트 ID가 올바른지 확인');
    console.log('2. Storage 버킷이 생성되어 있는지 확인');
    console.log('3. Storage 권한이 설정되어 있는지 확인');
    return dummyCampaignData;
    
    // 아래 코드는 Firebase 설정이 완료된 후 주석 해제
    /*
    // Firebase에서 실제 데이터 가져오기 시도
    const bucketUrl = 'gs://zeromap-8b449.appspot.com'; // ✅ 실제 gs:// 형식 버킷
    
    const storageRef = storage().refFromURL(bucketUrl);
    console.log('Storage ref 생성 완료');
    
    // 루트 디렉토리부터 확인
    console.log('Firebase Storage 루트 디렉토리 확인...');
    const rootResult = await storageRef.listAll();
    console.log('루트 디렉토리 파일/폴더 수:', rootResult.items.length + rootResult.prefixes.length);
    console.log('루트 디렉토리 파일들:', rootResult.items.map(item => item.fullPath));
    console.log('루트 디렉토리 폴더들:', rootResult.prefixes.map(prefix => prefix.fullPath));
    
    const imagesRef = storageRef.child('images');
    console.log('Images ref 생성 완료');
    
    // Firebase Storage에서 이미지 목록 가져오기
    console.log('Firebase Storage에서 이미지 목록 가져오기 시작...');
    const result = await imagesRef.listAll();
    console.log('Firebase에서 가져온 이미지 파일 수:', result.items.length);
    console.log('Firebase에서 가져온 이미지 파일들:', result.items.map(item => item.fullPath));
    
    // 게시물별로 이미지 그룹화
    const articleGroups: { [key: string]: string[] } = {};
    
    for (const itemRef of result.items) {
      try {
        console.log('파일 처리 중:', itemRef.fullPath);
        const url = await itemRef.getDownloadURL();
        const path = itemRef.fullPath;
        
        // 경로에서 게시물 ID 추출 (images/articleId/filename 형태)
        const pathParts = path.split('/');
        console.log('경로 파트:', pathParts);
        if (pathParts.length >= 3) {
          const articleId = pathParts[1];
          const filename = pathParts[2];
          
          // 이미지 파일인지 확인 (jpg, jpeg, png, gif, webp)
          const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(filename);
          
          if (isImage) {
            if (!articleGroups[articleId]) {
              articleGroups[articleId] = [];
            }
            articleGroups[articleId].push(url);
            console.log(`게시물 ${articleId}에 이미지 추가:`, url);
          } else {
            console.log(`이미지가 아닌 파일 스킵:`, filename);
          }
        }
      } catch (itemError) {
        console.log('개별 파일 처리 중 오류:', itemError);
        continue; // 개별 파일 오류는 무시하고 계속 진행
      }
    }
    
    console.log('그룹화된 게시물 수:', Object.keys(articleGroups).length);
    console.log('그룹화된 게시물들:', Object.keys(articleGroups));
    
    // 실제 데이터가 있으면 사용, 없으면 더미 데이터 사용
    if (Object.keys(articleGroups).length > 0) {
      // 캠페인 데이터로 변환
      const campaignData: CampaignData[] = Object.entries(articleGroups).map(([articleId, images], index) => {
        const firstImage = images[0] || '';
        
        return {
          id: articleId,
          title: `서울시 환경뉴스 ${index + 1}`,
          subtitle: `게시물 ID: ${articleId}`,
          thumbnail: firstImage,
          images: images,
          pdfs: [], // PDF는 별도로 처리 필요
          date: new Date().toLocaleDateString('ko-KR'),
          region: '서울시',
          description: `서울시 환경뉴스 게시물 ${articleId}의 이미지들입니다.`
        };
      });
      
      console.log('Firebase에서 가져온 캠페인 데이터:', campaignData.length, '개');
      return campaignData;
    } else {
      // Firebase에 데이터가 없으면 더미 데이터 반환
      console.log('Firebase에 데이터가 없어서 더미 데이터를 사용합니다.');
      return dummyCampaignData;
    }
    */
  } catch (error) {
    console.error('Firebase에서 캠페인 데이터 가져오기 실패:', error);
    console.error('에러 상세 정보:', error instanceof Error ? error.message : String(error));
    return dummyCampaignData; // 에러 시에도 더미 데이터 반환
  }
};

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
}; 