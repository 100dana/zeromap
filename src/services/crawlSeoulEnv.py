import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import firebase_admin
from firebase_admin import credentials, storage

#firebase 초기화
cred = credentials.Certificate("../../firebase_config.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'zeromap-8b449.firebasestorage.app'
})
bucket = storage.bucket()

# 페이지 범위 설정
start_page = 1
end_page = 10
base_domain = "https://news.seoul.go.kr"

def upload_firebase(url, file_type):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)

            #firebase 경로: images/ 또는 pdfs/
            blob = bucket.blob(f'{file_type}/{filename}')
            blob.upload_from_string(response.content, content_type=response.headers.get('Content-Type'))

            blob.make_public()
            print(f"업로드 완료: {blob.public_url}")
            return blob.public_url
    except Exception as e:
        print(f"업로드 실패: {e}")
    return None

#크롤링
for page_num in range(start_page, end_page + 1):
    page_url = f"{base_domain}/env/news-all/page/{page_num}"
    print(f"\n 크롤링 중: {page_url}")

    try:
        response = requests.get(page_url)
        response.encoding = 'utf-8'
        soup = BeautifulSoup(response.text, 'html.parser')

        for img_tag in soup.find_all('img'):
            src = img_tag.get('src')
            if src:
                full_url = urljoin(page_url, src)
                if full_url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
                    upload_firebase(full_url, 'images')

        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(page_url, href)
            if full_url.lower().endswith('.pdf'):
                upload_firebase(full_url, 'pdfs')

    except Exception as e:
        print(f"페이지 처리 중 오류 발생: {e}") 