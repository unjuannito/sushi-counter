import { APP_CONSTANTS } from "~/utils/constants";

export function meta() {
  return [
    { title: "Legal Notice - Sushi Counter" }
  ];
}

export default function LegalNotice() {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12 select-text pb-8">
        <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-2 !text-left !text-[2em]">Legal Notice</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed text-sm md:text-base">
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Identifying Data</h2>
            <p>
              In compliance with the information duty set out in Article 10 of Law 34/2002, of July 11, on Information Society Services and Electronic Commerce (LSSI-CE), the following data is reflected below:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-1">
              <li><strong>Owner:</strong> {APP_CONSTANTS.legalDetails.companyName}</li>
              {APP_CONSTANTS.legalDetails.commercialName && <li><strong>Commercial Name:</strong> {APP_CONSTANTS.legalDetails.commercialName}</li>}
              {APP_CONSTANTS.legalDetails.vatId && <li><strong>VAT/Tax ID:</strong> {APP_CONSTANTS.legalDetails.vatId}</li>}
              {APP_CONSTANTS.legalDetails.address && <li><strong>Address:</strong> {APP_CONSTANTS.legalDetails.address}</li>}
              <li><strong>Email:</strong> <a href={`mailto:${APP_CONSTANTS.legalDetails.email}`} className="text-[#646cff] hover:text-[#535bf2]">{APP_CONSTANTS.legalDetails.email}</a></li>
              <li><strong>Website:</strong> <a href={APP_CONSTANTS.legalDetails.websiteUrl} className="text-[#646cff] hover:text-[#535bf2]">{APP_CONSTANTS.legalDetails.websiteUrl}</a></li>
              {APP_CONSTANTS.legalDetails.registryData && <li><strong>Registry Data:</strong> {APP_CONSTANTS.legalDetails.registryData}</li>}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Users</h2>
            <p>
              Access and/or use of this {APP_CONSTANTS.legalDetails.companyName} portal attributes the condition of USER, who accepts, from said access and/or use, the General Conditions of Use reflected herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Use of the Portal</h2>
            <p>
              {APP_CONSTANTS.legalDetails.websiteUrl} provides access to a multitude of information, services, programs or data on the Internet belonging to {APP_CONSTANTS.legalDetails.companyName} or its licensors to which the USER may have access. The USER assumes responsibility for the use of the portal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Intellectual and Industrial Property</h2>
            <p>
              {APP_CONSTANTS.legalDetails.companyName} by itself or as an assignee, owns all intellectual and industrial property rights of its website, as well as the elements contained therein. All rights reserved.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Exclussion of Guarantees and Liability</h2>
            <p>
              {APP_CONSTANTS.legalDetails.companyName} is not responsible, in any case, for damages of any nature that could cause, but not limited to: errors or omissions in the contents, lack of availability of the portal or the transmission of viruses or malicious or harmful programs in the contents, despite having adopted all the necessary technological measures to prevent it.
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
