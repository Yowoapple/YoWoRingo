<a href="https://yowoapple.github.io/YoWoRingo/">
  <img src="public/readme/hero.svg" width="100%" alt="YoWoRingo. Got any Ringo?">
</a>

<p align="center">
  <a href="README.md">English</a> &nbsp;·&nbsp; <b>繁體中文</b> &nbsp;·&nbsp; <a href="README.zh-CN.md">简体中文</a> &nbsp;·&nbsp; <a href="README.ja.md">日本語</a>
</p>

<p align="center">
  <a href="https://yowoapple.github.io/YoWoRingo/"><b>yowoapple.github.io/YoWoRingo</b></a>
</p>

---

# YoWoRingo

這裡是 YoWoRingo（曾博文）的個人作品集，地牛記錄小組 TWERG 創辦人、遊戲開發者、街頭攝影者，來自新北。

這不是套個模板、換上名字就完成的網站，每一個區塊都是一段小小的互動設計，全部用原生 JavaScript 和 CSS 親手打造：用像素拼成的證件照、可以抓起來亂丟的名字、在瀏覽器裡即時譜出的背景音樂，還有一座靠捲動來「變焦」的攝影展。

<br>

## 設計理念

### 顏色，只在事情發生時出現

整個網站只有三個顏色，接近純黑的 `#0B0B0C`、帶點紙感的白 `#EFEEEA`，以及安靜的灰 `#85847F`，唯一打破沉默的，是群青藍 `#2B3BFF`。

它從來不拿來裝飾，只有在「有事發生」的時候才會出現，像是滑鼠移過去、畫面轉場、正在播放的音樂、你正在讀的段落、剛被鍵盤選中的按鈕，所以看到藍色，就代表有事正在發生。

### 文字本身就是介面

這裡的文字不只是淡入淡出，它會被拆散、重組、被丟來丟去，名字寫成一道算式，往下捲，天數會從 Day 001 一路跳到 Day 100，標題用巨大的字級，放在嚴格的網格上，四周留下大量的空白。

