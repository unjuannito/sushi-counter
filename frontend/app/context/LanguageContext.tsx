import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type Language = 'en' | 'es';
type LanguageContextValue = { language: Language; setLanguage: (language: Language) => void; t: (text: string) => string };
const LanguageContext = createContext<LanguageContextValue | null>(null);

const spanish: Record<string, string> = {
  'Your Profile': 'Tu perfil', 'Please log in to view your profile.': 'Inicia sesión para ver tu perfil.', 'User Information': 'Información del usuario', 'Edit Profile': 'Editar perfil',
  'Name': 'Nombre', 'Your name': 'Tu nombre', 'Email': 'Correo electrónico', 'Change Password': 'Cambiar contraseña', 'Add Password': 'Añadir contraseña',
  "Leave blank if you don't want to change it": 'Déjalo en blanco si no quieres cambiarla', 'Set a password to login without Google': 'Añade una contraseña para iniciar sesión sin Google',
  'New Password': 'Nueva contraseña', 'Password': 'Contraseña', 'Confirm New Password': 'Confirmar nueva contraseña', 'Confirm Password': 'Confirmar contraseña', 'Confirm new password': 'Confirma la nueva contraseña',
  'Current Password (required for changes)': 'Contraseña actual (obligatoria para realizar cambios)', 'Current password': 'Contraseña actual', 'Min. 8 characters, 1 uppercase, 1 number': 'Mín. 8 caracteres, 1 mayúscula y 1 número',
  'Save Changes': 'Guardar cambios', 'Cancel': 'Cancelar', 'Not set': 'No indicado', 'Linked Accounts': 'Cuentas vinculadas', 'Not linked': 'No vinculada', 'Unlink': 'Desvincular', 'Link': 'Vincular', 'Linked as': 'Vinculada como',
  'Legal & Privacy': 'Información legal y privacidad', 'Legal Notice': 'Aviso legal', 'Privacy Policy': 'Política de privacidad', 'Cookies Policy': 'Política de cookies', 'Danger Zone': 'Zona peligrosa', 'Account Scheduled for Deletion': 'Cuenta programada para eliminarse',
  'Your account is currently in a pending deletion state. This action is permanent and will remove all your data after the scheduled period.': 'Tu cuenta está pendiente de eliminación. Esta acción es permanente y borrará todos tus datos al terminar el plazo indicado.',
  'Cancel This Process': 'Cancelar este proceso', 'Once you delete your account, all your sushi logs and tournament history will be permanently wiped. This action cannot be undone.': 'Al eliminar tu cuenta, se borrarán permanentemente tus registros de sushi y tu historial de torneos. Esta acción no se puede deshacer.',
  'Confirm by typing "DELETE"': 'Confirma escribiendo «ELIMINAR»', 'Request Deletion': 'Solicitar eliminación', 'Back': 'Volver', 'Delete Account': 'Eliminar cuenta', 'Logout': 'Cerrar sesión',
  'Language': 'Idioma', 'Choose the language used across Sushi Counter.': 'Elige el idioma de Sushi Counter.', 'English': 'Inglés', 'Spanish': 'Español',
  'Google account linked successfully!': '¡Cuenta de Google vinculada correctamente!', 'Failed to link Google account': 'No se pudo vincular la cuenta de Google', 'Google linking failed': 'No se pudo vincular Google', 'New passwords do not match': 'Las nuevas contraseñas no coinciden',
  'Profile updated successfully!': '¡Perfil actualizado correctamente!', 'Failed to update profile': 'No se pudo actualizar el perfil', 'You cannot unlink Google without a password set.': 'No puedes desvincular Google si no tienes una contraseña configurada.',
  'Are you sure you want to unlink your Google account?': '¿Seguro que quieres desvincular tu cuenta de Google?', 'Google account unlinked successfully!': '¡Cuenta de Google desvinculada correctamente!', 'Failed to unlink Google account': 'No se pudo desvincular la cuenta de Google',
  'Account scheduled for deletion.': 'La cuenta se ha programado para eliminarse.', 'Failed to schedule deletion': 'No se pudo programar la eliminación', 'Account deletion cancelled.': 'Se ha cancelado la eliminación de la cuenta.', 'Failed to cancel deletion': 'No se pudo cancelar la eliminación',
  'Loading...': 'Cargando...', 'Track your sushi, one piece at a time': 'Lleva la cuenta de tu sushi, pieza a pieza', 'Add one sushi': 'Añadir una pieza de sushi', 'Remove one sushi': 'Quitar una pieza de sushi',
  'Close introduction': 'Cerrar introducción', 'Sign in': 'Iniciar sesión', 'Create an account': 'Crear una cuenta', 'Home Counter': 'Contador principal', 'View Calendar': 'Ver calendario', 'View Tournaments': 'Ver torneos', 'View Statistics': 'Ver estadísticas', 'View Profile': 'Ver perfil',
  'Cookie Notice': 'Aviso de cookies', 'For more information, read our': 'Para más información, consulta nuestra', 'Cookies Policy.': 'Política de cookies.',
  'Add Sushi': 'Añadir sushi', 'Number of pieces:': 'Número de piezas:', 'Time:': 'Hora:', 'Change Month': 'Cambiar mes', 'Select month:': 'Seleccionar mes:',
  'No sushi eaten this day.': 'No se ha comido sushi este día.', 'No sushi yet!': '¡Aún no has comido sushi!', 'Statistics': 'Estadísticas', 'sushi eaten all time': 'piezas de sushi en total', 'Personal Records': 'Récords personales', 'Best single day': 'Mejor día', 'Best month': 'Mejor mes', 'Insights': 'Estadísticas', 'Favourite day': 'Día favorito', 'Avg per session': 'Media por sesión', 'Each sitting on average': 'Media por comida', 'Sessions / month': 'Comidas al mes', 'How often you log sushi': 'Frecuencia de registro', 'Last 12 months': 'Últimos 12 meses',
  'Create Tournament': 'Crear torneo', "You've never participated in a tournament.": 'Todavía no has participado en ningún torneo.', 'Clear': 'Borrar', 'Joining tournament...': 'Uniéndose al torneo...', 'Loading tournament...': 'Cargando torneo...', 'Exit tournament': 'Salir del torneo', 'Participants:': 'Participantes:',
  'Current sushi count': 'Cantidad actual de sushi', 'Sushi Counter lets you count the sushi pieces you eat. You can use the counter above without an account. Sign in to save your meals, see them on a calendar, review your statistics, and join sushi-eating tournaments with friends.': 'Sushi Counter te permite contar las piezas de sushi que comes. Puedes usar el contador sin una cuenta. Inicia sesión para guardar tus comidas, verlas en un calendario, consultar tus estadísticas y participar en torneos de sushi con tus amigos.',
  'Sushi Counter is a free sushi tracker. Count pieces without an account, or sign in to save meals, view your calendar and statistics, and compete with friends.': 'Sushi Counter es un contador gratuito de sushi. Cuenta piezas sin crear una cuenta o inicia sesión para guardar comidas, consultar tu calendario y estadísticas, y competir con tus amigos.',
  'Count every piece. Save your meals and compete with friends.': 'Cuenta cada pieza. Guarda tus comidas y compite con tus amigos.',
  'Sushi Counter': 'Contador\nde sushi', 'Track your sushi and compete with friends.': 'Lleva la cuenta de tu sushi y compite con tus amigos.',
  'Google sign-in is available to create or access your account. You can also use email and password.': 'Puedes usar Google para crear una cuenta o iniciar sesión. También puedes acceder con tu correo y contraseña.',
  'Welcome Back': '¡Qué bueno verte!', 'Count your sushi plates and compete with friends.': 'Cuenta tus piezas de sushi y compite con tus amigos.', 'Email address': 'Correo electrónico', 'Sign In': 'Iniciar sesión', 'OR': 'O', 'Continue with Google': 'Continuar con Google', "Don't have an account?": '¿No tienes una cuenta?', 'Create one': 'Crear una', 'Continue as Guest': 'Continuar como invitado', 'Create Account': 'Crear cuenta', 'Join the sushi eating competition and track your progress.': 'Únete a la competición de sushi y sigue tu progreso.', 'Full Name': 'Nombre completo', 'Get Started': 'Empezar', 'Sign up with Google': 'Registrarse con Google', 'Already have an account?': '¿Ya tienes una cuenta?',
  'Track your sushi, one piece at a time': 'Registra tu sushi, pieza a pieza', 'DELETE': 'ELIMINAR', 'DELETE_PLACEHOLDER': 'ELIMINAR',
  'Reject Non-Essential': 'Rechazar las no esenciales', 'Accept All': 'Aceptar todas', 'We use our own strictly necessary cookies to keep your sessions secure and allow you to log in. These essential cookies work even if you reject the rest. We may also use third-party cookies to analyze traffic. You can accept all cookies or reject non-essential ones. For more information, read our': 'Usamos cookies propias estrictamente necesarias para mantener tu sesión segura y permitirte iniciar sesión. Estas cookies esenciales funcionan aunque rechaces las demás. También podemos usar cookies de terceros para analizar el tráfico. Puedes aceptar todas las cookies o rechazar las no esenciales. Para más información, consulta nuestra', 'e.g. 8': 'p. ej., 8', 'Save Log': 'Guardar registro',
  'Join my Sushi Counter tournament': 'Únete a mi torneo de Sushi Counter', 'Share invite': 'Compartir invitación', 'Share tournament': 'Compartir torneo', 'Invite friends to join the competition.': 'Invita a tus amigos a participar.', 'Share using your device…': 'Compartir con el dispositivo…', 'Copy link': 'Copiar enlace', 'Copied!': '¡Copiado!', 'Invite link copied to clipboard.': 'Enlace de invitación copiado.', 'Could not copy the link. Select and copy it manually.': 'No se pudo copiar el enlace. Selecciónalo y cópialo manualmente.', 'Close': 'Cerrar', 'Tournament invite link': 'Enlace de invitación al torneo',
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  useEffect(() => {
    const saved = localStorage.getItem('sushi-counter-language');
    const detected = navigator.language.toLowerCase().startsWith('es') ? 'es' : 'en';
    setLanguageState(saved === 'es' || saved === 'en' ? saved : detected);
  }, []);
  const setLanguage = (next: Language) => { localStorage.setItem('sushi-counter-language', next); setLanguageState(next); };
  const value = useMemo(() => ({ language, setLanguage, t: (text: string) => language === 'es' ? (spanish[text] ?? text) : text }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
