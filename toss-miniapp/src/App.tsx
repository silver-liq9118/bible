import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import bibleUrl from '../../assets/KorRV.json?url';
import { chapterKey, parseBible, randomVerse, reference, shareMessage, type Bible, type Verse } from './bible';
import { browserStorage, clearPreferences, defaults, FONT_SIZES, readPreferences, writePreferences, type Preferences } from './storage';
import { shareText } from './share';
import { isToss, listenBack, listenSafeArea, nativeShare } from './toss';

type Route = { page: 'today' | 'favorites' | 'info' | 'privacy' | 'licenses' } | { page: 'chapter'; id: string };
function getRoute(): Route {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('chapter/')) { try { return { page: 'chapter', id: decodeURIComponent(hash.slice(8)) }; } catch { return { page: 'today' }; } }
  return { page: ['favorites', 'info', 'privacy', 'licenses'].includes(hash) ? hash as 'info' : 'today' };
}
// Track our own history depth: a direct deep link must not navigate outside the app.
window.history.replaceState({ bibleDepth: 0 }, '', window.location.href);
const go = (page: string) => {
  if (window.location.hash === `#${page}`) return;
  window.history.pushState({ bibleDepth: (window.history.state?.bibleDepth ?? 0) + 1 }, '', `#${page}`);
  window.dispatchEvent(new HashChangeEvent('hashchange'));
};

