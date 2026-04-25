import { APP_CONSTANTS } from "~/utils/constants";

export function meta() {
  return [
    { title: "Cookies Policy - Sushi Counter" }
  ];
}

export default function CookiesPolicy() {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12 select-text pb-8">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2 !text-left !text-[2em]">Cookies Policy</h1>
      <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
        <p>
          On our website <strong>{APP_CONSTANTS.legalDetails.websiteUrl}</strong>, owned by <strong>{APP_CONSTANTS.legalDetails.companyName}</strong>, we use cookies to improve user experience and offer our services in the most optimal way possible. 
        </p>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">What are cookies?</h2>
          <p>
            A cookie is a small text file that is stored in your browser when you visit almost any web page. Its usefulness is that the web is able to remember your visit when you return to browse that page and maintain session state or preferences (such as login).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">What cookies do we use?</h2>
          <p>This website uses the following types of cookies:</p>
          <ul className="list-disc pl-6 mt-2 space-y-3">
            <li>
              <strong>Technical or strictly necessary cookies:</strong> These are those that allow the user to navigate through a web page and use the different options or services that exist in it, such as, for example, controlling traffic, identifying the session or accessing parts of restricted access. By law, this type of cookies do not require explicit consent. (Example: Authentication Tokens to remain logged in, cookie preferences persistence).
            </li>
            <li>
              <strong>Third-party analysis cookies (Future implementations):</strong> These are those that, processed by us or by third parties, allow us to quantify the number of users and thus perfectly measure and statistically analyze usage. *Currently not implemented, but the system is prepared for their inclusion once notice is given and consent is received.*
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">Disabling or eliminating cookies</h2>
          <p>
            At any time you may exercise your right to deactivate or eliminate cookies from this website. Depending on your web browser, the way to do this is different:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><a href="https://support.google.com/chrome/answer/95647?hl=en" target="_blank" rel="noopener noreferrer" className="text-[#646cff] hover:text-[#535bf2]">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-[#646cff] hover:text-[#535bf2]">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/en-us/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-[#646cff] hover:text-[#535bf2]">Safari</a></li>
            <li><a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-[#646cff] hover:text-[#535bf2]">Microsoft Edge</a></li>
          </ul>
        </section>
        
        <p className="text-xs text-gray-500 mt-8 pt-4 border-t border-gray-800">
          Last updated: {APP_CONSTANTS.legalDetails.lastUpdated}
        </p>
      </div>
      </div>
    </div>
  );
}
