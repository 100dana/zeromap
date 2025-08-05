import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import firebase_admin
from firebase_admin import credentials, storage
import time

#firebase 초기화
cred = credentials.Certificate("../../firebase_config.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'zeromap-8b449.firebasestorage.app'
})
bucket = storage.bucket()

# 페이지 범위 설정
start_page = 1
end_page = 1
base_domain = "https://news.seoul.go.kr"

uploaded_files = set()

def upload_firebase(url, file_type, article_id =None, index=None):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            parsed_url = urlparse(url)
            ext = os.path.splitext(parsed_url.path)[1] or '.jpg'

            if index is not None:
                filename = f"{index:03d}{ext}"
            else:
                filename = os.path.basename(parsed_url.path)


            # 중복 체크
            unique_key = f"{article_id}/{filename}" if article_id else filename
            if unique_key in uploaded_files:
                print(f"중복 파일 스킵: {unique_key}")
                return None
            
            firebase_path = f"{file_type}/{article_id}/{filename}" if article_id else f"{file_type}/{filename}"
            blob = bucket.blob(firebase_path)
            blob.upload_from_string(response.content, content_type=response.headers.get('Content-Type'))

            blob.make_public()
            print(f"업로드 완료: {blob.public_url}")
            uploaded_files.add(unique_key)
            return blob.public_url
    except Exception as e:
        print(f"업로드 실패: {e}")
    return None

def is_news_image(url):
    """실제 뉴스 이미지인지 판단하는 함수"""
    # UI 아이콘들 제외
    exclude_patterns = [
        'icon_tag.gif',
        'btn_top.png',
        'img-seoultalk.png',
        'common/',
        'themes/',
        'wp-content/'
    ]
    
    for pattern in exclude_patterns:
        if pattern in url:
            return False
    
    return True

def crawl_article_content(article_url):
    try:
        print(f"  게시물 크롤링: {article_url}")
        response = requests.get(article_url)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')
        
        article_images = 0
        article_pdfs = 0

        # 게시물 ID 추출 (URL 맨 끝 숫자 부분)
        article_id = article_url.rstrip('/').split('/')[-1]
        
        # 모든 이미지 찾기
        for idx, img_tag in enumerate(soup.find_all('img')):
            src = img_tag.get('src')
            if src:
                full_url = urljoin(article_url, src)
                
                if (full_url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')) and 
                    is_news_image(full_url)):
                    result = upload_firebase(full_url, 'images', article_id=article_id, index = idx+1)
                    if result:
                        article_images += 1
        
        # 모든 PDF 링크 찾기
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(article_url, href)
            if full_url.lower().endswith('.pdf'):
                result = upload_firebase(full_url, 'pdfs', article_id=article_id)
                if result:
                    article_pdfs += 1
        
        return article_images, article_pdfs
    except Exception as e:
        print(f"게시물 크롤링 실패: {e}")
        return 0, 0

#크롤링
total_images = 0
total_pdfs = 0

for page_num in range(start_page, end_page + 1):
    page_url = f"{base_domain}/env/news-all/page/{page_num}"
    print(f"\n=== 페이지 {page_num} 크롤링 중: {page_url} ===")

    try:
        response = requests.get(page_url)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        # 뉴스 게시물 링크 찾기 (숫자 ID만 있는 실제 게시물)
        article_links = []
        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            if '/env/archives/' in href and '/archives/category/' not in href and href not in article_links:
                full_url = urljoin(page_url, href)
                article_links.append(full_url)
        
        page_images = 0
        page_pdfs = 0
        
        for i, article_url in enumerate(article_links):
            article_images, article_pdfs = crawl_article_content(article_url)
            page_images += article_images
            page_pdfs += article_pdfs
            print(f"  -> {article_images}개 이미지, {article_pdfs}개 PDF 업로드")
            time.sleep(0.5)  # 서버 부하 방지
        
        total_images += page_images
        total_pdfs += page_pdfs

    except Exception as e:
        print(f"페이지 처리 중 오류 발생: {e}")

print(f"\n=== 크롤링 완료 ===")
print(f"총 업로드된 이미지: {total_images}개")
print(f"총 업로드된 PDF: {total_pdfs}개")
print(f"중복 제거된 파일 수: {len(uploaded_files)}개") 