export function App() {
  const [bible, setBible] = useState<Bible>();
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [current, setCurrent] = useState<Verse>();
  const [prefs, setPrefs] = useState<Preferences>(defaults);
  const [notice, setNotice] = useState('');
  const [route, setRoute] = useState<Route>(getRoute);
  const [sharing, setSharing] = useState(false);
  const [manualText, setManualText] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(bibleUrl, { signal: controller.signal }).then(response => {
      if (!response.ok) throw new Error('load');
      return response.json();
    }).then(data => {
      const loaded = parseBible(data);
      const saved = readPreferences(browserStorage(), new Set(loaded.byId.keys()));
      setBible(loaded); setCurrent(randomVerse(loaded.verses)); setPrefs(saved.value);
      if (saved.warning) setNotice(saved.warning);
    }).catch(e => { if (e.name !== 'AbortError') setError('말씀을 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.'); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => listenSafeArea(), []);
  useEffect(() => {
    const update = () => { setRoute(getRoute()); setManualText(''); setConfirmReset(false); };
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); };
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0); heading.current?.focus();
  }, [route]);
  // Subscribe only away from the root, so the SDK owns root exit behavior.
  useEffect(() => {
    if (route.page === 'today') return;
    return listenBack(() => {
      if (window.history.state?.bibleDepth > 0) window.history.back();
      else go('today');
    });
  }, [route.page]);

  function updatePreferences(next: Preferences, success: string) {
    setPrefs(next);
    setNotice(writePreferences(browserStorage(), next) ? success : '기기에 저장하지 못했어요. 변경 내용은 이번 이용 중에만 유지돼요.');
  }
  function toggle(v: Verse) {
    const exists = prefs.favorites.includes(v.id);
    updatePreferences({ ...prefs, favorites: exists ? prefs.favorites.filter(id => id !== v.id) : [...prefs.favorites, v.id] }, exists ? '즐겨찾기에서 해제했어요.' : '즐겨찾기에 저장했어요.');
  }
  const shareVerse = useCallback(async (v: Verse) => {
    if (sharing) return;
    setSharing(true); setManualText('');
    try {
      const message = shareMessage(v);
      const result = await shareText(message, isToss() ? { nativeShare } : {
        webShare: navigator.share?.bind(navigator),
        copy: navigator.clipboard?.writeText.bind(navigator.clipboard),
      });
      if (result === 'copied') setNotice('말씀을 복사했어요.');
      if (result === 'manual') { setManualText(message); setNotice('공유창을 열지 못했어요. 말씀을 복사해서 전할 수 있어요.'); }
    } finally { setSharing(false); }
  }, [sharing]);

  function verseActions(v: Verse, showChapter = true) {
    if (!v.text) return null;
    const saved = prefs.favorites.includes(v.id);
    return <div className="actions">
      <Button size="medium" variant="weak" color={saved ? 'primary' : 'dark'} aria-pressed={saved} aria-label={`${reference(v)} 즐겨찾기 ${saved ? '해제' : '저장'}`} onClick={() => toggle(v)}>{saved ? '저장됨' : '즐겨찾기'}</Button>
      <Button size="medium" variant="weak" color="dark" disabled={sharing} onClick={() => void shareVerse(v)}>말씀 공유</Button>
      {showChapter && <Button size="medium" variant="weak" color="dark" onClick={() => go(`chapter/${encodeURIComponent(v.id)}`)}>장 전체 보기</Button>}
    </div>;
  }
  const title = { today: '오늘, 마음에 담을 말씀', favorites: '나의 즐겨찾기', info: '정보와 설정', privacy: '개인정보처리방침', licenses: '오픈소스 안내', chapter: '장 전체 보기' }[route.page];
  const selected = route.page === 'chapter' ? bible?.byId.get(route.id) : undefined;
  const chapter = selected ? bible?.chapters.get(chapterKey(selected)) : undefined;

  return <div className="app">
    <main>
      <header className="page-heading"><p className="eyebrow">오늘의 성경</p><h1 ref={heading} tabIndex={-1}>{title}</h1>
        {route.page === 'today' && <p className="muted">잠시 멈추고, 한 구절을 천천히 읽어보세요.</p>}
      </header>
      <p className="status" role="status" aria-live="polite">{notice}</p>
      {!bible && !error && <p role="status" className="empty">말씀을 준비하고 있어요…</p>}
      {error && <div className="empty" role="alert"><p>{error}</p><Button onClick={() => { setError(''); setAttempt(a => a + 1); }}>다시 불러오기</Button></div>}
      {bible && <>
        {['today', 'chapter', 'favorites'].includes(route.page) && <div className="font-controls" aria-label="말씀 글자 크기">
          <span>글자 크기</span><div className="font-buttons">
            <Button size="medium" variant="weak" color="dark" aria-label="글자 작게" disabled={prefs.fontSize === FONT_SIZES[0]} onClick={() => updatePreferences({ ...prefs, fontSize: FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(prefs.fontSize as typeof FONT_SIZES[number]) - 1)] }, '글자 크기를 저장했어요.')}>가 −</Button>
            <span aria-label={`글자 크기 ${prefs.fontSize}`}>{prefs.fontSize}</span>
            <Button size="medium" variant="weak" color="dark" aria-label="글자 크게" disabled={prefs.fontSize === FONT_SIZES[4]} onClick={() => updatePreferences({ ...prefs, fontSize: FONT_SIZES[Math.min(4, FONT_SIZES.indexOf(prefs.fontSize as typeof FONT_SIZES[number]) + 1)] }, '글자 크기를 저장했어요.')}>가 +</Button>
          </div>
        </div>}
        {route.page === 'today' && current && <>
          <article className="verse-card" aria-label="오늘의 말씀"><p className="reference">{reference(current)}</p><blockquote style={{ fontSize: prefs.fontSize }}>{current.text}</blockquote><p className="translation">개역성경</p></article>
          {verseActions(current)}
          <Button display="full" onClick={() => { setCurrent(randomVerse(bible.verses, current.id)); setManualText(''); setNotice('새로운 말씀을 골랐어요.'); }}>다른 말씀 읽기</Button>
          <p className="footnote">말씀은 성경 전체에서 무작위로 골라요.</p>
        </>}
        {route.page === 'favorites' && <>
          <p className="muted">마음에 담은 말씀 {prefs.favorites.length}개</p>
          {prefs.favorites.length === 0 ? <div className="empty"><h2>아직 저장한 말씀이 없어요</h2><p>다시 읽고 싶은 말씀을 즐겨찾기에 담아보세요.</p><Button variant="weak" onClick={() => go('today')}>말씀 읽으러 가기</Button></div> : prefs.favorites.map(id => bible.byId.get(id)).filter((v): v is Verse => !!v).map(v => <article key={v.id} className="favorite-card"><h2 className="reference">{reference(v)}</h2><p className="verse-text" style={{ fontSize: prefs.fontSize }}>{v.text}</p>{verseActions(v)}</article>)}
          <p className="footnote">이 기기에 저장돼요. 다른 기기나 테스트 환경에는 자동으로 동기화되지 않아요.</p>
        </>}
        {route.page === 'chapter' && (selected && chapter ? <section><h2>{selected.bookName} {selected.chapter}장</h2><p className="muted">선택한 말씀은 파란색 배경으로 표시돼요.</p><ol className="chapter-list">{chapter.map(v => <li key={v.id} value={v.verse} className={v.id === selected.id ? 'selected' : ''}><span className="verse-number">{v.verse}</span><div><p className="verse-text" style={{ fontSize: prefs.fontSize }}>{v.text || '원본 데이터에 본문이 없는 구절이에요.'}</p>{verseActions(v, false)}</div></li>)}</ol></section> : <div className="empty"><p>찾을 수 없는 말씀이에요.</p><Button onClick={() => go('today')}>오늘의 말씀 보기</Button></div>)}
        {route.page === 'info' && <section className="info">
          <h2>매일 한 구절, 가까이</h2><p>개역성경을 읽고 마음에 남는 말씀을 간직하세요.</p>
          <div className="info-links"><Button variant="weak" color="dark" display="full" onClick={() => go('privacy')}>개인정보처리방침</Button><Button variant="weak" color="dark" display="full" onClick={() => go('licenses')}>오픈소스 안내</Button></div>
          <h2>기기에 저장한 정보</h2><p>즐겨찾기와 글자 크기만 이 기기에 저장해요. 별도 계정이나 서버 동기화는 제공하지 않아요.</p>
          <Button variant="weak" color="danger" onClick={() => setConfirmReset(true)}>저장한 정보 초기화</Button>
          {confirmReset && <div className="reset-confirm" role="group" aria-label="저장 정보 초기화 확인"><p>즐겨찾기 {prefs.favorites.length}개와 글자 크기를 초기화할까요? 삭제하면 되돌릴 수 없어요.</p><div className="actions"><Button variant="weak" color="dark" onClick={() => setConfirmReset(false)}>취소</Button><Button color="danger" onClick={() => { if (clearPreferences(browserStorage())) { setPrefs(defaults()); setNotice('저장한 정보를 초기화했어요.'); } else setNotice('저장한 정보를 삭제하지 못했어요. 다시 시도해 주세요.'); setConfirmReset(false); }}>초기화하기</Button></div></div>}
          <p className="footnote">오늘의 성경 · 토스 미니앱 1.0.0<br/>문의: sonprojecta@gmail.com · 토스 상단 더보기의 문의하기에서도 문의할 수 있어요.</p>
        </section>}
        {route.page === 'privacy' && <section className="prose">
          <p>시행일: 2026년 9월 7일</p>
          <h2>수집하는 정보</h2><p>오늘의 성경 미니앱은 이름, 연락처, 토스 계정 정보를 요청하지 않으며 별도 회원가입을 제공하지 않아요. 앱 자체의 광고·분석·결제 기능도 사용하지 않아요.</p>
          <h2>기기 내 저장과 보관 기간</h2><p>즐겨찾기한 성경 구절의 식별자와 글자 크기 설정을 이 기기의 브라우저 저장소(localStorage)에 보관해요. 앱 운영자의 서버로 전송하지 않아요. 사용자가 초기화하거나 토스 앱에서 미니앱 데이터를 삭제할 때까지 보관되며, 기기 설정에 따라 더 일찍 삭제될 수도 있어요.</p>
          <h2>공유 기능</h2><p>사용자가 말씀 공유를 누르면 선택한 구절과 성경 위치를 기기의 공유 기능에 전달해요. 공유 대상은 사용자가 선택해요. 복사 기능을 사용하면 같은 내용이 기기 클립보드에 저장돼요. 공유받는 앱의 정보 처리는 해당 서비스의 방침을 따르며, 토스 플랫폼의 정보 처리는 토스의 방침을 따라요.</p>
          <h2>삭제와 문의</h2><p>정보와 설정의 ‘저장한 정보 초기화’에서 앱이 저장한 정보를 삭제할 수 있어요. 문의: sonprojecta@gmail.com · 토스 상단 더보기의 문의하기에서도 문의할 수 있어요.</p>
          <h2>방침 변경</h2><p>정보 처리 방식이 변경되면 이 화면의 내용과 시행일을 갱신해 안내해요.</p>
        </section>}
        {route.page === 'licenses' && <section className="prose"><h2>성경 본문</h2><p>KorRV · 개역성경. 기존 오늘의 성경 앱과 동일한 성경 데이터를 사용해요.</p><p>기존 앱의 성경 데이터 라이선스 고지를 아래에 보존했어요.</p><pre className="license">{bibleLicense}</pre><h2>웹 미니앱</h2><p>React, Vite, Apps in Toss SDK, Toss Design System을 사용해요.</p></section>}
      </>}
      {manualText && <section className="manual-share"><h2>말씀 복사</h2><textarea aria-label="공유할 말씀" readOnly value={manualText} onFocus={e => e.target.select()} /><Button variant="weak" onClick={async () => { try { await navigator.clipboard.writeText(manualText); setNotice('말씀을 복사했어요.'); setManualText(''); } catch { setNotice('위 말씀을 길게 눌러 직접 복사해 주세요.'); } }}>복사하기</Button><Button color="dark" variant="weak" onClick={() => setManualText('')}>닫기</Button></section>}
    </main>
    <nav className="bottom-nav" aria-label="주요 메뉴">{([['today', '오늘의 말씀'], ['favorites', '즐겨찾기'], ['info', '정보']] as const).map(([page, label]) => <button key={page} aria-current={route.page === page ? 'page' : undefined} onClick={() => go(page)}>{label}</button>)}</nav>
  </div>;
}

const bibleLicense = `MIT License
Copyright (c) 2024 Scrollmapper

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;


