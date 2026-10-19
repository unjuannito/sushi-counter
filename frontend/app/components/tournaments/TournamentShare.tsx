import { useEffect, useState } from 'react';
import linkIcon from '~/assets/icons/ui/link.svg';
import { useLanguage } from '~/context/LanguageContext';

function isMobileDevice() {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function TournamentShare({ tournamentId, tournamentName }: { tournamentId: string; tournamentName?: string }) {
  const { t } = useLanguage();
  const [isMobile, setIsMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const inviteUrl = typeof window === 'undefined' ? '' : `${window.location.origin}/tournament/join/${encodeURIComponent(tournamentId)}`;
  const message = `${t('Join my Sushi Counter tournament')}${tournamentName ? `: ${tournamentName}` : ''}`;

  useEffect(() => setIsMobile(isMobileDevice() && typeof navigator.share === 'function'), []);

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

  const handleShare = async () => {
    if (isMobileDevice() && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: message, text: message, url: inviteUrl });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
      }
    }
    await copyLink();
  };

  return (
    <div className="pointer-events-auto justify-self-center text-center">
      <button type="button" className="secondary-button text-sm" onClick={handleShare}>
        <img src={linkIcon} alt="" className="invert h-auto w-4" />
        {copied ? t('Copied!') : isMobile ? t('Share invite') : t('Copy link')}
      </button>
      {copied && <span role="status" className="sr-only">{t('Invite link copied to clipboard.')}</span>}
      {copyError && (
        <div className="mt-2 text-sm">
          <p role="alert" className="mb-1 text-red-300">{t('Could not copy the link. Select and copy it manually.')}</p>
          <input readOnly value={inviteUrl} onFocus={(event) => event.currentTarget.select()} aria-label={t('Tournament invite link')} className="w-full rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-white" />
        </div>
      )}
    </div>
  );
}
