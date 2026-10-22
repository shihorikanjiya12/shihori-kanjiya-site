# お問い合わせフォーム修正版（2026年10月）

## 含まれる変更

- `index.html`：送信が正常に受理された場合だけ、はっきりした送信完了画面を表示。エラー時は入力内容を保持。写真や他のページには変更なし。
- `netlify/functions/contact-autoreply.mjs`：Netlify Forms が **検証済み** と判断した問い合わせについて、Resendから送信者に受付確認・入力内容の控えをメール送信。以前の自動返信文面を復元。メールへの返信先は管理Gmail。
- `netlify.toml`：静的HTMLの公開ディレクトリと関数ディレクトリを指定。

## 公開に必要な設定

1. **Resend** で `shihorikanjiya.com` のステータスが **Verified** になるのを待つ（DNSはお名前.comに設定済み）。
2. **Resend** ダッシュボードで API キーを1つ作る（送信専用の権限が選べればそれを選ぶ）。**キーはChatGPTやGitHubには送らない**。
3. **Netlify** の `shihorikanjiya.com` プロジェクト > Environment variables に、以下を設定する。
   - `RESEND_API_KEY`: 手順2の秘密のAPIキー。スコープは Functions で使用可能にする。
   - `AUTOREPLY_ENABLED`: 最初は `false`。サイトを公開しただけで外部宛メールは送らない。
4. このリポジトリのファイルを GitHub の `main` にアップロードする。既存ファイルの上書き対象は **`index.html` のみ**。新規追加は `netlify.toml` と `netlify/functions/contact-autoreply.mjs`、この説明書。
5. Netlify のデプロイ成功と Forms の `contact` が引き続き有効なことを確認する。
6. 自分のメールアドレスでフォーム送信を1回テストし、Netlify Formsの「contact」に保存されることと、管理Gmail通知が届くことを確認する。送信完了画面も確認する。
7. Resend認証が完了したら、Netlifyの `AUTOREPLY_ENABLED` を `true` に変更し、Netlifyが指示する場合は再デプロイする。**この変更で、以後の検証済み問い合わせから外部宛に自動返信が送られる**ので、サイト管理者本人が確認・了承してから行う。
8. 最後に自分の別のメールアドレスで問い合わせを送信し、自動返信文面、送信内容の控え、返信先の管理Gmailを確認する。

## 注意

- **Netlify Forms の既存の通知先** `s.kanjiya.management@gmail.com` はそのまま。Resendは送信者への返信にのみ使用。
- `AUTOREPLY_ENABLED` が `false`、APIキー未設定、DNS認証保留中の間は、フォームの送信が成功しても自動返信メールは届かない。問い合わせデータはNetlifyに保存される。
- 確認済み問い合わせのイベントで送信するため、送信完了画面は「Netlifyへの受付成功」を示す。メール配信の成功を保証するものではない。
- 送信元は `貫地谷しほり <contact@shihorikanjiya.com>`。受信側から返信すると管理用Gmail `s.kanjiya.management@gmail.com` に届くように設定。
- このZIP自体をGitHubの1ファイルとしてアップロードしてもサイトは更新されない。ZIPを解凍して**中のファイル構造を保って**アップロードする必要がある。
