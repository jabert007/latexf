import { Injectable, signal } from '@angular/core';

export type Language = 'en' | 'ta' | 'ml';

const translations: Record<Language, Record<string, string>> = {
  en: {
    brandTagline: 'Rubber intelligence', welcome: 'WELCOME TO LATEXF', market: 'Market updates live', logout: 'Logout',
    growers: 'BUILT FOR RUBBER GROWERS', headline: 'Know your market.', headlineAccent: 'Grow with clarity.',
    intro: 'Daily rubber prices, delivered with the context you need to make your next decision with confidence.',
    dailyPrices: 'Daily market prices', smsAlerts: 'SMS alerts every month', privateSecure: 'Private & secure',
    simplified: 'Your market, simplified.', registerOnce: 'Register once to access live pricing and alerts.', login: 'Log in', register: 'Register',
    mobile: 'Mobile number', continue: 'Continue to dashboard', sessionProtected: 'Your session is encrypted and protected.', fullName: 'Full name',
    address: 'Address', state: 'State', district: 'District', pincode: 'Pincode', createAccount: 'Create my account',
    requiredName: 'Name is required', validMobile: 'Enter a valid 10-digit number', validPincode: 'Enter a valid 6-digit pincode',
    goodMorning: 'GOOD MORNING', marketBrief: 'Your market brief.', everything: 'Everything you need for a better decision today.',
    todayPrice: "TODAY'S RUBBER PRICE", activeSubscription: 'EXISTING SUBSCRIPTION', active: 'ACTIVE',
    smsEnabled: 'SMS alerts enabled', smsNotEnabled: 'SMS alerts not enabled', smsEnabledCopy: 'You’ll receive market movements on your registered mobile number.',
    smsNotEnabledCopy: 'SMS alerts will appear here once enabled for your subscription.', profile: 'YOUR PROFILE', signOut: 'Sign out',
    priceAccess: 'PRICE ACCESS', pendingPayment: 'PAYMENT PENDING', waiting: 'Your daily price is waiting.', waitingApproval: 'Your daily price is waiting for approval.',
    subscribeCopy: "Subscribe to unlock today's rubber price and receive SMS alerts throughout the month. Post approval, you will receive the rubber price rate as an SMS.",
    pendingCopy: 'Check after sometime. Post approval, you will receive the rubber price rate as an SMS.', subscribe: 'Subscribe',
    account: 'YOUR ACCOUNT', paymentReview: 'Payment under review', checkStatus: 'Check status', back: 'Back to dashboard',
    oneMonth: 'ONE MONTH ACCESS', unlock: 'Unlock your market edge.', payLead: "Get the day's rubber price and SMS alerts delivered for one month.",
    paySecurely: 'Pay securely', adminVerifies: 'Admin verifies', getAccess: 'Get access', livePrice: "Today's live rubber price",
    sms30: 'SMS alerts for 30 days', webAndroid: 'Access from web or Android app', secure: 'Secure', scan: 'Scan with any UPI app to pay',
    upi: 'UPI ID', orderReady: 'Razorpay order ready', completed: "I've completed payment", submitted: 'Payment submitted', pendingApproval: 'Pending admin approval', refresh: 'Refresh', contact: 'CONTACT US', contactTitle: 'Planning to sell rubber sheets?', contactCopy: 'Talk to our team directly on WhatsApp for selling plans and support.', sellRubber: 'Chat on WhatsApp'
  },
  ta: {
    brandTagline: 'ரப்பர் தகவல்', welcome: 'LATEXF வரவேற்கிறது', market: 'சந்தை தகவல்கள் நேரலை', logout: 'வெளியேறு', growers: 'ரப்பர் விவசாயிகளுக்காக',
    headline: 'உங்கள் சந்தையை அறியுங்கள்.', headlineAccent: 'தெளிவுடன் வளருங்கள்.', intro: 'சந்தை முடிவுகளை நம்பிக்கையுடன் எடுக்க தினசரி ரப்பர் விலைகள்.',
    dailyPrices: 'தினசரி சந்தை விலைகள்', smsAlerts: 'மாதாந்திர SMS அறிவிப்புகள்', privateSecure: 'தனியுரிமை மற்றும் பாதுகாப்பு', simplified: 'உங்கள் சந்தை, எளிமையாக.',
    registerOnce: 'நேரடி விலைகள் மற்றும் அறிவிப்புகளுக்கு ஒருமுறை பதிவு செய்யுங்கள்.', login: 'உள்நுழைவு', register: 'பதிவு', mobile: 'மொபைல் எண்', continue: 'டாஷ்போர்டுக்குச் செல்லவும்',
    sessionProtected: 'உங்கள் அமர்வு பாதுகாப்பாக உள்ளது.', fullName: 'முழுப் பெயர்', address: 'முகவரி', state: 'மாநிலம்', district: 'மாவட்டம்', pincode: 'அஞ்சல் குறியீடு', createAccount: 'கணக்கை உருவாக்கவும்',
    requiredName: 'பெயர் அவசியம்', validMobile: 'சரியான 10 இலக்க எண்ணை உள்ளிடவும்', validPincode: 'சரியான அஞ்சல் குறியீட்டை உள்ளிடவும்', goodMorning: 'காலை வணக்கம்', marketBrief: 'உங்கள் சந்தை சுருக்கம்.', everything: 'இன்றைய சிறந்த முடிவுக்குத் தேவையான அனைத்தும்.',
    todayPrice: 'இன்றைய ரப்பர் விலை', activeSubscription: 'தற்போதைய சந்தா', active: 'செயலில்', smsEnabled: 'SMS அறிவிப்புகள் செயல்பாட்டில்', smsNotEnabled: 'SMS அறிவிப்புகள் செயல்பாட்டில் இல்லை', smsEnabledCopy: 'உங்கள் பதிவு செய்யப்பட்ட மொபைலுக்கு சந்தை தகவல்கள் வரும்.', smsNotEnabledCopy: 'சந்தா செயல்படுத்தப்பட்டதும் SMS அறிவிப்புகள் இங்கே காட்டப்படும்.', profile: 'உங்கள் சுயவிவரம்', signOut: 'வெளியேறு',
    priceAccess: 'விலை அணுகல்', pendingPayment: 'பணம் நிலுவையில்', waiting: 'உங்கள் தினசரி விலை காத்திருக்கிறது.', waitingApproval: 'உங்கள் தினசரி விலை அனுமதிக்காக காத்திருக்கிறது.', subscribeCopy: 'தினசரி ரப்பர் விலை மற்றும் மாதாந்திர SMS அறிவிப்புகளைப் பெற சந்தா செய்யுங்கள். அனுமதிக்குப் பிறகு விலை SMS ஆக வரும்.', pendingCopy: 'சிறிது நேரம் கழித்து சரிபார்க்கவும். அனுமதிக்குப் பிறகு விலை SMS ஆக வரும்.', subscribe: 'சந்தா செய்யவும்', account: 'உங்கள் கணக்கு', paymentReview: 'பணம் பரிசீலனையில்', checkStatus: 'நிலையைச் சரிபார்க்கவும்', back: 'டாஷ்போர்டுக்குத் திரும்பு', oneMonth: 'ஒரு மாத அணுகல்', unlock: 'சந்தை முன்னேற்றத்தைப் பெறுங்கள்.', payLead: 'ஒரு மாதத்திற்கு தினசரி ரப்பர் விலை மற்றும் SMS அறிவிப்புகளைப் பெறுங்கள்.', paySecurely: 'பாதுகாப்பாக செலுத்தவும்', adminVerifies: 'நிர்வாகி சரிபார்ப்பு', getAccess: 'அணுகலைப் பெறவும்', livePrice: 'இன்றைய நேரடி ரப்பர் விலை', sms30: '30 நாட்கள் SMS அறிவிப்புகள்', webAndroid: 'வலை அல்லது Android அணுகல்', secure: 'பாதுகாப்பானது', scan: 'UPI செயலியில் ஸ்கேன் செய்யவும்', upi: 'UPI ID', orderReady: 'Razorpay ஆர்டர் தயார்', completed: 'பணம் செலுத்திவிட்டேன்', submitted: 'பணம் சமர்ப்பிக்கப்பட்டது', pendingApproval: 'நிர்வாகி அனுமதி நிலுவையில்', refresh: 'புதுப்பிக்கவும்'
  },
  ml: {
    brandTagline: 'റബ്ബർ വിവരങ്ങൾ', welcome: 'LATEXF-ലേക്ക് സ്വാഗതം', market: 'വിപണി വിവരങ്ങൾ തത്സമയം', logout: 'പുറത്തുകടക്കുക', growers: 'റബ്ബർ കർഷകർക്കായി',
    headline: 'നിങ്ങളുടെ വിപണി അറിയൂ.', headlineAccent: 'വ്യക്തതയോടെ വളരൂ.', intro: 'ആത്മവിശ്വാസത്തോടെ തീരുമാനമെടുക്കാൻ ദിവസേനയുള്ള റബ്ബർ വിലകൾ.', dailyPrices: 'ദിവസേനയുള്ള വിപണി വിലകൾ', smsAlerts: 'പ്രതിമാസ SMS അലേർട്ടുകൾ', privateSecure: 'സ്വകാര്യവും സുരക്ഷിതവും', simplified: 'നിങ്ങളുടെ വിപണി, ലളിതമായി.', registerOnce: 'വിലകളും അലേർട്ടുകളും ലഭിക്കാൻ ഒരിക്കൽ രജിസ്റ്റർ ചെയ്യൂ.', login: 'ലോഗിൻ', register: 'രജിസ്റ്റർ', mobile: 'മൊബൈൽ നമ്പർ', continue: 'ഡാഷ്ബോർഡിലേക്ക് തുടരുക', sessionProtected: 'നിങ്ങളുടെ സെഷൻ സുരക്ഷിതമാണ്.', fullName: 'പൂർണ്ണ പേര്', address: 'വിലാസം', state: 'സംസ്ഥാനം', district: 'ജില്ല', pincode: 'പിൻകോഡ്', createAccount: 'അക്കൗണ്ട് സൃഷ്ടിക്കുക', requiredName: 'പേര് ആവശ്യമാണ്', validMobile: '10 അക്കമുള്ള നമ്പർ നൽകുക', validPincode: 'ശരിയായ പിൻകോഡ് നൽകുക', goodMorning: 'സുപ്രഭാതം', marketBrief: 'നിങ്ങളുടെ വിപണി സംഗ്രഹം.', everything: 'ഇന്നത്തെ മികച്ച തീരുമാനത്തിന് ആവശ്യമായതെല്ലാം.',
    todayPrice: 'ഇന്നത്തെ റബ്ബർ വില', activeSubscription: 'നിലവിലെ സബ്സ്ക്രിപ്ഷൻ', active: 'സജീവം', smsEnabled: 'SMS അലേർട്ടുകൾ സജീവം', smsNotEnabled: 'SMS അലേർട്ടുകൾ സജീവമല്ല', smsEnabledCopy: 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പറിൽ വിപണി വിവരങ്ങൾ ലഭിക്കും.', smsNotEnabledCopy: 'സബ്സ്ക്രിപ്ഷൻ സജീവമാക്കിയാൽ SMS അലേർട്ടുകൾ ഇവിടെ കാണിക്കും.', profile: 'നിങ്ങളുടെ പ്രൊഫൈൽ', signOut: 'പുറത്തുകടക്കുക', priceAccess: 'വില ലഭ്യത', pendingPayment: 'പേയ്മെന്റ് കാത്തിരിക്കുന്നു', waiting: 'നിങ്ങളുടെ ദിവസേനയുള്ള വില കാത്തിരിക്കുന്നു.', waitingApproval: 'നിങ്ങളുടെ ദിവസേനയുള്ള വില അംഗീകാരത്തിനായി കാത്തിരിക്കുന്നു.', subscribeCopy: 'ദിവസേനയുള്ള റബ്ബർ വിലയും SMS അലേർട്ടുകളും ലഭിക്കാൻ സബ്സ്ക്രൈബ് ചെയ്യുക. അംഗീകാരത്തിന് ശേഷം വില SMS ആയി ലഭിക്കും.', pendingCopy: 'കുറച്ച് സമയത്തിന് ശേഷം പരിശോധിക്കുക. അംഗീകാരത്തിന് ശേഷം വില SMS ആയി ലഭിക്കും.', subscribe: 'സബ്സ്ക്രൈബ് ചെയ്യുക', account: 'നിങ്ങളുടെ അക്കൗണ്ട്', paymentReview: 'പേയ്മെന്റ് പരിശോധിക്കുന്നു', checkStatus: 'നില പരിശോധിക്കുക', back: 'ഡാഷ്ബോർഡിലേക്ക് മടങ്ങുക', oneMonth: 'ഒരു മാസത്തെ ആക്സസ്', unlock: 'നിങ്ങളുടെ വിപണി നേട്ടം നേടൂ.', payLead: 'ഒരു മാസത്തേക്ക് ദിവസേനയുള്ള റബ്ബർ വിലയും SMS അലേർട്ടുകളും നേടൂ.', paySecurely: 'സുരക്ഷിതമായി അടയ്ക്കുക', adminVerifies: 'അഡ്മിൻ പരിശോധിക്കുന്നു', getAccess: 'ആക്സസ് നേടുക', livePrice: 'ഇന്നത്തെ റബ്ബർ വില', sms30: '30 ദിവസത്തെ SMS അലേർട്ടുകൾ', webAndroid: 'വെബ് അല്ലെങ്കിൽ Android ആക്സസ്', secure: 'സുരക്ഷിതം', scan: 'ഏത് UPI ആപ്പിലും സ്കാൻ ചെയ്യുക', upi: 'UPI ID', orderReady: 'Razorpay ഓർഡർ തയ്യാറാണ്', completed: 'പേയ്മെന്റ് പൂർത്തിയാക്കി', submitted: 'പേയ്മെന്റ് സമർപ്പിച്ചു', pendingApproval: 'അഡ്മിൻ അംഗീകാരം കാത്തിരിക്കുന്നു', refresh: 'പുതുക്കുക'
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  readonly language = signal<Language>((localStorage.getItem('latexf-language') as Language) || 'en');
  setLanguage(language: Language): void { this.language.set(language); localStorage.setItem('latexf-language', language); }
  translate(key: string): string { return translations[this.language()][key] || translations.en[key] || key; }
}
