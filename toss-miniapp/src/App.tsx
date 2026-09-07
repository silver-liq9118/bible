import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@toss/tds-mobile';
import bibleUrl from '../../assets/KorRV.json?url';
import appIconUrl from './app-icon.png?url';
import { chapterKey, parseBible, randomVerse, reference, shareMessage, type Bible, type Verse } from './bible';
import { browserStorage, clearPreferences, defaults, FONT_SIZES, readPreferences, writePreferences, type Preferences } from './storage';
import { shareText } from './share';
import { createVerseShareLink, initialSharedVerseId, isToss, listenBack, listenSafeArea, nativeShare } from './toss';

type IconName = 'home' | 'heart' | 'info' | 'refresh' | 'share' | 'back';
function AppIcon({ name, filled = false }: { name: IconName; filled?: boolean }) {
  const common = { width: 24, height: 24, viewBox: '0 0 24 24', fill: filled ? 'currentColor' : 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (name === 'heart') return <svg {...common}><path d="M20.8 4.7a5.5 5.5 0 0 0-7.8 0L12 5.8l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.5a5.5 5.5 0 0 0 0-7.8Z" /></svg>;
  if (name === 'home') return <svg {...common}><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></svg>;
  if (name === 'info') return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/></svg>;
  if (name === 'refresh') return <svg {...common}><path d="M20 6v5h-5M4 18v-5h5"/><path d="M18.2 9A7 7 0 0 0 6.3 6.3L4 8m16 8-2.3 1.7A7 7 0 0 1 5.8 15"/></svg>;
  if (name === 'back') return <svg {...common}><path d="m15 18-6-6 6-6"/></svg>;
  return <svg {...common}><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/></svg>;
}

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
      const shared = initialSharedVerseId();
      setBible(loaded); setCurrent(shared ? loaded.byId.get(shared) ?? randomVerse(loaded.verses) : randomVerse(loaded.verses)); setPrefs(saved.value);
      if (saved.warning) setNotice(saved.warning);
      else if (shared && loaded.byId.has(shared)) setNotice('공유받은 말씀을 열었어요.');
    }).catch(e => { if (e.name !== 'AbortError') setError('말씀을 불러오지 못했어요. 연결을 확인한 뒤 다시 시도해 주세요.'); });
    return () => controller.abort();
  }, [attempt]);
  useEffect(() => listenSafeArea(), []);
  useEffect(() => {
    const update = () => { setRoute(getRoute()); setManualText(''); setConfirmReset(false); setNotice(''); };
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    return () => { window.removeEventListener('hashchange', update); window.removeEventListener('popstate', update); };
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2400);
    return () => window.clearTimeout(timer);
  }, [notice]);
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
  function goBack() {
    if (window.history.state?.bibleDepth > 0) window.history.back();
    else go('today');
  }
  function toggle(v: Verse) {
    const exists = prefs.favorites.includes(v.id);
    updatePreferences({ ...prefs, favorites: exists ? prefs.favorites.filter(id => id !== v.id) : [...prefs.favorites, v.id] }, exists ? '즐겨찾기에서 해제했어요.' : '즐겨찾기에 저장했어요.');
  }
  const shareVerse = useCallback(async (v: Verse) => {
    if (sharing) return;
    setSharing(true); setManualText('');
    try {
      let link: string | undefined;
      if (isToss()) { try { link = await createVerseShareLink(v.id); } catch { /* Share the verse text even if link creation is unavailable. */ } }
      const message = shareMessage(v, link);
      const result = await shareText(message, isToss() ? { nativeShare } : {
        webShare: navigator.share?.bind(navigator),
        copy: navigator.clipboard?.writeText.bind(navigator.clipboard),
      });
      if (result === 'copied') setNotice('말씀을 복사했어요.');
      if (result === 'manual') { setManualText(message); setNotice('공유창을 열지 못했어요. 말씀을 복사해서 전할 수 있어요.'); }
    } finally { setSharing(false); }
  }, [sharing]);

  const fontControls = <div className="font-controls" aria-label="말씀 글자 크기">
    <button className="round-control" aria-label="글자 작게" disabled={prefs.fontSize === FONT_SIZES[0]} onClick={() => updatePreferences({ ...prefs, fontSize: FONT_SIZES[Math.max(0, FONT_SIZES.indexOf(prefs.fontSize as typeof FONT_SIZES[number]) - 1)] }, '글자 크기를 저장했어요.')}>−</button>
    <button className="font-reset" aria-label="글자 크기 기본값" onClick={() => updatePreferences({ ...prefs, fontSize: 24 }, '기본 글자 크기로 돌아왔어요.')}>Aa</button>
    <button className="round-control" aria-label="글자 크게" disabled={prefs.fontSize === FONT_SIZES[4]} onClick={() => updatePreferences({ ...prefs, fontSize: FONT_SIZES[Math.min(4, FONT_SIZES.indexOf(prefs.fontSize as typeof FONT_SIZES[number]) + 1)] }, '글자 크기를 저장했어요.')}>+</button>
  </div>;
  const selected = route.page === 'chapter' ? bible?.byId.get(route.id) : undefined;
  const chapter = selected ? bible?.chapters.get(chapterKey(selected)) : undefined;
  const title = route.page === 'chapter' && selected
    ? reference(selected).replace('장 ', ':').replace('절', '')
    : { today: '오늘, 마음에 담을 말씀', favorites: '즐겨찾기', info: '정보', privacy: '개인정보처리방침', licenses: '오픈소스 안내', chapter: '장 전체 보기' }[route.page];
  const isDetailPage = ['chapter', 'privacy', 'licenses'].includes(route.page);

  return <div className={`app page-${route.page}`}>
    <main>
      {route.page !== 'today' && (isDetailPage
        ? <header className={`page-heading detail-heading ${route.page === 'chapter' ? 'chapter-heading' : ''}`}><div className="detail-title-row"><button className="back-button" aria-label="이전 화면으로 돌아가기" onClick={goBack}><AppIcon name="back" /></button><h1 ref={heading} tabIndex={-1}>{title}</h1><span className="header-spacer" aria-hidden="true" /></div>{route.page === 'chapter' && fontControls}</header>
        : <header className="page-heading"><h1 ref={heading} tabIndex={-1}>{title}</h1></header>)}
      <p className="status" role="status" aria-live="polite">{notice}</p>
      {!bible && !error && <p role="status" className="empty">말씀을 준비하고 있어요…</p>}
      {error && <div className="empty" role="alert"><p>{error}</p><Button onClick={() => { setError(''); setAttempt(a => a + 1); }}>다시 불러오기</Button></div>}
      {bible && <>
        {route.page === 'today' && current && <section className="today-layout"><div className="today-stack">
          <article className="verse-card" aria-label="오늘의 말씀">
            <div className="verse-card-heading"><h1 ref={heading} tabIndex={-1}>{reference(current).replace('장 ', ':').replace('절', '')}</h1><button className={`heart-button ${prefs.favorites.includes(current.id) ? 'saved' : ''}`} aria-label="즐겨찾기" onClick={() => toggle(current)}><AppIcon name="heart" filled={prefs.favorites.includes(current.id)} /></button></div>
            <blockquote style={{ fontSize: prefs.fontSize }}>{current.text}</blockquote>
            <button className="chapter-link" onClick={() => go(`chapter/${encodeURIComponent(current.id)}`)}>{current.chapter}장 전체 보기</button>
            <div className="icon-actions"><button aria-label="다른 말씀 읽기" onClick={() => { setCurrent(randomVerse(bible.verses, current.id)); setManualText(''); setNotice('새로운 말씀을 골랐어요.'); }}><AppIcon name="refresh" /></button><button aria-label="말씀 공유" disabled={sharing} onClick={() => void shareVerse(current)}><AppIcon name="share" /></button></div>
          </article>
          {fontControls}
        </div></section>}
        {route.page === 'favorites' && <>
          <div className="favorites-toolbar"><p className="muted">마음에 담은 말씀 {prefs.favorites.length}개</p>{fontControls}</div>
          {prefs.favorites.length === 0 ? <div className="empty"><h2>즐겨찾기한 말씀이 없습니다.</h2><Button variant="weak" onClick={() => go('today')}>말씀 읽으러 가기</Button></div> : prefs.favorites.map(id => bible.byId.get(id)).filter((v): v is Verse => !!v).map(v => <article key={v.id} className="favorite-card"><div className="favorite-heading"><h2 className="reference">{reference(v).replace('장 ', ':').replace('절', '')}</h2><button className="heart-button saved" aria-label="즐겨찾기 삭제" onClick={() => toggle(v)}><AppIcon name="heart" filled /></button></div><p className="verse-text" style={{ fontSize: prefs.fontSize }}>{v.text}</p><div className="favorite-footer"><button onClick={() => go(`chapter/${encodeURIComponent(v.id)}`)}>전체 보기</button><button aria-label="말씀 공유" onClick={() => void shareVerse(v)}><AppIcon name="share" /></button></div></article>)}
        </>}
        {route.page === 'chapter' && (selected && chapter ? <section><ol className="chapter-list">{chapter.map(v => <li key={v.id} value={v.verse} className={v.id === selected.id ? 'selected' : ''}><span className="verse-number">{v.verse}</span><div><p className="verse-text" style={{ fontSize: prefs.fontSize }}>{v.text || '원본 데이터에 본문이 없는 구절이에요.'}</p></div></li>)}</ol></section> : <div className="empty"><p>찾을 수 없는 말씀이에요.</p><Button onClick={() => go('today')}>오늘의 말씀 보기</Button></div>)}
        {route.page === 'info' && <section className="info">
          <div className="info-hero"><img src={appIconUrl} alt="오늘의 성경 앱 아이콘"/><div><h2>오늘의 성경</h2><p>매일 한 구절을 읽고 마음에 간직하세요.</p></div></div>
          <div className="info-card"><h2>저장과 개인정보</h2><p>즐겨찾기와 글자 크기는 이 기기에만 저장돼요. 계정이나 서버로 전송하지 않으며 다른 기기와 자동 동기화되지 않아요.</p><div className="info-menu"><button onClick={() => go('privacy')}><span>개인정보처리방침</span><span aria-hidden="true">›</span></button><button onClick={() => go('licenses')}><span>오픈소스 안내</span><span aria-hidden="true">›</span></button></div></div>
          <button className="reset-button" onClick={() => setConfirmReset(true)}>저장한 정보 초기화</button>
          {confirmReset && <div className="reset-confirm" role="group" aria-label="저장 정보 초기화 확인"><p>즐겨찾기 {prefs.favorites.length}개와 글자 크기를 초기화할까요? 삭제하면 되돌릴 수 없어요.</p><div className="actions"><Button variant="weak" color="dark" onClick={() => setConfirmReset(false)}>취소</Button><Button color="danger" onClick={() => { if (clearPreferences(browserStorage())) { setPrefs(defaults()); setNotice('저장한 정보를 초기화했어요.'); } else setNotice('저장한 정보를 삭제하지 못했어요. 다시 시도해 주세요.'); setConfirmReset(false); }}>초기화하기</Button></div></div>}
          <p className="info-footer">버전 1.0.0<br/>문의 sonprojecta@gmail.com</p>
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
    {['today', 'favorites', 'info'].includes(route.page) && <nav className="bottom-nav" aria-label="주요 메뉴">{([['today', '홈', 'home'], ['favorites', '즐겨찾기', 'heart'], ['info', '정보', 'info']] as const).map(([page, label, icon]) => <button key={page} aria-current={route.page === page ? 'page' : undefined} onClick={() => go(page)}><AppIcon name={icon} filled={page === 'favorites' && route.page === page}/><span>{label}</span></button>)}</nav>}
  </div>;
}

const bibleLicense = `MIT License
Copyright (c) 2024 Scrollmapper

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`;


