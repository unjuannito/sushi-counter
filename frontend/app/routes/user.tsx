import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import type { Route } from './+types/user';
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../assets/icons/social/google.svg";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Your Profile - Sushi Counter" },
    { name: "description", content: "Manage your Sushi Counter profile, link your Google account, update your credentials, and configure your privacy settings." },
    { property: "og:title", content: "Your Profile - Sushi Counter" },
    { property: "og:description", content: "Manage your Sushi Counter profile and account settings." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function User() {
  const { user, linkGoogle, unlinkGoogle, updateProfile, requestDeletion, cancelDeletion, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await linkGoogle(tokenResponse.access_token);
      if (res.success) {
        setMessage({ type: 'success', text: "Google account linked successfully!" });
      } else {
        setMessage({ type: 'error', text: res.errorMessage || "Failed to link Google account" });
      }
    },
    onError: () => setMessage({ type: 'error', text: "Google linking failed" }),
    flow: 'implicit',
  });

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const currentPassword = formData.get("currentPassword") as string;

    // Frontend validation
    if (password && password !== confirmPassword) {
      setMessage({ type: 'error', text: "New passwords do not match" });
      return;
    }

    const res = await updateProfile({
      name: name !== user?.name ? name : undefined,
      email: email !== user?.email ? email : undefined,
      password: password || undefined,
      currentPassword: password ? currentPassword : undefined
    });

    if (res.success) {
      setMessage({ type: 'success', text: "Profile updated successfully!" });
      setIsEditing(false);
    } else {
      setMessage({ type: 'error', text: res.errorMessage || "Failed to update profile" });
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!user?.hasPassword) {
      setMessage({ type: 'error', text: "You cannot unlink Google without a password set." });
      return;
    }

    if (confirm("Are you sure you want to unlink your Google account?")) {
      const res = await unlinkGoogle();
      if (res.success) {
        setMessage({ type: 'success', text: "Google account unlinked successfully!" });
      } else {
        setMessage({ type: 'error', text: res.errorMessage || "Failed to unlink Google account" });
      }
    }
  };

  const handleRequestDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmation !== "DELETE") return;
    const res = await requestDeletion();
    if (res.success) {
      setMessage({ type: 'success', text: "Account scheduled for deletion." });
      setIsDeletingAccount(false);
      setDeleteConfirmation("");
    } else {
      setMessage({ type: 'error', text: res.errorMessage || "Failed to schedule deletion" });
    }
  };

  const handleCancelDeletion = async () => {
    const res = await cancelDeletion();
    if (res.success) {
      setMessage({ type: 'success', text: "Account deletion cancelled." });
    } else {
      setMessage({ type: 'error', text: res.errorMessage || "Failed to cancel deletion" });
    }
  };

  const DeletionCountdown = ({ requestedAt, graceDays }: { requestedAt: string, graceDays: number }) => {
    const [timeLeft, setTimeLeft] = useState<{ d: number, h: number, m: number, s: number } | null>(null);

    useEffect(() => {
      const calculateTime = () => {
        const start = new Date(requestedAt).getTime();
        const end = start + (graceDays * 24 * 60 * 60 * 1000);
        const now = new Date().getTime();
        const diff = end - now;

        if (diff <= 0) return null;

        return {
          d: Math.floor(diff / (1000 * 60 * 60 * 24)),
          h: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          s: Math.floor((diff % (1000 * 60)) / 1000)
        };
      };

      setTimeLeft(calculateTime());
      const timer = setInterval(() => {
        setTimeLeft(calculateTime());
      }, 1000);

      return () => clearInterval(timer);
    }, [requestedAt, graceDays]);

    if (!timeLeft) return null;

    return (
      <div className="flex gap-2 items-center font-mono text-red-100 bg-red-400/20 px-3 py-1 rounded-full text-xs font-bold w-fit border border-red-500/20 shadow-sm shadow-red-500/10">
        <span className="flex items-center gap-1">
          <span className="text-sm">{timeLeft.d}d</span>
          <span className="opacity-50">:</span>
          <span className="text-sm">{String(timeLeft.h).padStart(2, '0')}h</span>
          <span className="opacity-50">:</span>
          <span className="text-sm">{String(timeLeft.m).padStart(2, '0')}m</span>
          <span className="opacity-50">:</span>
          <span className="text-sm">{String(timeLeft.s).padStart(2, '0')}s</span>
        </span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="w-full max-w-[400px] p-4 flex flex-col items-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-[400px] mx-auto flex flex-col gap-4 p-4 items-center">
      <h1 className="text-center m-0 text-6xl font-bold my-8">Your Profile</h1>

      {message && (
        <div className={`w-full p-4 rounded-lg text-center font-bold ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <section className="flex flex-col gap-6 w-full p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center border-b border-white/10 pb-4">
          <h2 className="text-xl font-bold m-0">User Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm bg-white/10 hover:bg-white/20 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Edit Profile
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#aaa]">Name</label>
              <input
                name="name"
                type="text"
                defaultValue={user.name}
                className="bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/30"
                placeholder="Your name"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-[#aaa]">Email</label>
              <input
                name="email"
                type="email"
                defaultValue={user.email || ""}
                className="bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/30"
                placeholder="your@email.com"
              />
            </div>

            <div className="border-t border-white/10 mt-4 pt-4 flex flex-col gap-4">
              <h3 className="text-md font-bold">{user.hasPassword ? "Change Password" : "Add Password"}</h3>
              <p className="text-xs text-[#888]">
                {user.hasPassword ? "Leave blank if you don't want to change it" : "Set a password to login without Google"}
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#aaa]">{user.hasPassword ? "New Password" : "Password"}</label>
                <input
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  className="bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/30"
                  placeholder="Min. 8 characters, 1 uppercase, 1 number"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm text-[#aaa]">{user.hasPassword ? "Confirm New Password" : "Confirm Password"}</label>
                <input
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  className="bg-white/5 border border-white/10 rounded-lg p-3 outline-none focus:border-white/30"
                  placeholder="Confirm new password"
                />
              </div>

              {user.hasPassword && (
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-yellow-400/80">Current Password (required for changes)</label>
                  <input
                    name="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    className="bg-white/5 border border-yellow-400/30 rounded-lg p-3 outline-none focus:border-yellow-400/50"
                    placeholder="Current password"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-white/90 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 transition-colors py-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-[#aaa]">Name</span>
              <span className="text-lg font-medium">{user.name}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-[#aaa]">Email</span>
              <span className="text-lg font-medium">{user.email || <em className="text-[#666]">Not set</em>}</span>
            </div>
            {user.hasPassword && (
              <div className="flex flex-col">
                <span className="text-sm text-[#aaa]">Password</span>
                <span className="text-lg font-medium">••••••••</span>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-6 w-full p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm">
        <h2 className="text-xl font-bold m-0 border-b border-white/10 pb-4">Linked Accounts</h2>

        <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10 gap-3">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-white rounded-full flex-shrink-0 flex items-center justify-center">
              <img src={googleIcon} alt="Google" className="w-6 h-6" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold">Google</span>
              <span className="text-xs text-[#aaa] truncate">
                {user.isGoogleLinked ? `Linked as ${user.googleEmail}` : "Not linked"}
              </span>
            </div>
          </div>

          {user.isGoogleLinked ? (
            <button
              onClick={handleUnlinkGoogle}
              className="text-sm text-red-400 hover:text-red-300 bg-red-400/10 hover:bg-red-400/20 px-4 py-2 rounded-lg transition-colors font-medium whitespace-nowrap"
            >
              Unlink
            </button>
          ) : (
            <button
              onClick={() => googleLogin()}
              className="text-sm bg-white text-black hover:bg-white/90 px-4 py-2 rounded-lg transition-colors font-bold whitespace-nowrap"
            >
              Link
            </button>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 w-full p-6 sm:p-8 border border-white/10 rounded-2xl bg-white/5 backdrop-blur-sm mt-2">
        <h2 className="text-xl font-bold m-0 border-b border-white/10 pb-4">Legal & Privacy</h2>
        <div className="flex flex-col gap-3 mt-2">
          <Link to="/legal-notice" className="text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-3 rounded-lg flex justify-between items-center group">
            <span>Legal Notice</span>
            <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link to="/privacy-policy" className="text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-3 rounded-lg flex justify-between items-center group">
            <span>Privacy Policy</span>
            <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
          <Link to="/cookies-policy" className="text-gray-300 hover:text-white transition-colors bg-white/5 px-4 py-3 rounded-lg flex justify-between items-center group">
            <span>Cookies Policy</span>
            <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      <section className="flex flex-col gap-6 w-full p-8 border border-red-500/20 rounded-2xl bg-red-500/[0.02] backdrop-blur-sm mt-4 transition-all">
        <div className="flex items-center gap-3 border-b border-red-500/10 pb-4">
          <div className="w-1.5 h-6 bg-red-500 rounded-full" />
          <h2 className="text-xl font-bold m-0 text-red-500">Danger Zone</h2>
        </div>

        {user!.deletionRequestedAt ? (
          <div className="flex flex-col gap-6 bg-red-500/5 p-6 rounded-xl border border-red-500/20">
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <p className="font-bold text-red-500 text-lg">Account Scheduled for Deletion</p>
                <DeletionCountdown requestedAt={user!.deletionRequestedAt!} graceDays={user!.accountDeletionDays || 30} />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed text-pretty">
                Your account is currently in a pending deletion state. This action is permanent and will remove all your data after the scheduled period.
              </p>
            </div>
            <button
              onClick={handleCancelDeletion}
              className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-100 active:scale-[0.98] transition-all shadow-lg shadow-white/5"
            >
              Cancel This Process
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-gray-400 leading-relaxed">
              Once you delete your account, all your sushi logs and tournament history will be permanently wiped. This action cannot be undone.
            </p>
            {isDeletingAccount ? (
              <form onSubmit={handleRequestDeletion} className="flex flex-col gap-5 relative animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-red-500/80">Confirm by typing "DELETE"</label>
                  <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                    className="bg-red-500/[0.05] border border-red-500/30 rounded-xl p-4 outline-none focus:border-red-500/60 text-red-100 placeholder:text-red-500/20 transition-all font-mono"
                    placeholder="DELETE"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={deleteConfirmation !== "DELETE"}
                    className="flex-[2] bg-red-500 text-white font-bold py-4 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all disabled:opacity-20 disabled:grayscale shadow-lg shadow-red-500/10"
                  >
                    Request Deletion
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsDeletingAccount(false); setDeleteConfirmation(""); }}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white transition-all py-4 rounded-xl font-bold border border-white/10"
                  >
                    Back
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsDeletingAccount(true)}
                className="w-full bg-red-500/5 border border-red-500/20 text-red-500 font-bold py-4 rounded-xl hover:bg-red-500/10 active:scale-[0.98] transition-all"
              >
                Delete Account
              </button>
            )}
          </div>
        )}
      </section>

      <button
        onClick={logout}
        className="w-full p-4 border border-red-500/30 text-red-500 rounded-2xl hover:bg-red-500/10 active:scale-[0.98] transition-all font-bold mt-4"
      >
        Logout
      </button>
    </main>
  );
}
