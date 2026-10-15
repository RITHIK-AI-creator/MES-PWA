import React, { useState, useRef, useCallback, useEffect } from "react";
import * as S from "./index.styled";

/* ───────────────────────────────────────────────────────────
   KEYBOARD LAYOUTS
─────────────────────────────────────────────────────────── */
type Mode = "alpha" | "num" | "sym";

const ALPHA_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["q","w","e","r","t","y","u","i","o","p"],
  ["a","s","d","f","g","h","j","k","l"],
  ["SHIFT","z","x","c","v","b","n","m","BKSP"],
  ["?123",",","SPACE",".","ENTER"],
];

const NUM_ROWS = [
  ["1","2","3","4","5","6","7","8","9","0"],
  ["-","/",":",";","(",")","\$","&","@","\""],
  ["SYM",".",",","?","!","'","#","%","^","*","BKSP"],
  ["ABC","SPACE","=","+","BKSP2"],
];

const SYM_ROWS = [
  ["~","`","|","•","√","π","÷","×","¶","Δ"],
  ["£","¢","€","¥","^","°","=","{","}","\\"],
  ["NUM","%","©","®","™","✓","[","]","<",">","BKSP"],
  ["ABC","SPACE","ENTER"],
];

/* ───────────────────────────────────────────────────────────
   PROPS
─────────────────────────────────────────────────────────── */
interface FloatingKeypadProps {
  onInput?: (value: string) => void;
}

