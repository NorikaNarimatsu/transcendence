import React from "react";

interface PrivacyPolicyModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const	PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
	if (!isOpen) return null;
	return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-pink-light p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] m-4 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SCROLLABLE CONTENT */}
        <div className="overflow-y-auto flex-1 p-6 text-blue-deep font-dotgothic">
        {/* HEADER */}
        <div className="bg-purple-purple p-4 rounded-lg">
          <h1 className="text-3xl text-white font-pixelify font-bold text-shadow">
            PRIVACY POLICY
          </h1>
          <p className="text-sm text-gray-300 font-dotgothic mt-1">
            Version 1.0 - Last updated: 11th October 2025
          </p>
        </div>

          <div className="space-y-6 text-sm leading-relaxed">
            {/* INTRO */}
            <section>
              <p className="mb-2">
                This Privacy Policy explains how we collect, use, store and
                protect your personal data when you use our Transcendence
                platform
              </p>
            </section>

            {/* SECTION 1 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                1. Who We Are
              </h2>
              <p className="mb-2">
                Transcendence ("we, "us", "our") is a web application developed
                as part of the Codam curriculum, offering games such as Pong and
                Snake. We are committed to protecting your personal data and
                processing it in accordance with the{" "}
                <a
                  href="https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX3A02016R0679-20160504"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-game underline font-bold hover:text-purple-700 transition-colors"
                >
                  General Data Protection Regulation (EU) 2016/679
                </a>{" "}
                ("GDPR") and applicable data protection laws
              </p>
              <p>
                <strong>Data Controller:</strong> SNEG Transcendence Project
                Team, Codam <br />
                For all data protection matters, you can contact us at{" "}
                <a
                  href="mailto:sneg.transcendence@gmail.com"
                  className="text-purple-dame underline font-bold hover:text-purple-700 transition-colors"
                >
                  sneg.transcendence@gmail.com
                </a>
              </p>
            </section>

            {/* SECTION 2 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                2. What Data We Collect
              </h2>
              <p className="mb-2">
                We collect and process only the minimum personal data necessary
                to provide our services and ensure account security. The data we
                collect includes:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>email address (for account creation and login)</li>
                <li>nickname (used publicly in the game)</li>
                <li>hashed password (for account security)</li>
                <li>game results and statistics (linked to your nickname)</li>
                <li>
                  session and security data (for maintaining service integrity
                  and preventing unauthorised access)
                </li>
              </ul>
              <p className="mt-3">
                This processing is based on Article 6(1)(b) GDPR - necessary for
                the performance of a contract (providing you access to our
                services), and Article 6(1)(f) GDPR - legitimate interests
                pursued by the controller (security and fraud prevention)
              </p>

              <h3 className="font-bold mt-4 mb-2">
                Data Recipients / Third-Party Access
              </h3>
              <p>
                We do not use your personal data for marketing purposes or share
                it with third parties, unless required by law or with your
                explicit consent (Art. 6(1)(a) GDPR). We do not transfer your
                data outside the European Economic Area (EEA) (articles 13(1)(e)
                and 44-46 GDPR)
              </p>
            </section>

            {/* SECTION 3 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                3. Why We Collect Your Data
              </h2>
              <p className="mb-2">
                We collect and process your personal data for the following
                lawful purposes:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-2 border-black text-sm bg-blue-deep">
                  <thead className="bg-purple-game">
                    <tr>
                      <th className="border-2 border-black p-3 text-left text-white font-bold">
                        Purpose
                      </th>
                      <th className="border-2 border-black p-3 text-left text-white font-bold">
                        Legal Basis
                      </th>
                      <th className="border-2 border-black p-3 text-left text-white font-bold">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <tr>
                      <td className="border-2 border-black p-3">
                        Account creation and management
                      </td>
                      <td className="border-2 border-black p-3">
                        Article 6(1)(b) GDPR
                      </td>
                      <td className="border-2 border-black p-3">
                        Necessary to provide you access to the Transcendence
                        platform and your account
                      </td>
                    </tr>
                    <tr className="bg-pink-dark bg-opacity-30">
                      <td className="border-2 border-black p-3">
                        Gameplay functionality
                      </td>
                      <td className="border-2 border-black p-3">
                        Article 6(1)(b) GDPR
                      </td>
                      <td className="border-2 border-black p-3">
                        To allow you to play our games, display your scores and
                        statistics
                      </td>
                    </tr>
                    <tr>
                      <td className="border-2 border-black p-3">
                        Personalisation and user experience improvement
                      </td>
                      <td className="border-2 border-black p-3">
                        Article 6(1)(f) GDPR
                      </td>
                      <td className="border-2 border-black p-3">
                        To enhance your gaming experience and provide relevant
                        content
                      </td>
                    </tr>
                    <tr className="bg-pink-dark bg-opacity-30">
                      <td className="border-2 border-black p-3">
                        Security and fraud prevention
                      </td>
                      <td className="border-2 border-black p-3">
                        Article 6(1)(f) GDPR
                      </td>
                      <td className="border-2 border-black p-3">
                        To protect user accounts and ensure service integrity
                      </td>
                    </tr>
                    <tr>
                      <td className="border-2 border-black p-3">
                        Legal compliance
                      </td>
                      <td className="border-2 border-black p-3">
                        Article 6(1)(c) GDPR
                      </td>
                      <td className="border-2 border-black p-3">
                        To comply with applicable legal obligations
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">
                We may use local storage to maintain your session and
                preferences. This is functional only and does not track your
                behaviour across other sites
              </p>
            </section>

            {/* SECTION 4 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                4. Children's Privacy
              </h2>
              <p>
                Our services are not directed to children under 18 years old. We
                do not knowingly collect personal data from minors. If you
                believe a minor has provided us with personal data, please
                contact us immediately so we can delete it
              </p>
            </section>

            {/* SECTION 5 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                5. How Long We Keep Your Data
              </h2>
              <p className="mt-2">
                Your personal data will be retained only for as long as
                necessary to fulfil the purposes for which it was collected
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Data is stored while your account remains active</li>
                <li>
                  If the account has been inactive for 24 months, or upon your
                  request, all personal data will be erased or anonymised
                </li>
              </ul>
              <p className="mt-2">
                This is in accordance with Article 5(1)(e) GDPR - data must not
                be kept longer than necessary for the purposes of processing
              </p>
            </section>

            {/* SECTION 6 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                6. Your Data Rights
              </h2>
              <p className="mb-2">
                You have the following rights regarding your personal data:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  Right of access (Art. 15) - to obtain confirmation and a copy
                  of your personal data
                </li>
                <li>
                  Right to rectification (Art. 16) - to correct inaccurate or
                  incomplete data
                </li>
                <li>
                  Right to erasure (Art. 17) - to request deletion of your
                  personal data (“right to be forgotten”)
                </li>
                <li>
                  Right to restriction of processing (Art. 18) – to limit how we
                  use your data
                </li>
                <li>
                  Right to data portability (Art. 20) – to receive your data in
                  a structured, machine-readable format
                </li>
                <li>
                  Right to object (Art. 21) – to object to processing based on
                  legitimate interests
                </li>
                <li>
                  Right to complain (Art. 77) – with a supervisory authority in
                  your EU country
                </li>
              </ul>
              <p className="mt-2">
                You can exercise these rights directly through the User Portal,
                or by contacting us (see Section 9). You may also contact your
                national Data Protection Authority. A full list is available at{" "}
                <a
                  href="https://edpb.europa.eu/about-edpb/board/members_en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-game underline font-bold hover:text-purple-700 transition-colors"
                >
                  https://edpb.europa.eu/about-edpb/board/members_en
                </a>
              </p>
            </section>

            {/* SECTION 7 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                7. Data Security
              </h2>
              <p className="mt-2">
                We implement appropriate technical and organisational measure to
                ensure a level of security appropriate to the risk, including:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Encryption and hashing of passwords</li>
                <li>Secure storage and limited access to personal data</li>
                <li>Two-Factor Authentication (2FA) option</li>
                <li>Regular monitoring for unauthorised access or misuse</li>
              </ul>
              <p className="mt-2">
                These measure comply with Article 32 GDPR - ensuring integrity,
                confidentiality, and availability of personal data
              </p>
            </section>

            {/* SECTION 8 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                8. Automated Decision-Making
              </h2>
              <p className="mt-2">
                We do not use automated decision-making or profiling that
                produces legal or similarly significant effects on you (Article
                22 GDPR)
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                9. Contact and Questions
              </h2>
              <p className="mb-2">
                If you have any questions, please contact our team at{" "}
                <a
                  href="mailto:sneg.transcendence@gmail.com"
                  className="text-purple-game underline font-bold hover:text-purple-700 transition-colors"
                >
                  sneg.transcendence@gmail.com
                </a>
                . We respond to legitimate requests within one month (Article
                12(3) GDPR)
              </p>
            </section>

            {/* SECTION 9 */}
            <section>
              <h2 className="text-xl font-bold text-blue-deep mb-2">
                10. Changes to This Policy
              </h2>
              <p className="mb-2">
                We may update this Privacy policy to reflect changes in legal
                requirements or service updates. Significant changes will be
                communicated to you through the Transcendence application. The
                current version of this policy is always available in your User
                Portal
              </p>
            </section>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-center mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg font-dotgothic hover:bg-gray-600"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;