這套做法參考了韓國設計工作室的作品，例如 [RAYRAYlab](https://rayraylab.com)、[Plus X](https://15th.plus-ex.com)、[DOES](https://does.kr)，黑白單色、放大到極限的字、精準的對齊，以及對顏色的節制。

### 最正式的照片，放在最不正式的地方

網站一打開，迎面而來的是一張正式到有點僵硬的證件照，這是刻意的，因為網站其他地方完全不是這樣，這份反差就是重點：游標經過，臉會碎成像素，往下捲，整張照片飛散開來，再重新拼成名字。

<p align="center">
  <img src="docs/readme/01-portrait.webp" width="49%" alt="證件照，游標經過的地方被推散成方塊">
  <img src="docs/readme/02-scatter.webp" width="49%" alt="捲動到一半時，上千個方塊向外飛散">
</p>
<p align="center">
  <img src="docs/readme/03-wordmark.webp" width="98.5%" alt="方塊落定，拼出 YoWoRingo">
</p>

### 有聲音，但要先問過你

讓網站「活起來」的不只有動畫，還有聲音，每一次點擊、快門、碰撞都有自己的小音效，也有一首背景音樂。

但在你於入口選擇「Enter with sound」之前，網站一個聲音都不會發出，而且網站沒有下載任何音檔，所有聲音都是用 Web Audio API 即時合成的。

### 誠實，也是設計的一部分

作品頁只寫做了什麼、為什麼這樣做，不多也不少，地震重播裡，除了方法有效的那一場，也如實放上了兩場反而變差的結果，因為只放成功案例的作品集，很難讓人真正信任。

<br>

## 值得一看的地方

### 從像素到人（Pixel to Person）

用 Canvas 2D 畫出的證件照，由一格格從照片取色的方塊組成，方塊會用彈簧物理回應游標，往下捲時再各自飛到新的位置，拼出名字，在窄螢幕或效能較弱的裝置上，方塊會自動變得比較粗，讓畫面保持順暢。

### 物理遊樂場（Playground）

名字的每個字母、故事裡的關鍵字、四張作品卡，全都是真正有重量的物體（Matter.js），抓起來、丟出去、按下 Shake 把整箱搖亂都可以，點一下作品卡就會進入那個作品，用手機的話，傾斜手機就能改變重力方向（iOS 會先詢問權限），而且只有捲到這一區時才會開始運算。

<p align="center">
  <img src="docs/readme/04-playground.webp" width="98.5%" alt="作品卡、標籤和巨大字母堆在物理遊樂場裡">
</p>

### 把名字寫成一道算式

YoWo（有無）加上 Ringo（りんご，日文的蘋果），等於「Got any Ringo?」，也就是有無蘋果？一個本身就在發問的名字。

<p align="center">
  <img src="docs/readme/05-name.webp" width="98.5%" alt="YoWo 加 Ringo 等於 Got any Ringo，下方分別附上中文與日文">
</p>

### 作品列表，預覽圖會跟著你走

作品名稱用巨大的字級排成一列列，滑鼠移到某一列，整列會塗上群青藍，預覽卡則會帶著一點慣性跟著游標移動。

<p align="center">
  <img src="docs/readme/06-works.webp" width="98.5%" alt="作品列表，TWERG 那一列亮起，logo 預覽卡跟著游標">
</p>

### 動態島與即時生成的音樂

畫面上方的膠囊會告訴你現在讀到哪一段，點一下，它就會「彈」開變成音樂播放器，外型的伸縮是用 CSS `linear()` 寫成的彈簧曲線。

背景音樂〈Got any Ringo?〉是 84 BPM、32 小節的循環，由瀏覽器即時演奏，換到其他頁面時，音樂會從同一個地方接下去，離開前還會先輕輕淡出。

### 指令面板

在任何地方按 <kbd>Ctrl</kbd> + <kbd>K</kbd>，就能直接跳到任一個區塊或頁面、複製 Email、開關聲音、切換語言，在手機上則會變成全螢幕的面板，另外，有些指令沒有列在清單上。

<p align="center">
  <img src="docs/readme/07-island.webp" width="38%" alt="動態島展開成音樂播放器">
  &nbsp;
  <img src="docs/readme/08-palette.webp" width="58%" alt="指令面板列出各個區塊與頁面">
</p>

### 焦段（Focal Length）

54 張街拍照片，依焦段從 23 mm 排到 439 mm，在這一頁，捲動就是變焦環，右側的鏡頭刻度尺採用對數刻度，視角越窄，觀景窗的框也跟著收窄，角落的讀數會即時顯示目前的焦段與視角，點開照片，檢視器會染上那張照片的主色，並配上一聲快門。

<p align="center">
  <img src="docs/readme/09-focal-length.webp" width="49%" alt="焦段頁的開場標題">
  <img src="docs/readme/10-focal-75mm.webp" width="49%" alt="75 mm 分組，右側是鏡頭刻度尺與觀景窗框">
</p>

### 超越點源（Beyond the Point）：地震重播

以互動方式回溯重播三場台灣的地震，左右拖曳分隔線，就能比較傳統的點源估計和考慮破裂方向的估計，拉動時間軸從 T+0 秒到 T+60 秒，可以看到 S 波的波前和關鍵城市的長條圖一起變化，所有資料都是事先離線算好的，網頁上只有結果，沒有演算法。

<p align="center">
  <img src="docs/readme/11-replay.webp" width="98.5%" alt="2024 年花蓮地震的重播，比較點源與考慮方向的震度圖">
</p>

### 百日（100 Days）

一款開發中、故事偏黑暗的劇情遊戲的介紹頁，開場畫面會固定住，隨著捲動，天數從 001 數到 100，下方一百格的進度條也一格格被填滿。

<p align="center">
  <img src="docs/readme/12-100-days.webp" width="98.5%" alt="第 042 天，下方是百格進度條">
</p>

### 每一種螢幕都照顧到

所有動畫都針對手機、平板、電腦的寬度設計過，有些還為了觸控重新做過，橫向捲動的作品牆在手機上改成用手指滑，指令面板變成全螢幕，動態島則移到畫面下方。

<p align="center">
  <img src="docs/readme/15-mobile.webp" width="80%" alt="首頁、焦段頁、百日頁在手機尺寸上的樣子">
</p>

<br>

## 三種語言，版面零位移

網站以英文為主，如果瀏覽器偏好中文，會自動切換成繁體或簡體中文，右上角的地球按鈕可以在 EN、繁、简 之間循環切換。

- **是在地化，不是轉換。** 繁體中文用台灣的說法來寫，簡體中文則換成大陸習慣的用語，例如「视频」「简历」「烈度」，而不只是把字轉成簡體。
- **切換時畫面不會跳。** 繁體和簡體使用同一款可變字型、同樣的字重範圍，所以互相切換時，頁面上沒有任何一行會移動，你正在讀的那一段，切換後還在原來的位置。
- **你按下之前就準備好了。** 瀏覽器空閒時會先下載下一個語言的字典，滑鼠一移到按鈕上，就開始載入字型，所以按下去的那一刻，幾乎是瞬間完成。
- **字型保持輕巧。** HarmonyOS Sans 只保留網站實際用到的字，並拆成兩個檔案，瀏覽英文頁面時，只需要下載 9 KB 的中文字。

<p align="center">
  <img src="docs/readme/13-languages.webp" width="98.5%" alt="同一個 TWERG 開場，分別以英文、繁體中文、簡體中文顯示，版面完全一致">
</p>

<br>

## 無障礙

互動再多，也不應該把任何人擋在門外。

- **鍵盤就能操作全站。** 包括物理遊樂場的作品卡、動態島、播放器、照片檢視器，全部都能用 <kbd>Tab</kbd>、<kbd>Enter</kbd>、<kbd>Esc</kbd> 和方向鍵操作。
- **跳到內容。** 在每一頁按下第一次 <kbd>Tab</kbd>，會出現一個「跳到內容」的連結，可以直接略過導覽列。
- **對話視窗不會讓你迷路。** 指令面板或照片檢視器打開時，後面的頁面會暫時無法被選取，關閉後，焦點會回到你原本的位置。
- **螢幕閱讀器友善。** 圖示按鈕都有文字說明，裝飾用的畫布會被隱藏，每個區塊都有標題，每張照片都有描述，通知會被朗讀出來，網頁的語言標示也會跟著語言切換一起更新。
- **尊重「減少動態效果」。** 系統開啟這個設定後，平滑捲動、像素開場、捲動淡入和轉場都會退場，內容直接呈現。

<p align="center">
  <img src="docs/readme/14-skip-link.webp" width="60%" alt="按下第一次 Tab 後出現的「跳到內容」連結">
</p>

<br>

## 效能

- 畫布動畫和物理運算，只要離開畫面就會立刻暫停。
- 像素的密度會依照裝置效能自動調整。
- 照片提供 AVIF 和 WebP 兩種格式、三種尺寸，附帶模糊預覽圖與主色，需要時才載入。
- 示範影片在快要出現在畫面上之前，都不會下載。
- 中文字典和字型都是需要時才載入。
- 電腦上實測，主要內容約 0.2 秒出現，版面位移為 0。

<br>

## 使用技術

| | |
|---|---|
| 建置 | [Vite](https://vite.dev)（多頁面）、原生 JavaScript，不使用 UI 框架 |
| 動態 | [GSAP](https://gsap.com) 與 ScrollTrigger、[Lenis](https://lenis.darkroom.engineering)、CSS `linear()` 彈簧曲線、View Transitions API |
| 互動 | [Matter.js](https://brm.io/matter-js/)、Canvas 2D、Web Audio API |
| 字型 | [Schibsted Grotesk](https://fonts.google.com/specimen/Schibsted+Grotesk)、[Azeret Mono](https://fonts.google.com/specimen/Azeret+Mono)、華為 HarmonyOS Sans TC / SC |
| 素材處理 | [sharp](https://sharp.pixelplumbing.com)、[subset-font](https://github.com/papandreou/subset-font)、[fontkit](https://github.com/foliojs/fontkit)、[OpenCC](https://github.com/nk2028/opencc-js) |
| 部署 | GitHub Pages，每次推送到 `main` 後由 GitHub Actions 自動部署 |

<br>

## 專案結構

```
index.html, photography/, works/{twerg,plum,galgame}/, 404.html   各頁面
src/css/        設計 token、基礎樣式、元件、各頁樣式
src/js/         入口、全站共用外框、功能模組、各頁程式
src/i18n/       繁體與簡體中文字典
src/data/       照片資料與預先算好的重播資料
public/         處理後的圖片、字型、影片、圖示、分享預覽圖
scripts/        素材處理腳本（照片、證件照、字型、多語系、品牌）
docs/readme/    這份 README 使用的截圖
```

## 在本機執行

```bash
npm install
npm run dev        # 開發伺服器
npm run build      # 建置正式版本到 dist/
npm run preview    # 預覽正式版本
```

素材處理指令（`npm run photos`、`portrait`、`works`、`fonts`、`i18n`、`brand`、`readme`）會從原始檔案重新產生 `public/` 裡的所有素材，但原始檔案（例如全尺寸照片、字型原檔）並不在這個 repository 裡，所以剛 clone 下來時無法執行這些指令，處理好的成品則已經放在 repository 中。

<br>

## 授權

**保留所有權利。** 這個 repository 公開，是為了讓你閱讀、從中學習，未經許可，不得複製、再利用、修改、重新散布，或將任何部分用於商業用途，範圍包括程式碼、設計、文字、照片、證件照、音樂與標誌，完整條款請見 [LICENSE](LICENSE)。

第三方函式庫與字型，依其各自的授權條款使用。

<br>

<p align="center">
  <sub>Got any Ringo? &nbsp;·&nbsp; <a href="mailto:apple@twerg.org">apple@twerg.org</a> &nbsp;·&nbsp; <a href="https://www.instagram.com/yowoapple/">Instagram</a> &nbsp;·&nbsp; <a href="https://x.com/AppleJackOAO">X</a></sub>
</p>
