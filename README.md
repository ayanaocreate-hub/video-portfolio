# YOUR NAME — Video Portfolio

映像クリエイター（映像ディレクター / モーショングラフィックス）向けの、ミニマルで高級感のある静的ポートフォリオサイトです。ビルドツールや npm、外部フレームワークは一切使用しておらず、HTML / CSS / JavaScript（Vanilla JS）のみで構成されています。外部依存は Google Fonts のみです。

## サイト概要

- 1枚の静的ページ（`index.html`）+ モーダルによる作品詳細表示という構成です。
- 構成セクション: ヒーロー（名前アニメーション） / 固定ヘッダー（WORKS・CONTACTへのアンカーリンク） / WORKS（作品グリッド） / CONTACT（メール表記・お問い合わせフォーム・SNS） / フッター。
- CONTACT はバックエンドを持たない静的サイトのため、フォーム送信時は入力内容を件名・本文に詰めた `mailto:` リンクを生成し、ユーザーのメールクライアントを起動する方式です（`js/main.js` の `initContactForm()`）。
- 配色は背景 `#0a0a0a`、文字色 `#f5f5f0` の完全モノトーン。装飾色は使用していません。
- フォントは Google Fonts の「Inter」（英数字）と「Noto Sans JP」（日本語）を使用しています。
- WORKS セクションのカードをクリックすると、YouTube / Vimeo の埋め込みプレーヤーを含むモーダルが開きます。

```
video-portfolio/
├── index.html          … ページ本体（構造）
├── css/
│   └── style.css        … 全スタイル
├── js/
│   ├── works-data.js     … 作品データ（配列）のみを保持
│   └── main.js           … 画面描画・イベント制御ロジック
└── README.md
```

---

## 作品の追加・差し替え方法

作品データは `js/works-data.js` の `WORKS` 配列にすべて集約されています。`index.html` には作品カードは一切ハードコードされておらず、`main.js` がこの配列を読み込んで動的にグリッドを生成します。**作品を追加・変更・削除したい場合は `js/works-data.js` だけを編集してください。**

```js
const WORKS = [
  {
    title: "Neon Horizon",                       // 作品タイトル
    year: "2026",                                 // 制作年（文字列）
    role: "Direction / Edit / Color Grading",     // 担当役割
    description: "作品の説明文をここに記載します。", // モーダル内に表示される説明文
    platform: "youtube",                          // "youtube" または "vimeo"
    videoId: "dQw4w9WgXcQ",                       // 動画ID（後述）
    thumbnail: ""                                 // サムネイル画像URL（空欄でも可・後述）
  },
  // ...配列に追加していくだけでカードが増えます
];
```

### 各フィールドの説明

| フィールド | 説明 |
|---|---|
| `title` | 作品タイトル。カード・オーバーレイ・モーダルに表示されます。 |
| `year` | 制作年。モーダル内に表示されます。 |
| `role` | 担当した役割（例: `Direction / Edit / Motion Graphics`）。カードのホバー時オーバーレイとモーダルに表示されます。 |
| `description` | 作品の説明文。モーダル内にのみ表示されます。 |
| `platform` | 動画配信元。`"youtube"` または `"vimeo"` のいずれかを指定してください。 |
| `videoId` | 動画ID。<br>・YouTube: URL の `watch?v=` 以降の文字列（例: `https://www.youtube.com/watch?v=dQw4w9WgXcQ` なら `dQw4w9WgXcQ`）<br>・Vimeo: URL の数字部分（例: `https://vimeo.com/76979871` なら `76979871`） |
| `thumbnail` | サムネイル画像のURL。**空文字 `""` の場合の挙動**: `platform` が `"youtube"` なら `https://i.ytimg.com/vi/{videoId}/hqdefault.jpg` を自動的に使用します。`platform` が `"vimeo"` の場合は自動取得を行わず、グレーのプレースホルダー背景（CSSのみ、通信なし）を表示します。任意の画像URLを指定すればそれが優先されます。 |

作品を1件追加したい場合は、配列の末尾（または好きな位置）にオブジェクトを1つ追加するだけです。順番はそのままグリッドの表示順になります。削除したい場合はオブジェクトごと削除してください。

