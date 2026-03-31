import { useState, useRef, useEffect, useCallback } from 'react';
import { uploadPhoto } from '../utils/cloudUpload';

/* ─── Vintage newspaper frame overlay (SVG + CSS) ─── */
function NewspaperFrame({ children, headline, date }) {
  return (
    <div className="relative w-full aspect-[3/4] max-w-sm mx-auto">
      {/* Photo area */}
      <div className="absolute inset-0 overflow-hidden rounded-sm">
        {children}
      </div>

      {/* Decorative border */}
      <div className="absolute inset-0 pointer-events-none border-[6px] border-double border-gold/80 rounded-sm" />
      <div className="absolute inset-[3px] pointer-events-none border border-gold/40 rounded-sm" />

      {/* Top banner */}
      <div className="absolute top-0 left-0 right-0 pointer-events-none bg-gradient-to-b from-ink/90 via-ink/70 to-transparent pt-1 pb-6 px-3">
        <div className="flex items-center justify-center gap-1 mb-0.5">
          <div className="h-px flex-1 bg-gold/60" />
          <span className="text-gold/80 font-serif text-[8px] tracking-widest">THE XIMEN TIMES</span>
          <div className="h-px flex-1 bg-gold/60" />
        </div>
        <h3 className="text-gold font-serif font-bold text-base text-center leading-tight">
          西門町日報
        </h3>
        <p className="text-parchment/60 font-serif text-[9px] text-center">{date}</p>
      </div>

      {/* Bottom caption */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none bg-gradient-to-t from-ink/90 via-ink/70 to-transparent pb-2 pt-6 px-3">
        <div className="border-t border-gold/40 pt-1">
          <p className="text-gold font-serif font-bold text-xs text-center leading-snug">
            {headline}
          </p>
          <p className="text-parchment/50 font-serif text-[8px] text-center mt-0.5">
            特派記者 攝影報導
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      {['top-0 left-0', 'top-0 right-0 scale-x-[-1]', 'bottom-0 left-0 scale-y-[-1]', 'bottom-0 right-0 scale-[-1]'].map((pos, i) => (
        <div key={i} className={`absolute ${pos} pointer-events-none`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M2 2 L10 2 L10 4 L4 4 L4 10 L2 10 Z" fill="rgba(212,175,55,0.6)" />
          </svg>
        </div>
      ))}
    </div>
  );
}

/* ─── Shutter flash animation ─── */
function ShutterFlash({ show }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-50 bg-white animate-[shutterFlash_0.4s_ease-out_forwards] pointer-events-none" />
  );
}

export default function CameraGame({ mission, timeLimit, onComplete }) {
  const [phase, setPhase] = useState('intro'); // intro | camera | preview | uploading | done
  const [photoData, setPhotoData] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [showFlash, setShowFlash] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);
  const startTime = useRef(null);

  const HEADLINE = '號外！西門町驚現珍貴影像！';
  const DATE = '民國十九年 特刊';

  // Stop camera stream
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  // Start camera
  const startCamera = useCallback(async (facing) => {
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1440 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      return true;
    } catch (err) {
      console.warn('Camera access failed:', err);
      return false;
    }
  }, [stopCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  // Enter camera mode
  const handleStartCamera = async () => {
    startTime.current = Date.now();
    setPhase('camera');
    const ok = await startCamera(facingMode);
    if (!ok) {
      // Fallback: use file input
      setPhase('camera-fallback');
    }
  };

  // Switch camera
  const handleSwitchCamera = async () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    await startCamera(newMode);
  };

  // Capture photo from video
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhotoData(dataUrl);
    stopCamera();

    // Flash effect
    setShowFlash(true);
    setTimeout(() => setShowFlash(false), 400);

    setPhase('preview');
  };

  // Handle file input fallback
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPhotoData(ev.target.result);
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
      setPhase('preview');
    };
    reader.readAsDataURL(file);
  };

  // Retake photo
  const handleRetake = async () => {
    setPhotoData(null);
    setUploadError(null);
    const ok = await startCamera(facingMode);
    setPhase(ok ? 'camera' : 'camera-fallback');
  };

  // Upload and finish
  const handleConfirm = async () => {
    setPhase('uploading');
    setUploadError(null);
    try {
      const result = await uploadPhoto(photoData, {
        playerName: 'player',
        missionId: mission.id,
      });
      setUploadResult(result);
      setPhase('done');
      // Complete mission — always 3 stars for successfully taking & uploading a photo
      const elapsed = Math.round((Date.now() - startTime.current) / 1000);
      const score = mission.baseScore;
      onComplete(3, score, elapsed);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message);
      setPhase('preview'); // Go back to preview so user can retry
    }
  };

  // Skip upload (complete without cloud save)
  const handleSkipUpload = () => {
    const elapsed = Math.round((Date.now() - startTime.current) / 1000);
    const score = mission.baseScore;
    onComplete(3, score, elapsed);
  };

  // Cancel / give up
  const handleGiveUp = () => {
    stopCamera();
    onComplete(0, 0, 0);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img src={mission.gameBg} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <ShutterFlash show={showFlash} />
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4">

        {/* ──── INTRO ──── */}
        {phase === 'intro' && (
          <div className="bg-ink/90 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-sm w-full shadow-2xl animate-[fadeIn_0.5s_ease]">
            <div className="text-center mb-4">
              <span className="text-3xl">📸</span>
              <h3 className="text-gold font-serif font-bold text-lg mt-2">攝影記者任務</h3>
            </div>
            <p className="text-parchment font-serif text-sm leading-relaxed mb-4">
              {mission.gameDescription}
            </p>
            <div className="bg-parchment/10 rounded-lg p-3 mb-4 border border-gold/20">
              <p className="text-gold/80 font-serif text-xs text-center">
                📌 拍攝提示：捕捉西門町周遭最具特色的一幕
              </p>
              <p className="text-parchment/50 font-serif text-xs text-center mt-1">
                照片將套用復古報紙邊框並上傳雲端保存
              </p>
            </div>
            <button onClick={handleStartCamera}
              className="w-full py-3 rounded-lg bg-gradient-to-b from-gold to-gold/80 text-ink font-serif font-bold text-base border border-gold-light hover:from-gold-light active:scale-95 transition-all shadow-lg">
              📷 開啟相機
            </button>
            <button onClick={handleGiveUp}
              className="w-full mt-2 py-2 rounded-lg text-parchment/50 font-serif text-xs hover:text-parchment/70 transition-colors">
              返回
            </button>
          </div>
        )}

        {/* ──── LIVE CAMERA ──── */}
        {phase === 'camera' && (
          <div className="w-full max-w-sm animate-[fadeIn_0.3s_ease]">
            <NewspaperFrame headline={HEADLINE} date={DATE}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </NewspaperFrame>

            <div className="flex gap-3 mt-4 justify-center">
              <button onClick={handleSwitchCamera}
                className="w-12 h-12 rounded-full bg-ink/80 border border-gold/40 text-gold text-lg flex items-center justify-center hover:bg-gold/20 active:scale-90 transition-all">
                🔄
              </button>
              <button onClick={handleCapture}
                className="w-16 h-16 rounded-full bg-white border-4 border-gold shadow-lg shadow-gold/20 flex items-center justify-center hover:scale-105 active:scale-95 transition-all">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-ink/20" />
              </button>
              <button onClick={handleGiveUp}
                className="w-12 h-12 rounded-full bg-ink/80 border border-red-light/40 text-red-light text-lg flex items-center justify-center hover:bg-red-light/20 active:scale-90 transition-all">
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ──── FALLBACK (file input) ──── */}
        {phase === 'camera-fallback' && (
          <div className="bg-ink/90 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-sm w-full shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="text-center mb-4">
              <span className="text-3xl">📷</span>
              <h3 className="text-gold font-serif font-bold text-base mt-2">選擇拍攝方式</h3>
              <p className="text-parchment/60 font-serif text-xs mt-1">相機無法直接開啟，請選擇以下方式</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 rounded-lg bg-gradient-to-b from-gold to-gold/80 text-ink font-serif font-bold text-sm border border-gold-light hover:from-gold-light active:scale-95 transition-all mb-2">
              📸 拍攝照片
            </button>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="gallery-input"
            />
            <button onClick={() => document.getElementById('gallery-input')?.click()}
              className="w-full py-3 rounded-lg bg-parchment/10 text-parchment font-serif font-bold text-sm border border-gold/30 hover:bg-gold/10 active:scale-95 transition-all mb-2">
              🖼️ 從相簿選擇
            </button>

            <button onClick={handleGiveUp}
              className="w-full mt-1 py-2 rounded-lg text-parchment/50 font-serif text-xs hover:text-parchment/70 transition-colors">
              返回
            </button>
          </div>
        )}

        {/* ──── PREVIEW ──── */}
        {phase === 'preview' && photoData && (
          <div className="w-full max-w-sm animate-[fadeIn_0.3s_ease]">
            <NewspaperFrame headline={HEADLINE} date={DATE}>
              <img src={photoData} alt="拍攝照片" className="w-full h-full object-cover" />
            </NewspaperFrame>

            {uploadError && (
              <div className="mt-2 bg-red-light/20 border border-red-light/40 rounded-lg px-3 py-2 text-center">
                <p className="text-red-light font-serif text-xs">上傳失敗：{uploadError}</p>
                <p className="text-parchment/50 font-serif text-xs mt-1">可重試上傳或直接完成任務</p>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button onClick={handleRetake}
                className="flex-1 py-3 rounded-lg bg-parchment/10 text-parchment font-serif font-bold text-sm border border-gold/30 hover:bg-gold/10 active:scale-95 transition-all">
                🔄 重拍
              </button>
              <button onClick={handleConfirm}
                className="flex-1 py-3 rounded-lg bg-gradient-to-b from-gold to-gold/80 text-ink font-serif font-bold text-sm border border-gold-light hover:from-gold-light active:scale-95 transition-all shadow-lg">
                ✅ 確認上傳
              </button>
            </div>
            {uploadError && (
              <button onClick={handleSkipUpload}
                className="w-full mt-2 py-2 rounded-lg text-parchment/60 font-serif text-xs border border-parchment/20 hover:bg-parchment/10 transition-colors">
                跳過上傳，直接完成任務
              </button>
            )}
          </div>
        )}

        {/* ──── UPLOADING ──── */}
        {phase === 'uploading' && (
          <div className="bg-ink/90 backdrop-blur-sm border-2 border-gold rounded-xl p-6 max-w-sm w-full shadow-2xl animate-[fadeIn_0.3s_ease]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
              <p className="text-gold font-serif text-sm">正在上傳照片至雲端...</p>
              <p className="text-parchment/40 font-serif text-xs">請稍候片刻</p>
            </div>
          </div>
        )}

        {/* ──── DONE ──── */}
        {phase === 'done' && uploadResult && (
          <div className="bg-ink/90 backdrop-blur-sm border-2 border-gold rounded-xl p-5 max-w-sm w-full shadow-2xl animate-[fadeIn_0.5s_ease]">
            <div className="text-center mb-3">
              <span className="text-4xl">🎉</span>
              <h3 className="text-gold font-serif font-bold text-lg mt-2">照片上傳成功！</h3>
            </div>

            <div className="rounded-lg overflow-hidden border border-gold/30 mb-3">
              <NewspaperFrame headline={HEADLINE} date={DATE}>
                <img src={photoData} alt="完成照片" className="w-full h-full object-cover" />
              </NewspaperFrame>
            </div>

            <div className="bg-parchment/10 rounded-lg p-3 border border-gold/20">
              <p className="text-parchment/60 font-serif text-xs text-center mb-1">雲端照片連結：</p>
              <a href={uploadResult.url} target="_blank" rel="noopener noreferrer"
                className="text-gold font-serif text-xs text-center block truncate underline hover:text-gold-light">
                {uploadResult.url}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
