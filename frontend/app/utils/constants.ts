const constantsEN = {

        MONTHS: [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"],
};

const constantsES = {
    MONTHS: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
};

//constnates independientes del idioma pueden ir aqui
const constantsIndependent = {
    SAVE_DELAY_MS: 0.5 * 1000, // 0.5 segundo
    SHORT_SESSION_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutos
    SESSION_TIMEOUT_MS: 2 * 60 * 60 * 1000,  // 2 horas
    NEW_SESSION_THRESHOLD_MS: 3 * 60 * 60 * 1000, // 3 horas
};

const lan = navigator.language.startsWith('es') ? 'es' : 'en';
let constants;
// if (lan === 'es') {
if (false) {
    constants = constantsES;
} else {
    constants = constantsEN;
}
export const MONTHS = constants.MONTHS;
export const SAVE_DELAY_MS = constantsIndependent.SAVE_DELAY_MS;
export const SESSION_TIMEOUT_MS = constantsIndependent.SESSION_TIMEOUT_MS;
export const NEW_SESSION_THRESHOLD_MS = constantsIndependent.NEW_SESSION_THRESHOLD_MS;
export const SHORT_SESSION_THRESHOLD_MS = constantsIndependent.SHORT_SESSION_THRESHOLD_MS;