---

## 名前・SNSリンクなど固有情報の変更箇所

すべて `index.html` 内のプレースホルダーを直接書き換えてください。

| 内容 | 場所 | 目印 |
|---|---|---|
| ヘッダーのロゴ表示名 | `<header>` 内 | `<a href="#hero" class="logo">YOUR NAME</a>` |
| ヒーローの氏名（1文字ずつフェードインする名前） | `js/main.js` の `initHero()` 関数内 | `var text = "YOUR NAME";` の文字列を変更（`index.html` 側の `#heroName` は空でOK、JSが自動生成します） |
| ヒーローのサブテキスト（肩書き） | `<section class="hero">` 内 | `<p class="hero-sub reveal">Video Director / Motion Graphics</p>` |
| ページタイトル・meta説明文・OGP情報 | `<head>` 内 | `<title>`、`<meta name="description">`、`og:title` / `og:description` / `og:image` / `og:url` の各 `<meta>` タグ |
| メールアドレス | `<section class="contact">` 内 + `js/main.js` | `<a class="contact-mail-value" href="mailto:...">` の両方（`href`と表示テキスト）、および `js/main.js` の `CONTACT_EMAIL` 変数（フォーム送信時の宛先）を変更 |
| SNSリンク（X / YouTube） | `<section class="contact">` 内 | `<ul class="sns-links">` 内の各 `<a href="...">` の URL を変更 |
| フッターの著作権表記 | `<footer class="site-footer">` 内 | `<p>&copy; 2026 YOUR NAME</p>` |

※ ヒーローの氏名だけは `js/main.js` 側で文字列からアニメーション用の `<span>` を自動生成しているため、`index.html` の `#heroName` 要素自体は直接編集せず、`main.js` の `text` 変数を書き換えてください。

---

## ローカルでの確認方法

このサイトはビルド不要の静的サイトなので、Python の簡易HTTPサーバーなどで確認できます。

```bash
cd /Users/ayanao/video-portfolio
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000` を開いてください。

（`index.html` をブラウザで直接開く「二重クリックで確認」する方法でも大部分は動作しますが、環境によっては `file://` 制限で動作が変わる場合があるため、上記のローカルサーバー経由での確認を推奨します。）

---

## 公開方法

### GitHub Pages で公開する場合

1. このディレクトリの中身を GitHub リポジトリとして初期化し、コミット・プッシュします。

   ```bash
   cd /Users/ayanao/video-portfolio
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
   git push -u origin main
   ```

2. GitHub のリポジトリページで **Settings → Pages** を開きます。
3. 「Build and deployment」の Source を `Deploy from a branch` に設定し、Branch を `main` / `/(root)` に指定して保存します。
4. 数分後、`https://<ユーザー名>.github.io/<リポジトリ名>/` で公開されます。

### Netlify で公開する場合

**方法A: ドラッグ&ドロップ（最も簡単）**

1. [Netlify](https://app.netlify.com/) にログインします。
2. ダッシュボードの「Add new site」→「Deploy manually」を選択し、`video-portfolio` フォルダごとドラッグ&ドロップします。
3. 自動でデプロイが完了し、ランダムなサブドメイン（例: `random-name-123.netlify.app`）が発行されます。必要に応じて Site settings からドメイン名を変更できます。

**方法B: GitHub連携（継続的デプロイ）**

1. 上記の手順でこのディレクトリを GitHub リポジトリにプッシュしておきます。
2. Netlify で「Add new site」→「Import an existing project」→「Deploy with GitHub」を選び、対象リポジトリを選択します。
3. ビルドコマンドは空欄のまま、Publish directory を `/`（リポジトリのルート）に設定してデプロイします。
4. 以降、`main` ブランチに push するたびに自動で再デプロイされます。

---

## 補足

- 埋め込み動画は YouTube / Vimeo の公開動画IDのみで動作します。非公開・限定公開設定の動画は埋め込みできない場合があります。
- 画像・動画等の著作権にはご注意の上、実際の作品差し替え時はサムネイル画像や動画IDを適切なものに置き換えてください。
