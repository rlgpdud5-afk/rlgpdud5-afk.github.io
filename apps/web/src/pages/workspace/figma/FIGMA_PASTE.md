# Figma 데이터 입력

## 마지막 업데이트
2026-06-04 / (미입력 — Dev Mode 붙여넣기 대기)

## 토큰

_(피그마 Variables 복사본 — 아직 미수신)_

## 레이어별 CSS

_(Dev Mode CSS 복사본 — 아직 미수신)_

**수신 상태:** 채팅/붙여넣기 본문에 `[여기에 피그마 CSS 붙여넣기]` 플레이스홀더만 있고, 실제 CSS·레이어 트리·텍스트 값은 포함되지 않았습니다.

붙여넣을 때 레이어별로 아래 형식 권장:

```
### Frame · Product card
(Dev Mode CSS 블록 전체)

### Group · Header
...

### Text · Title
...
```

## 미해결 항목

- **전체 Figma 스펙** — Dev Mode CSS / Variables 미제공 → `tokens.css`, `figma-product-card.css`, `FigmaProductCard.tsx` 교체 불가 (스캐폴드 360×420 유지)
- **캔버스 프레임** — width × height 공식 값 없음
- **레이어 트리** — Figma 패널 이름·순서·중첩 확정 불가 (`layers.ts`는 이전 스캐폴드 트리)
- **텍스트 콘텐츠** — Title / Description / Button 라벨 Figma 원문 없음 (i18n 스캐폴드 문구 사용 중)
- **Frame · Media** — 이미지 URL·export 없음 → placeholder 유지
- **Component · Button** — hover / focus / disabled variant CSS 없음 (스캐폴드 `:hover`만 존재, Figma 미확인)
- **box-shadow / gradient / blur** — Figma 레이어별 값 없음
- **폰트** — Inter 등 스캐폴드 가정 — Figma Dev Mode font-family 미확인

---

## 반영 순서 (데이터 수신 후)

1. 이 파일 `## 토큰` / `## 레이어별 CSS` 채우기  
2. `tokens.css` — Variables만, 임의 변환 없이  
3. `figma-product-card.css` — 레이어별 CSS만  
4. `layers.ts` — Figma 레이어 이름·순서  
5. `FigmaProductCard.tsx` — 텍스트·구조만 (스타일은 CSS)
