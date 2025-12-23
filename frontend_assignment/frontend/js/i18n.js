

class I18n {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.supportedLanguages = ['en', 'da'];
        this.init();
    }

    async init() {
        const savedLanguage = localStorage.getItem('pawhaven_language') || 'en';
        await this.setLanguage(savedLanguage);
    }

    async loadTranslations(lang) {
        try {
            const response = await fetch(`data/translations/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang} translations`);
            }
            this.translations[lang] = await response.json();
            return true;
        } catch (error) {
            console.error(`Error loading translations for ${lang}:`, error);
            if (lang !== 'en') {
                await this.loadTranslations('en');
            }
            return false;
        }
    }

    
    async setLanguage(lang) {
        if (!this.supportedLanguages.includes(lang)) {
            console.warn(`Language ${lang} not supported, defaulting to English`);
            lang = 'en';
        }

        // Load translations if not already loaded
        if (!this.translations[lang]) {
            await this.loadTranslations(lang);
        }

        this.currentLanguage = lang;
        localStorage.setItem('pawhaven_language', lang);
        document.documentElement.lang = lang;

        // Update all translatable elements on the page
        this.updatePageContent();

        // Update language switcher UI
        this.updateLanguageSwitcher();

        // Dispatch custom event for other scripts to react to language change
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
        return true;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`Translation key not found: ${key}`);
                return key; // Return key if translation not found
            }
        }
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }

        return value;
    }

    updatePageContent() {
        // Update elements with data-i18n attribute for text content
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // Update elements with data-i18n-placeholder for input placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });

        // Update elements with data-i18n-title for title attributes
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // Update elements with data-i18n-value for button/input values
        document.querySelectorAll('[data-i18n-value]').forEach(element => {
            const key = element.getAttribute('data-i18n-value');
            element.value = this.t(key);
        });

        const titleElement = document.querySelector('[data-i18n-page-title]');
        if (titleElement) {
            const key = titleElement.getAttribute('data-i18n-page-title');
            document.title = this.t(key);
        }
    }

    // Update language switcher button states
    updateLanguageSwitcher() {
        document.querySelectorAll('.lang-btn').forEach(btn => {
            const lang = btn.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // Get translation for dynamic content
    translate(key, params = {}) {
        return this.t(key, params);
    }
}


const i18n = new I18n();
window.i18n = i18n;

// Language switcher click handler
async function switchLanguage(lang) {
    await i18n.setLanguage(lang);
}
window.switchLanguage = switchLanguage;

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { i18n, switchLanguage };
}
