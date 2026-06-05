import { useState } from 'react';

interface ReviewModalProps {
  onClose: () => void;
  onSubmit: (rev: { rating: number; text: string }) => void;
}

export function ReviewModal({ onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');

  return (
    <div className="modal-bg" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>긱 완료 · 리뷰</h2>
        <div className="muted label">평점 (1–5)</div>
        <div className="tags">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={'tag' + (rating === n ? ' on' : '')}
              onClick={() => setRating(n)}
              role="button"
              tabIndex={0}
            >
              ★{n}
            </span>
          ))}
        </div>
        <textarea
          className="input"
          rows={3}
          placeholder="한 줄 코멘트"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="row-actions">
          <button type="button" className="btn btn-p" onClick={() => onSubmit({ rating, text })}>
            완료 처리
          </button>
          <button type="button" className="btn btn-s" onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