/* ───────────────────────────────────────────────────────────
   COMPONENT
─────────────────────────────────────────────────────────── */
const FloatingKeypad: React.FC<FloatingKeypadProps> = ({ onInput }) => {
  /* toggle + drag state */
  const BTN_SIZE = 56;
  const MARGIN   = 12;
  const [isOpen, setIsOpen]     = useState(false);
  // Default: right edge, vertically centred
  const [position, setPosition] = useState({
    x: window.innerWidth - BTN_SIZE - MARGIN,
    y: window.innerHeight / 2 - BTN_SIZE / 2,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  /* global input tracking */
  const activeInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === "INPUT" && (target as HTMLInputElement).type !== "radio" && (target as HTMLInputElement).type !== "checkbox") {
        activeInputRef.current = target as HTMLInputElement;
        
        // Globally prevent native keyboard from showing on all inputs
        // EXCEPT on the Login page where users need to type their username/password
        if (window.location.pathname !== "/") {
          target.setAttribute("inputmode", "none");
          
          // Android Chrome aggressive native keyboard suppression trick:
          // Temporarily set to readonly during focus so the keyboard doesn't trigger,
          // then remove it shortly after so hardware barcode scanners can still type.
          target.setAttribute("readonly", "readonly");
          setTimeout(() => {
            target.removeAttribute("readonly");
          }, 200);
          target.setAttribute("autocomplete", "off");
        }

        if (isOpen) {
          setInputValue((target as HTMLInputElement).value || "");
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.key === "Enter" && target && target.tagName === "INPUT" && (target as HTMLInputElement).type !== "radio" && (target as HTMLInputElement).type !== "checkbox") {
        // Globally unfocus the input when physical scanner presses Enter (skip on Login)
        if (window.location.pathname !== "/") {
          (target as HTMLInputElement).blur();
        }
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  /* Snap button to nearest LEFT or RIGHT edge only.
     Y stays wherever the user dropped it (iOS AssistiveTouch style). */
  const snapToEdge = useCallback((curX: number, curY: number) => {
    const snapX = curX + BTN_SIZE / 2 < window.innerWidth / 2
      ? MARGIN                                   // snap to left edge
      : window.innerWidth - BTN_SIZE - MARGIN;  // snap to right edge
    // Clamp Y so button never goes off-screen
    const clampedY = Math.max(MARGIN, Math.min(window.innerHeight - BTN_SIZE - MARGIN, curY));
    setPosition({ x: snapX, y: clampedY });
  }, []);

  /* keyboard state */
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode]       = useState<Mode>("alpha");
  const [isShift, setIsShift] = useState(false);
  const [isCaps, setIsCaps]   = useState(false);
  const [dark, setDark]       = useState(false);
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const shiftTs = useRef(0);

  /* ── Drag handlers ──────────────────────────────────── */
  const onPtrDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY };
    setIsDragging(true);
    setHasDragged(false);
    const r = btnRef.current!.getBoundingClientRect();
    setDragOffset({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const onPtrMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dx = Math.abs(e.clientX - dragStart.current.x);
    const dy = Math.abs(e.clientY - dragStart.current.y);
    if (dx > 5 || dy > 5) setHasDragged(true);
    setPosition({
      x: Math.max(0, Math.min(window.innerWidth  - 56, e.clientX - dragOffset.x)),
      y: Math.max(0, Math.min(window.innerHeight - 56, e.clientY - dragOffset.y)),
    });
  }, [isDragging, dragOffset]);

  const onPtrUp = useCallback(() => {
    setIsDragging(false);
    if (!hasDragged) {
      setIsOpen(p => !p);
    } else {
      // Snap to left or right edge; Y stays where dropped
      setPosition(prev => {
        const snapX = prev.x + BTN_SIZE / 2 < window.innerWidth / 2
          ? MARGIN
          : window.innerWidth - BTN_SIZE - MARGIN;
        const clampedY = Math.max(MARGIN, Math.min(window.innerHeight - BTN_SIZE - MARGIN, prev.y));
        return { x: snapX, y: clampedY };
      });
    }
  }, [hasDragged]);

  /* ── Push value to target input ─────────────────────── */
  const push = (val: string) => {
    if (activeInputRef.current) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(activeInputRef.current, val);
      activeInputRef.current.dispatchEvent(new Event("input",  { bubbles: true }));
      activeInputRef.current.dispatchEvent(new Event("change", { bubbles: true }));
    }
    onInput?.(val);
  };

  /* ── Key press logic ────────────────────────────────── */
  const handleKey = (key: string) => {
    /* mode switches */
    if (key === "?123")  { setMode("num"); return; }
    if (key === "SYM")   { setMode("sym"); return; }
    if (key === "NUM")   { setMode("num"); return; }
    if (key === "ABC")   { setMode("alpha"); return; }

    /* shift */
    if (key === "SHIFT") {
      const now = Date.now();
      if (now - shiftTs.current < 350) { setIsCaps(true); setIsShift(false); }
      else { setIsCaps(false); setIsShift(p => !p); }
      shiftTs.current = now;
      return;
    }

    /* backspace */
    if (key === "BKSP" || key === "BKSP2") {
      const v = inputValue.slice(0, -1);
      setInputValue(v);
      push(v);
      return;
    }

    /* space */
    if (key === "SPACE") {
      const v = inputValue + " ";
      setInputValue(v);
      push(v);
      return;
    }

    /* enter / done */
    if (key === "ENTER") {
      push(inputValue);
      setIsOpen(false);
      return;
    }

    /* regular character */
    let ch = key;
    if (mode === "alpha" && (isShift || isCaps)) ch = key.toUpperCase();
    const v = inputValue + ch;
    setInputValue(v);
    push(v);
    if (isShift) setIsShift(false); // auto-unshift
  };

  /* sync on open */
  useEffect(() => {
    if (isOpen) {
      if (activeInputRef.current) {
        setInputValue(activeInputRef.current.value || "");
      } else {
        setInputValue("");
      }
    }
  }, [isOpen]);

  /* responsive resize logic */
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const snapX = prev.x + BTN_SIZE / 2 < window.innerWidth / 2
          ? MARGIN
          : window.innerWidth - BTN_SIZE - MARGIN;
        const clampedY = Math.max(MARGIN, Math.min(window.innerHeight - BTN_SIZE - MARGIN, prev.y));
        return { x: snapX, y: clampedY };
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ── Render a single key ────────────────────────────── */
  const renderKey = (key: string) => {
    const isBksp   = key === "BKSP" || key === "BKSP2";
    const isEnter  = key === "ENTER";
    const isSpace  = key === "SPACE";
    const isShiftK = key === "SHIFT";
    const isAction = isShiftK || key === "?123" || key === "ABC"
                  || key === "SYM" || key === "NUM";

    /* flex sizing */
    let flex = 1;
    if (isSpace)       flex = 4;
    if (isShiftK || isBksp) flex = 1.4;
    if (isEnter)       flex = 1.5;
    if (key === "?123" || key === "ABC") flex = 1.4;

    /* display */
    let display: React.ReactNode = mode === "alpha" && (isShift || isCaps)
      ? key.toUpperCase()
      : key;

    if (isBksp)   display = <i className="fa-solid fa-delete-left" />;
    if (isEnter)  display = <><i className="fa-solid fa-check" style={{ fontSize: 13 }} />&nbsp;Return</>;
    if (isSpace)  display = null;
    if (isShiftK) display = isCaps
      ? <i className="fa-solid fa-lock" />
      : <i className={`fa-solid fa-arrow-up`} style={{ opacity: isShift ? 1 : 0.5 }} />;

    const showPopup = pressedKey === key && !isBksp && !isEnter && !isShiftK && !isAction;

    return (
      <S.Key
        key={key}
        $dark={dark}
        $flex={flex}
        $isAction={isAction}
        $isBackspace={isBksp}
        $isEnter={isEnter}
        $isSpace={isSpace}
        $isShift={isShiftK}
        $isShiftActive={isShiftK && (isShift)}
        $isCapsLock={isShiftK && isCaps}
        onPointerDown={(e) => {
          e.stopPropagation();
          if (!isBksp && !isEnter && !isShiftK && !isAction) setPressedKey(key);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          setPressedKey(null);
          handleKey(key);
        }}
        onPointerLeave={() => setPressedKey(null)}
        onPointerCancel={() => setPressedKey(null)}
      >
        {showPopup && (
          <S.KeyPopup $dark={dark} className="key-popup">
            {mode === "alpha" && (isShift || isCaps) ? key.toUpperCase() : key}
          </S.KeyPopup>
        )}
        {display}
      </S.Key>
    );
  };

  /* ── Rows ───────────────────────────────────────────── */
  const rows = mode === "alpha" ? ALPHA_ROWS : mode === "num" ? NUM_ROWS : SYM_ROWS;

  return (
    <>
      <S.GlobalKeyStyle />

      {/* ── Floating Toggle ── */}
      <S.FloatingBtn
        ref={btnRef}
        $x={position.x}
        $y={position.y}
        $isDragging={isDragging}
        onPointerDown={onPtrDown}
        onPointerMove={onPtrMove}
        onPointerUp={onPtrUp}
      >
        <S.BtnInner $isOpen={isOpen}>
          <i className="fa-solid fa-keyboard" />
          <S.RippleRing $isOpen={isOpen} />
        </S.BtnInner>
      </S.FloatingBtn>

      {/* ── Keyboard ── */}
      {isOpen && (
        <S.KbOverlay onPointerDown={() => setIsOpen(false)}>
          <S.KbPanel $dark={dark} onPointerDown={e => e.stopPropagation()}>

            {/* Input bar */}
            <S.InputBar $dark={dark}>
              <S.InputText $dark={dark}>
                {inputValue
                  ? inputValue
                  : <span className="placeholder">Start typing…</span>}
              </S.InputText>
              <S.InputActions>
                {inputValue && (
                  <S.ActionBtn $variant="clear" onClick={() => { setInputValue(""); push(""); }}>
                    <i className="fa-solid fa-xmark" />
                  </S.ActionBtn>
                )}
                <S.ThemeToggle $dark={dark} onClick={() => setDark(d => !d)}>
                  <i className={`fa-solid fa-${dark ? "sun" : "moon"}`} />
                </S.ThemeToggle>
                <S.ActionBtn $variant="done" onClick={() => { push(inputValue); setIsOpen(false); }}>
                  <i className="fa-solid fa-check" /> Done
                </S.ActionBtn>
              </S.InputActions>
            </S.InputBar>

            {/* Key rows */}
            <S.KeyRows>
              {rows.map((row, ri) => (
                <S.KeyRow key={ri}>
                  {row.map(key => renderKey(key))}
                </S.KeyRow>
              ))}
            </S.KeyRows>

          </S.KbPanel>
        </S.KbOverlay>
      )}
    </>
  );
};

export default FloatingKeypad;
