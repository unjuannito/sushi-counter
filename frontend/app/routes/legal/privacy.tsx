import { APP_CONSTANTS } from "~/utils/constants";

export function meta() {
  return [
    { title: "Privacy Policy - Sushi Counter" }
  ];
}

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12 select-text pb-8">
        <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2 !text-left !text-[2em]">Privacy Policy</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
          <p>
            At <strong>{APP_CONSTANTS.legalDetails.companyName}</strong>, we care about the protection of your personal data. This Privacy Policy describes how we collect, use, and protect the information you provide.
          </p>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Data Controller</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Identity:</strong> {APP_CONSTANTS.legalDetails.companyName}</li>
              {APP_CONSTANTS.legalDetails.vatId && <li><strong>Tax ID:</strong> {APP_CONSTANTS.legalDetails.vatId}</li>}
              {APP_CONSTANTS.legalDetails.address && <li><strong>Address:</strong> {APP_CONSTANTS.legalDetails.address}</li>}
              {APP_CONSTANTS.legalDetails.registryData && <li><strong>Registry Data:</strong> {APP_CONSTANTS.legalDetails.registryData}</li>}
              <li><strong>Email:</strong> {APP_CONSTANTS.legalDetails.email}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Purpose of the Processing</h2>
            <p>
              At {APP_CONSTANTS.legalDetails.companyName} we process the information provided by interested persons in order to inform about our services, manage your experience on our platform (for example, allowing the use of calendars or tournaments), and graphicly ensure the proper functioning of the software.
            </p>
            <p className="mt-2">No automated decisions will be made based on user profiles, and the personal data provided will be kept as long as the interested party does not request its deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Legitimation</h2>
            <p>
              The legal basis for the processing of your data is the explicit consent collected through this website and the legitimate interest to offer a correct service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Recipients</h2>
            <p>
              Data will not be transferred to third parties outside of {APP_CONSTANTS.legalDetails.companyName} unless legally obliged to do so. However, we may use technology service providers within the European Economic Area (or in the USA under compliance frameworks equivalent to the GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Rights</h2>
            <p>
              Anyone has the right to obtain confirmation as to whether {APP_CONSTANTS.legalDetails.companyName} is processing personal data that concerns them or not.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Right to request access to personal data.</li>
              <li>Right to request its rectification or deletion.</li>
              <li>Right to request the limitation of their processing.</li>
              <li>Right to object to processing.</li>
              <li>Right to data portability.</li>
            </ul>
            <p className="mt-2 text-sm italic">
              To exercise these rights, please contact us at {APP_CONSTANTS.legalDetails.email}. Likewise, you have the right to file a claim with the relevant Control Authority.
            </p>
          </section>

          <p className="text-xs text-gray-500 mt-8 pt-4 border-t border-gray-800">
            Last updated: {APP_CONSTANTS.legalDetails.lastUpdated}
          </p>
        </div>
      </div>
    </div>
  );
}
