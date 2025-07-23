class GoldenOrbitChatbot {
    constructor() {
        this.apiKey = this.getApiKey();
        this.apiUrl = 'https://api.groq.com/openai/v1/chat/completions';
        this.conversationHistory = [];
        this.userBookingData = {};
        this.bookingStep = 0;
        
        this.initializeChat();
        this.setupEventListeners();
    }

    getApiKey() {
        return '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';
    }

    initializeChat() {
        const welcomeMessage = "مرحباً بك في المدار الذهبي لمعالجة المياه! أنا مساعدك الذكي وسأكون سعيد لمساعدتك اليوم. كيف يمكنني خدمتك؟";
        this.addMessage(welcomeMessage, 'bot');
        
        this.conversationHistory.push({
            role: "system",
            content: `أنت ممثل خدمة عملاء افتراضي تعمل لشركة "المدار الذهبي لمعالجة المياه". 

قواعد صارمة:
- اجب باللغة العربية فقط - لا تستخدم أي كلمة إنجليزية مطلق<|im_start|>
- لا تكتب "provide" أو "service" أو "help" أو أي كلمة إنجليزية
- استخدم فقط الأحرف العربية والأرقام العربية
- إذا لم تعرف الكلمة العربية، استخدم كلمة عربية مشابهة

مسؤولياتك:
1. الترحيب بالعملاء باللغة العربية
2. جمع معلومات الحجز (الاسم، الهاتف، نوع الخدمة، الوقت)
3. تقديم معلومات الأسعار والخدمات
4. الرد على الاستفسارات بأدب ومهنية

الخدمات المتاحة:
- تحليل مياه: ١٥٠ ريال
- صيانة أنظمة المياه: ٢٠٠-٥٠٠ ريال
- تركيب أنظمة جديدة: ١٠٠٠-٣٠٠٠ ريال  
- استشارة فنية: ١٠٠ ريال

ساعات العمل: السبت-الخميس ٨ص-٥م

تذكر: استخدم العربية فقط - لا إنجليزية مطلق س
`
        });
    }

    setupEventListeners() {
        const sendButton = document.getElementById('sendButton');
        const userInput = document.getElementById('userInput');

        sendButton.addEventListener('click', () => this.sendMessage());
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    async sendMessage() {
        const userInput = document.getElementById('userInput');
        const message = userInput.value.trim();
        
        if (!message) return;

        this.addMessage(message, 'user');
        userInput.value = '';

        this.showTypingIndicator();

        try {
            const response = await this.getGroqResponse(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            this.hideTypingIndicator();
            console.error('Send Message Error:', error);
            this.addMessage('عذراً، حدث خطأ تقني. يرجى المحاولة مرة أخرى.', 'bot');
        }
    }

    async getGroqResponse(userMessage) {
        this.conversationHistory.push({
            role: "user",
            content: userMessage
        });

        try {
            console.log('Sending request to Groq API...');
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192",
                    messages: this.conversationHistory,
                    temperature: 0.3,
                    max_tokens: 1024,
                    top_p: 0.9,
                    stream: false,
                    stop: null
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }
            
            let botResponse = data.choices[0].message.content;
            
            // Comprehensive English word replacement
            const englishToArabic = {
                'provide': 'أقدم',
                'tell me': 'أخبرني',
                'aquipara': 'معدات المياه',
                'please': 'من فضلك',
                'thank you': 'شكراً لك',
                'welcome': 'مرحباً',
                'hello': 'مرحباً',
                'service': 'خدمة',
                'water': 'مياه',
                'system': 'نظام',
                'price': 'سعر',
                'cost': 'تكلفة',
                'help': 'مساعدة',
                'information': 'معلومات',
                'booking': 'حجز',
                'appointment': 'موعد',
                'available': 'متاح',
                'contact': 'تواصل',
                'phone': 'هاتف',
                'email': 'بريد إلكتروني',
                'address': 'عنوان',
                'time': 'وقت',
                'schedule': 'جدولة',
                'maintenance': 'صيانة',
                'installation': 'تركيب',
                'analysis': 'تحليل',
                'consultation': 'استشارة'
            };

            // Clean up unwanted tokens first
            botResponse = botResponse.replace(/\|im_start\|>/g, '');
            botResponse = botResponse.replace(/<\|im_start\|>/g, '');
            botResponse = botResponse.replace(/<\|im_end\|>/g, '');
            botResponse = botResponse.replace(/\|im_start\|>ANCEL/g, '');
            botResponse = botResponse.replace(/Quran/g, '');

            // Replace English words with Arabic equivalents
            for (const [english, arabic] of Object.entries(englishToArabic)) {
                const regex = new RegExp(english, 'gi');
                botResponse = botResponse.replace(regex, arabic);
            }

            // Remove any remaining English words (basic pattern)
            botResponse = botResponse.replace(/\b[a-zA-Z]+\b/g, '');
            
            // Clean up extra spaces
            botResponse = botResponse.replace(/\s+/g, ' ').trim();

            this.conversationHistory.push({
                role: "assistant",
                content: botResponse
            });

            return botResponse;
        } catch (error) {
            console.error('Groq API Error Details:', error);
            throw new Error('فشل في الاتصال بالخدمة. يرجى المحاولة مرة أخرى.');
        }
    }

    addMessage(message, sender) {
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        chatMessages.appendChild(messageDiv);
        
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        typingDiv.id = 'typing-indicator';
        
        const typingContent = document.createElement('div');
        typingContent.className = 'typing-indicator';
        
        for (let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'typing-dot';
            typingContent.appendChild(dot);
        }
        
        typingDiv.appendChild(typingContent);
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }
}

// Initialize the chatbot when called, not automatically
// Remove the automatic initialization at the bottom
// document.addEventListener('DOMContentLoaded', () => {
//     new GoldenOrbitChatbot();
// });

// Make the class available globally
window.GoldenOrbitChatbot = GoldenOrbitChatbot;

