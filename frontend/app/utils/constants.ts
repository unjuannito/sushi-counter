export const APP_CONSTANTS = {
    MONTHS: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ],
    // Language-independent constants
    SAVE_DELAY_MS: 0.5 * 1000, // 0.5 seconds
    SHORT_SESSION_THRESHOLD_MS: 5 * 60 * 1000, // 5 minutes
    SESSION_TIMEOUT_MS: 2 * 60 * 60 * 1000,  // 2 hours
    NEW_SESSION_THRESHOLD_MS: 3 * 60 * 60 * 1000, // 3 hours

    legalDetails: {
        // Company / Owner Information
        companyName: "Juan Cañas",
        commercialName: "Sushi Counter",
        vatId: "",

        // Contact Information
        address: "",
        email: "sushi.counter.project@gmail.com",

        // Other details
        websiteUrl: "https://sushi-counter.ydns.eu",
        registryData: "",

        // Last updated date
        lastUpdated: "April 2, 2026",
    }
};
