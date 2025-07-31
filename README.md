# ZeroMap - 제로웨이스트 지도 앱

서울시 착한소비 관련 정보를 제공하는 React Native 앱입니다.

## 주요 기능

### 서울시 착한소비 API 연동
- **[착한소비] 제로웨이스트상점** (ID: 11103395)
- **[착한소비] 개인 컵 할인 카페** (ID: 1693986134109)

### 카테고리별 장소 검색
- 🌱 **착한소비**: 모든 착한소비 관련 장소
- 🛒 **제로웨이스트샵**: 제로웨이스트상점 정보
- ☕ **개인컵할인카페**: 개인 컵 사용 시 할인 카페
- 🍽️ **제로식당**: 친환경 식당 및 카페
- 🔄 **리필스테이션**: 리필 서비스 제공 장소
- 💧 **리필샵**: 리필 제품 판매 상점
- 🍽 **식당**: 친환경 식당
- 🧴 **친환경생필품점**: 친환경 생필품 판매점
- ⋯ **기타**: 기타 친환경 시설

## 기술 스택

- **React Native** - 모바일 앱 개발
- **TypeScript** - 타입 안전성
- **KakaoMap API** - 지도 서비스
- **서울시 스마트서울맵 OpenAPI** - 착한소비 데이터

## Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## API 설정

### 서울시 스마트서울맵 OpenAPI
- **API 키**: `KEY219_5fef8bdf0db54014960b99eb89c4be07`
- **기본 URL**: `https://map.seoul.go.kr/openapi/v5`
- **테마 ID**:
  - 제로웨이스트상점: `11103395`
  - 개인 컵 할인 카페: `1693986134109`

## 파일 구조

```
src/
├── services/
│   ├── seoulApi.ts          # 서울시 API 서비스
│   ├── localDataService.ts  # 로컬 데이터 서비스
│   └── searchService.ts     # 검색 서비스
├── screens/
│   ├── MapScreen.tsx        # 지도 화면
│   └── ...
└── components/
    ├── KakaoMap.tsx         # 카카오맵 컴포넌트
    └── ...
```

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
