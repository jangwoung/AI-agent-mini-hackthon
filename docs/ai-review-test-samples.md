# AI レビュー テスト用サンプルコード

ステップ詳細の **提出物** に貼り付けて「AI レビューを生成」で動作確認するためのサンプルです。

---

## 1. Next.js シンプルページ（短め・すぐ試せる）

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>Hello World</h1>
      <p>Welcome to my app.</p>
    </main>
  )
}
```

---

## 2. Next.js ページ（フォームあり・やや実践的）

```tsx
// app/page.tsx
'use client'

import { useState } from 'react'

export default function TodoPage() {
  const [text, setText] = useState('')
  const [items, setItems] = useState<string[]>([])

  function add() {
    if (!text.trim()) return
    setItems([...items, text.trim()])
    setText('')
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>TODO</h1>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && add()}
      />
      <button onClick={add}>追加</button>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </main>
  )
}
```

---

## 3. API ルート風（エラーハンドリングなし）

```ts
// app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const data = { message: 'hello' }
  return NextResponse.json(data)
}
```

---

## 4. バグ・改善ポイント多め（レビューが出やすい）

```tsx
// app/page.tsx
export default function Page() {
  const x = 1
  const y = 2
  return <div>{x + y}</div>
}
```

※ 変数未使用・型なし・コンポーネント名が汎用的、などの指摘が期待できます。

---

## 5. URL 提出用（「URL」ラジオで使用）

```
https://github.com/vercel/next.js/tree/canary/examples/hello-world
```

---

## テスト手順

1. 学習目標を作成して 5 ステップを生成
2. いずれかのステップの詳細を開く
3. 提出物で **コード** または **URL** を選択
4. 上記のいずれかを貼り付け → **保存**
5. **「AI レビューを生成」** をクリック
6. Keep / Problem / Try / Next が表示されることを確認
