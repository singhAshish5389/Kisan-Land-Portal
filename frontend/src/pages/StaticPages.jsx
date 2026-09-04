import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { 
  Info, Shield, FileText, PhoneCall, HelpCircle, ArrowLeft, Landmark, MessageSquare, Mail, MapPin
} from 'lucide-react';

const StaticLayout = ({ title, icon: Icon, children }) => (
  <div className="max-w-3xl mx-auto py-4 space-y-8">
    <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm transition-colors duration-200">
      <Link to="/" className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-700 text-slate-500">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-emerald-50 dark:bg-emerald-950/40 text-primary dark:text-emerald-400 rounded-xl flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-gray-100">{title}</h1>
      </div>
    </div>

    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-3xl border border-emerald-100/60 dark:border-gray-700 shadow-sm prose prose-emerald max-w-none text-slate-600 dark:text-gray-300 leading-relaxed font-sans space-y-6 transition-colors duration-200">
      {children}
    </div>
  </div>
);

export const AboutUs = () => {
  const { t } = useLanguage();
  return (
    <StaticLayout title={t('footer.about')} icon={Info}>
      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Our Mission / हमारा लक्ष्य</h2>
      <p>
        Meri Khatauni was created to simplify land record management for Indian farmers. Land holdings are often scattered, and retrieving Gata/Khasra/Khata numbers repeatedly can be difficult and prone to errors.
      </p>
      <p>
        यह किसानों को अपने परिवार के सभी भूखंडों और खातों के नंबरों को केवल एक बार सुरक्षित रूप से दर्ज करने की अनुमति देता है, जिससे सरकारी भूमि रिकॉर्ड को किसी भी समय तुरंत निकाला जा सके।
      </p>
      
      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mt-6">Optimized for Rural India</h2>
      <p>
        We recognize that internet connectivity can be intermittent in rural agricultural regions. Thus, Meri Khatauni is engineered to be extremely fast, lightweight, and offline-resilient, providing a seamless mobile experience on low-end Android devices.
      </p>
    </StaticLayout>
  );
};

export const PrivacyPolicy = () => {
  const { t } = useLanguage();
  return (
    <StaticLayout title={t('footer.privacy')} icon={Shield}>
      <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold uppercase">Last Updated: June 2026</p>
      <p>
        At Meri Khatauni, we prioritize your data privacy. This policy outlines how we protect and manage your registered farmer details.
      </p>
      
      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mt-6">Data Collection</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Authentication Information:</strong> Full Name, Mobile Number, and Hashed Passwords.</li>
        <li><strong>Family & Plot Data:</strong> Saved Names, relations, and geographical land identifiers (Khata & Gata numbers) used solely to query public land registers.</li>
        <li><strong>Media:</strong> Profile photos uploaded optionally are stored securely in encrypted cloud storage (Cloudinary) or local environments.</li>
      </ul>

      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mt-6">Information Sharing</h2>
      <p>
        We do not sell, trade, or share your saved plot details or family information with any third-party marketing networks. The details are used exclusively to fetch official land records at your request.
      </p>
    </StaticLayout>
  );
};

export const TermsConditions = () => {
  const { t } = useLanguage();
  return (
    <StaticLayout title={t('footer.terms')} icon={FileText}>
      <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold uppercase">Last Updated: June 2026</p>
      <p>
        By registering or using the Meri Khatauni application, you agree to comply with the following terms:
      </p>

      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mt-6">Appropriate Use</h2>
      <p>
        You agree that you are the lawful owner, authorized relative, or representative of the land holdings entered into your profile ledger. Entering false Khata or Gata details to misrepresent ownership is strictly prohibited.
      </p>

      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100 mt-6">Digital Information Disclaimer</h2>
      <p>
        Meri Khatauni queries public state land APIs (Bhulekh) to fetch official Khatauni documents. We are a utility application and cannot guarantee the state api's real-time uptime or correctness of government registers.
      </p>
    </StaticLayout>
  );
};

export const ContactUs = () => {
  const { t } = useLanguage();
  return (
    <StaticLayout title={t('footer.contact')} icon={PhoneCall}>
      <p>
        Have questions or experiencing technical difficulties? Our team is ready to assist you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="p-5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl text-center space-y-3">
          <Mail className="mx-auto h-6 w-6 text-primary dark:text-emerald-400" />
          <h4 className="font-bold text-slate-800 dark:text-gray-200">Email Address</h4>
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">support@merikhatauni.in</p>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl text-center space-y-3">
          <MessageSquare className="mx-auto h-6 w-6 text-primary dark:text-emerald-400" />
          <h4 className="font-bold text-slate-800 dark:text-gray-200">Helpline Phone</h4>
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">+91 1800-345-6789</p>
        </div>

        <div className="p-5 bg-slate-50 dark:bg-gray-900 border border-slate-100 dark:border-gray-700 rounded-2xl text-center space-y-3">
          <MapPin className="mx-auto h-6 w-6 text-primary dark:text-emerald-400" />
          <h4 className="font-bold text-slate-800 dark:text-gray-200">Support Center</h4>
          <p className="text-sm font-semibold text-slate-500 dark:text-gray-400">Gorakhpur, Uttar Pradesh, India</p>
        </div>
      </div>
    </StaticLayout>
  );
};

export const HelpCenter = () => {
  const { t } = useLanguage();
  return (
    <StaticLayout title={t('footer.help')} icon={HelpCircle}>
      <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Frequently Asked Questions</h2>
      
      <div className="space-y-6 pt-4">
        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-gray-200 text-base">Q: Do I need to enter my land details every time I log in?</h3>
          <p className="text-sm">
            A: No! You only enter your Khata number, Gata number, Village, Tehsil, and District once. Meri Khatauni saves it permanently, so you can view it instantly with one tap every time you open the app.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-gray-200 text-base">Q: How can I print my official land record?</h3>
          <p className="text-sm">
            A: Open the family member holding, click "View Record", and select "Print Copy". The page is optimized so that only the official land record certificate prints, automatically hiding the website menus and buttons.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="font-bold text-slate-800 dark:text-gray-200 text-base">Q: What is a Khata and Gata number?</h3>
          <p className="text-sm">
            A: The Khata number represents the owner ledger ID, and the Gata/Khasra number represents the specific survey plot number of your farmland.
          </p>
        </div>
      </div>
    </StaticLayout>
  );
};

