import { useState, useEffect } from "react";
import { useAuth } from "~/hooks/useAuth";
import type { Route } from "./+types";
import { useGoogleLogin } from "@react-oauth/google";
import googleIcon from "../assets/icons/social/google.svg";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "User - Sushi Counter" },
    { name: "description", content: "Your profile sushi eater" },
  ];
}

export default function User() {
  const { user, linkGoogle, unlinkGoogle, updateProfile, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

  if (!user) {
    return (
      <div className="w-full max-w-[400px] p-4 flex flex-col items-center">
        <p>Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[400px] p-4 flex flex-col items-center gap-3">
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

      <button
        onClick={logout}
        className="w-full p-4 border border-red-500/30 text-red-400 rounded-2xl hover:bg-red-500/10 transition-colors font-bold mt-4"
      >
        Logout
      </button>
    </div>
  );
}
