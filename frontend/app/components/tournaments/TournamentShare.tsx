import { useState } from 'react';
import linkIcon from '~/assets/icons/ui/link.svg';
import { useLanguage } from '~/context/LanguageContext';

/** Share menu with the native OS share sheet where supported and useful desktop fallbacks. */
export default function TournamentShare({ tournamentId, tournamentName }: { tournamentId: string; tournamentName?: string }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const inviteUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/tournament/join/${encodeURIComponent(tournamentId)}`;
  const title = t('Join my Sushi Counter tournament');
  const message = `${title}${tournamentName ? `: ${tournamentName}` : ''}`;
  const shareText = `${message} ${inviteUrl}`;

  const copyLink = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(inviteUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = inviteUrl;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        const succeeded = document.execCommand('copy');
        input.remove();
        if (!succeeded) throw new Error('Copy failed');
      }
      setCopied(true);
      setCopyError(false);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  const shareWithDevice = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title: message, text: message, url: inviteUrl });
      setOpen(false);
    } catch (error) {
      // Closing the native share sheet is a normal user action.
    }
  };

  return (
    <>
      <button type="button" className="flex flex-row items-center gap-2 font-semibold justify-self-center" onClick={() => setOpen(true)} aria-haspopup="dialog">
        <img src={linkIcon} alt="" className="invert h-auto w-6" /> {t('Share invite')}
      </button>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" onClick={(event) => event.stopPropagation()} onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="share-tournament-title" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#202020] p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="share-tournament-title" className="m-0 text-xl font-bold">{t('Share tournament')}</h2>
                <p className="mb-0 mt-1 text-sm text-white/60">{t('Invite friends to join the competition.')}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-3 py-1 text-xl text-white/60 hover:bg-white/10" aria-label={t('Close')}>×</button>
            </div>

            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button type="button" onClick={shareWithDevice} className="mb-3 w-full rounded-xl bg-white px-4 py-3 font-bold text-black hover:bg-gray-200">
                {t('Share using your device…')}
              </button>
            )}

            <div className="mb-4 flex gap-2">
              <input readOnly value={inviteUrl} onFocus={(event) => event.currentTarget.select()} aria-label={t('Tournament invite link')} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80" />
              <button type="button" onClick={copyLink} className="rounded-lg bg-white/10 px-3 py-2 text-sm font-bold hover:bg-white/20">{copied ? t('Copied!') : t('Copy link')}</button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366]/15 px-4 py-3 text-center font-semibold text-green-300 hover:bg-[#25D366]/25">WhatsApp</a>
              <a href={`mailto:?subject=${encodeURIComponent(message)}&body=${encodeURIComponent(shareText)}`} className="rounded-xl bg-white/10 px-4 py-3 text-center font-semibold hover:bg-white/20">Email</a>
            </div>
            {copied && <p role="status" className="mb-0 mt-3 text-center text-sm text-green-300">{t('Invite link copied to clipboard.')}</p>}
            {copyError && <p role="alert" className="mb-0 mt-3 text-center text-sm text-red-300">{t('Could not copy the link. Select and copy it manually.')}</p>}
          </section>
        </div>
      )}
    </>
  );
}
